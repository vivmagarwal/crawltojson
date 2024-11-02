// build.js
const esbuild = require("esbuild");
const fs = require("fs/promises");

async function build() {
  try {
    // Common build options
    const buildOptions = {
      bundle: true,
      platform: "node",
      format: "cjs",
      external: ["playwright", "chalk", "inquirer", "commander", "ora"],
    };

    // Build the CLI
    await esbuild.build({
      ...buildOptions,
      entryPoints: ["./src/cli.js"],
      outfile: "./dist/cli.cjs",
    });

    // Build the library
    await esbuild.build({
      ...buildOptions,
      entryPoints: ["./src/index.js"],
      outfile: "./dist/index.cjs",
    });

    // Add shebang to CLI
    const cliContent = await fs.readFile("./dist/cli.cjs", "utf8");
    await fs.writeFile("./dist/cli.cjs", `#!/usr/bin/env node\n${cliContent}`);
    await fs.chmod("./dist/cli.cjs", 0o755);

    console.log("Build complete");
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
}

build();
