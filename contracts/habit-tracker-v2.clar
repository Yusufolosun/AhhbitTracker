;; ============================================
;; AhhbitTracker - On-Chain Habit Tracking with Staking
;; ============================================
;; 
;; A Stacks smart contract for habit accountability through financial commitment.
;; Users stake STX on daily habits and check in every 24 hours to maintain streaks.
;; Missed check-ins result in stake forfeiture to a shared pool.
;;
;; Version: 0.1.0
;; Network: Stacks Mainnet
;; ============================================

;; ============================================
;; CONSTANTS
;; ============================================

;; Minimum stake required (in microSTX)
;; 1 STX = 1,000,000 microSTX
;; Minimum: 0.02 STX = 20,000 microSTX
(define-constant MIN-STAKE-AMOUNT u20000)

;; Maximum stake allowed (in microSTX)
;; 100 STX = 100,000,000 microSTX
(define-constant MAX-STAKE-AMOUNT u100000000)

;; Maximum habit name length
(define-constant MAX-HABIT-NAME-LENGTH u50)

;; Check-in window (in blocks)
;; ~144 blocks per day on Stacks (10 min per block)
(define-constant CHECK-IN-WINDOW u144)

;; Minimum interval between check-ins (in blocks)
;; ~120 blocks = ~20 hours minimum between check-ins
;; Prevents streak farming while allowing flexibility for users
(define-constant MIN-CHECK-IN-INTERVAL u120)

;; Minimum streak required for withdrawal
(define-constant MIN-STREAK-FOR-WITHDRAWAL u7)

;; Bonus distribution uses dynamic equal-share allocation across
;; completed habits that have not claimed yet.

;; ============================================
;; ERROR CODES
;; ============================================

(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-INVALID-STAKE-AMOUNT (err u101))
(define-constant ERR-INVALID-HABIT-NAME (err u102))
(define-constant ERR-HABIT-NOT-FOUND (err u103))
(define-constant ERR-NOT-HABIT-OWNER (err u104))
(define-constant ERR-ALREADY-CHECKED-IN (err u105))
(define-constant ERR-INSUFFICIENT-STREAK (err u107))
(define-constant ERR-HABIT-ALREADY-COMPLETED (err u108))
(define-constant ERR-POOL-INSUFFICIENT-BALANCE (err u109))
(define-constant ERR-BONUS-ALREADY-CLAIMED (err u111))
(define-constant ERR-HABIT-LIMIT-REACHED (err u112))
(define-constant ERR-STAKE-TOO-HIGH (err u113))
(define-constant ERR-HABIT-AUTO-SLASHED (err u114))

;; ============================================
;; DATA STRUCTURES
;; ============================================

;; Habit data structure
(define-map habits
  { habit-id: uint }
  {
    owner: principal,
    name: (string-utf8 50),
    stake-amount: uint,
    current-streak: uint,
    last-check-in-block: uint,
    created-at-block: uint,
    is-active: bool,
    is-completed: bool,
    bonus-claimed: bool
  }
)

;; User's list of habit IDs
;; Allows querying all habits for a specific user
(define-map user-habits
  { user: principal }
  { habit-ids: (list 100 uint) }
)

;; Global habit ID counter
(define-data-var habit-id-nonce uint u0)

;; Forfeited stakes pool (total available for distribution)
(define-data-var forfeited-pool-balance uint u0)

;; Number of completed habits that are still eligible to claim bonus
(define-data-var unclaimed-completed-habits uint u0)

;; ============================================
;; ACCOUNTABILITY GROUPS (merged from habit-accountability-group.clar)
;; ============================================

;; Group size limits
(define-constant MAX-GROUP-SIZE u10)

;; Duration bounds (in blocks, ~144 blocks/day)
(define-constant MIN-GROUP-DURATION u144)     ;; ~1 day
(define-constant MAX-GROUP-DURATION u12960)   ;; ~90 days

;; Error codes for groups (300 range)
(define-constant ERR-NOT-AUTHORIZED-GROUP (err u300))
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
    streak-at-join: uint,
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

;; Private helper: next group id
(define-private (get-next-group-id)
  (let
    (
      (next-id (+ (var-get group-id-nonce) u1))
    )
    (var-set group-id-nonce next-id)
    next-id
  )
)

;; Create a new accountability group
(define-public (create-group (stake-amount uint) (duration uint) (habit-id uint))
  (let
    (
      (group-id (get-next-group-id))
      (caller tx-sender)
      (habit (unwrap! (map-get? habits { habit-id: habit-id }) ERR-INVALID-HABIT))
      (streak-now (get current-streak habit))
    )
    ;; Verify caller owns the habit
    (asserts! (is-eq caller (get owner habit)) ERR-NOT-AUTHORIZED)

    ;; Verify habit is still active
    (asserts! (get is-active habit) ERR-INVALID-HABIT)

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
        streak-at-join: streak-now,
        is-successful: false,
        has-claimed: false
      }
    )

    ;; Track in member's group list
    (match (map-get? member-groups { member: caller })
      existing
        (map-set member-groups
          { member: caller }
          { group-ids: (unwrap! (as-max-len? (append (get group-ids existing) (list group-id)) u20) ERR-GROUP-LIMIT-REACHED) }
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
(define-public (join-group (group-id uint) (habit-id uint))
  (let
    (
      (caller tx-sender)
      (group (unwrap! (map-get? groups { group-id: group-id }) ERR-GROUP-NOT-FOUND))
      (habit (unwrap! (map-get? habits { habit-id: habit-id }) ERR-INVALID-HABIT))
      (stake-amount (get stake-amount group))
      (streak-now (get current-streak habit))
    )
    ;; Verify caller owns the habit
    (asserts! (is-eq caller (get owner habit)) ERR-NOT-AUTHORIZED)

    ;; Verify habit is still active
    (asserts! (get is-active habit) ERR-INVALID-HABIT)

    ;; Group must be active
    (asserts! (get is-active group) ERR-GROUP-NOT-ACTIVE)

    ;; Group must not have expired
    (asserts! (< block-height (get end-block group)) ERR-GROUP-NOT-ACTIVE)

    ;; Group must not be full
    (asserts! (< (get member-count group) MAX-GROUP-SIZE) ERR-GROUP-FULL)

    ;; Caller must not already be a member
    (asserts! (is-none (map-get? group-members { group-id: group-id, member: caller })) ERR-ALREADY-MEMBER)

    ;; Transfer stake
    (try! (stx-transfer? stake-amount caller (as-contract tx-sender)))

    ;; Register member
    (map-set group-members
      { group-id: group-id, member: caller }
      {
        habit-id: habit-id,
        joined-at-block: block-height,
        streak-at-join: streak-now,
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
          { group-ids: (unwrap! (as-max-len? (append (get group-ids existing) (list group-id)) u20) ERR-GROUP-LIMIT-REACHED) }
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
(define-public (settle-member (group-id uint) (member principal))
  (let
    (
      (group (unwrap! (map-get? groups { group-id: group-id }) ERR-GROUP-NOT-FOUND))
      (member-data (unwrap! (map-get? group-members { group-id: group-id, member: member }) ERR-NOT-MEMBER))
      (habit (unwrap! (map-get? habits { habit-id: (get habit-id member-data) }) ERR-INVALID-HABIT))
      (current-streak (get current-streak habit))
      (streak-delta (if (> current-streak (get streak-at-join member-data)) (- current-streak (get streak-at-join member-data)) u0))
      (duration-blocks (- (get end-block group) (get start-block group)))
      (required-days (/ duration-blocks CHECK-IN-WINDOW))
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

    (if (>= streak-delta threshold)
      (begin
        (map-set group-members { group-id: group-id, member: member } (merge member-data { is-successful: true }))
        (map-set groups { group-id: group-id } (merge group { successful-count: (+ (get successful-count group) u1), settled-count: (+ (get settled-count group) u1) }))
        (print { event: "member-settled-success", group-id: group-id, member: member, streak-delta: streak-delta })
        (ok true)
      )
      (begin
        (map-set group-members { group-id: group-id, member: member } (merge member-data { has-claimed: true }))
        (map-set groups { group-id: group-id } (merge group { settled-count: (+ (get settled-count group) u1) }))
        (print { event: "member-settled-failed", group-id: group-id, member: member, streak-delta: streak-delta })
        (ok false)
      )
    )
  )
)

;; Claim share of group pool for successful members
(define-public (claim-group-reward (group-id uint))
  (let
    (
      (caller tx-sender)
      (group (unwrap! (map-get? groups { group-id: group-id }) ERR-GROUP-NOT-FOUND))
      (member-data (unwrap! (map-get? group-members { group-id: group-id, member: caller }) ERR-NOT-MEMBER))
      (total-pool (get total-staked group))
      (successful (get successful-count group))
    )
    ;; Group must have ended
    (asserts! (>= block-height (get end-block group)) ERR-GROUP-STILL-ACTIVE)

    ;; Group must be finalized
    (asserts! (get is-settled group) ERR-GROUP-STILL-ACTIVE)

    ;; Caller must be settled as successful
    (asserts! (get is-successful member-data) ERR-NOT-ELIGIBLE)

    ;; Caller must not have already claimed
    (asserts! (not (get has-claimed member-data)) ERR-ALREADY-CLAIMED)

    ;; Must have at least one successful member
    (asserts! (> successful u0) ERR-NOT-ELIGIBLE)

    (let ((share (/ total-pool successful)))
      (try! (as-contract (stx-transfer? share tx-sender caller)))
      (map-set group-members { group-id: group-id, member: caller } (merge member-data { has-claimed: true }))
      (print { event: "group-reward-claimed", group-id: group-id, member: caller, amount: share, successful-members: successful })
      (ok share)
    )
  )
)

;; Refund stake when ALL members in a group failed
(define-public (refund-failed-group (group-id uint) (member principal))
  (let
    (
      (group (unwrap! (map-get? groups { group-id: group-id }) ERR-GROUP-NOT-FOUND))
      (member-data (unwrap! (map-get? group-members { group-id: group-id, member: member }) ERR-NOT-MEMBER))
      (stake-amount (get stake-amount group))
    )
    ;; Group must have ended
    (asserts! (>= block-height (get end-block group)) ERR-GROUP-STILL-ACTIVE)

    ;; Group must be settled and have zero successful members
    (asserts! (get is-settled group) ERR-GROUP-STILL-ACTIVE)
    (asserts! (is-eq (get successful-count group) u0) ERR-NOT-ELIGIBLE)

    ;; Member must have been settled as failed
    (asserts! (get has-claimed member-data) ERR-NOT-ELIGIBLE)

    ;; Member must not have already been refunded
    (asserts! (not (get is-successful member-data)) ERR-ALREADY-CLAIMED)

    (try! (as-contract (stx-transfer? stake-amount tx-sender member)))

    (map-set group-members { group-id: group-id, member: member } (merge member-data { is-successful: true }))

    (print { event: "group-refund-claimed", group-id: group-id, member: member, amount: stake-amount })

    (ok stake-amount)
  )
)

;; Finalize a group after all members have been settled
(define-public (finalize-group (group-id uint))
  (let ((group (unwrap! (map-get? groups { group-id: group-id }) ERR-GROUP-NOT-FOUND)))
    ;; Group must have ended
    (asserts! (>= block-height (get end-block group)) ERR-GROUP-STILL-ACTIVE)

    ;; Group must still be active
    (asserts! (not (get is-settled group)) ERR-ALREADY-SETTLED)

    ;; All members must have been settled before finalization
    (asserts! (is-eq (get settled-count group) (get member-count group)) ERR-NOT-ELIGIBLE)

    (map-set groups { group-id: group-id } (merge group { is-settled: true, is-active: false }))

    (print { event: "group-finalized", group-id: group-id, successful-count: (get successful-count group), member-count: (get member-count group) })

    (ok true)
  )
)

;; Read-only helpers for groups
(define-read-only (get-group (group-id uint)) (map-get? groups { group-id: group-id }))
(define-read-only (get-member-info (group-id uint) (member principal)) (map-get? group-members { group-id: group-id, member: member }))
(define-read-only (get-member-groups (member principal)) (default-to { group-ids: (list) } (map-get? member-groups { member: member })))
(define-read-only (get-total-groups) (ok (var-get group-id-nonce)))
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

;; ============================================
;; PRIVATE HELPER FUNCTIONS
;; ============================================

;; Validate habit name
;; Returns true if name is valid (non-empty and within length limit)
(define-private (is-valid-habit-name (name (string-utf8 50)))
  (let
    (
      (name-length (len name))
    )
    (and
      (> name-length u0)
      (<= name-length MAX-HABIT-NAME-LENGTH)
    )
  )
)

;; Generate next habit ID
(define-private (get-next-habit-id)
  (let
    (
      (current-id (var-get habit-id-nonce))
      (next-id (+ current-id u1))
    )
    (var-set habit-id-nonce next-id)
    next-id
  )
)

;; Check if check-in is within valid window
;; Returns true if blocks since last check-in <= CHECK-IN-WINDOW
(define-private (is-check-in-valid (last-check-in-block uint))
  (let
    (
      (blocks-elapsed (- block-height last-check-in-block))
    )
    (<= blocks-elapsed CHECK-IN-WINDOW)
  )
)

;; Check if already checked in today (same block height range)
(define-private (already-checked-in-today (last-check-in-block uint))
  (let
    (
      (blocks-elapsed (- block-height last-check-in-block))
    )
    (< blocks-elapsed MIN-CHECK-IN-INTERVAL)
  )
)

;; Calculate equal-share bonus amount for the next claimant.
;; Integer division intentionally leaves any remainder for later claimants.
(define-private (calculate-bonus-share (pool-balance uint) (eligible-claimants uint))
  (if (> eligible-claimants u0)
    (/ pool-balance eligible-claimants)
    u0
  )
)

;; ============================================
;; PUBLIC FUNCTIONS - HABIT MANAGEMENT
;; ============================================

;; Create a new habit with stake
;; @param name: Habit description (max 50 characters)
;; @param stake-amount: Amount to stake in microSTX (min 0.02 STX)
;; @returns: habit-id on success, error code on failure
(define-public (create-habit (name (string-utf8 50)) (stake-amount uint))
  (let
    (
      (habit-id (get-next-habit-id))
      (caller tx-sender)
    )
    ;; Validate stake amount
    (asserts! (>= stake-amount MIN-STAKE-AMOUNT) ERR-INVALID-STAKE-AMOUNT)
    (asserts! (<= stake-amount MAX-STAKE-AMOUNT) ERR-STAKE-TOO-HIGH)
    
    ;; Validate habit name
    (asserts! (is-valid-habit-name name) ERR-INVALID-HABIT-NAME)
    
    ;; Transfer stake from user to contract
    (try! (stx-transfer? stake-amount caller (as-contract tx-sender)))
    
    ;; Store habit data
    (map-set habits
      { habit-id: habit-id }
      {
        owner: caller,
        name: name,
        stake-amount: stake-amount,
        current-streak: u0,
        last-check-in-block: block-height,
        created-at-block: block-height,
        is-active: true,
        is-completed: false,
        bonus-claimed: false
      }
    )
    
    ;; Add habit to user's habit list
    (match (map-get? user-habits { user: caller })
      existing-habits
        (map-set user-habits
          { user: caller }
          { habit-ids: (unwrap! (as-max-len? (append (get habit-ids existing-habits) habit-id) u100) ERR-HABIT-LIMIT-REACHED) }
        )
      ;; First habit for this user
      (map-set user-habits
        { user: caller }
        { habit-ids: (list habit-id) }
      )
    )
    
    ;; Emit event
    (print {
      event: "habit-created",
      habit-id: habit-id,
      owner: caller,
      stake-amount: stake-amount,
      block: block-height
    })
    
    ;; Return habit ID
    (ok habit-id)
  )
)

;; Daily check-in for habit
;; @param habit-id: ID of the habit to check in
;; @returns: current streak on success, ERR-HABIT-AUTO-SLASHED if window expired
(define-public (check-in (habit-id uint))
  (let
    (
      (caller tx-sender)
      (habit (unwrap! (map-get? habits { habit-id: habit-id }) ERR-HABIT-NOT-FOUND))
      (last-check-in (get last-check-in-block habit))
      (current-streak (get current-streak habit))
    )
    ;; Verify caller is habit owner
    (asserts! (is-eq caller (get owner habit)) ERR-NOT-HABIT-OWNER)
    
    ;; Verify habit is still active
    (asserts! (get is-active habit) ERR-HABIT-ALREADY-COMPLETED)
    
    ;; Check if already checked in today
    (asserts! (not (already-checked-in-today last-check-in)) ERR-ALREADY-CHECKED-IN)
    ;; Check if within valid window
    (if (is-check-in-valid last-check-in)
      ;; Valid check-in: increment streak
      (begin
        (map-set habits
          { habit-id: habit-id }
          (merge habit {
            current-streak: (+ current-streak u1),
            last-check-in-block: block-height
          })
        )
        ;; Emit event
        (print {
          event: "habit-checked-in",
          habit-id: habit-id,
          owner: caller,
          new-streak: (+ current-streak u1),
          block: block-height
        })
        (ok (+ current-streak u1))
      )
      ;; Missed window: auto-slash - forfeit stake and deactivate
      (begin
        (var-set forfeited-pool-balance
          (+ (var-get forfeited-pool-balance) (get stake-amount habit)))
        (map-set habits
          { habit-id: habit-id }
          (merge habit {
            current-streak: u0,
            is-active: false
          })
        )
        (print {
          event: "habit-auto-slashed",
          habit-id: habit-id,
          owner: caller,
          amount: (get stake-amount habit),
          block: block-height
        })
        ERR-HABIT-AUTO-SLASHED
      )
    )
  )
)

;; Slash a habit that has missed its check-in window
;; Anyone can call this to move the stake to the pool
;; @param habit-id: ID of the habit to slash
;; @returns: ok on success, error on failure
(define-public (slash-habit (habit-id uint))
  (let
    (
      (habit (unwrap! (map-get? habits { habit-id: habit-id }) ERR-HABIT-NOT-FOUND))
      (last-check-in (get last-check-in-block habit))
      (stake-amount (get stake-amount habit))
    )
    ;; Verify habit is still active
    (asserts! (get is-active habit) ERR-HABIT-ALREADY-COMPLETED)
    
    ;; Verify window has actually expired
    (asserts! (not (is-check-in-valid last-check-in)) ERR-NOT-AUTHORIZED)
    
    ;; Move stake to pool
    (var-set forfeited-pool-balance (+ (var-get forfeited-pool-balance) stake-amount))
    
    ;; Mark habit as inactive
    (map-set habits
      { habit-id: habit-id }
      (merge habit {
        current-streak: u0,
        is-active: false
      })
    )
    
    ;; Emit event
    (print {
      event: "habit-slashed",
      habit-id: habit-id,
      slasher: tx-sender,
      amount: stake-amount,
      block: block-height
    })
    
    (ok true)
  )
)

;; Withdraw stake after completing minimum streak
;; @param habit-id: ID of the habit
;; @returns: ok on success with stake amount, error on failure
(define-public (withdraw-stake (habit-id uint))
  (let
    (
      (caller tx-sender)
      (habit (unwrap! (map-get? habits { habit-id: habit-id }) ERR-HABIT-NOT-FOUND))
      (stake-amount (get stake-amount habit))
      (current-streak (get current-streak habit))
    )
    ;; Verify caller is habit owner
    (asserts! (is-eq caller (get owner habit)) ERR-NOT-HABIT-OWNER)
    
    ;; Verify habit is active
    (asserts! (get is-active habit) ERR-HABIT-ALREADY-COMPLETED)
    
    ;; Verify minimum streak requirement
    (asserts! (>= current-streak MIN-STREAK-FOR-WITHDRAWAL) ERR-INSUFFICIENT-STREAK)
    
    ;; Transfer stake back to user
    (try! (as-contract (stx-transfer? stake-amount tx-sender caller)))
    
    ;; Mark habit as completed
    (map-set habits
      { habit-id: habit-id }
      (merge habit {
        is-active: false,
        is-completed: true
      })
    )

    ;; Completed habits become eligible for a single pool bonus claim.
    (var-set unclaimed-completed-habits (+ (var-get unclaimed-completed-habits) u1))
    
    ;; Emit event
    (print {
      event: "stake-withdrawn",
      habit-id: habit-id,
      owner: caller,
      amount: stake-amount,
      final-streak: current-streak,
      block: block-height
    })
    
    (ok stake-amount)
  )
)

;; Claim bonus from forfeited pool
;; @param habit-id: ID of a completed habit (proof of eligibility)
;; @returns: bonus amount on success, error on failure
(define-public (claim-bonus (habit-id uint))
  (let
    (
      (caller tx-sender)
      (habit (unwrap! (map-get? habits { habit-id: habit-id }) ERR-HABIT-NOT-FOUND))
      (pool-balance (var-get forfeited-pool-balance))
      (eligible-claimants (var-get unclaimed-completed-habits))
      (bonus-amount (calculate-bonus-share pool-balance eligible-claimants))
    )
    ;; Verify caller is habit owner
    (asserts! (is-eq caller (get owner habit)) ERR-NOT-HABIT-OWNER)
    
    ;; Verify habit is completed
    (asserts! (get is-completed habit) ERR-INSUFFICIENT-STREAK)

    ;; Verify bonus has not already been claimed for this habit
    (asserts! (not (get bonus-claimed habit)) ERR-BONUS-ALREADY-CLAIMED)
    
    ;; Verify pool has sufficient balance and bonus is non-zero
    (asserts! (> eligible-claimants u0) ERR-POOL-INSUFFICIENT-BALANCE)
    (asserts! (> bonus-amount u0) ERR-POOL-INSUFFICIENT-BALANCE)
    (asserts! (>= pool-balance bonus-amount) ERR-POOL-INSUFFICIENT-BALANCE)
    
    ;; Transfer bonus from pool to user
    (try! (as-contract (stx-transfer? bonus-amount tx-sender caller)))
    
    ;; Update pool balance
    (var-set forfeited-pool-balance (- pool-balance bonus-amount))
    (var-set unclaimed-completed-habits (- eligible-claimants u1))

    ;; Mark bonus as claimed to prevent re-entrancy
    (map-set habits
      { habit-id: habit-id }
      (merge habit { bonus-claimed: true })
    )
    
    ;; Emit event
    (print {
      event: "bonus-claimed",
      habit-id: habit-id,
      owner: caller,
      amount: bonus-amount,
      claimant-count: eligible-claimants,
      remaining-claimants: (- eligible-claimants u1),
      remaining-pool: (- pool-balance bonus-amount),
      block: block-height
    })
    
    (ok bonus-amount)
  )
)

;; ============================================
;; READ-ONLY FUNCTIONS
;; ============================================

;; Get habit details
(define-read-only (get-habit (habit-id uint))
  (map-get? habits { habit-id: habit-id })
)

;; Get all habit IDs for a user
(define-read-only (get-user-habits (user principal))
  (default-to 
    { habit-ids: (list) }
    (map-get? user-habits { user: user })
  )
)

;; Get current streak for a habit
(define-read-only (get-habit-streak (habit-id uint))
  (match (map-get? habits { habit-id: habit-id })
    habit (ok (get current-streak habit))
    ERR-HABIT-NOT-FOUND
  )
)

;; Get forfeited pool balance
(define-read-only (get-pool-balance)
  (ok (var-get forfeited-pool-balance))
)

;; Get number of completed habits that have not yet claimed bonus
(define-read-only (get-unclaimed-completed-habits)
  (ok (var-get unclaimed-completed-habits))
)

;; Estimate next claim amount based on current pool and claimant count
(define-read-only (get-estimated-bonus-share)
  (let
    (
      (pool-balance (var-get forfeited-pool-balance))
      (eligible-claimants (var-get unclaimed-completed-habits))
    )
    (ok (calculate-bonus-share pool-balance eligible-claimants))
  )
)

;; Get total habits created
(define-read-only (get-total-habits)
  (ok (var-get habit-id-nonce))
)

;; Get aggregated statistics for a user
(define-read-only (get-user-stats (user principal))
  (match (map-get? user-habits { user: user })
    user-habit-data
      (ok {
        total-habits: (len (get habit-ids user-habit-data)),
        habit-ids: (get habit-ids user-habit-data)
      })
    (ok {
      total-habits: u0,
      habit-ids: (list)
    })
  )
)

;; ============================================
;; CONTRACT INITIALIZATION
;; ============================================

;; Contract is ready for use immediately after deployment
;; No initialization function required

;; ============================================
;; EXPIRED HABIT DETECTION
;; ============================================

;; Check if a single habit has its check-in window expired
;; Returns habit-id if expired and active, u0 otherwise
(define-private (check-habit-expired (habit-id uint))
  (match (map-get? habits { habit-id: habit-id })
    habit
      (if (and (get is-active habit)
               (not (is-check-in-valid (get last-check-in-block habit))))
        habit-id
        u0
      )
    u0
  )
)

;; Get all expired active habit IDs for a user
;; Returns a list of habit IDs where the check-in window has passed
;; Non-expired habits appear as u0 (filter client-side)
(define-read-only (get-expired-habits (user principal))
  (match (map-get? user-habits { user: user })
    user-data (ok (map check-habit-expired (get habit-ids user-data)))
    (ok (list))
  )
)