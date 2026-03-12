;; ============================================
;; Habit Accountability Group - Group Staking & Rewards
;; ============================================
;;
;; Users form accountability groups where each member stakes STX and
;; commits a habit from the habit-tracker-v2 contract. After the group
;; duration ends, members who maintained their streak share the
;; entire pool. Failed members forfeit their stake to those who
;; succeeded.
;;
;; Version: 1.0.0
;; ============================================

;; ============================================
;; CONSTANTS
;; ============================================

;; Group size limits
(define-constant MAX-GROUP-SIZE u10)

;; Duration bounds (in blocks, ~144 blocks/day)
(define-constant MIN-GROUP-DURATION u144)     ;; ~1 day
(define-constant MAX-GROUP-DURATION u12960)   ;; ~90 days

;; Minimum stake to create or join a group
(define-constant MIN-STAKE-AMOUNT u20000)     ;; 0.02 STX

;; ============================================
;; ERROR CODES (300 range)
;; ============================================

(define-constant ERR-NOT-AUTHORIZED (err u300))
(define-constant ERR-GROUP-NOT-FOUND (err u301))
(define-constant ERR-GROUP-FULL (err u302))
(define-constant ERR-ALREADY-MEMBER (err u303))
(define-constant ERR-NOT-MEMBER (err u304))
(define-constant ERR-GROUP-NOT-ACTIVE (err u305))
(define-constant ERR-GROUP-STILL-ACTIVE (err u306))
(define-constant ERR-INVALID-STAKE (err u307))
(define-constant ERR-INVALID-DURATION (err u308))
(define-constant ERR-ALREADY-SETTLED (err u309))
(define-constant ERR-ALREADY-CLAIMED (err u310))
(define-constant ERR-NOT-ELIGIBLE (err u311))
(define-constant ERR-INVALID-HABIT (err u312))
(define-constant ERR-GROUP-LIMIT-REACHED (err u313))

;; ============================================
;; DATA STRUCTURES
;; ============================================

;; Group metadata
(define-map groups
  { group-id: uint }
  {
    creator: principal,
    stake-amount: uint,
    start-block: uint,
    end-block: uint,
    member-count: uint,
    is-active: bool,
    is-settled: bool,
    total-staked: uint,
    successful-count: uint,
    settled-count: uint
  }
)

;; Per-member data within a group
(define-map group-members
  { group-id: uint, member: principal }
  {
    habit-id: uint,
    joined-at-block: uint,
    is-successful: bool,
    has-claimed: bool
  }
)

;; Track which groups a user belongs to
(define-map member-groups
  { member: principal }
  { group-ids: (list 20 uint) }
)

;; Global group ID counter
(define-data-var group-id-nonce uint u0)

;; ============================================
;; PRIVATE FUNCTIONS
;; ============================================

(define-private (get-next-group-id)
  (let
    (
      (next-id (+ (var-get group-id-nonce) u1))
    )
    (var-set group-id-nonce next-id)
    next-id
  )
)

;; ============================================
;; PUBLIC FUNCTIONS
;; ============================================

;; Create a new accountability group
;; @param stake-amount: STX each member must stake (in microSTX)
;; @param duration: group duration in blocks
;; @param habit-id: creator's habit from habit-tracker-v2
;; @returns: group-id on success
(define-public (create-group (stake-amount uint) (duration uint) (habit-id uint))
  (let
    (
      (group-id (get-next-group-id))
      (caller tx-sender)
      (habit-data (unwrap! (contract-call? .habit-tracker-v2 get-habit habit-id)
                           ERR-INVALID-HABIT))
    )
    ;; Verify caller owns the habit
    (asserts! (is-eq caller (get owner habit-data)) ERR-NOT-AUTHORIZED)

    ;; Verify habit is still active
    (asserts! (get is-active habit-data) ERR-INVALID-HABIT)

    ;; Validate stake
    (asserts! (>= stake-amount MIN-STAKE-AMOUNT) ERR-INVALID-STAKE)

    ;; Validate duration
    (asserts! (>= duration MIN-GROUP-DURATION) ERR-INVALID-DURATION)
    (asserts! (<= duration MAX-GROUP-DURATION) ERR-INVALID-DURATION)

    ;; Transfer stake from creator to contract
    (try! (stx-transfer? stake-amount caller (as-contract tx-sender)))

    ;; Create group
    (map-set groups
      { group-id: group-id }
      {
        creator: caller,
        stake-amount: stake-amount,
        start-block: block-height,
        end-block: (+ block-height duration),
        member-count: u1,
        is-active: true,
        is-settled: false,
        total-staked: stake-amount,
        successful-count: u0,
        settled-count: u0
      }
    )

    ;; Add creator as first member
    (map-set group-members
      { group-id: group-id, member: caller }
      {
        habit-id: habit-id,
        joined-at-block: block-height,
        is-successful: false,
        has-claimed: false
      }
    )

    ;; Track in member's group list
    (match (map-get? member-groups { member: caller })
      existing
        (map-set member-groups
          { member: caller }
          { group-ids: (unwrap! (as-max-len?
              (append (get group-ids existing) group-id) u20)
              ERR-GROUP-LIMIT-REACHED) }
        )
      (map-set member-groups
        { member: caller }
        { group-ids: (list group-id) }
      )
    )

    (print {
      event: "group-created",
      group-id: group-id,
      creator: caller,
      stake-amount: stake-amount,
      duration: duration,
      end-block: (+ block-height duration)
    })

    (ok group-id)
  )
)

;; Join an existing accountability group
;; @param group-id: group to join
;; @param habit-id: member's habit from habit-tracker-v2
;; @returns: ok true on success
(define-public (join-group (group-id uint) (habit-id uint))
  (let
    (
      (caller tx-sender)
      (group (unwrap! (map-get? groups { group-id: group-id })
                      ERR-GROUP-NOT-FOUND))
      (habit-data (unwrap! (contract-call? .habit-tracker-v2 get-habit habit-id)
                           ERR-INVALID-HABIT))
      (stake-amount (get stake-amount group))
    )
    ;; Verify caller owns the habit
    (asserts! (is-eq caller (get owner habit-data)) ERR-NOT-AUTHORIZED)

    ;; Verify habit is still active
    (asserts! (get is-active habit-data) ERR-INVALID-HABIT)

    ;; Group must be active
    (asserts! (get is-active group) ERR-GROUP-NOT-ACTIVE)

    ;; Group must not have expired
    (asserts! (< block-height (get end-block group)) ERR-GROUP-NOT-ACTIVE)

    ;; Group must not be full
    (asserts! (< (get member-count group) MAX-GROUP-SIZE) ERR-GROUP-FULL)

    ;; Caller must not already be a member
    (asserts! (is-none (map-get? group-members
                { group-id: group-id, member: caller }))
              ERR-ALREADY-MEMBER)

    ;; Transfer stake
    (try! (stx-transfer? stake-amount caller (as-contract tx-sender)))

    ;; Register member
    (map-set group-members
      { group-id: group-id, member: caller }
      {
        habit-id: habit-id,
        joined-at-block: block-height,
        is-successful: false,
        has-claimed: false
      }
    )

    ;; Update group totals
    (map-set groups
      { group-id: group-id }
      (merge group {
        member-count: (+ (get member-count group) u1),
        total-staked: (+ (get total-staked group) stake-amount)
      })
    )

    ;; Track in member's group list
    (match (map-get? member-groups { member: caller })
      existing
        (map-set member-groups
          { member: caller }
          { group-ids: (unwrap! (as-max-len?
              (append (get group-ids existing) group-id) u20)
              ERR-GROUP-LIMIT-REACHED) }
        )
      (map-set member-groups
        { member: caller }
        { group-ids: (list group-id) }
      )
    )

    (print {
      event: "member-joined",
      group-id: group-id,
      member: caller,
      habit-id: habit-id
    })

    (ok true)
  )
)

;; Settle a member after the group duration ends
;; Evaluates whether the member maintained at least half the required streak.
;; Anyone can call this to trigger settlement for any member.
;; @param group-id: the group
;; @param member: the member to settle
;; @returns: ok true if successful, ok false if failed
(define-public (settle-member (group-id uint) (member principal))
  (let
    (
      (group (unwrap! (map-get? groups { group-id: group-id })
                      ERR-GROUP-NOT-FOUND))
      (member-data (unwrap! (map-get? group-members
                    { group-id: group-id, member: member })
                    ERR-NOT-MEMBER))
      (habit-data (unwrap! (contract-call? .habit-tracker-v2 get-habit
                    (get habit-id member-data))
                    ERR-INVALID-HABIT))
      (streak (get current-streak habit-data))
      (duration-blocks (- (get end-block group) (get start-block group)))
      (required-days (/ duration-blocks u144))
      (half-required (/ required-days u2))
      (threshold (if (> half-required u0) half-required u1))
    )
    ;; Group duration must have ended
    (asserts! (>= block-height (get end-block group)) ERR-GROUP-STILL-ACTIVE)

    ;; Group must still be active (not finalized)
    (asserts! (get is-active group) ERR-GROUP-NOT-ACTIVE)

    ;; Member must not already be settled
    (asserts! (not (get is-successful member-data)) ERR-ALREADY-SETTLED)
    (asserts! (not (get has-claimed member-data)) ERR-ALREADY-SETTLED)

    ;; Evaluate: member needs at least half the required streak days (min 1)
    (if (>= streak threshold)
      (begin
        ;; Mark as successful
        (map-set group-members
          { group-id: group-id, member: member }
          (merge member-data { is-successful: true })
        )
        ;; Increment successful count and settled count
        (map-set groups
          { group-id: group-id }
          (merge group {
            successful-count: (+ (get successful-count group) u1),
            settled-count: (+ (get settled-count group) u1)
          })
        )
        (print {
          event: "member-settled-success",
          group-id: group-id,
          member: member,
          streak: streak
        })
        (ok true)
      )
      (begin
        ;; Mark as failed (has-claimed prevents future claiming)
        (map-set group-members
          { group-id: group-id, member: member }
          (merge member-data { has-claimed: true })
        )
        ;; Increment settled count
        (map-set groups
          { group-id: group-id }
          (merge group {
            settled-count: (+ (get settled-count group) u1)
          })
        )
        (print {
          event: "member-settled-failed",
          group-id: group-id,
          member: member,
          streak: streak
        })
        (ok false)
      )
    )
  )
)

;; Claim share of group pool for successful members
;; Share = total-staked / successful-count
;; @param group-id: the group to claim from
;; @returns: share amount on success
(define-public (claim-group-reward (group-id uint))
  (let
    (
      (caller tx-sender)
      (group (unwrap! (map-get? groups { group-id: group-id })
                      ERR-GROUP-NOT-FOUND))
      (member-data (unwrap! (map-get? group-members
                    { group-id: group-id, member: caller })
                    ERR-NOT-MEMBER))
      (total-pool (get total-staked group))
      (successful (get successful-count group))
    )
    ;; Group must have ended
    (asserts! (>= block-height (get end-block group)) ERR-GROUP-STILL-ACTIVE)

    ;; Group must be finalized (all members settled)
    (asserts! (get is-settled group) ERR-GROUP-STILL-ACTIVE)

    ;; Caller must be settled as successful
    (asserts! (get is-successful member-data) ERR-NOT-ELIGIBLE)

    ;; Caller must not have already claimed
    (asserts! (not (get has-claimed member-data)) ERR-ALREADY-CLAIMED)

    ;; Must have at least one successful member
    (asserts! (> successful u0) ERR-NOT-ELIGIBLE)

    (let
      (
        (share (/ total-pool successful))
      )
      ;; Transfer share to caller
      (try! (as-contract (stx-transfer? share tx-sender caller)))

      ;; Mark as claimed
      (map-set group-members
        { group-id: group-id, member: caller }
        (merge member-data { has-claimed: true })
      )

      (print {
        event: "group-reward-claimed",
        group-id: group-id,
        member: caller,
        amount: share,
        successful-members: successful
      })

      (ok share)
    )
  )
)

;; Refund stake when ALL members in a group failed
;; Returns each member's original stake. Anyone can trigger this.
;; Failed members are marked with has-claimed=true by settle-member.
;; Refund uses is-successful as a "refunded" flag to prevent double-refund.
;; @param group-id: the group to refund
;; @param member: the member to refund
;; @returns: refund amount on success
(define-public (refund-failed-group (group-id uint) (member principal))
  (let
    (
      (group (unwrap! (map-get? groups { group-id: group-id })
                      ERR-GROUP-NOT-FOUND))
      (member-data (unwrap! (map-get? group-members
                    { group-id: group-id, member: member })
                    ERR-NOT-MEMBER))
      (stake-amount (get stake-amount group))
    )
    ;; Group must have ended
    (asserts! (>= block-height (get end-block group)) ERR-GROUP-STILL-ACTIVE)

    ;; Group must be settled (is-settled = true) with zero successful members
    (asserts! (get is-settled group) ERR-GROUP-STILL-ACTIVE)
    (asserts! (is-eq (get successful-count group) u0) ERR-NOT-ELIGIBLE)

    ;; Member must have been settled as failed (has-claimed = true from settle-member)
    (asserts! (get has-claimed member-data) ERR-NOT-ELIGIBLE)

    ;; Member must not have already been refunded (is-successful used as refund flag)
    (asserts! (not (get is-successful member-data)) ERR-ALREADY-CLAIMED)

    ;; Transfer original stake back to member
    (try! (as-contract (stx-transfer? stake-amount tx-sender member)))

    ;; Mark as refunded (is-successful = true prevents double refund)
    (map-set group-members
      { group-id: group-id, member: member }
      (merge member-data { is-successful: true })
    )

    (print {
      event: "group-refund-claimed",
      group-id: group-id,
      member: member,
      amount: stake-amount
    })

    (ok stake-amount)
  )
)

;; Finalize a group after all members have been settled
;; Marks the group as settled. Anyone can call this.
;; Required before refund-failed-group can be used.
;; @param group-id: the group to finalize
;; @returns: ok true on success
(define-public (finalize-group (group-id uint))
  (let
    (
      (group (unwrap! (map-get? groups { group-id: group-id })
                      ERR-GROUP-NOT-FOUND))
    )
    ;; Group must have ended
    (asserts! (>= block-height (get end-block group)) ERR-GROUP-STILL-ACTIVE)

    ;; Group must still be active (not already finalized)
    (asserts! (not (get is-settled group)) ERR-ALREADY-SETTLED)

    ;; All members must have been settled before finalization
    (asserts! (is-eq (get settled-count group) (get member-count group)) ERR-NOT-ELIGIBLE)

    ;; Mark group as settled and inactive
    (map-set groups
      { group-id: group-id }
      (merge group {
        is-settled: true,
        is-active: false
      })
    )

    (print {
      event: "group-finalized",
      group-id: group-id,
      successful-count: (get successful-count group),
      member-count: (get member-count group)
    })

    (ok true)
  )
)

;; ============================================
;; READ-ONLY FUNCTIONS
;; ============================================

;; Get group details
(define-read-only (get-group (group-id uint))
  (map-get? groups { group-id: group-id })
)

;; Get member info within a group
(define-read-only (get-member-info (group-id uint) (member principal))
  (map-get? group-members { group-id: group-id, member: member })
)

;; Get all group IDs for a member
(define-read-only (get-member-groups (member principal))
  (default-to
    { group-ids: (list) }
    (map-get? member-groups { member: member })
  )
)

;; Get total groups created
(define-read-only (get-total-groups)
  (ok (var-get group-id-nonce))
)

;; Get estimated share per successful member
(define-read-only (get-group-share (group-id uint))
  (match (map-get? groups { group-id: group-id })
    group
      (if (> (get successful-count group) u0)
        (ok (/ (get total-staked group) (get successful-count group)))
        (ok u0)
      )
    (err u301)
  )
)
