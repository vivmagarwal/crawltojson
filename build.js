import * as esbuild from "esbuild";

const isWatch = process.argv.includes("--watch");

/** @type {import('esbuild').BuildOptions} */
const buildOptions = {
  entryPoints: ["./src/cli.js", "./src/index.js"],
  bundle: true,
  platform: "node",
  format: "esm",
  outdir: "./dist",
  banner: {
    js: "#!/usr/bin/env node",
  },
};

if (isWatch) {
  const context = await esbuild.context(buildOptions);
  await context.watch();
  console.log("Watching for changes...");
} else {
  await esbuild.build(buildOptions);
  console.log("Build complete");
}
