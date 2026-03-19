import type {
  AST,
  DefineFunctionExpression,
  DefineExpression,
  IfExpression,
  ImportExpression,
  NamespaceImportExpression,
} from "./ast.ts";
import type { Token } from "./token.ts";
import { KSSyntaxError } from "./error.ts";

export const parse = (tokens: Token[]): AST[] => {
  let index = 0;

  const peek = (offset = 0): Token => {
    const i = index + offset;
    if (i < tokens.length) {
      return tokens[i];
    }
    throw new KSSyntaxError(
      "Unexpected end of input",
      tokens[tokens.length - 1].offset,
    );
  };

  const isAtEnd = (): boolean => peek().type === "EOL";

  const advance = (): Token => tokens[index++];

  const consumeType = <T extends Token["type"]>(
    type: T,
  ): Extract<Token, { type: T }> => {
    const t = peek();
    if (t.type !== type) {
      throw new KSSyntaxError(
        `Expected token ${type}, got ${t.type}`,
        t.offset,
      );
    }
    return advance() as Extract<Token, { type: T }>;
  };

  const tryConsume = (type: Token["type"]): boolean => {
    if (peek().type === type) {
      advance();
      return true;
    }
    return false;
  };

  // Look ahead to detect `(params) =>` pattern starting at current index.
  const isArrowFunction = (): boolean => {
    if (peek().type !== "LeftParen") return false;
    let i = 1;
    let depth = 1;
    while (index + i < tokens.length && depth > 0) {
      const t = tokens[index + i];
      if (t.type === "LeftParen") depth++;
      else if (t.type === "RightParen") depth--;
      i++;
    }
    return tokens[index + i]?.type === "Arrow";
  };

  const parseArrowParams = (): string[] => {
    consumeType("LeftParen");
    const params: string[] = [];
    while (peek().type !== "RightParen") {
      params.push(consumeType("Identifier").value);
      tryConsume("Comma");
    }
    consumeType("RightParen");
    return params;
  };

  // Consume any trailing .prop, [index], and (args) chains.
  // symbolName: if provided and the first postfix is a plain call, use the string as callee.
  const applyPostfix = (node: AST, symbolName?: string): AST => {
    let result = node;
    let first = true;
    for (;;) {
      if (peek().type === "Dot") {
        advance(); // consume .
        const prop = consumeType("Identifier");
        result = {
          type: "MemberExpression",
          object: result,
          property: prop.value,
        };
        first = false;
      } else if (peek().type === "LeftBracket") {
        advance(); // consume [
        const index = parseExpr();
        consumeType("RightBracket");
        result = { type: "IndexExpression", object: result, index };
        first = false;
      } else if (peek().type === "LeftParen") {
        advance(); // consume (
        const args: AST[] = [];
        while (peek().type !== "RightParen") {
          args.push(parseExpr());
          tryConsume("Comma");
        }
        advance(); // consume )
        // Plain symbol call f(x) uses string callee; all others use AST callee
        const callee: string | AST =
          first && symbolName !== undefined ? symbolName : result;
        result = { type: "CallExpression", callee, args };
        first = false;
      } else {
        break;
      }
    }
    return result;
  };

  const parseExpr = (): AST => {
    const t = peek();

    // (expr op expr)  — parenthesised infix expression
    if (t.type === "LeftParen") {
      advance();
      const left = parseExpr();
      if (peek().type === "Operator") {
        const op = (advance() as Extract<Token, { type: "Operator" }>).value;
        const right = parseExpr();
        consumeType("RightParen");
        if (op === "&&") {
          return { type: "AndExpression", conditions: [left, right] };
        }
        if (op === "||") {
          return { type: "OrExpression", conditions: [left, right] };
        }
        return { type: "CallExpression", callee: op, args: [left, right] };
      }
      consumeType("RightParen");
      return left;
    }

    // if (cond) { return then; } else { return else; }
    if (t.type === "Keyword" && t.value === "if") {
      advance();
      consumeType("LeftParen");
      const condition = parseExpr();
      consumeType("RightParen");
      consumeType("LeftBrace");
      const thenRet = advance();
      if (thenRet.type !== "Keyword" || thenRet.value !== "return") {
        throw new KSSyntaxError("Expected 'return' in if body", thenRet.offset);
      }
      const thenBranch = parseExpr();
      tryConsume("Semicolon");
      consumeType("RightBrace");
      let elseBranch: AST | null = null;
      if (
        peek().type === "Keyword" &&
        (peek() as Extract<Token, { type: "Keyword" }>).value === "else"
      ) {
        advance();
        consumeType("LeftBrace");
        const elseRet = advance();
        if (elseRet.type !== "Keyword" || elseRet.value !== "return") {
          throw new KSSyntaxError(
            "Expected 'return' in else body",
            elseRet.offset,
          );
        }
        elseBranch = parseExpr();
        tryConsume("Semicolon");
        consumeType("RightBrace");
      }
      return {
        type: "IfExpression",
        condition,
        thenBranch,
        elseBranch,
      } satisfies IfExpression;
    }

    // Boolean literals
    if (t.type === "Keyword" && (t.value === "true" || t.value === "false")) {
      advance();
      return { type: "LiteralExpression", value: t.value === "true" };
    }

    // Array literal  [expr, ...]
    if (t.type === "LeftBracket") {
      advance();
      const elements: AST[] = [];
      while (peek().type !== "RightBracket") {
        elements.push(parseExpr());
        tryConsume("Comma");
      }
      consumeType("RightBracket");
      return applyPostfix({ type: "ArrayExpression", elements });
    }

    // Object literal  { key: expr, ... }
    if (t.type === "LeftBrace") {
      advance();
      const properties: { key: string; value: AST }[] = [];
      while (peek().type !== "RightBrace") {
        const key = consumeType("Identifier").value;
        consumeType("Colon");
        const value = parseExpr();
        tryConsume("Comma");
        properties.push({ key, value });
      }
      consumeType("RightBrace");
      return applyPostfix({ type: "ObjectExpression", properties });
    }

    // Number literal
    if (t.type === "Number") {
      advance();
      return { type: "LiteralExpression", value: t.value };
    }

    // String literal
    if (t.type === "String") {
      advance();
      return { type: "LiteralExpression", value: t.value };
    }

    // Identifier — may be followed by any postfix chain (.prop, [idx], (args))
    if (t.type === "Identifier") {
      advance();
      return applyPostfix({ type: "SymbolExpression", name: t.value }, t.value);
    }

    throw new KSSyntaxError(`Unexpected token: ${t.type}`, t.offset);
  };

  const parseStatement = (): AST => {
    const t = peek();

    // Two consecutive identifiers is never valid — likely a misspelled keyword
    if (t.type === "Identifier" && peek(1).type === "Identifier") {
      throw new KSSyntaxError(
        `Unexpected identifier '${t.value}'; did you mean 'const' or 'let'?`,
        t.offset,
      );
    }

    // from "module" import name1, name2;
    if (t.type === "Keyword" && t.value === "from") {
      advance();
      const module = consumeType("String").value;
      const imp = advance();
      if (imp.type !== "Keyword" || imp.value !== "import") {
        throw new KSSyntaxError(
          "Expected 'import' after module name",
          imp.offset,
        );
      }
      // from "mod" import Alias;  — namespace import (whole module as object)
      if (peek().type === "Identifier") {
        const alias = consumeType("Identifier").value;
        tryConsume("Semicolon");
        return {
          type: "NamespaceImportExpression",
          module,
          alias,
        } satisfies NamespaceImportExpression;
      }
      const names: string[] = [];
      consumeType("LeftBrace");
      while (!isAtEnd() && peek().type !== "RightBrace") {
        names.push(consumeType("Identifier").value);
        tryConsume("Comma");
      }
      consumeType("RightBrace");
      tryConsume("Semicolon");
      return {
        type: "ImportExpression",
        module,
        names,
      } satisfies ImportExpression;
    }

    // const x = expr;  or  const f = (params) => expr;
    if (t.type === "Keyword" && t.value === "const") {
      advance();
      const name = consumeType("Identifier").value;
      consumeType("Assign");
      if (isArrowFunction()) {
        const params = parseArrowParams();
        consumeType("Arrow");
        const body = parseExpr();
        tryConsume("Semicolon");
        return {
          type: "DefineFunctionExpression",
          name,
          params,
          body,
        } satisfies DefineFunctionExpression;
      }
      const expression = parseExpr();
      tryConsume("Semicolon");
      return {
        type: "DefineExpression",
        name,
        expression,
      } satisfies DefineExpression;
    }

    // Expression statement
    const expr = parseExpr();
    tryConsume("Semicolon");
    return expr;
  };

  const result: AST[] = [];
  while (!isAtEnd()) {
    result.push(parseStatement());
  }
  return result;
};
