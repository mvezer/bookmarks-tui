import {
  importBookmarks,
  exportBookmarks,
  getUsage,
  parseCliArgs,
  type ExportOptions,
  type ImportOptions,
  type MainOptions,
  Commands,
  type CliResult,
} from './cli-controller';
import { TUIController } from './tui-controller';

let importOptions: ImportOptions | undefined;
let exportOptions: ExportOptions | undefined;
let mainOptions: MainOptions;
let result: CliResult | undefined;

try {
  ({ mainOptions, importOptions, exportOptions } = parseCliArgs());
  // ---- cli mode ----
  if (mainOptions.command || mainOptions.help) {
    if (mainOptions.help) {
      result = { stdout: getUsage(), exitCode: 0 };
    } else {
      switch (mainOptions.command) {
        case Commands.Import:
          result = await importBookmarks(importOptions || {});
          break;
        case Commands.Export:
          result = await exportBookmarks(exportOptions || {});
          break;
      }
    }
  }
} catch (e: unknown) {
  result = {
    exitCode: 1,
    stderr: (e as Error).message || 'Unknown error',
    stdout: 'See usage with the -h option',
  };
}

if (result) {
  if (result.stderr) {
    console.error(result.stderr);
  }
  if (result.stdout) {
    console.log(result.stdout);
  }
  process.exit(result.exitCode);
}

// ---- tui mode ----
const tuiController = new TUIController();
await tuiController.init();
