import { spawnSync } from "node:child_process";
import { createWriteStream } from "node:fs";
import { mkdir, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const browserify = require("browserify");

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const examplesRoot = join(projectRoot, "examples");
const outputRoot = join(projectRoot, "examples-dist");
const typescriptBin = join(projectRoot, "node_modules", "typescript", "bin", "tsc");
const concurrency = 4;

const collectTypeScriptFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return collectTypeScriptFiles(path);
      if (entry.isFile() && extname(entry.name) === ".ts") return [path];
      return [];
    }),
  );
  return files.flat();
};

const bundle = (entry, destination) =>
  new Promise((resolveBundle, rejectBundle) => {
    const output = createWriteStream(destination);
    const bundleStream = browserify(entry).bundle();

    bundleStream.on("error", rejectBundle);
    output.on("error", rejectBundle);
    output.on("finish", resolveBundle);
    bundleStream.pipe(output);
  });

const compile = (compileRoot) => {
  const result = spawnSync(process.execPath, [typescriptBin, "--outDir", compileRoot], {
    cwd: projectRoot,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`TypeScript compilation failed with exit code ${result.status}`);
};

const bundleName = (sourcePath) => {
  const relativePath = relative(examplesRoot, sourcePath);
  const withoutExtension = relativePath.slice(0, -extname(relativePath).length);
  return `${withoutExtension.split(sep).join("__")}.js`;
};

const main = async () => {
  const compileRoot = await mkdtemp(join(tmpdir(), "jsbox-cview-examples-"));

  try {
    const sources = (await collectTypeScriptFiles(examplesRoot)).sort();
    if (sources.length === 0) throw new Error("No TypeScript examples found");

    console.log(`Compiling ${sources.length} example entries...`);
    compile(compileRoot);

    await rm(outputRoot, { recursive: true, force: true });
    await mkdir(outputRoot, { recursive: true });

    const jobs = sources.map((sourcePath) => {
      const source = relative(examplesRoot, sourcePath).split(sep).join("/");
      const compiledEntry = join(compileRoot, "examples", source.replace(/\.ts$/, ".js"));
      const output = bundleName(sourcePath);
      return { source, compiledEntry, output };
    });

    const outputNames = new Set();
    for (const job of jobs) {
      if (outputNames.has(job.output)) throw new Error(`Duplicate bundle name: ${job.output}`);
      outputNames.add(job.output);
    }

    let nextJob = 0;
    const worker = async () => {
      while (nextJob < jobs.length) {
        const job = jobs[nextJob++];
        await bundle(job.compiledEntry, join(outputRoot, job.output));
        console.log(`Bundled ${job.source} -> ${job.output}`);
      }
    };

    await Promise.all(Array.from({ length: Math.min(concurrency, jobs.length) }, worker));
    await writeFile(
      join(outputRoot, "manifest.json"),
      `${JSON.stringify(
        jobs.map(({ source, output }) => ({ source, bundle: output })),
        null,
        2,
      )}\n`,
    );

    console.log(`Created ${jobs.length} bundles in ${relative(projectRoot, outputRoot)}/`);
  } catch (error) {
    await rm(outputRoot, { recursive: true, force: true });
    throw error;
  } finally {
    await rm(compileRoot, { recursive: true, force: true });
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
