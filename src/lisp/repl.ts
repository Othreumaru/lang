import { defaultEnv, Environment } from "./environment.ts";
import type { IEnvironment } from "./environment.ts";
import { interpretAll } from "./interpret.ts";
import { parse } from "./parse.ts";
import { scan } from "./scan.ts";

export const createRepl = (env: IEnvironment = defaultEnv) => {
  const globalEnv = new Environment([],[], env);
  return (input: string): any => {
    const tokens = scan(input);
    const ast = parse(tokens);
    return interpretAll(ast, globalEnv);
  };
};
