import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outPath = path.join(root, "types", "supabase", "database.ts");

// shell: true — required on Windows (.cmd shims like npx.cmd fail with execFileSync)
const types = execSync("npx --yes supabase@2.101.0 gen types typescript --linked", {
  cwd: root,
  encoding: "utf8",
  stdio: ["ignore", "pipe", "inherit"],
  shell: true,
});

writeFileSync(outPath, types);
