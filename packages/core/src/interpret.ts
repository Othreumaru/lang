import type { AST } from "./ast.ts";
import type { IEnvironment } from "./environment.ts";
import { defaultEnv, Environment } from "./environment.ts";
import { stdlib } from "./stdlib/index.ts";

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
    if (node.name) env.set(node.name, func);
    return node.name ? undefined : func;
  }
  if (node.type === "LiteralExpression") {
    return node.value;
  }
  if (node.type === "CallExpression") {
    const args = node.args.map((arg) => interpret(arg, env));
    // Method call: obj.method(args) — must call bound to the object so `this` is correct
    if (
      typeof node.callee !== "string" &&
      node.callee.type === "MemberExpression"
    ) {
      const obj = interpret(node.callee.object, env) as Record<string, unknown>;
      const method = obj[node.callee.property];
      if (typeof method !== "function") {
        throw new Error(`"${node.callee.property}" is not a function`);
      }
      return (method as (...a: unknown[]) => unknown).call(obj, ...args);
    }
    const callee =
      typeof node.callee === "string"
        ? node.callee
        : interpret(node.callee, env);
    if (typeof callee === "function") {
      return callee(...args);
    }
    if (env.has(callee)) {
      const func = env.get(callee);
      return func(...args);
    } else {
      throw new Error(`Function ${node.callee} is not defined`);
    }
  }
  if (node.type === "LetExpression") {
    const localEnv = new Environment(
      node.bindings.map((b) => b.name),
      node.bindings.map((b) => interpret(b.expression, env)),
      env,
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
  if (node.type === "ImportExpression") {
    const mod = stdlib[node.module];
    if (!mod) throw new Error(`Module "${node.module}" not found`);
    for (const name of node.names) {
      if (!(name in mod))
        throw new Error(`"${name}" is not exported from "${node.module}"`);
      env.set(name, mod[name]);
    }
    return undefined;
  }
  if (node.type === "NamespaceImportExpression") {
    const mod = stdlib[node.module];
    if (!mod) throw new Error(`Module "${node.module}" not found`);
    const obj = Object.create(null) as Record<string, unknown>;
    for (const [key, value] of Object.entries(mod)) {
      obj[key] = value;
    }
    env.set(node.alias, Object.freeze(obj));
    return undefined;
  }
  if (node.type === "ArrayExpression") {
    return Object.freeze(node.elements.map((el) => interpret(el, env)));
  }
  if (node.type === "IndexExpression") {
    const obj = interpret(node.object, env);
    const idx = interpret(node.index, env);
    if (!Array.isArray(obj)) {
      throw new Error("Index access on a non-array value");
    }
    if (typeof idx !== "number" || idx < 0 || idx >= obj.length) {
      throw new Error(`Index ${idx} is out of bounds`);
    }
    return (obj as unknown[])[idx as number];
  }
  if (node.type === "ObjectExpression") {
    const obj = Object.create(null) as Record<string, unknown>;
    for (const { key, value } of node.properties) {
      obj[key] = interpret(value, env);
    }
    return Object.freeze(obj);
  }
  if (node.type === "MemberExpression") {
    const obj = interpret(node.object, env) as Record<string, unknown>;
    if (obj == null || !(node.property in Object(obj))) {
      throw new Error(`"${node.property}" is not a property of the object`);
    }
    return obj[node.property];
  }
  throw new Error(`Unknown AST node type: ${(node as any).type}`);
};

export const interpretAll = (
  ast: AST[],
  env: IEnvironment = defaultEnv,
): any => {
  let result: any = null;
  for (const node of ast) {
    result = interpret(node, env);
  }
  return result;
};
