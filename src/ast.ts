export type CallExpression = {
  type: "CallExpression";
  callee: string;
  args: AST[];
};

export type LetExpression = {
  type: "LetExpression";
  bindings: { name: string; expression: AST }[];
  body: AST;
};

export type DefineExpression = {
  type: "DefineExpression";
  name: string;
  expression: AST;
};

export type DefineFunctionExpression = {
  type: "DefineFunctionExpression";
  name: string;
  params: string[];
  body: AST;
};

export type SymbolExpression = {
  type: "SymbolExpression";
  name: string;
};

export type LiteralExpression = {
  type: "LiteralExpression";
  value: number | string | boolean | null;
};

export type AtomExpression = SymbolExpression | LiteralExpression;

export type IfExpression = {
  type: "IfExpression";
  condition: AST;
  thenBranch: AST;
  elseBranch: AST | null;
};

export type CondExpression = {
  type: "CondExpression";
  clauses: { condition: AST; thenBranch: AST }[];
};

export type AST =
  | DefineExpression
  | DefineFunctionExpression
  | CallExpression
  | LetExpression
  | IfExpression
  | CondExpression
  | AtomExpression;
