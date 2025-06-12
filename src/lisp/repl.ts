import { defaultEnv, interpretAll } from "./interpret.ts";
import type { Env } from "./interpret.ts";
import { parse } from "./parse.ts";
import { scan } from "./scan.ts";

export const createRepl = (env: Env = defaultEnv) => {
  const globalEnv = new Map(env);
  return (input: string): any => {
    const tokens = scan(input);
    const ast = parse(tokens);
    return interpretAll(ast, globalEnv);
  };
};
