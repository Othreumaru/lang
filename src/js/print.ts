import type { AST } from "../ast";

export const print = (ast: AST): string => {
  switch (ast.type) {
    case "CallExpression":
      if (["+", "-", "*", "/"].includes(ast.callee)) {
        return `(${ast.args.map(print).join(` ${ast.callee} `)})`;
      }
      return `${ast.callee}(${ast.args.map(print).join(", ")});`;
    case "DefineExpression":
      return `const ${ast.name} = ${print(ast.expression)};`;
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
