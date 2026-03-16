import type { AST } from "../ast";

const INFIX_OPS = new Set([
  "+",
  "-",
  "*",
  "/",
  "===",
  "!==",
  ">",
  ">=",
  "<",
  "<=",
]);

export const printExpr = (ast: AST): string => {
  switch (ast.type) {
    case "CallExpression":
      if (typeof ast.callee === "string" && INFIX_OPS.has(ast.callee)) {
        return `(${ast.args.map(printExpr).join(` ${ast.callee} `)})`;
      }
      if (typeof ast.callee === "string") {
        return `${ast.callee}(${ast.args.map(printExpr).join(", ")})`;
      }
      return `${printExpr(ast.callee)}(${ast.args.map(printExpr).join(", ")})`;
    case "DefineExpression":
      return `const ${ast.name} = ${printExpr(ast.expression)}`;
    case "DefineFunctionExpression":
      return `const ${ast.name} = (${ast.params.join(", ")}) => ${printExpr(ast.body)}`;
    case "IfExpression": {
      const thenPart = `{ return ${printExpr(ast.thenBranch)}; }`;
      const elsePart = ast.elseBranch
        ? ` else { return ${printExpr(ast.elseBranch)}; }`
        : "";
      return `if (${printExpr(ast.condition)}) ${thenPart}${elsePart}`;
    }
    case "AndExpression":
      return ast.conditions.map(printExpr).join(" && ");
    case "OrExpression":
      return ast.conditions.map(printExpr).join(" || ");
    case "SymbolExpression":
      return ast.name;
    case "LiteralExpression":
      if (typeof ast.value === "boolean") {
        return `${ast.value}`;
      }
      return JSON.stringify(ast.value);
    default:
      throw new Error(`Unknown AST node type: ${(ast as AST).type}`);
  }
};

export const print = (ast: AST): string => {
  switch (ast.type) {
    case "CallExpression":
      if (typeof ast.callee === "string" && INFIX_OPS.has(ast.callee)) {
        return printExpr(ast);
      }
      return `${printExpr(ast)};`;
    case "DefineExpression":
      return `const ${ast.name} = ${printExpr(ast.expression)};`;
    case "DefineFunctionExpression":
      return `const ${ast.name} = (${ast.params.join(", ")}) => ${printExpr(ast.body)};`;
    case "IfExpression":
      return printExpr(ast);
    default:
      return printExpr(ast);
  }
};

export const printAll = (ast: AST[]) => {
  return ast.map((node) => print(node)).join("\n");
};
