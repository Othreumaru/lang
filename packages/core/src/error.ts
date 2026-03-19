export class KSSyntaxError extends Error {
  readonly offset: number;

  constructor(message: string, offset: number) {
    super(message);
    this.name = "KSSyntaxError";
    this.offset = offset;
  }
}
