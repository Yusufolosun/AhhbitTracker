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

;; Derived timing constants
;; ~6 blocks per hour (144 / 24)
(define-constant BLOCKS-PER-HOUR u6)
;; Blocks per 24h day
(define-constant BLOCKS-PER-DAY u144)
;; Minimum interval between check-ins (in blocks)
;; ~120 blocks = ~20 hours minimum between check-ins
;; Prevents streak farming while allowing flexibility for users
(define-constant MIN-CHECK-IN-INTERVAL u120)

;; Minimum streak required for withdrawal
(define-constant MIN-STREAK-FOR-WITHDRAWAL u7)

;; Partial forfeit settings (basis points)
;; 10% per missed day => 1000 / 10000
(define-constant FORFEIT-BPS-PER-MISS u1000)
(define-constant BPS-DENOMINATOR u10000)

;; Referral boost settings (bonus claim weights)
(define-constant REFERRAL-BOOST-PER-COMPLETION u1)
(define-constant MAX-REFERRAL-BOOST u10)

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
(define-constant ERR-REFERRER-ALREADY-SET (err u115))
(define-constant ERR-INVALID-REFERRER (err u116))
(define-constant ERR-SELF-REFERRAL (err u117))

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
    bonus-weight: uint,
    bonus-claimed: bool
  }
)

;; Tracks original stake and applied missed check-ins per habit
(define-map habit-penalties
  { habit-id: uint }
  {
    initial-stake-amount: uint,
    missed-checkins: uint
  }
)

;; User's list of habit IDs
;; Allows querying all habits for a specific user
(define-map user-habits
  { user: principal }
  { habit-ids: (list 100 uint) }
)

;; Referral relationships (one-time registration per user)
(define-map referrals
  { user: principal }
  { referrer: principal, set-at-block: uint }
)

;; Referrer stats for bonus weight boosts
(define-map referrer-stats
  { referrer: principal }
  { successful-referrals: uint }
)

;; Global habit ID counter
(define-data-var habit-id-nonce uint u0)

;; Forfeited stakes pool (total available for distribution)
(define-data-var forfeited-pool-balance uint u0)

;; Number of completed habits that are still eligible to claim bonus
(define-data-var unclaimed-completed-habits uint u0)

;; Total bonus claim weight across unclaimed completed habits
(define-data-var unclaimed-completed-weight uint u0)

;; ============================================
;; ACCOUNTABILITY GROUPS (merged from habit-accountability-group-v3.clar)
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

;; Get latest valid check-in block (relative to last check-in)
(define-private (get-checkin-latest (last-check-in-block uint))
  (+ last-check-in-block CHECK-IN-WINDOW)
)

;; Check if check-in is within valid window relative to last check-in
(define-private (is-check-in-valid (last-check-in-block uint))
  (let ((latest (get-checkin-latest last-check-in-block)))
    (<= block-height latest)
  )
)

;; Check if already checked in today (same block height range)
;; Check if already checked in within minimum interval
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
(define-private (calculate-bonus-share (pool-balance uint) (total-weight uint) (claim-weight uint))
  (if (and (> total-weight u0) (> claim-weight u0))
    (/ (* pool-balance claim-weight) total-weight)
    u0
  )
)

;; Calculate how many check-in windows were missed since last check-in
(define-private (get-missed-checkins (last-check-in-block uint))
  (let ((latest (get-checkin-latest last-check-in-block)))
    (if (<= block-height latest)
      u0
      (let ((overdue (- block-height latest)))
        (+ u1 (/ overdue BLOCKS-PER-DAY))
      )
    )
  )
)

;; Calculate referral bonus weight boost for a user
(define-private (calculate-referral-boost (user principal))
  (let
    (
      (stats (default-to { successful-referrals: u0 } (map-get? referrer-stats { referrer: user })))
      (raw-boost (* (get successful-referrals stats) REFERRAL-BOOST-PER-COMPLETION))
    )
    (if (> raw-boost MAX-REFERRAL-BOOST)
      MAX-REFERRAL-BOOST
      raw-boost
    )
  )
)

;; Register a referrer once per user (no self-referrals)
(define-private (set-referrer (user principal) (referrer principal))
  (match (map-get? referrals { user: user })
    existing
      (if (is-eq (get referrer existing) referrer)
        (ok true)
        ERR-REFERRER-ALREADY-SET
      )
    (begin
      (asserts! (not (is-eq user referrer)) ERR-SELF-REFERRAL)
      (asserts! (not (is-eq referrer (as-contract tx-sender))) ERR-INVALID-REFERRER)
      (map-set referrals { user: user } { referrer: referrer, set-at-block: block-height })
      (print { event: "referrer-registered", user: user, referrer: referrer, block: block-height })
      (ok true)
    )
  )
)

;; Calculate total penalty for missed check-ins
(define-private (calculate-missed-penalty (initial-stake uint) (missed-checkins uint))
  (let ((per-miss (/ (* initial-stake FORFEIT-BPS-PER-MISS) BPS-DENOMINATOR)))
    (* per-miss missed-checkins)
  )
)

;; ============================================
;; PUBLIC FUNCTIONS - HABIT MANAGEMENT
;; ============================================

;; Register a referrer for on-chain attribution (one-time)
;; @param referrer: principal that referred the caller
;; @returns: true on success
(define-public (register-referrer (referrer principal))
  (set-referrer tx-sender referrer)
)

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
        bonus-weight: u1,
        bonus-claimed: false
      }
    )

    ;; Track penalty metadata
    (map-set habit-penalties
      { habit-id: habit-id }
      { initial-stake-amount: stake-amount, missed-checkins: u0 }
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
      (penalty-data (default-to { initial-stake-amount: (get stake-amount habit), missed-checkins: u0 }
        (map-get? habit-penalties { habit-id: habit-id })))
      (initial-stake (get initial-stake-amount penalty-data))
      (applied-missed (get missed-checkins penalty-data))
    )
    ;; Verify caller is habit owner
    (asserts! (is-eq caller (get owner habit)) ERR-NOT-HABIT-OWNER)
    
    ;; Verify habit is still active
    (asserts! (get is-active habit) ERR-HABIT-ALREADY-COMPLETED)
    
    ;; Check if already checked in within minimum interval
    (asserts! (not (already-checked-in-today last-check-in)) ERR-ALREADY-CHECKED-IN)
    ;; Check if within anchored valid window (relative to last check-in)
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
        (map-set habit-penalties
          { habit-id: habit-id }
          (merge penalty-data { missed-checkins: u0 })
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
      ;; Missed window: apply partial forfeits and reset streak
      (begin
        (let
          (
            (missed-total (get-missed-checkins last-check-in))
            (new-missed (if (> missed-total applied-missed) (- missed-total applied-missed) u0))
            (raw-penalty (calculate-missed-penalty initial-stake new-missed))
            (remaining-stake (get stake-amount habit))
            (applied-penalty (if (> raw-penalty remaining-stake) remaining-stake raw-penalty))
            (remaining-after (- remaining-stake applied-penalty))
            (is-active-after (> remaining-after u0))
            (new-streak (if is-active-after u1 u0))
          )
          (var-set forfeited-pool-balance
            (+ (var-get forfeited-pool-balance) applied-penalty))
          (map-set habits
            { habit-id: habit-id }
            (merge habit {
              stake-amount: remaining-after,
              current-streak: new-streak,
              last-check-in-block: block-height,
              is-active: is-active-after
            })
          )
          (map-set habit-penalties
            { habit-id: habit-id }
            (merge penalty-data { missed-checkins: u0 })
          )
          (print {
            event: "habit-check-in-penalized",
            habit-id: habit-id,
            owner: caller,
            missed-checkins: missed-total,
            penalty: applied-penalty,
            remaining-stake: remaining-after,
            new-streak: new-streak,
            block: block-height
          })
          (ok new-streak)
        )
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
      (penalty-data (default-to { initial-stake-amount: stake-amount, missed-checkins: u0 }
        (map-get? habit-penalties { habit-id: habit-id })))
      (initial-stake (get initial-stake-amount penalty-data))
      (applied-missed (get missed-checkins penalty-data))
      (missed-total (get-missed-checkins last-check-in))
      (new-missed (if (> missed-total applied-missed) (- missed-total applied-missed) u0))
    )
    ;; Verify habit is still active
    (asserts! (get is-active habit) ERR-HABIT-ALREADY-COMPLETED)
    
    ;; Verify window has actually expired relative to last check-in
    (asserts! (not (is-check-in-valid last-check-in)) ERR-NOT-AUTHORIZED)
    ;; Only apply penalties for newly missed windows
    (asserts! (> new-missed u0) ERR-NOT-AUTHORIZED)

    (let
      (
        (raw-penalty (calculate-missed-penalty initial-stake new-missed))
        (applied-penalty (if (> raw-penalty stake-amount) stake-amount raw-penalty))
        (remaining-after (- stake-amount applied-penalty))
        (is-active-after (> remaining-after u0))
      )
      ;; Move penalty to pool
      (var-set forfeited-pool-balance (+ (var-get forfeited-pool-balance) applied-penalty))

      ;; Update habit stake and streak
      (map-set habits
        { habit-id: habit-id }
        (merge habit {
          stake-amount: remaining-after,
          current-streak: u0,
          is-active: is-active-after
        })
      )

      ;; Track applied missed check-ins
      (map-set habit-penalties
        { habit-id: habit-id }
        (merge penalty-data { missed-checkins: (+ applied-missed new-missed) })
      )

      ;; Emit event
      (print {
        event: "habit-slashed",
        habit-id: habit-id,
        slasher: tx-sender,
        missed-checkins: missed-total,
        amount: applied-penalty,
        remaining-stake: remaining-after,
        block: block-height
      })

      (ok true)
    )
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
      (bonus-weight (+ u1 (calculate-referral-boost caller)))
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
        is-completed: true,
        bonus-weight: bonus-weight
      })
    )

    ;; Completed habits become eligible for a single pool bonus claim.
    (var-set unclaimed-completed-habits (+ (var-get unclaimed-completed-habits) u1))
    (var-set unclaimed-completed-weight (+ (var-get unclaimed-completed-weight) bonus-weight))

    ;; Reward referrer (if any) by increasing their referral boost
    (match (map-get? referrals { user: caller })
      referral
        (let
          (
            (referrer (get referrer referral))
            (stats (default-to { successful-referrals: u0 } (map-get? referrer-stats { referrer: referrer })))
          )
          (map-set referrer-stats
            { referrer: referrer }
            { successful-referrals: (+ (get successful-referrals stats) u1) }
          )
          (print { event: "referral-completed", referrer: referrer, referred: caller, habit-id: habit-id, block: block-height })
        )
      none
        true
    )
    
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
      (eligible-weight (var-get unclaimed-completed-weight))
      (bonus-weight (get bonus-weight habit))
      (bonus-amount (calculate-bonus-share pool-balance eligible-weight bonus-weight))
    )
    ;; Verify caller is habit owner
    (asserts! (is-eq caller (get owner habit)) ERR-NOT-HABIT-OWNER)
    
    ;; Verify habit is completed
    (asserts! (get is-completed habit) ERR-INSUFFICIENT-STREAK)

    ;; Verify bonus has not already been claimed for this habit
    (asserts! (not (get bonus-claimed habit)) ERR-BONUS-ALREADY-CLAIMED)
    
    ;; Verify pool has sufficient balance and bonus is non-zero
    (asserts! (> eligible-claimants u0) ERR-POOL-INSUFFICIENT-BALANCE)
    (asserts! (> eligible-weight u0) ERR-POOL-INSUFFICIENT-BALANCE)
    (asserts! (> bonus-amount u0) ERR-POOL-INSUFFICIENT-BALANCE)
    (asserts! (>= pool-balance bonus-amount) ERR-POOL-INSUFFICIENT-BALANCE)
    
    ;; Transfer bonus from pool to user
    (try! (as-contract (stx-transfer? bonus-amount tx-sender caller)))
    
    ;; Update pool balance
    (var-set forfeited-pool-balance (- pool-balance bonus-amount))
    (var-set unclaimed-completed-habits (- eligible-claimants u1))
    (var-set unclaimed-completed-weight (- eligible-weight bonus-weight))

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
      (eligible-weight (var-get unclaimed-completed-weight))
    )
    (ok (calculate-bonus-share pool-balance eligible-weight u1))
  )
)

;; Get total unclaimed bonus weight
(define-read-only (get-unclaimed-completed-weight)
  (ok (var-get unclaimed-completed-weight))
)

;; Get referrer for a user
(define-read-only (get-referrer (user principal))
  (map-get? referrals { user: user })
)

;; Get referrer stats (successful referrals)
(define-read-only (get-referrer-stats (referrer principal))
  (default-to { successful-referrals: u0 } (map-get? referrer-stats { referrer: referrer }))
)

;; Get current referral boost for a referrer
(define-read-only (get-referral-boost (referrer principal))
  (ok (calculate-referral-boost referrer))
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