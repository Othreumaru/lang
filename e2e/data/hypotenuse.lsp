(from "math" import sqrt pow)

(define (hypotenuse a b)
  (sqrt
    (+
      (pow a 2)
      (pow b 2)
    )
  )
)
