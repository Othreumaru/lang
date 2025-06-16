import type { LeftBracketToken, RightBracketToken, Token } from "./token.ts";

const leftBracketToken: LeftBracketToken = {
  type: "LeftBracket",
};

const rightBracketToken: RightBracketToken = {
  type: "RightBracket",
};

const isDigit = (char: string): boolean => {
  return char >= "0" && char <= "9";
};

const isIdentifier = (char: string): boolean => {
  return (
    (char >= "a" && char <= "z") ||
    (char >= "A" && char <= "Z") ||
    ["*", "-", "+", "/", "=", "?", "<", ">"].includes(char)
  );
};

export const scan = (input: string): Token[] => {
  let index = 0;
  const tokens: Token[] = [];

  const peek = (offset: number = 0): string | undefined => {
    if (index + offset < input.length) {
      return input[index + offset];
    }
    return undefined;
  };

  const consumeWhile = (predicate: (char: string) => boolean): string => {
    let result = "";
    while (index < input.length && predicate(input[index])) {
      result += input[index];
      index++;
    }
    return result;
  };

  const consume = (expected: string): boolean => {
    if (peek() === expected) {
      index++;
      return true;
    }
    return false;
  };

  const consumeDigit = (): void => {
    let numStr = "";
    if (peek() === "-") {
      consume("-");
      numStr += "-";
    }
    numStr += consumeWhile(isDigit);
    if (consume(".")) {
      numStr += ".";
      numStr += consumeWhile(isDigit);
    }
    tokens.push({ type: "Number", value: parseFloat(numStr) });
  };

  while (index < input.length) {
    const char = peek();
    switch (char) {
      case "(":
        consume("(");
        tokens.push(leftBracketToken);
        break;
      case ")":
        consume(")");
        tokens.push(rightBracketToken);
        break;
      case " ":
        consume(" ");
        break;
      case "\n":
        consume("\n");
        break;
      case "\r":
        consume("\r");
        break;
      case "\t":
        consume("\t");
        break;
      case '"':
        {
          consume('"');
          let str = consumeWhile((c) => c !== '"');
          if (consume('"')) {
            tokens.push({ type: "String", value: str });
          }
        }
        break;
      case "#": {
        consume("#");
        if (consume("t")) {
          tokens.push({ type: "Boolean", value: true });
        } else if (consume("f")) {
          tokens.push({ type: "Boolean", value: false });
        }
        break;
      }
      default: {
        if (char === undefined) {
          throw new Error("Unexpected end of input");
        }
        if (isDigit(char)) {
          consumeDigit();
        } else if (char === "-" && isDigit(peek(1)!)) {
          consumeDigit();
        } else if (isIdentifier(char)) {
          let symbol = consumeWhile(isIdentifier);
          tokens.push({ type: "Symbol", value: symbol });
        } else {
          throw new Error(`Unexpected character: ${char}`);
        }
      }
    }
  }
  tokens.push({ type: "EOL" });
  return tokens;
};
