// Vitest breaks when the working directory has a lowercase Windows drive
// letter (vitest-dev/vitest#5251), which some shells report. Respawn vitest
// with a normalized cwd so `yarn test` works everywhere.
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const cwd = root.replace(/^[a-z]:/, (drive) => drive.toUpperCase());
const vitestBin = path.join(cwd, "node_modules", "vitest", "vitest.mjs");

const result = spawnSync(process.execPath, [vitestBin, ...process.argv.slice(2)], {
  cwd,
  stdio: "inherit",
});

process.exit(result.status ?? 1);
