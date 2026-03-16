import type { Token } from "./token.ts";

const KEYWORDS = new Set([
  "const",
  "let",
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
      tokens.push({ type: "Number", value: parseFloat(numStr) });
      continue;
    }

    // Strings (single or double quote)
    if (char === '"' || char === "'") {
      const quote = char;
      index++;
      const str = consumeWhile((c) => c !== quote);
      index++; // consume closing quote
      tokens.push({ type: "String", value: str });
      continue;
    }

    // Arrow => or Assign =
    if (char === "=") {
      index++;
      if (peek() === "=") {
        index++;
        if (peek() === "=") {
          index++;
          tokens.push({ type: "Operator", value: "===" });
        } else {
          throw new Error("Expected '===' but got '=='");
        }
      } else if (peek() === ">") {
        index++;
        tokens.push({ type: "Arrow" });
      } else {
        tokens.push({ type: "Assign" });
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
          tokens.push({ type: "Operator", value: "!==" });
        } else {
          throw new Error("Expected '!==' but got '!='");
        }
      } else {
        throw new Error(`Unexpected character: !`);
      }
      continue;
    }

    // >= and >
    if (char === ">") {
      index++;
      if (peek() === "=") {
        index++;
        tokens.push({ type: "Operator", value: ">=" });
      } else {
        tokens.push({ type: "Operator", value: ">" });
      }
      continue;
    }

    // <= and <
    if (char === "<") {
      index++;
      if (peek() === "=") {
        index++;
        tokens.push({ type: "Operator", value: "<=" });
      } else {
        tokens.push({ type: "Operator", value: "<" });
      }
      continue;
    }

    // && and ||
    if (char === "&") {
      index++;
      if (peek() === "&") {
        index++;
        tokens.push({ type: "Operator", value: "&&" });
      } else {
        throw new Error(`Unexpected character: &`);
      }
      continue;
    }

    if (char === "|") {
      index++;
      if (peek() === "|") {
        index++;
        tokens.push({ type: "Operator", value: "||" });
      } else {
        throw new Error(`Unexpected character: |`);
      }
      continue;
    }

    // Single-character tokens
    switch (char) {
      case "(":
        index++;
        tokens.push({ type: "LeftParen" });
        continue;
      case ")":
        index++;
        tokens.push({ type: "RightParen" });
        continue;
      case "{":
        index++;
        tokens.push({ type: "LeftBrace" });
        continue;
      case "}":
        index++;
        tokens.push({ type: "RightBrace" });
        continue;
      case ";":
        index++;
        tokens.push({ type: "Semicolon" });
        continue;
      case ",":
        index++;
        tokens.push({ type: "Comma" });
        continue;
      case "+":
        index++;
        tokens.push({ type: "Operator", value: "+" });
        continue;
      case "-":
        index++;
        tokens.push({ type: "Operator", value: "-" });
        continue;
      case "*":
        index++;
        tokens.push({ type: "Operator", value: "*" });
        continue;
      case "/":
        index++;
        tokens.push({ type: "Operator", value: "/" });
        continue;
    }

    // Identifiers and keywords
    if (isAlpha(char)) {
      const word = consumeWhile(isAlphaNumeric);
      if (KEYWORDS.has(word)) {
        if (word === "true") {
          tokens.push({ type: "Keyword", value: "true" });
        } else if (word === "false") {
          tokens.push({ type: "Keyword", value: "false" });
        } else {
          tokens.push({
            type: "Keyword",
            value: word as "const" | "let" | "return" | "if" | "else" | "from" | "import",
          });
        }
      } else {
        tokens.push({ type: "Identifier", value: word });
      }
      continue;
    }

    throw new Error(`Unexpected character: ${char}`);
  }

  tokens.push({ type: "EOL" });
  return tokens;
};
