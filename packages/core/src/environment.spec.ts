import { describe, it } from "node:test";
import { deepStrictEqual, throws } from "node:assert/strict";
import { Environment, defaultEnv } from "./environment.ts";

describe("Environment", () => {
  describe("get", () => {
    it("should return a value that was set", () => {
      const env = new Environment();
      env.set("x", 42);
      deepStrictEqual(env.get("x"), 42);
    });

    it("should look up the enclosing env when the symbol is not local", () => {
      const outer = new Environment();
      outer.set("x", 99);
      const inner = new Environment([], [], outer);
      deepStrictEqual(inner.get("x"), 99);
    });

    it("should throw when the symbol is not found and there is no enclosing env", () => {
      const env = new Environment();
      throws(() => env.get("notDefined"), /is not defined/);
    });

    it("should throw when the symbol is not found in any env", () => {
      const outer = new Environment();
      const inner = new Environment([], [], outer);
      throws(() => inner.get("missing"), /is not defined/);
    });
  });

  describe("has", () => {
    it("should return true for a locally set symbol", () => {
      const env = new Environment();
      env.set("x", 1);
      deepStrictEqual(env.has("x"), true);
    });

    it("should return true when the symbol exists in the enclosing env", () => {
      const outer = new Environment();
      outer.set("x", 1);
      const inner = new Environment([], [], outer);
      deepStrictEqual(inner.has("x"), true);
    });

    it("should return false when the symbol is not found and there is no enclosing env", () => {
      const env = new Environment();
      deepStrictEqual(env.has("missing"), false);
    });

    it("should return false when the symbol is not found in any env", () => {
      const outer = new Environment();
      const inner = new Environment([], [], outer);
      deepStrictEqual(inner.has("missing"), false);
    });
  });

  describe("constructor params/args binding", () => {
    it("should bind params to args", () => {
      const env = new Environment(["a", "b"], [10, 20]);
      deepStrictEqual(env.get("a"), 10);
      deepStrictEqual(env.get("b"), 20);
    });
  });
});

describe("defaultEnv", () => {
  it("should support the = equality operator", () => {
    const eq = defaultEnv.get("=");
    deepStrictEqual(eq(1, 1, 1), true);
    deepStrictEqual(eq(1, 2), false);
  });

  it("should support the else identity operator", () => {
    const elseFn = defaultEnv.get("else");
    deepStrictEqual(elseFn(42), 42);
  });
});
