import { readFile } from "node:fs/promises";
import { createRepl } from "@ks/core";

const filePath = process.argv[2];

if (!filePath) {
  console.error("Usage: ks <file>");
  process.exit(1);
}

const source = await readFile(filePath, "utf8").catch(() => {
  console.error(`Error: cannot read file '${filePath}'`);
  process.exit(1);
});

try {
  const repl = createRepl();
  repl(source);
} catch (err) {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
}
