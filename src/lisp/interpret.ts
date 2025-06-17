import type { AST } from "../ast.ts";
import type { IEnvironment } from "./environment.ts";
import { print } from "./print.ts";
import { defaultEnv, Environment } from "./environment.ts";

export const interpret = (node: AST, env: IEnvironment = defaultEnv): any => {
  if (node.type === "DefineExpression") {
    const value = interpret(node.expression, env);
    env.set(node.name, value);
    return value;
  }
  if (node.type === "DefineFunctionExpression") {
    const func = (...args: any[]) => {
      const localEnv = new Environment(node.params, args, env);
      return interpret(node.body, localEnv);
    };
    env.set(node.name, func);
    return undefined;
  }
  if (node.type === "LiteralExpression") {
    return node.value;
  }
  if (node.type === "CallExpression") {
    const args = node.args.map((arg) => interpret(arg, env));
    if (env.has(node.callee)) {
      const func = env.get(node.callee);
      return func(...args);
    } else {
      throw new Error(`Function ${node.callee} is not defined`);
    }
  }
  if (node.type === "LetExpression") {
    const localEnv = new Environment(
      node.bindings.map((b) => b.name),
      node.bindings.map((b) => interpret(b.expression, env)),
      env
    );
    return interpret(node.body, localEnv);
  }
  if (node.type === "SymbolExpression") {
    if (env.has(node.name)) {
      return env.get(node.name);
    } else {
      throw new Error(`Symbol ${node.name} is not defined`);
    }
  }
  if (node.type === "IfExpression") {
    const condition = interpret(node.condition, env);
    if (condition) {
      return interpret(node.thenBranch, env);
    } else if (node.elseBranch) {
      return interpret(node.elseBranch, env);
    }
    return null;
  }
  if (node.type === "CondExpression") {
    for (const clause of node.clauses) {
      const condition = interpret(clause.condition, env);
      if (condition) {
        return interpret(clause.thenBranch, env);
      }
    }
    return null; // No conditions matched
  }
  if (node.type === "AndExpression") {
    for (const condition of node.conditions) {
      const result = interpret(condition, env);
      if (!result) {
        return false; // Short-circuit
      }
    }
    return true; // All conditions are true
  }
  if (node.type === "OrExpression") {
    for (const condition of node.conditions) {
      const result = interpret(condition, env);
      if (result) {
        return true; // Short-circuit
      }
    }
    return false; // All conditions are false
  }
  throw new Error(`Unknown AST node type: ${(node as any).type}`);
};

export const interpretAll = (
  ast: AST[],
  env: IEnvironment = defaultEnv
): any => {
  let result: any = null;
  for (const node of ast) {
    result = interpret(node, env);
  }
  return result;
};
