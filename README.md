# lang

A toy two-language system: **KS** (Krzysztof Script) and **Lisp**, with a shared AST, interpreter, and VS Code tooling.

## Packages

| Package                                    | Description                                          |
| ------------------------------------------ | ---------------------------------------------------- |
| [`packages/core`](packages/core)           | Language core — scanner, parser, interpreter, stdlib |
| [`packages/vscode-ks`](packages/vscode-ks) | VS Code syntax highlighting for `.ks` files          |
| [`packages/ks-lsp`](packages/ks-lsp)       | VS Code extension with live parse-error diagnostics  |

## Languages

**KS** (`.ks`) — JS-inspired syntax:

```ks
from "math" import { sqrt, pow };

const hypotenuse = (a, b) => sqrt((pow(a, 2) + pow(b, 2)));
```

**Lisp** (`.lsp`) — S-expression syntax, same semantics:

```lisp
(from "math" import sqrt pow)

(define (hypotenuse a b)
  (sqrt (+ (pow a 2) (pow b 2)))
)
```

Both compile to the same shared AST and run on the same interpreter.

## Getting started

```bash
npm install
npm test               # run all tests (252)
npm run test:coverage  # with coverage report
```

## VS Code extension

Install the syntax highlighter locally:

```bash
npm run install-ext
```

For development (grammar changes), open `packages/vscode-ks` in VS Code and press **F5**.

For the diagnostic extension (live parse errors), open `packages/ks-lsp` in VS Code and press **F5**.

## Stdlib

Available modules for `from "module" import { ... }`:

| Module    | Functions                                                                                                                               |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `math`    | `floor`, `ceil`, `round`, `sqrt`, `pow`, `min`, `max`, `abs`, `PI`, `hypot`, `log`, `log2`, `log10`, `sign`, `trunc`                    |
| `console` | `log`                                                                                                                                   |
| `string`  | `length`, `slice`, `toUpperCase`, `toLowerCase`, `includes`, `startsWith`, `endsWith`, `concat`, `trim`, `repeat`, `indexOf`, `replace` |
