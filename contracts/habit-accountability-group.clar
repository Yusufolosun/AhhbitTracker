;; Wrapper for accountability group functions — forwards to habit-tracker-v2
;; This thin adapter preserves the original contract namespace for tests

(define-read-only (contract-info)
  (ok "habit's accountability wrapper to habit-tracker-v2")
)

(define-public (create-group (stake-amount uint) (duration uint) (habit-id uint))
  (contract-call? .habit-tracker-v2 create-group stake-amount duration habit-id)
)

(define-public (join-group (group-id uint) (habit-id uint))
  (contract-call? .habit-tracker-v2 join-group group-id habit-id)
)

(define-public (settle-member (group-id uint) (member principal))
  (contract-call? .habit-tracker-v2 settle-member group-id member)
)

(define-public (claim-group-reward (group-id uint))
  (contract-call? .habit-tracker-v2 claim-group-reward group-id)
)

(define-public (refund-failed-group (group-id uint) (member principal))
  (contract-call? .habit-tracker-v2 refund-failed-group group-id member)
)

(define-public (finalize-group (group-id uint))
  (contract-call? .habit-tracker-v2 finalize-group group-id)
)

(define-read-only (get-group (group-id uint))
  (contract-call? .habit-tracker-v2 get-group group-id)
)

(define-read-only (get-member-info (group-id uint) (member principal))
  (contract-call? .habit-tracker-v2 get-member-info group-id member)
)

(define-read-only (get-member-groups (member principal))
  (contract-call? .habit-tracker-v2 get-member-groups member)
)

(define-read-only (get-total-groups)
  (contract-call? .habit-tracker-v2 get-total-groups)
)

(define-read-only (get-group-share (group-id uint))
  (contract-call? .habit-tracker-v2 get-group-share group-id)
)
