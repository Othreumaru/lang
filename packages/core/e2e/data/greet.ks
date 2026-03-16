from "string" import { concat, toUpperCase, trim, repeat };

const greet = (name) => concat("Hello, ", toUpperCase(trim(name)), "!");
const banner = (name) => concat(repeat("-", 20), greet(name), repeat("-", 20));
