import type { AST } from "../ast.ts";

export type Env = Map<string, any>;

export const defaultEnv: Env = new Map<string, any>();
defaultEnv.set("+", (...nums: number[]) => nums.reduce((a, b) => a + b, 0));
defaultEnv.set("-", (...nums: number[]) => nums.reduce((a, b) => a - b));
defaultEnv.set("*", (...nums: number[]) => nums.reduce((a, b) => a * b, 1));
defaultEnv.set("/", (...nums: number[]) => nums.reduce((a, b) => a / b));

export const interpret = (node: AST, env: Env = defaultEnv): any => {
  if (node.type === "DefineExpression") {
    const value = interpret(node.expression, env);
    env.set(node.name, value);
    return value;
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
  if (node.type === "SymbolExpression") {
    if (env.has(node.name)) {
      return env.get(node.name);
    } else {
      throw new Error(`Symbol ${node.name} is not defined`);
    }
  }
  throw new Error(`Unknown AST node type: ${node.type}`);
};

export const interpretAll = (ast: AST[], env: Env = defaultEnv): any => {
  let result: any = null;
  for (const node of ast) {
    result = interpret(node, env);
  }
  return result;
};
