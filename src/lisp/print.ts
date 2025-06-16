import type { AST } from "../ast";

const isAllArgsAtom = (args: AST[]): boolean => {
  return args.every(
    (arg) => arg.type === "LiteralExpression" || arg.type === "SymbolExpression"
  );
};

export const print = (ast: AST, indentCount = 0): string => {
  const indent = (count) => " ".repeat(count);
  switch (ast.type) {
    case "CallExpression":
      if (ast.args.length === 0) {
        return `(${ast.callee})`;
      }
      if (isAllArgsAtom(ast.args)) {
        return `(${ast.callee} ${ast.args.map(print).join(" ")})`;
      }
      return `(${ast.callee} \n${ast.args
        .map((ast) => print(ast, indentCount + 2))
        .map((str) => `${indent(indentCount + 2)}${str}`)
        .join("\n")}\n${indent(indentCount)})`;
    case "DefineExpression":
      if (ast.expression.type === "CallExpression") {
        return `(define ${ast.name} \n${indent(indentCount + 2)}${print(ast.expression, indentCount + 2)}\n${indent(indentCount)})`;
      }
      return `(define ${ast.name} ${print(ast.expression)})`;
    case "SymbolExpression":
      return ast.name;
    case "LiteralExpression":
      if (typeof ast.value === "boolean") {
        return ast.value ? "#t" : "#f";
      }
      return JSON.stringify(ast.value);
    case "CondExpression":
      return `(cond \n${ast.clauses
        .map(
          (clause) =>
            `${indent(indentCount + 2)}(${print(clause.condition)} ${print(clause.thenBranch)})`
        )
        .join("\n")}\n${indent(indentCount)})`;
    default:
      throw new Error(`Unknown AST node type: ${ast.type}`);
  }
};

export const printAll = (ast: AST[]): string => {
  return ast.map(print).join("\n");
};
