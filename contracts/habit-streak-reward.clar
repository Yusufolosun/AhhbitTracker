;; ============================================
;; Habit Streak Reward - Milestone-Based Rewards
;; ============================================
;;
;; Companion contract for AhhbitTracker that rewards users who reach
;; streak milestones (7, 14, 30, 60, 90 days). Anyone can fund the
;; reward pool, and the contract owner configures reward tiers.
;; Claims are verified against the habit-tracker-v2 contract on-chain.
;;
;; Version: 1.0.0
;; ============================================

;; ============================================
;; CONSTANTS
;; ============================================

(define-constant CONTRACT-OWNER tx-sender)

;; Milestone tiers (in days / check-ins)
(define-constant MILESTONE-7 u7)
(define-constant MILESTONE-14 u14)
(define-constant MILESTONE-30 u30)
(define-constant MILESTONE-60 u60)
(define-constant MILESTONE-90 u90)

;; Min funding amount: 0.01 STX
(define-constant MIN-FUND-AMOUNT u10000)

;; ============================================
;; ERROR CODES (200 range)
;; ============================================

(define-constant ERR-NOT-AUTHORIZED (err u200))
(define-constant ERR-INVALID-MILESTONE (err u201))
(define-constant ERR-ALREADY-CLAIMED (err u202))
(define-constant ERR-INSUFFICIENT-STREAK (err u203))
(define-constant ERR-INSUFFICIENT-FUNDS (err u204))
(define-constant ERR-HABIT-NOT-FOUND (err u206))
(define-constant ERR-NOT-HABIT-OWNER (err u207))
(define-constant ERR-INVALID-AMOUNT (err u208))
(define-constant ERR-REWARD-NOT-SET (err u209))

;; ============================================
;; DATA STRUCTURES
;; ============================================

;; Reward amount per milestone tier
(define-map milestone-rewards
  { milestone: uint }
  { reward-amount: uint }
)

;; Tracks which milestones have been claimed per habit
(define-map claimed-milestones
  { habit-id: uint, milestone: uint }
  {
    claimed-by: principal,
    claimed-at-block: uint
  }
)

;; Total reward pool balance held by this contract
(define-data-var reward-pool-balance uint u0)

;; Total rewards distributed to date
(define-data-var total-distributed uint u0)

;; ============================================
;; PRIVATE FUNCTIONS
;; ============================================

;; Validate milestone is one of the supported tiers
(define-private (is-valid-milestone (milestone uint))
  (or
    (is-eq milestone MILESTONE-7)
    (is-eq milestone MILESTONE-14)
    (is-eq milestone MILESTONE-30)
    (is-eq milestone MILESTONE-60)
    (is-eq milestone MILESTONE-90)
  )
)

;; ============================================
;; PUBLIC FUNCTIONS
;; ============================================

;; Fund the reward pool - anyone can contribute
;; @param amount: STX amount in microSTX to add
;; @returns: new pool balance
(define-public (fund-reward-pool (amount uint))
  (begin
    (asserts! (>= amount MIN-FUND-AMOUNT) ERR-INVALID-AMOUNT)
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    (var-set reward-pool-balance (+ (var-get reward-pool-balance) amount))
    (print {
      event: "reward-pool-funded",
      funder: tx-sender,
      amount: amount,
      new-balance: (var-get reward-pool-balance)
    })
    (ok (var-get reward-pool-balance))
  )
)

;; Set reward amount for a milestone tier (owner only)
;; @param milestone: one of 7, 14, 30, 60, 90
;; @param reward-amount: STX reward in microSTX
(define-public (set-milestone-reward (milestone uint) (reward-amount uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (asserts! (is-valid-milestone milestone) ERR-INVALID-MILESTONE)
    (asserts! (> reward-amount u0) ERR-INVALID-AMOUNT)
    (map-set milestone-rewards
      { milestone: milestone }
      { reward-amount: reward-amount }
    )
    (print {
      event: "milestone-reward-set",
      milestone: milestone,
      reward-amount: reward-amount
    })
    (ok true)
  )
)

;; Claim reward for reaching a streak milestone
;; @param habit-id: habit to verify streak against
;; @param milestone: milestone tier to claim (7/14/30/60/90)
;; @returns: reward amount on success
(define-public (claim-milestone-reward (habit-id uint) (milestone uint))
  (let
    (
      (caller tx-sender)
      (habit-data (unwrap! (contract-call? .habit-tracker-v2 get-habit habit-id)
                           ERR-HABIT-NOT-FOUND))
      (streak (get current-streak habit-data))
      (reward-data (unwrap! (map-get? milestone-rewards { milestone: milestone })
                            ERR-REWARD-NOT-SET))
      (reward-amount (get reward-amount reward-data))
      (pool (var-get reward-pool-balance))
    )
    ;; Verify caller owns the habit
    (asserts! (is-eq caller (get owner habit-data)) ERR-NOT-HABIT-OWNER)

    ;; Verify valid milestone
    (asserts! (is-valid-milestone milestone) ERR-INVALID-MILESTONE)

    ;; Verify streak meets milestone requirement
    (asserts! (>= streak milestone) ERR-INSUFFICIENT-STREAK)

    ;; Verify not already claimed for this habit + milestone
    (asserts! (is-none (map-get? claimed-milestones
                { habit-id: habit-id, milestone: milestone }))
              ERR-ALREADY-CLAIMED)

    ;; Verify pool has sufficient funds
    (asserts! (>= pool reward-amount) ERR-INSUFFICIENT-FUNDS)

    ;; Transfer reward
    (try! (as-contract (stx-transfer? reward-amount tx-sender caller)))

    ;; Update pool balance
    (var-set reward-pool-balance (- pool reward-amount))

    ;; Track total distributed
    (var-set total-distributed (+ (var-get total-distributed) reward-amount))

    ;; Record claim
    (map-set claimed-milestones
      { habit-id: habit-id, milestone: milestone }
      {
        claimed-by: caller,
        claimed-at-block: block-height
      }
    )

    (print {
      event: "milestone-reward-claimed",
      habit-id: habit-id,
      milestone: milestone,
      reward: reward-amount,
      claimer: caller,
      remaining-pool: (- pool reward-amount)
    })

    (ok reward-amount)
  )
)

;; ============================================
;; READ-ONLY FUNCTIONS
;; ============================================

;; Get reward amount for a milestone tier
(define-read-only (get-milestone-reward (milestone uint))
  (map-get? milestone-rewards { milestone: milestone })
)

;; Get current reward pool balance
(define-read-only (get-reward-pool-balance)
  (ok (var-get reward-pool-balance))
)

;; Check if a milestone has been claimed for a habit
(define-read-only (is-milestone-claimed (habit-id uint) (milestone uint))
  (is-some (map-get? claimed-milestones
              { habit-id: habit-id, milestone: milestone }))
)

;; Get claim details for a habit + milestone
(define-read-only (get-claim-details (habit-id uint) (milestone uint))
  (map-get? claimed-milestones
    { habit-id: habit-id, milestone: milestone })
)

;; Get total rewards distributed
(define-read-only (get-total-distributed)
  (ok (var-get total-distributed))
)
