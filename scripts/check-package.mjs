import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const cacheDirectory = await mkdtemp(join(tmpdir(), "jsbox-cview-npm-cache-"));
const staleDirectory = join(projectRoot, "dist", "components", "spinners");
const staleFile = join(staleDirectory, "release-gate-stale.js");

try {
  await mkdir(staleDirectory, { recursive: true });
  await writeFile(staleFile, "// prepack must remove this file\n");

  const result = spawnSync("npm", ["pack", "--dry-run", "--json", "--cache", cacheDirectory], {
    cwd: projectRoot,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });

  if (result.status !== 0) {
    throw new Error(`npm pack failed:\n${result.stdout}\n${result.stderr}`);
  }

  const json = result.stdout.match(/\[\s*\{[\s\S]*\}\s*\]\s*$/)?.[0];
  assert.ok(json, `npm pack did not return JSON:\n${result.stdout}`);

  const [report] = JSON.parse(json);
  const packageJson = JSON.parse(await readFile(join(projectRoot, "package.json"), "utf8"));
  const files = new Set(report.files.map((file) => file.path));

  assert.equal(report.version, packageJson.version, "packed version must match package.json");
  for (const required of [
    "CHANGELOG.md",
    "LICENSE",
    "README.md",
    "dist/index.d.ts",
    "dist/index.js",
    "dist/components/android-style-spinner.d.ts",
    "dist/components/android-style-spinner.js",
  ]) {
    assert.ok(files.has(required), `package is missing ${required}`);
  }

  for (const removed of [
    "dist/components/spinners/loading-dual-ring.d.ts",
    "dist/components/spinners/loading-dual-ring.js",
    "dist/components/spinners/loading-wedges.d.ts",
    "dist/components/spinners/loading-wedges.js",
    "dist/components/spinners/spinner-androidstyle.d.ts",
    "dist/components/spinners/spinner-androidstyle.js",
    "dist/components/spinners/release-gate-stale.js",
  ]) {
    assert.ok(!files.has(removed), `package still contains removed output ${removed}`);
  }

  console.log(`Package preflight passed: ${report.filename}, ${report.entryCount} entries.`);
} finally {
  await rm(cacheDirectory, { recursive: true, force: true });
}
