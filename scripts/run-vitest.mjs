import { spawnSync } from "node:child_process";
import { realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);

// Resolve the installed Vitest package
const vitestPackage = require.resolve("vitest/package.json");

// Locate the Vitest CLI
const vitestCli = realpathSync.native(
  join(dirname(vitestPackage), "vitest.mjs")
);

// Normalize Windows working directory
const cwd =
  process.platform === "win32"
    ? realpathSync.native(process.cwd())
    : process.cwd();

// Execute Vitest
const result = spawnSync(
  process.execPath,
  [vitestCli, ...process.argv.slice(2)],
  {
    cwd,
    stdio: "inherit",
  }
);

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
