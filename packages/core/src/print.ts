import type { AST, IfExpression } from "./ast";

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
      if (!ast.name) {
        return `(${ast.params.join(", ")}) => ${printExpr(ast.body)}`;
      }
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
    case "LetExpression": {
      const params = ast.bindings.map((b) => b.name).join(", ");
      const args = ast.bindings.map((b) => printExpr(b.expression)).join(", ");
      return `((${params}) => ${printExpr(ast.body)})(${args})`;
    }
    case "CondExpression": {
      let result = "null";
      for (let i = ast.clauses.length - 1; i >= 0; i--) {
        result = `${printExpr(ast.clauses[i].condition)} ? ${printExpr(ast.clauses[i].thenBranch)} : ${result}`;
      }
      return result;
    }
    case "ImportExpression":
      return `from "${ast.module}" import { ${ast.names.join(", ")} }`;
    case "NamespaceImportExpression":
      return `from "${ast.module}" import ${ast.alias}`;
    case "ArrayExpression": {
      const els = ast.elements.map((e) => printExpr(e)).join(", ");
      return `[${els}]`;
    }
    case "IndexExpression":
      return `${printExpr(ast.object)}[${printExpr(ast.index)}]`;
    case "ObjectExpression": {
      if (ast.properties.length === 0) return "{}";
      const props = ast.properties
        .map((p) => `${p.key}: ${printExpr(p.value)}`)
        .join(", ");
      return `{ ${props} }`;
    }
    case "MemberExpression":
      return `${printExpr(ast.object)}.${ast.property}`;
    default:
      throw new Error(`Unknown AST node type: ${(ast as AST).type}`);
  }
};

const printIfMultiline = (
  ast: IfExpression,
  outerIndent = "  ",
  innerIndent = "    ",
): string => {
  const elsePart = ast.elseBranch
    ? ` else {\n${innerIndent}return ${printExpr(ast.elseBranch)};\n${outerIndent}}`
    : "";
  return `if (${printExpr(ast.condition)}) {\n${innerIndent}return ${printExpr(ast.thenBranch)};\n${outerIndent}}${elsePart}`;
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
    case "DefineFunctionExpression": {
      const params = `(${ast.params.join(", ")})`;
      if (ast.body.type === "IfExpression") {
        return `const ${ast.name} = ${params} =>\n  ${printIfMultiline(ast.body, "  ", "    ")};`;
      }
      return `const ${ast.name} = ${params} => ${printExpr(ast.body)};`;
    }
    case "IfExpression":
      return printExpr(ast);
    case "LetExpression":
    case "CondExpression":
    case "ImportExpression":
    case "NamespaceImportExpression":
      return `${printExpr(ast)};`;
    default:
      return printExpr(ast);
  }
};

export const printAll = (ast: AST[]) => {
  return ast.map((node) => print(node)).join("\n\n") + "\n";
};
