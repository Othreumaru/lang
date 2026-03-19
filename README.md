# lang

A toy language — **KS** (Krzysztof Script) — with a scanner, parser, interpreter, stdlib, and VS Code tooling.

## Packages

| Package                              | Description                                          |
| ------------------------------------ | ---------------------------------------------------- |
| [`packages/core`](packages/core)     | Language core — scanner, parser, interpreter, stdlib |
| [`packages/ks-lsp`](packages/ks-lsp) | VS Code extension with live parse-error diagnostics  |

## Language

**KS** (`.ks`) — JS-inspired syntax, fully parenthesised infix expressions:

```ks
from "math" import { sqrt, pow };

const hypotenuse = (a, b) => sqrt((pow(a, 2) + pow(b, 2)));
```

## Grammar

The full EBNF grammar is in [`GRAMMAR.ebnf`](GRAMMAR.ebnf). A quick reference:

```ebnf
program    = statement* EOF

statement  = "from" STRING "import" "{" IDENT ("," IDENT)* "}" ";"?
           | "const" IDENT "=" ("(" params ")" "=>" expression | expression) ";"?
           | expression ";"?

expression = "(" expression OPERATOR expression ")"   (* infix, must be parenthesised *)
           | "if" "(" expression ")" then_block ("else" else_block)?
           | IDENT "(" (expression ("," expression)*)? ")"   (* call *)
           | NUMBER | STRING | "true" | "false" | IDENT

OPERATOR   = "+" | "-" | "*" | "/" | "===" | "!==" | ">" | ">=" | "<" | "<=" | "&&" | "||"
```

Key rules:

- **No operator precedence** — all infix expressions must be fully parenthesised: `(1 + (2 * 3))`.
- **Semicolons are optional** everywhere.
- **`if` bodies require `return`**: `if (x) { return 1; } else { return 0; }`.
- **Negative literals** (`-42`) are a single token only when `-` is immediately followed by a digit.

## Getting started

```bash
npm install
npm test               # run all tests
npm run test:coverage  # with coverage report
```

## VS Code extension

For the diagnostic extension (live parse errors), open `packages/ks-lsp` in VS Code and press **F5**.

## Stdlib

Available modules for `from "module" import { ... }`:

| Module    | Functions                                                                                                                               |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `math`    | `floor`, `ceil`, `round`, `sqrt`, `pow`, `min`, `max`, `abs`, `PI`, `hypot`, `log`, `log2`, `log10`, `sign`, `trunc`                    |
| `console` | `log`                                                                                                                                   |
| `string`  | `length`, `slice`, `toUpperCase`, `toLowerCase`, `includes`, `startsWith`, `endsWith`, `concat`, `trim`, `repeat`, `indexOf`, `replace` |
