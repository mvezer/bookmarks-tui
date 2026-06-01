import commandLineArgs, { type CommandLineOptions } from "command-line-args";

const mainDefinitions = [
  { name: "command", type: String, defaultOption: true },
];

const importDefinitions = [
  { name: "importPath", shortName: "p", type: String },
];

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
    if (!importOptions.importPath) {
      console.error("No import path provided!");
      process.exit(1);
    }
  }
  return { mainOptions, importOptions };
};
