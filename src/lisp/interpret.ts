import type { AST } from "../ast.ts";
import type { IEnvironment } from "./environment.ts";
import { defaultEnv, Environment } from "./environment.ts";

export const interpret = (node: AST, env: IEnvironment = defaultEnv): any => {
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
  throw new Error(`Unknown AST node type: ${node.type}`);
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
