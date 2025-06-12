export type CallExpression = {
  type: "CallExpression";
  callee: string;
  args: any[];
};

export type DefineExpression = {
  type: "DefineExpression";
  name: string;
  expression: AST;
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
  condition: any;
  thenBranch: any;
  elseBranch: any;
};

export type AST =
  | DefineExpression
  | CallExpression
  | IfExpression
  | AtomExpression;
