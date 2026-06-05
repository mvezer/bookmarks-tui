import { TUIController } from './tui-controller';
import { setupCliArgs } from './utils/cli-args';
import { CliRenderer, ConsolePosition, createCliRenderer } from '@opentui/core';

// const { importOptions, mainOptions } = setupCliArgs();

// if (mainOptions.command === 'import' && importOptions) {
//   console.log(`Importing bookmarks from HTML ${importOptions.importPath}`);
//   bookmarks.importFromHtml(importOptions.importPath);
//
//   process.exit(0);
// }

const tuiController = new TUIController();
await tuiController.init();
