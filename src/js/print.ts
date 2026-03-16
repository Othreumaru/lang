import { zstdCompress } from "node:zlib";
import type { AST } from "../ast";

const printExpr = (ast: AST): string => {
  switch (ast.type) {
    case "CallExpression":
      if (typeof ast.callee === "string") {
        if (["+", "-", "*", "/"].includes(ast.callee)) {
          return `(${ast.args.map(printExpr).join(` ${ast.callee} `)})`;
        }
        return `${ast.callee}(${ast.args.map(printExpr).join(", ")})`;
      }
      return `${printExpr(ast.callee)}(${ast.args.map(printExpr).join(", ")})`;
    case "DefineExpression":
      return `const ${ast.name} = ${printExpr(ast.expression)}`;
    case "SymbolExpression":
      return ast.name;
    case "LiteralExpression":
      if (typeof ast.value === "boolean") {
        return `${ast.value}`;
      }
      return JSON.stringify(ast.value);
    default:
      throw new Error(`Unknown AST node type: ${ast.type}`);
  }
};

export const print = (ast: AST): string => {
  switch (ast.type) {
    case "CallExpression":
      if (typeof ast.callee === "string") {
        if (["+", "-", "*", "/"].includes(ast.callee)) {
          return `(${ast.args.map(printExpr).join(` ${ast.callee} `)})`;
        }
        return `${ast.callee}(${ast.args.map(printExpr).join(", ")});`;
      }
      return `${printExpr(ast.callee)}(${ast.args.map(printExpr).join(", ")});`;
    case "DefineExpression":
      return `const ${ast.name} = ${printExpr(ast.expression)};`;
    case "SymbolExpression":
      return ast.name;
    case "LiteralExpression":
      if (typeof ast.value === "boolean") {
        return `${ast.value}`;
      }
      return JSON.stringify(ast.value);
    default:
      throw new Error(`Unknown AST node type: ${ast.type}`);
  }
};

export const printAll = (ast: AST[]) => {
  const printed = ast.map(print);
  return printed.join("\n");
};
