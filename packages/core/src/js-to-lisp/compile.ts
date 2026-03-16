import { parse } from "../js/parse.ts";
import { scan } from "../js/scan.ts";
import { printAll } from "../lisp/print.ts";

import { readFile, writeFile } from "node:fs/promises";

const run = async () => {
  const sourcePath = process.argv[2];
  const destPath = process.argv[3];

  const source = await readFile(sourcePath, "utf8");

  const tokens = scan(source);
  const ast = parse(tokens);

  const lispSource = printAll(ast);
  await writeFile(destPath, lispSource, "utf8");
  console.log(`Compiled ${sourcePath} to ${destPath}`);
};

void run();
