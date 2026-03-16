export type LeftParenToken = {
  type: "LeftParen";
};

export type RightParenToken = {
  type: "RightParen";
};

export type LeftBraceToken = {
  type: "LeftBrace";
};

export type RightBraceToken = {
  type: "RightBrace";
};

export type SemicolonToken = {
  type: "Semicolon";
};

export type CommaToken = {
  type: "Comma";
};

export type ArrowToken = {
  type: "Arrow";
};

export type AssignToken = {
  type: "Assign";
};

export type OperatorToken = {
  type: "Operator";
  value:
    | "+"
    | "-"
    | "*"
    | "/"
    | "==="
    | "!=="
    | ">"
    | ">="
    | "<"
    | "<="
    | "&&"
    | "||";
};

export type KeywordToken = {
  type: "Keyword";
  value: "const" | "let" | "return" | "if" | "else" | "true" | "false";
};

export type IdentifierToken = {
  type: "Identifier";
  value: string;
};

export type NumberToken = {
  type: "Number";
  value: number;
};

export type StringToken = {
  type: "String";
  value: string;
};

export type EOLToken = {
  type: "EOL";
};

export type Token =
  | LeftParenToken
  | RightParenToken
  | LeftBraceToken
  | RightBraceToken
  | SemicolonToken
  | CommaToken
  | ArrowToken
  | AssignToken
  | OperatorToken
  | KeywordToken
  | IdentifierToken
  | NumberToken
  | StringToken
  | EOLToken;
