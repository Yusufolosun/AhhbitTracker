;; ============================================
;; Habit Accountability Groups - Standalone Contract
;; ============================================
;;
;; Companion contract for AhhbitTracker that enables group-based
;; accountability. Members stake STX and are settled after the group
;; duration ends based on streak progress. Successful members split
;; the pool; if everyone fails, stakes are refunded.
;;
;; Reads habit data from habit-tracker-v3 via contract-call? get-habit.
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

;; Blocks per 24h day (used for streak threshold calculation)
(define-constant BLOCKS-PER-DAY u144)

;; Minimum stake required (mirrors habit-tracker-v3 MIN-STAKE-AMOUNT)
(define-constant MIN-STAKE-AMOUNT u20000)

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
    member: principal,
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

;; ============================================
;; PRIVATE HELPERS
;; ============================================

;; Generate next group ID
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
;; @param stake-amount: STX stake per member in microSTX
;; @param duration: group duration in blocks
;; @param habit-id: caller's habit ID (must be active and owned by caller)
;; @returns: group-id on success
(define-public (create-group (stake-amount uint) (duration uint) (habit-id uint))
  (let
    (
      (group-id (get-next-group-id))
      (caller tx-sender)
      (habit (unwrap! (contract-call? .habit-tracker-v3 get-habit habit-id) ERR-INVALID-HABIT))
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

    ;; Transfer stake from creator to this contract
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
        member: caller,
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
          { group-ids: (unwrap! (as-max-len? (append (get group-ids existing) group-id) u20) ERR-GROUP-LIMIT-REACHED) }
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
;; @param group-id: ID of the group to join
;; @param habit-id: caller's habit ID (must be active and owned by caller)
;; @returns: true on success
(define-public (join-group (group-id uint) (habit-id uint))
  (let
    (
      (caller tx-sender)
      (group (unwrap! (map-get? groups { group-id: group-id }) ERR-GROUP-NOT-FOUND))
      (habit (unwrap! (contract-call? .habit-tracker-v3 get-habit habit-id) ERR-INVALID-HABIT))
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
        member: caller,
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
          { group-ids: (unwrap! (as-max-len? (append (get group-ids existing) group-id) u20) ERR-GROUP-LIMIT-REACHED) }
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

;; Settle a member after the group duration ends (permissionless)
;; Reads the member's habit streak from habit-tracker-v3 and compares
;; streak progress against the group threshold.
;; @param group-id: group ID
;; @param member: member principal to settle
;; @returns: true if successful, false if failed
(define-public (settle-member (group-id uint) (member principal))
  (let
    (
      (group (unwrap! (map-get? groups { group-id: group-id }) ERR-GROUP-NOT-FOUND))
      (member-data (unwrap! (map-get? group-members { group-id: group-id, member: member }) ERR-NOT-MEMBER))
      (member-principal (get member member-data))
      (habit (unwrap! (contract-call? .habit-tracker-v3 get-habit (get habit-id member-data)) ERR-INVALID-HABIT))
      (current-streak (get current-streak habit))
      (streak-delta (if (> current-streak (get streak-at-join member-data)) (- current-streak (get streak-at-join member-data)) u0))
      (duration-blocks (- (get end-block group) (get start-block group)))
      (required-days (/ duration-blocks BLOCKS-PER-DAY))
      (half-required (/ required-days u2))
      (threshold (if (> half-required u0) half-required u1))
    )
    ;; Group duration must have ended
    (asserts! (>= block-height (get end-block group)) ERR-GROUP-STILL-ACTIVE)

    ;; Group must still be active (not finalized)
    (asserts! (get is-active group) ERR-GROUP-NOT-ACTIVE)

    ;; Member must not already be settled
    ;; Note: has-claimed is used as a "settled-as-failed" flag during settlement.
    ;; is-successful is used as the "settled-as-successful" flag.
    (asserts! (not (get is-successful member-data)) ERR-ALREADY-SETTLED)
    (asserts! (not (get has-claimed member-data)) ERR-ALREADY-SETTLED)

    (if (>= streak-delta threshold)
      (begin
        (map-set group-members { group-id: group-id, member: member-principal } (merge member-data { is-successful: true }))
        (map-set groups { group-id: group-id } (merge group { successful-count: (+ (get successful-count group) u1), settled-count: (+ (get settled-count group) u1) }))
        (print { event: "member-settled-success", group-id: group-id, member: member-principal, streak-delta: streak-delta })
        (ok true)
      )
      (begin
        ;; Mark as settled-failed using has-claimed flag
        (map-set group-members { group-id: group-id, member: member-principal } (merge member-data { has-claimed: true }))
        (map-set groups { group-id: group-id } (merge group { settled-count: (+ (get settled-count group) u1) }))
        (print { event: "member-settled-failed", group-id: group-id, member: member-principal, streak-delta: streak-delta })
        (ok false)
      )
    )
  )
)

;; Claim share of group pool for successful members
;; @param group-id: group ID
;; @returns: share amount on success
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
;; @param group-id: group ID
;; @param member: member to refund
;; @returns: refund amount on success
(define-public (refund-failed-group (group-id uint) (member principal))
  (let
    (
      (group (unwrap! (map-get? groups { group-id: group-id }) ERR-GROUP-NOT-FOUND))
      (member-data (unwrap! (map-get? group-members { group-id: group-id, member: member }) ERR-NOT-MEMBER))
      (member-principal (get member member-data))
      (stake-amount (get stake-amount group))
    )
    ;; Group must have ended
    (asserts! (>= block-height (get end-block group)) ERR-GROUP-STILL-ACTIVE)

    ;; Group must be settled and have zero successful members
    (asserts! (get is-settled group) ERR-GROUP-STILL-ACTIVE)
    (asserts! (is-eq (get successful-count group) u0) ERR-NOT-ELIGIBLE)

    ;; Member must have been settled as failed (has-claimed = true from settle-member)
    (asserts! (get has-claimed member-data) ERR-NOT-ELIGIBLE)

    ;; Member must not have already been refunded (is-successful used as refund flag)
    (asserts! (not (get is-successful member-data)) ERR-ALREADY-CLAIMED)

    (try! (as-contract (stx-transfer? stake-amount tx-sender member-principal)))

    ;; Mark as refunded
    (map-set group-members { group-id: group-id, member: member-principal } (merge member-data { is-successful: true }))

    (print { event: "group-refund-claimed", group-id: group-id, member: member-principal, amount: stake-amount })

    (ok stake-amount)
  )
)

;; Finalize a group after all members have been settled
;; @param group-id: group ID
;; @returns: true on success
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

;; ============================================
;; READ-ONLY FUNCTIONS
;; ============================================

(define-read-only (get-group (group-id uint))
  (map-get? groups { group-id: group-id })
)

(define-read-only (get-member-info (group-id uint) (member principal))
  (map-get? group-members { group-id: group-id, member: member })
)

(define-read-only (get-member-groups-list (member principal))
  (default-to { group-ids: (list) } (map-get? member-groups { member: member }))
)

(define-read-only (get-total-groups)
  (ok (var-get group-id-nonce))
)

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
