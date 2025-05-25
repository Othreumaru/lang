type Combinator = (a: string) => boolean;

export const char = (c: string): Combinator => {
  return (str: string): boolean => {
    return str[0] === c;
  };
};

export const either = (...combinators: Combinator[]): Combinator => {
  return (str: string): boolean => {
    for (const combinator of combinators) {
      if (combinator(str)) {
        return true;
      }
    }
    return false;
  };
};
