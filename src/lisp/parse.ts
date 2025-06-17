import type {
  AST,
  AtomExpression,
  CallExpression,
  CondExpression,
  DefineExpression,
  DefineFunctionExpression,
  IfExpression,
} from "../ast.ts";
import type { Token } from "./token.ts";

export const parse = (tokens: Token[]): AST[] => {
  let index = 0;

  const peek = (offset: number = 0): Token => {
    if (index + offset < tokens.length) {
      return tokens[index + offset];
    }
    throw new Error("Unexpected end of input");
  };

  const isAtEnd = (): boolean => {
    return peek().type === "EOL";
  };

  const isTokenOfType = <T extends Token["type"]>(
    token: Token,
    type: T
  ): token is Extract<Token, { type: T }> => {
    return token.type === type;
  };

  const consumeAnyToken = (): Token => {
    const token = peek();
    index++;
    return token;
  };

  const consumeToken = <T extends Token["type"]>(
    type: T
  ): Extract<Token, { type: T }> | null => {
    const token = peek();
    if (isTokenOfType(token, type)) {
      index++;
      return token;
    }
    return null;
  };

  const consumeTokenOrThrow = <T extends Token["type"]>(
    type: T
  ): Extract<Token, { type: T }> => {
    const token = consumeToken(type);
    if (!token) {
      throw new Error(`Expected token of type ${type}, but found none`);
    }
    return token;
  };

  const consumeIfExpression = (): IfExpression => {
    consumeAnyToken(); // consume "if"
    const condition = consumeExpression();
    const thenBranch = consumeExpression();
    let elseBranch: AST | null = null;
    if (!consumeToken("RightBracket")) {
      elseBranch = consumeExpression();
    }
    consumeToken("RightBracket"); // consume the closing bracket
    return {
      type: "IfExpression",
      condition,
      thenBranch,
      elseBranch,
    };
  };

  const consumeCondExpression = (): CondExpression => {
    consumeAnyToken(); // consume "cond"
    const clauses: CondExpression["clauses"] = [];
    while (!isAtEnd() && !consumeToken("RightBracket")) {
      consumeTokenOrThrow("LeftBracket"); // consume the opening bracket for each clause
      const condition = consumeExpression();
      const body = consumeExpression();
      if (!consumeToken("RightBracket")) {
        throw new Error("Expected closing bracket for cond clause");
      }
      clauses.push({ condition, thenBranch: body });
    }
    consumeToken("RightBracket"); // consume the closing bracket
    return { type: "CondExpression", clauses };
  };

  const consumeCallExpression = (): CallExpression => {
    const isExpression = peek().type === "LeftBracket";
    let callee: string | AST;
    if (isExpression) {
      callee = consumeExpression();
    } else {
      const token = consumeAnyToken();
      if (token.type !== "Symbol") {
        throw new Error(
          "Expected a symbol for the function name or expression"
        );
      }
      callee = token.value;
    }
    const args: AST[] = [];
    while (!isAtEnd() && !consumeToken("RightBracket")) {
      args.push(consumeExpression());
    }
    return { type: "CallExpression", callee, args };
  };

  const consumeLiteralExpression = (): AtomExpression => {
    const token = consumeAnyToken();
    switch (token.type) {
      case "Symbol":
        return { type: "SymbolExpression", name: token.value };
      case "Number":
        return { type: "LiteralExpression", value: token.value };
      case "String":
        return { type: "LiteralExpression", value: token.value };
      case "Boolean":
        return { type: "LiteralExpression", value: token.value };
      default:
        throw new Error(`Unexpected token type: ${token.type}`);
    }
  };

  const consumeDefineExpression = (): DefineExpression => {
    consumeAnyToken(); // consume "define"
    const nameToken = consumeAnyToken();
    if (nameToken.type !== "Symbol") {
      throw new Error("Expected a symbol for the function name");
    }
    const name = nameToken.value;
    const expr = consumeExpression();
    consumeToken("RightBracket"); // consume the closing bracket
    return { type: "DefineExpression", name, expression: expr };
  };

  const consumeDefineFunctionExpression = (): DefineFunctionExpression => {
    consumeAnyToken(); // consume "define"
    const params: string[] = [];
    consumeTokenOrThrow("LeftBracket"); // consume the opening bracket
    const nameToken = consumeTokenOrThrow("Symbol");
    const name = nameToken.value;
    while (!isAtEnd() && !consumeToken("RightBracket")) {
      const paramToken = consumeTokenOrThrow("Symbol");
      params.push(paramToken.value);
    }
    const body = consumeExpression();
    consumeToken("RightBracket"); // consume the closing bracket
    return { type: "DefineFunctionExpression", name, params, body };
  };

  const consumeLetExpression = (): AST => {
    consumeAnyToken(); // consume "let"
    const bindings: { name: string; expression: AST }[] = [];
    consumeTokenOrThrow("LeftBracket"); // consume the opening bracket
    while (!isAtEnd() && !consumeToken("RightBracket")) {
      const nameToken = consumeTokenOrThrow("Symbol");
      const name = nameToken.value;
      const expr = consumeExpression();
      bindings.push({ name, expression: expr });
    }
    const body = consumeExpression();
    consumeToken("RightBracket"); // consume the closing bracket
    return { type: "LetExpression", bindings, body };
  };

  const consumeAndExpression = (): AST => {
    consumeAnyToken(); // consume "and"
    const conditions: AST[] = [];
    while (!isAtEnd() && !consumeToken("RightBracket")) {
      conditions.push(consumeExpression());
    }
    consumeToken("RightBracket"); // consume the closing bracket
    return { type: "AndExpression", conditions };
  };

  const consumeOrExpression = (): AST => {
    consumeAnyToken(); // consume "or"
    const conditions: AST[] = [];
    while (!isAtEnd() && !consumeToken("RightBracket")) {
      conditions.push(consumeExpression());
    }
    consumeToken("RightBracket"); // consume the closing bracket
    return { type: "OrExpression", conditions };
  };

  const consumeExpression = (): AST => {
    if (consumeToken("LeftBracket")) {
      if (consumeToken("RightBracket")) {
        return { type: "LiteralExpression", value: null };
      }
      const token = peek();
      if (token.type === "Symbol" && token.value === "if") {
        return consumeIfExpression();
      }
      if (token.type === "Symbol" && token.value === "cond") {
        return consumeCondExpression();
      }
      if (token.type === "Symbol" && token.value === "define") {
        const nextToken = peek(1);
        if (nextToken.type === "LeftBracket") {
          return consumeDefineFunctionExpression();
        }
        return consumeDefineExpression();
      }
      if (token.type === "Symbol" && token.value === "and") {
        return consumeAndExpression();
      }
      if (token.type === "Symbol" && token.value === "or") {
        return consumeOrExpression();
      }
      if (token.type === "Symbol" && token.value === "let") {
        return consumeLetExpression();
      }
      return consumeCallExpression();
    }
    return consumeLiteralExpression();
  };

  const expressions: AST[] = [];
  while (!isAtEnd()) {
    const expr = consumeExpression();
    expressions.push(expr);
  }

  return expressions;
};
