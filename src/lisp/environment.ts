export type IEnvironment = {
  get(name: string): any;
  set(name: string, value: any): void;
  has(name: string): boolean;
};

export class Environment implements IEnvironment {
  private env: Map<string, any>;
  private enclosingEnv?: IEnvironment;

  constructor(
    params: string[] = [],
    args: any[] = [],
    enclosingEnv?: IEnvironment
  ) {
    this.env = new Map<string, any>();
    this.enclosingEnv = enclosingEnv;
    for (let i = 0; i < params.length; i++) {
      this.env.set(params[i], args[i]);
    }
  }

  get(name: string): any {
    if (this.env.has(name)) {
      return this.env.get(name);
    }
    if (this.enclosingEnv) {
      return this.enclosingEnv.get(name);
    }
    throw new Error(`Symbol ${name} is not defined`);
  }

  set(name: string, value: any): void {
    this.env.set(name, value);
  }

  has(name: string): boolean {
    if (this.env.has(name)) {
      return true;
    }
    if (this.enclosingEnv) {
      return this.enclosingEnv.has(name);
    }
    return false;
  }
}

export const defaultEnv: IEnvironment = new Environment();
defaultEnv.set("+", (...nums: number[]) => nums.reduce((a, b) => a + b, 0));
defaultEnv.set("-", (...nums: number[]) => {
  if (nums.length === 1) {
    return -nums[0];
  }
  return nums.reduce((a, b) => a - b);
});
defaultEnv.set("*", (...nums: number[]) => nums.reduce((a, b) => a * b, 1));
defaultEnv.set("/", (...nums: number[]) => nums.reduce((a, b) => a / b));
defaultEnv.set("=", (...nums: number[]) => nums.every((n) => n === nums[0]));
defaultEnv.set(">", (...nums: number[]) =>
  nums.slice(1).every((n) => nums[0] > n)
);
defaultEnv.set("<", (...nums: number[]) =>
  nums.slice(1).every((n) => nums[0] < n)
);
defaultEnv.set("not", (value: boolean) => !value);
