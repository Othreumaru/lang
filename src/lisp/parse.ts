import type {
  AST,
  AtomExpression,
  CallExpression,
  DefineExpression,
  IfExpression,
} from "./ast.ts";
import type { Token } from "./token.ts";

export const parse = (tokens: Token[]): AST[] => {
  let index = 0;

  const peek = (): Token => {
    if (index < tokens.length) {
      return tokens[index];
    }
    throw new Error("Unexpected end of input");
  };

  const isAtEnd = (): boolean => {
    return peek().type === "EOL";
  };

  const isTokenType = (type: Token["type"]): boolean => {
    return peek().type === type;
  };

  const consumeAnyToken = (): Token => {
    const token = peek();
    index++;
    return token;
  };

  const consumeToken = (type: Token["type"]): boolean => {
    if (isTokenType(type)) {
      index++;
      return true;
    }
    return false;
  };

  const consumeIfExpression = (): IfExpression => {
    consumeAnyToken(); // consume "if"
    const condition = consumeExpression();
    const thenBranch = consumeExpression();
    let elseBranch: AST | null = null;
    if (!consumeToken("RightBracket")) {
      elseBranch = consumeExpression();
    }
    return {
      type: "IfExpression",
      condition,
      thenBranch,
      elseBranch,
    };
  };

  const consumeCallExpression = (): CallExpression => {
    const calleeToken = consumeAnyToken();
    if (calleeToken.type !== "Symbol") {
      throw new Error("Expected a symbol for the function name");
    }
    const callee = calleeToken.value;
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

  const consumeExpression = (): AST => {
    if (consumeToken("LeftBracket")) {
      if (consumeToken("RightBracket")) {
        return { type: "LiteralExpression", value: null };
      }
      const token = peek();
      if (token.type === "Symbol" && token.value === "if") {
        return consumeIfExpression();
      }
      if (token.type === "Symbol" && token.value === "define") {
        return consumeDefineExpression();
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
