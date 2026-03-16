import { describe, it } from "node:test";
import { Environment, defaultEnv } from "../environment.ts";
import { deepStrictEqual, throws } from "node:assert/strict";
import { ok } from "node:assert";

describe("Environment", () => {
  it("should create a new environment", () => {
    const env = new Environment();
    deepStrictEqual(env.has("foo"), false);
  });

  it("should set and get a value", () => {
    const env = new Environment();
    env.set("foo", 42);
    deepStrictEqual(env.get("foo"), 42);
  });

  it("should throw an error when getting a non-existent value", () => {
    const env = new Environment();
    try {
      env.get("foo");
    } catch (error) {
      ok(error instanceof Error);
      deepStrictEqual(error.message, "Symbol foo is not defined");
    }
  });

  it("should check if a value exists", () => {
    const env = new Environment();
    env.set("foo", 42);
    deepStrictEqual(env.has("foo"), true);
    deepStrictEqual(env.has("bar"), false);
  });

  it("should create an environment with parameters and arguments", () => {
    const env = new Environment(["x", "y"], [1, 2]);
    deepStrictEqual(env.get("x"), 1);
    deepStrictEqual(env.get("y"), 2);
  });

  it("should get a value from the enclosing environment", () => {
    const outerEnv = new Environment(["x"], [10]);
    const innerEnv = new Environment(["y"], [20], outerEnv);
    deepStrictEqual(innerEnv.get("x"), 10);
    deepStrictEqual(innerEnv.get("y"), 20);
  });

  it("should check has in the enclosing environment", () => {
    const outerEnv = new Environment(["x"], [10]);
    const innerEnv = new Environment([], [], outerEnv);
    deepStrictEqual(innerEnv.has("x"), true);
    deepStrictEqual(innerEnv.has("z"), false);
  });

  it("should throw when getting from enclosing env and not found", () => {
    const outerEnv = new Environment();
    const innerEnv = new Environment([], [], outerEnv);
    throws(() => innerEnv.get("missing"), /Symbol missing is not defined/);
  });

  describe("defaultEnv", () => {
    it("should subtract multiple numbers", () => {
      deepStrictEqual(defaultEnv.get("-")(10, 3), 7);
    });

    it("should negate a single number", () => {
      deepStrictEqual(defaultEnv.get("-")(5), -5);
    });

    it("should multiply numbers", () => {
      deepStrictEqual(defaultEnv.get("*")(2, 3, 4), 24);
    });

    it("should divide numbers", () => {
      deepStrictEqual(defaultEnv.get("/")(10, 2), 5);
    });

    it("should compute abs", () => {
      deepStrictEqual(defaultEnv.get("abs")(-7), 7);
    });

    it("should check equality", () => {
      deepStrictEqual(defaultEnv.get("=")(3, 3), true);
      deepStrictEqual(defaultEnv.get("=")(3, 4), false);
    });

    it("should check >", () => {
      deepStrictEqual(defaultEnv.get(">")(5, 3), true);
      deepStrictEqual(defaultEnv.get(">")(3, 5), false);
    });

    it("should check >=", () => {
      deepStrictEqual(defaultEnv.get(">=")(5, 5), true);
      deepStrictEqual(defaultEnv.get(">=")(4, 5), false);
    });

    it("should check <=", () => {
      deepStrictEqual(defaultEnv.get("<=")(5, 5), true);
      deepStrictEqual(defaultEnv.get("<=")(6, 5), false);
    });

    it("should check <", () => {
      deepStrictEqual(defaultEnv.get("<")(3, 5), true);
      deepStrictEqual(defaultEnv.get("<")(5, 3), false);
    });

    it("should negate a boolean with not", () => {
      deepStrictEqual(defaultEnv.get("not")(true), false);
    });

    it("should return identity with else", () => {
      deepStrictEqual(defaultEnv.get("else")(42), 42);
    });
  });
});
