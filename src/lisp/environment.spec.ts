import { describe, it } from "node:test";
import { Environment } from "./environment.ts";
import { deepStrictEqual } from "node:assert/strict";

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
});
