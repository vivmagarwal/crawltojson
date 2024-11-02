import * as esbuild from "esbuild";

const isWatch = process.argv.includes("--watch");

/** @type {import('esbuild').BuildOptions} */
const sharedOptions = {
  bundle: true,
  platform: "node",
  format: "esm",
  external: ["playwright-core", "playwright", "chromium-bidi", "chalk", "inquirer", "commander", "ora"],
};

// CLI build config
const cliBuildOptions = {
  ...sharedOptions,
  entryPoints: ["./src/cli.js"],
  outfile: "./dist/cli.js",
};

// Library build config
const libBuildOptions = {
  ...sharedOptions,
  entryPoints: ["./src/index.js"],
  outfile: "./dist/index.js",
};

async function build() {
  try {
    // Build the library
    await esbuild.build(libBuildOptions);

    // Build the CLI
    await esbuild.build(cliBuildOptions);

    // Add shebang to CLI file
    const { promises: fs } = await import("fs");
    const cliContent = await fs.readFile("./dist/cli.js", "utf8");
    await fs.writeFile("./dist/cli.js", `#!/usr/bin/env node\n${cliContent}`);
    await fs.chmod("./dist/cli.js", "755");

    console.log("Build complete");
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
}

if (isWatch) {
  const context = await esbuild.context(sharedOptions);
  await context.watch();
  console.log("Watching for changes...");
} else {
  build();
}
