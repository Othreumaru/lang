(from "string" import concat toUpperCase trim repeat)

(define (greet name)
  (concat "Hello, " (toUpperCase (trim name)) "!")
)

(define (banner name)
  (concat (repeat "-" 20) (greet name) (repeat "-" 20))
)
