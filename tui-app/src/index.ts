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
import { getConfig } from './config';
import type { Config } from './config/types';
import { APP_VERSION } from './utils/app-version';

let importOptions: ImportOptions | undefined;
let exportOptions: ExportOptions | undefined;
let mainOptions: MainOptions | undefined;
let result: CliResult | undefined;

try {
  ({ mainOptions, importOptions, exportOptions } = parseCliArgs());
  // ---- cli mode ----
  if (mainOptions.command || mainOptions.help || mainOptions.version) {
    if (mainOptions.help) {
      result = { stdout: getUsage(), exitCode: 0 };
    } else if (mainOptions.version) {
      result = { stdout: APP_VERSION, exitCode: 0 };
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

let config: Config;
try {
  config = getConfig(mainOptions);
} catch (e: unknown) {
  console.error((e as Error).message || 'Unknown error');
  process.exit(1);
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
const tuiController = new TUIController(config);
await tuiController.init();
