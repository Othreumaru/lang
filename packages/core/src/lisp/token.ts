export type LeftBracketToken = {
  type: "LeftBracket";
};

export type RightBracketToken = {
  type: "RightBracket";
};

export type SymbolToken = {
  type: "Symbol";
  value: string;
};

export type NumberToken = {
  type: "Number";
  value: number;
};

export type BooleanToken = {
  type: "Boolean";
  value: boolean;
};

export type StringToken = {
  type: "String";
  value: string;
};

export type EOLToken = {
  type: "EOL";
};

export type Token =
  | LeftBracketToken
  | RightBracketToken
  | SymbolToken
  | NumberToken
  | BooleanToken
  | StringToken
  | EOLToken;
