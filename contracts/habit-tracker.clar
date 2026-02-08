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
;; Minimum: 0.1 STX = 100,000 microSTX
(define-constant MIN-STAKE-AMOUNT u100000)

;; Maximum habit name length
(define-constant MAX-HABIT-NAME-LENGTH u50)

;; Check-in window (in blocks)
;; ~144 blocks per day on Stacks (10 min per block)
(define-constant CHECK-IN-WINDOW u144)

;; Minimum streak required for withdrawal
(define-constant MIN-STREAK-FOR-WITHDRAWAL u7)

;; Contract owner
(define-constant CONTRACT-OWNER tx-sender)

;; ============================================
;; ERROR CODES
;; ============================================

(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-INVALID-STAKE-AMOUNT (err u101))
(define-constant ERR-INVALID-HABIT-NAME (err u102))
(define-constant ERR-HABIT-NOT-FOUND (err u103))
(define-constant ERR-NOT-HABIT-OWNER (err u104))
(define-constant ERR-ALREADY-CHECKED-IN (err u105))
(define-constant ERR-CHECK-IN-WINDOW-EXPIRED (err u106))
(define-constant ERR-INSUFFICIENT-STREAK (err u107))
(define-constant ERR-HABIT-ALREADY-COMPLETED (err u108))
(define-constant ERR-POOL-INSUFFICIENT-BALANCE (err u109))
(define-constant ERR-TRANSFER-FAILED (err u110))

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
    is-completed: bool
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
    (< blocks-elapsed u1)
  )
)

;; ============================================
;; PUBLIC FUNCTIONS - HABIT MANAGEMENT
;; ============================================

;; Create a new habit with stake
;; @param name: Habit description (max 50 characters)
;; @param stake-amount: Amount to stake in microSTX (min 0.1 STX)
;; @returns: habit-id on success, error code on failure
(define-public (create-habit (name (string-utf8 50)) (stake-amount uint))
  (let
    (
      (habit-id (get-next-habit-id))
      (caller tx-sender)
    )
    ;; Validate stake amount
    (asserts! (>= stake-amount MIN-STAKE-AMOUNT) ERR-INVALID-STAKE-AMOUNT)
    
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
        is-completed: false
      }
    )
    
    ;; Add habit to user's habit list
    (match (map-get? user-habits { user: caller })
      existing-habits
        (map-set user-habits
          { user: caller }
          { habit-ids: (unwrap! (as-max-len? (append (get habit-ids existing-habits) habit-id) u100) ERR-HABIT-NOT-FOUND) }
        )
      ;; First habit for this user
      (map-set user-habits
        { user: caller }
        { habit-ids: (list habit-id) }
      )
    )
    
    ;; Return habit ID
    (ok habit-id)
  )
)

;; Daily check-in for habit
;; @param habit-id: ID of the habit to check in
;; @returns: current streak on success, error on failure
(define-public (check-in (habit-id uint))
  (let
    (
      (caller tx-sender)
      (habit (unwrap! (map-get? habits { habit-id: habit-id }) ERR-HABIT-NOT-FOUND))
      (last-check-in (get last-check-in-block habit))
      (current-streak (get current-streak habit))
      (stake-amount (get stake-amount habit))
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
        (ok (+ current-streak u1))
      )
      ;; Missed window: forfeit stake and reset
      (begin
        ;; Add stake to forfeited pool
        (var-set forfeited-pool-balance (+ (var-get forfeited-pool-balance) stake-amount))
        
        ;; Reset habit
        (map-set habits
          { habit-id: habit-id }
          (merge habit {
            current-streak: u0,
            is-active: false
          })
        )
        
        ERR-CHECK-IN-WINDOW-EXPIRED
      )
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
      ;; Simple bonus calculation: 10% of pool per completed habit
      (bonus-amount (/ pool-balance u10))
    )
    ;; Verify caller is habit owner
    (asserts! (is-eq caller (get owner habit)) ERR-NOT-HABIT-OWNER)
    
    ;; Verify habit is completed
    (asserts! (get is-completed habit) ERR-INSUFFICIENT-STREAK)
    
    ;; Verify pool has sufficient balance
    (asserts! (>= pool-balance bonus-amount) ERR-POOL-INSUFFICIENT-BALANCE)
    
    ;; Transfer bonus from pool to user
    (try! (as-contract (stx-transfer? bonus-amount tx-sender caller)))
    
    ;; Update pool balance
    (var-set forfeited-pool-balance (- pool-balance bonus-amount))
    
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

;; Get total habits created
(define-read-only (get-total-habits)
  (ok (var-get habit-id-nonce))
)

;; ============================================
;; CONTRACT INITIALIZATION
;; ============================================

;; Contract is ready for use immediately after deployment
;; No initialization function required
