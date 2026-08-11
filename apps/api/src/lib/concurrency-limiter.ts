export class ConcurrencyLimiter {
  private active = 0;

  public constructor(private readonly maximum: number) {}

  public get activeCount(): number {
    return this.active;
  }

  public async tryRun<T>(operation: () => Promise<T>): Promise<T | undefined> {
    if (this.active >= this.maximum) {
      return undefined;
    }

    this.active += 1;
    try {
      return await operation();
    } finally {
      this.active -= 1;
    }
  }
}
