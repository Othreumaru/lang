import type { Token } from "./token.ts";
import { KSSyntaxError } from "./error.ts";

const KEYWORDS = new Set([
  "const",
  "return",
  "if",
  "else",
  "true",
  "false",
  "from",
  "import",
]);

const isDigit = (char: string): boolean => char >= "0" && char <= "9";

const isAlpha = (char: string): boolean =>
  (char >= "a" && char <= "z") || (char >= "A" && char <= "Z") || char === "_";

const isAlphaNumeric = (char: string): boolean =>
  isAlpha(char) || isDigit(char);

export const scan = (input: string): Token[] => {
  let index = 0;
  const tokens: Token[] = [];

  const peek = (offset: number = 0): string | undefined => {
    const i = index + offset;
    return i < input.length ? input[i] : undefined;
  };

  const consumeWhile = (predicate: (char: string) => boolean): string => {
    let result = "";
    while (index < input.length && predicate(input[index])) {
      result += input[index++];
    }
    return result;
  };

  while (index < input.length) {
    const char = peek()!;

    // Whitespace
    if (char === " " || char === "\t" || char === "\n" || char === "\r") {
      index++;
      continue;
    }

    const start = index;

    // Numbers
    if (isDigit(char) || (char === "-" && isDigit(peek(1) ?? ""))) {
      let numStr = "";
      if (char === "-") {
        index++;
        numStr += "-";
      }
      numStr += consumeWhile(isDigit);
      if (peek() === "." && isDigit(peek(1) ?? "")) {
        index++; // consume "."
        numStr += "." + consumeWhile(isDigit);
      }
      tokens.push({ type: "Number", value: parseFloat(numStr), offset: start });
      continue;
    }

    // Strings (single or double quote)
    if (char === '"' || char === "'") {
      const quote = char;
      index++;
      const str = consumeWhile((c) => c !== quote);
      index++; // consume closing quote
      tokens.push({ type: "String", value: str, offset: start });
      continue;
    }

    // Arrow => or Assign =
    if (char === "=") {
      index++;
      if (peek() === "=") {
        index++;
        if (peek() === "=") {
          index++;
          tokens.push({ type: "Operator", value: "===", offset: start });
        } else {
          throw new KSSyntaxError("Expected '===' but got '=='", start);
        }
      } else if (peek() === ">") {
        index++;
        tokens.push({ type: "Arrow", offset: start });
      } else {
        tokens.push({ type: "Assign", offset: start });
      }
      continue;
    }

    // !==
    if (char === "!") {
      index++;
      if (peek() === "=") {
        index++;
        if (peek() === "=") {
          index++;
          tokens.push({ type: "Operator", value: "!==", offset: start });
        } else {
          throw new KSSyntaxError("Expected '!==' but got '!='", start);
        }
      } else {
        throw new KSSyntaxError(`Unexpected character: !`, start);
      }
      continue;
    }

    // >= and >
    if (char === ">") {
      index++;
      if (peek() === "=") {
        index++;
        tokens.push({ type: "Operator", value: ">=", offset: start });
      } else {
        tokens.push({ type: "Operator", value: ">", offset: start });
      }
      continue;
    }

    // <= and <
    if (char === "<") {
      index++;
      if (peek() === "=") {
        index++;
        tokens.push({ type: "Operator", value: "<=", offset: start });
      } else {
        tokens.push({ type: "Operator", value: "<", offset: start });
      }
      continue;
    }

    // && and ||
    if (char === "&") {
      index++;
      if (peek() === "&") {
        index++;
        tokens.push({ type: "Operator", value: "&&", offset: start });
      } else {
        throw new KSSyntaxError(`Unexpected character: &`, start);
      }
      continue;
    }

    if (char === "|") {
      index++;
      if (peek() === "|") {
        index++;
        tokens.push({ type: "Operator", value: "||", offset: start });
      } else {
        throw new KSSyntaxError(`Unexpected character: |`, start);
      }
      continue;
    }

    // Single-character tokens
    switch (char) {
      case "(":
        index++;
        tokens.push({ type: "LeftParen", offset: start });
        continue;
      case ")":
        index++;
        tokens.push({ type: "RightParen", offset: start });
        continue;
      case "{":
        index++;
        tokens.push({ type: "LeftBrace", offset: start });
        continue;
      case "}":
        index++;
        tokens.push({ type: "RightBrace", offset: start });
        continue;
      case ";":
        index++;
        tokens.push({ type: "Semicolon", offset: start });
        continue;
      case ",":
        index++;
        tokens.push({ type: "Comma", offset: start });
        continue;
      case ".":
        index++;
        tokens.push({ type: "Dot", offset: start });
        continue;
      case ":":
        index++;
        tokens.push({ type: "Colon", offset: start });
        continue;
      case "[":
        index++;
        tokens.push({ type: "LeftBracket", offset: start });
        continue;
      case "]":
        index++;
        tokens.push({ type: "RightBracket", offset: start });
        continue;
      case "+":
        index++;
        tokens.push({ type: "Operator", value: "+", offset: start });
        continue;
      case "-":
        index++;
        tokens.push({ type: "Operator", value: "-", offset: start });
        continue;
      case "*":
        index++;
        tokens.push({ type: "Operator", value: "*", offset: start });
        continue;
      case "/":
        index++;
        tokens.push({ type: "Operator", value: "/", offset: start });
        continue;
    }

    // Identifiers and keywords
    if (isAlpha(char)) {
      const word = consumeWhile(isAlphaNumeric);
      if (KEYWORDS.has(word)) {
        if (word === "true") {
          tokens.push({ type: "Keyword", value: "true", offset: start });
        } else if (word === "false") {
          tokens.push({ type: "Keyword", value: "false", offset: start });
        } else {
          tokens.push({
            type: "Keyword",
            value: word as
              | "const"
              | "let"
              | "return"
              | "if"
              | "else"
              | "from"
              | "import",
            offset: start,
          });
        }
      } else {
        tokens.push({ type: "Identifier", value: word, offset: start });
      }
      continue;
    }

    throw new KSSyntaxError(`Unexpected character: ${char}`, start);
  }

  tokens.push({ type: "EOL", offset: index });
  return tokens;
};
