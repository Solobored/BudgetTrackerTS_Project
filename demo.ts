import { factorial, ExampleClass, fakeApi } from './lib';

(async () => {
  console.log("Demo starting...");
  try {
    console.log("Factorial(5) =", factorial(5));
  } catch (e) {
    console.error("Factorial error:", (e as Error).message);
  }
  const dev = new ExampleClass("Josue");
  console.log("Developer:", dev.greet());
  const res = await fakeApi("ok", 100);
  console.log("Async result:", res);
})();
