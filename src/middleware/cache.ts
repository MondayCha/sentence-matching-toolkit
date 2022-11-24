// localStorage cache manager

export default class Cache {
  private static instance: Cache;
  private cache: { [key: string]: any } = {};

  private constructor() {
    // ...
  }

  public static getInstance(): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache();
    }
    return Cache.instance;
  }

  public get(key: string): any {
    return this.cache[key];
  }

  public set(key: string, value: any): void {
    this.cache[key] = value;
  }

  public remove(key: string): void {
    delete this.cache[key];
  }

  public clear(): void {
    this.cache = {};
  }

  public has(key: string): boolean {
    return this.cache.hasOwnProperty(key);
  }
}
