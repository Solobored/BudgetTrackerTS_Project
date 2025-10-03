# BudgetTrackerTS (With Server & Jest)

**Author:** Josue Neiculeo  
**Date:** October 03, 2025  
**Course:** CSE 310 – Applied Programming  
**Module:** #2 – TypeScript  

---

## Description
This project is a **Budget Tracker application** written in **TypeScript**.  
It demonstrates all the required features for the TypeScript module:  

- **Display output to the terminal** (via `demo.ts`)  
- **Recursion** (`sumRecursive`, `factorial`)  
- **Classes** (`ExampleClass`, `Budget` class for transactions)  
- **Lists** (transaction arrays stored, filtered, and displayed)  
- **Asynchronous functions** (`fakeApi`, async save simulation)  
- **Exception handling** (function `throwIfNegative`, input validation)  

It also includes:  
- A **browser UI** for adding, editing, and filtering income/expenses.  
- A **Jest test suite** validating recursion, async, classes, and exceptions.  
- A lightweight **http-server** script to run the app locally.  

---

## Quick Start

1. Install dependencies:
   ```bash
   npm install

2. Build TypeScript to `dist/`:
   ```bash
   npm run build
   ```

3. Run the static server and open http://localhost:8080:
   ```bash
   npm run server
   ```

4. Run tests:
   ```bash
   npm run test
   ```

5. Run demo: 
```bash
   npm run demo
   ```

Notes:
- `server` uses `npx http-server` so you don't need a global install.
- The app uses ES modules in the browser. `index.html` loads `dist/*.js` with `type="module"`.
- Jest is configured to run TypeScript tests using `ts-jest` in ESM mode. If tests fail due to Node or environment versions, ensure Node >= 18 and npm installed.
