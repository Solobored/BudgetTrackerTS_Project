// demo.ts - Terminal demo for showing recursion, classes, async, and exceptions
// Author: Josue Neiculeo

import { factorial, ExampleClass, fakeApi } from './lib';

(async () => {
  console.log("Demo starting...");

  // Recursion: factorial
  try {
    console.log("Factorial(5) =", factorial(5));
  } catch (e) {
    console.error("Factorial error:", (e as Error).message);
  }

  // Classes: ExampleClass
  const dev = new ExampleClass("Josue");
  console.log("Developer:", dev.greet());

  // Async/Await: fakeApi call
  const res = await fakeApi("ok", 100);
  console.log("Async result:", res);
})();
