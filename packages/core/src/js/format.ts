import { scan } from "./scan.ts";
import { parse } from "./parse.ts";
import { printAll } from "./print.ts";

import { readFile, writeFile } from "node:fs/promises";

const run = async () => {
  const filePath = process.argv[2];

  const source = await readFile(filePath, "utf8");
  const formatted = printAll(parse(scan(source)));
  await writeFile(filePath, formatted, "utf8");
  console.log(`Formatted ${filePath}`);
};

void run();
