import { char } from "./combinators.ts";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("char combinator", () => {
  it("should return true for matching character", () => {
    const result = char("a")("abc");
    assert.strictEqual(result, true);
  });

  it("should return false for non-matching character", () => {
    const result = char("a")("bca");
    assert.strictEqual(result, false);
  });
});
