;; Clarinet-style tests are repository-specific; adapt as needed.
;; This file provides Clarity unit tests for anchored check-in window behaviors.

(define-test test-checkin-within-early-grace
  (let (
          (creator (some-test-principal))
          (stake u20000)
          (name "early-grace-habit")
        )
    (begin
      (unwrap-panic (contract-call? .habit-tracker-v3 create-habit name stake))
      ;; Simulate advancing blocks to just before nominal window
      (begin (block-height+ (- 144 40)))
      (let ((res (contract-call? .habit-tracker-v3 check-in u1)))
        (match res
          ok (asserts! true true)
          err (asserts! false true)
        )
      )
    )
  )
)

(define-test test-checkin-after-late-grace-fails
  (let (
          (creator (some-test-principal))
          (stake u20000)
          (name "late-grace-habit")
        )
    (begin
      (unwrap-panic (contract-call? .habit-tracker-v3 create-habit name stake))
      ;; Advance beyond nominal + late grace
      (begin (block-height+ (+ 144 50)))
      (let ((res (contract-call? .habit-tracker-v3 check-in u2)))
        (match res
          ok (asserts! false true)
          err (asserts! true true)
        )
      )
    )
  )
)
