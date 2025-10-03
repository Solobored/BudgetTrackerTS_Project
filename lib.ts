// lib.ts - Shared utility functions and classes for demo and tests
// Author: Josue Neiculeo

/**
 * Recursive function that sums a list of numbers.
 * Example: sumRecursive([1,2,3]) => 6
 */
export function sumRecursive(list: number[]): number {
  if (list.length === 0) return 0;
  return list[0] + sumRecursive(list.slice(1));
}

/**
 * Recursive factorial function.
 * Throws an error if the input is negative.
 */
export function factorial(n: number): number {
  if (n < 0) throw new Error("Negative not allowed");
  if (n === 0) return 1;
  return n * factorial(n - 1);
}

/**
 * Example class to demonstrate TypeScript classes.
 * Has a constructor that takes a name and a greet() method.
 */
export class ExampleClass {
  constructor(public name: string) {}
  greet(): string {
    return `Hello, ${this.name}`;
  }
}

/**
 * Fake async API function to simulate a delay using setTimeout.
 * Returns the provided value after ms milliseconds.
 */
export async function fakeApi<T>(value: T, ms = 50): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/**
 * Throws an exception if n is negative.
 * Otherwise returns the number back.
 */
export function throwIfNegative(n: number): number {
  if (n < 0) throw new Error("Negative");
  return n;
}
