import commandLineArgs, { type CommandLineOptions } from "command-line-args";

const mainDefinitions = [
  { name: "command", type: String, defaultOption: true },
  { name: "path", alias: "p", type: String },
];

const importDefinitions = [
  { name: "importPath", type: String },
  { name: "source", alias: "s", type: String, defaultValue: "html" },
];

const allowedSources = ["html", "chrome"];

export const setupCliArgs = (): {
  mainOptions: CommandLineOptions;
  importOptions: CommandLineOptions | undefined;
} => {
  const mainOptions: CommandLineOptions = commandLineArgs(mainDefinitions, {
    stopAtFirstUnknown: true,
  });
  let importOptions: CommandLineOptions | undefined;
  const argv = mainOptions._unknown || [];
  if (mainOptions.command === "import") {
    importOptions = commandLineArgs(importDefinitions, { argv });
    if (!allowedSources.includes(importOptions.source)) {
      console.error(
        `Source "${importOptions.source}" is not supported (currently only html and chrome import is supported)`,
      );
      process.exit(1);
    }
    if (!importOptions.importPath) {
      console.error("No import path provided!");
      process.exit(1);
    }
  }
  return { mainOptions, importOptions };
};
