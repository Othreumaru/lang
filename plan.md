# Milestone: Exact error locations in diagnostics

## Problem

The scanner does not track source positions. When a parse error occurs, the
diagnostic is reported at `(0, 0)` — always the first line, regardless of
where the actual error is.

## Goal

Squiggles and Problems panel entries point to the exact token that caused the
error.

## Plan

### 1. Add `offset` to every token (`src/ks/token.ts`)

Add an `offset: number` field to the base of every token type (or as an
intersection type). This is the character offset from the start of the source
string — cheap to track in the scanner, and `vscode.TextDocument.positionAt()`
converts it to `{ line, character }` without any extra logic.

```ts
// every token gets:
offset: number;
```

### 2. Track offset in the scanner (`src/ks/scan.ts`)

Record `index` at the start of each token production and attach it as `offset`.

```ts
const start = index;
// ... consume chars ...
tokens.push({ type: "Identifier", value: word, offset: start });
```

### 3. Create `KSSyntaxError` (`src/ks/error.ts`)

A custom error class that carries the offset of the problematic token.

```ts
export class KSSyntaxError extends Error {
  constructor(
    message: string,
    public readonly offset: number,
  ) {
    super(message);
    this.name = "KSSyntaxError";
  }
}
```

### 4. Throw `KSSyntaxError` from scanner and parser

Replace bare `throw new Error(...)` calls with `throw new KSSyntaxError(..., token.offset)`.

### 5. Use offset in the extension (`packages/ks-lsp/src/extension.ts`)

```ts
import { KSSyntaxError } from "@ks/core";

} catch (e: unknown) {
  if (e instanceof KSSyntaxError) {
    const pos = document.positionAt(e.offset);
    const range = new vscode.Range(pos, pos.translate(0, 1));
    diagnostics.push(new vscode.Diagnostic(range, e.message, vscode.DiagnosticSeverity.Error));
  } else {
    // fallback to (0,0) for unexpected errors
  }
}
```

### 6. Export `KSSyntaxError` from `@ks/core` barrel (`src/index.ts`)

```ts
export { KSSyntaxError } from "./ks/error.ts";
```

### 7. Update scan tests

Scan tests use `deepStrictEqual` against full token arrays — adding `offset`
is a breaking change to all assertions. Options:

- **Preferred**: update all expected tokens to include `offset`
- Alternative: strip `offset` in a test helper before asserting

### 8. Update parse/print/repl tests

Parser tests pass token arrays directly — they will need `offset` fields added
to all manually constructed tokens in `parse.spec.ts`.

## Acceptance criteria

- Typing `constx isPositive = ...` shows the squiggle under `constx`, not at line 1
- Typing `const x = @@` shows the squiggle under `@`
- All 252 existing tests pass
- `KSSyntaxError` is exported from `@ks/core`
