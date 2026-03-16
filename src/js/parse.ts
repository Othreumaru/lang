import type {
  AST,
  DefineFunctionExpression,
  DefineExpression,
  IfExpression,
} from "../ast.ts";
import type { Token } from "./token.ts";

export const parse = (tokens: Token[]): AST[] => {
  let index = 0;

  const peek = (offset = 0): Token => {
    const i = index + offset;
    if (i < tokens.length) return tokens[i];
    throw new Error("Unexpected end of input");
  };

  const isAtEnd = (): boolean => peek().type === "EOL";

  const advance = (): Token => tokens[index++];

  const consumeType = <T extends Token["type"]>(
    type: T,
  ): Extract<Token, { type: T }> => {
    const t = peek();
    if (t.type !== type) {
      throw new Error(`Expected token ${type}, got ${t.type}`);
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
        throw new Error("Expected 'return' in if body");
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
          throw new Error("Expected 'return' in else body");
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

    // Identifier or function call
    if (t.type === "Identifier") {
      advance();
      if (peek().type === "LeftParen") {
        advance(); // consume (
        const args: AST[] = [];
        while (peek().type !== "RightParen") {
          args.push(parseExpr());
          tryConsume("Comma");
        }
        advance(); // consume )
        return { type: "CallExpression", callee: t.value, args };
      }
      return { type: "SymbolExpression", name: t.value };
    }

    throw new Error(`Unexpected token: ${t.type}`);
  };

  const parseStatement = (): AST => {
    const t = peek();

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

    // function f(params) { return expr; }
    if (t.type === "Keyword" && t.value === "function") {
      advance();
      const name = consumeType("Identifier").value;
      consumeType("LeftParen");
      const params: string[] = [];
      while (peek().type !== "RightParen") {
        params.push(consumeType("Identifier").value);
        tryConsume("Comma");
      }
      consumeType("RightParen");
      consumeType("LeftBrace");
      const ret = advance();
      if (ret.type !== "Keyword" || ret.value !== "return") {
        throw new Error("Expected 'return' in function body");
      }
      const body = parseExpr();
      tryConsume("Semicolon");
      consumeType("RightBrace");
      return {
        type: "DefineFunctionExpression",
        name,
        params,
        body,
      } satisfies DefineFunctionExpression;
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
