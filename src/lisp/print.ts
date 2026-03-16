import type { AST } from "../ast";

const isAllArgsAtom = (args: AST[]): boolean => {
  return args.every(
    (arg) =>
      arg.type === "LiteralExpression" || arg.type === "SymbolExpression",
  );
};

export const print = (ast: AST, indentCount = 0): string => {
  const indent = (count: number) => " ".repeat(count);
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
    case "DefineFunctionExpression": {
      const paramList = ast.params.length ? ` ${ast.params.join(" ")}` : "";
      return `(define (${ast.name}${paramList})\n${indent(indentCount + 2)}${print(ast.body, indentCount + 2)}\n${indent(indentCount)})`;
    }
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
            `${indent(indentCount + 2)}(${print(clause.condition, indentCount + 2)} ${print(clause.thenBranch, indentCount + 2)})`,
        )
        .join("\n")}\n${indent(indentCount)})`;
    case "IfExpression": {
      const elsePart = ast.elseBranch
        ? `\n${indent(indentCount + 2)}${print(ast.elseBranch, indentCount + 2)}`
        : "";
      return `(if ${print(ast.condition, indentCount)} \n${indent(indentCount + 2)}${print(ast.thenBranch, indentCount + 2)}${elsePart}\n${indent(indentCount)})`;
    }
    case "AndExpression":
      return `(and \n${ast.conditions
        .map(
          (condition) =>
            `${indent(indentCount + 2)}${print(condition, indentCount + 2)}`,
        )
        .join("\n")}\n${indent(indentCount)})`;
    case "OrExpression":
      return `(or \n${ast.conditions
        .map(
          (condition) =>
            `${indent(indentCount + 2)}${print(condition, indentCount + 2)}`,
        )
        .join("\n")}\n${indent(indentCount)})`;
    case "LetExpression": {
      const bindingsList = ast.bindings
        .map((b) => `(${b.name} ${print(b.expression, indentCount + 4)})`)
        .join(" ");
      return `(let (${bindingsList})\n${indent(indentCount + 2)}${print(ast.body, indentCount + 2)}\n${indent(indentCount)})`;
    }
  }
};

export const printAll = (ast: AST[]): string => {
  return ast.map((node) => print(node)).join("\n\n") + "\n";
};
