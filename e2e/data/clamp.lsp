(from "math" import min max sign abs)

(define (clamp x lo hi)
  (min (max x lo) hi)
)

(define (isPositive x)
  (> (sign x) 0)
)

(define (diff a b)
  (abs (- a b))
)
