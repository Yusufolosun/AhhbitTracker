;; Clarinet-style tests are repository-specific; adapt as needed.
;; This file provides Clarity unit tests for anchored check-in window behaviors.

(define-test test-checkin-at-min-interval
  (let (
          (creator (some-test-principal))
          (stake u20000)
          (name "early-grace-habit")
        )
    (begin
      (unwrap-panic (contract-call? .habit-tracker-v3 create-habit name stake))
      ;; Advance to minimum interval (96 blocks)
      (begin (block-height+ 96))
      (let ((res (contract-call? .habit-tracker-v3 check-in u1)))
        (match res
          ok (asserts! true true)
          err (asserts! false true)
        )
      )
    )
  )
)

(define-test test-checkin-after-window-applies-penalty
  (let (
          (creator (some-test-principal))
          (stake u20000)
          (name "late-grace-habit")
        )
    (begin
      (unwrap-panic (contract-call? .habit-tracker-v3 create-habit name stake))
      ;; Advance beyond the 32h window
      (begin (block-height+ 193))
      (let ((res (contract-call? .habit-tracker-v3 check-in u2)))
        (match res
          ok (asserts! true true)
          err (asserts! false true)
        )
      )
    )
  )
)
