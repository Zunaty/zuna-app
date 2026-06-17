import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outPath = path.join(root, "types", "supabase", "database.ts");

const types = execFileSync(
  process.platform === "win32" ? "npx.cmd" : "npx",
  ["--yes", "supabase@2.101.0", "gen", "types", "typescript", "--linked"],
  { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] },
);

writeFileSync(outPath, types);
