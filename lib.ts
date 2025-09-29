export function sumRecursive(list: number[]): number {
  if (list.length === 0) return 0;
  return list[0] + sumRecursive(list.slice(1));
}

export function factorial(n: number): number {
  if (n < 0) throw new Error("Negative not allowed");
  if (n === 0) return 1;
  return n * factorial(n - 1);
}

export class ExampleClass {
  constructor(public name: string) {}
  greet(): string {
    return `Hello, ${this.name}`;
  }
}

export async function fakeApi<T>(value: T, ms = 50): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function throwIfNegative(n: number): number {
  if (n < 0) throw new Error("Negative");
  return n;
}
