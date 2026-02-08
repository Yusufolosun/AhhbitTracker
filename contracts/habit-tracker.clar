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
;; CONTRACT INITIALIZATION
;; ============================================

;; Contract is ready for use immediately after deployment
;; No initialization function required
