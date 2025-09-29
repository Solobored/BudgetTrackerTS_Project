import { sumRecursive, factorial, ExampleClass, fakeApi, throwIfNegative } from '../lib';

test('sumRecursive works', () => {
  expect(sumRecursive([1,2,3,4])).toBe(10);
});

test('factorial computes', () => {
  expect(factorial(5)).toBe(120);
});

test('ExampleClass greet', () => {
  const e = new ExampleClass('Test');
  expect(e.greet()).toBe('Hello, Test');
});

test('fakeApi resolves', async () => {
  const r = await fakeApi('ok', 10);
  expect(r).toBe('ok');
});

test('throwIfNegative throws', () => {
  expect(() => throwIfNegative(-1)).toThrow('Negative');
});
