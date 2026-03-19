export type LeftParenToken = {
  type: "LeftParen";
  offset: number;
};

export type RightParenToken = {
  type: "RightParen";
  offset: number;
};

export type LeftBraceToken = {
  type: "LeftBrace";
  offset: number;
};

export type RightBraceToken = {
  type: "RightBrace";
  offset: number;
};

export type SemicolonToken = {
  type: "Semicolon";
  offset: number;
};

export type CommaToken = {
  type: "Comma";
  offset: number;
};

export type ArrowToken = {
  type: "Arrow";
  offset: number;
};

export type AssignToken = {
  type: "Assign";
  offset: number;
};

export type OperatorToken = {
  type: "Operator";
  offset: number;
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
  offset: number;
  value:
    | "const"
    | "let"
    | "return"
    | "if"
    | "else"
    | "true"
    | "false"
    | "from"
    | "import";
};

export type IdentifierToken = {
  type: "Identifier";
  offset: number;
  value: string;
};

export type NumberToken = {
  type: "Number";
  offset: number;
  value: number;
};

export type StringToken = {
  type: "String";
  offset: number;
  value: string;
};

export type EOLToken = {
  type: "EOL";
  offset: number;
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
