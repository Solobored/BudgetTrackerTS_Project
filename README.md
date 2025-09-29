# BudgetTrackerTS (With Server & Jest)

Author: Josue Neiculeo

This package includes a TypeScript budget tracker (browser app), a small library used for unit tests, a development server script, and Jest unit tests configured for ESM+TypeScript.

## Quick start

1. Install dependencies:
   ```bash
   npm install
   ```

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
   npm test
   ```

Notes:
- `server` uses `npx http-server` so you don't need a global install.
- The app uses ES modules in the browser. `index.html` loads `dist/*.js` with `type="module"`.
- Jest is configured to run TypeScript tests using `ts-jest` in ESM mode. If tests fail due to Node or environment versions, ensure Node >= 18 and npm installed.
