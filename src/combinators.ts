type Combinator = (a: string) => boolean;

export const char = (c: string): Combinator => {
  return (a: string): boolean => {
    return a[0] === c;
  };
};
