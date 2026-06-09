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
import { parseConfigFileOrDefault } from './config';

let importOptions: ImportOptions | undefined;
let exportOptions: ExportOptions | undefined;
let mainOptions: MainOptions | undefined;
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

// TODO: add the cli arg 'configPath' here to override the default config path
const { config, errors } = parseConfigFileOrDefault(mainOptions);
if (errors.length > 0) {
  console.error('  ' + errors.join('  \n'));
  process.exit(1);
}

// TODO: parse and merge general config from cli args

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
const tuiController = new TUIController(config);
await tuiController.init();
