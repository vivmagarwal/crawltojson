import * as esbuild from "esbuild";
import { chmod, writeFile } from "fs/promises";

const isWatch = process.argv.includes("--watch");

/** @type {import('esbuild').BuildOptions} */
const sharedOptions = {
  bundle: true,
  platform: "node",
  external: ["playwright-core", "playwright", "chromium-bidi", "chalk", "inquirer", "commander", "ora"],
};

// CLI build config
const cliBuildOptions = {
  ...sharedOptions,
  entryPoints: ["./src/cli.js"],
  outfile: "./dist/cli.cjs",
  format: "cjs",
};

// Library build config
const libBuildOptions = {
  ...sharedOptions,
  entryPoints: ["./src/index.js"],
  outfile: "./dist/index.js",
  format: "esm",
};

async function build() {
  try {
    // Build the library
    await esbuild.build(libBuildOptions);

    // Build the CLI
    await esbuild.build(cliBuildOptions);

    // Add shebang to CLI file and set permissions
    const shebang = "#!/usr/bin/env node\n";
    const cliContent = await import("fs").then((fs) => fs.readFileSync("./dist/cli.cjs", "utf8"));

    await writeFile("./dist/cli.cjs", shebang + cliContent);
    await chmod("./dist/cli.cjs", "755");

    console.log("Build complete");
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
}

if (isWatch) {
  console.log("Watch mode not supported for this build configuration");
  process.exit(1);
} else {
  build();
}
