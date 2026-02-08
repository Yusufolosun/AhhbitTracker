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

;; ============================================
;; CONTRACT INITIALIZATION
;; ============================================

;; Contract is ready for use immediately after deployment
;; No initialization function required
