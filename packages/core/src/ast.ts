export type CallExpression = {
  type: "CallExpression";
  callee: string | AST; // can be a symbol or another expression
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

export type AndExpression = {
  type: "AndExpression";
  conditions: AST[];
};

export type OrExpression = {
  type: "OrExpression";
  conditions: AST[];
};

export type CondExpression = {
  type: "CondExpression";
  clauses: { condition: AST; thenBranch: AST }[];
};

export type ImportExpression = {
  type: "ImportExpression";
  module: string;
  names: string[];
};

export type NamespaceImportExpression = {
  type: "NamespaceImportExpression";
  module: string;
  alias: string;
};

export type ObjectExpression = {
  type: "ObjectExpression";
  properties: { key: string; value: AST }[];
};

export type MemberExpression = {
  type: "MemberExpression";
  object: AST;
  property: string;
};

export type AST =
  | DefineExpression
  | DefineFunctionExpression
  | CallExpression
  | LetExpression
  | IfExpression
  | CondExpression
  | AndExpression
  | OrExpression
  | ImportExpression
  | NamespaceImportExpression
  | ObjectExpression
  | MemberExpression
  | AtomExpression;
