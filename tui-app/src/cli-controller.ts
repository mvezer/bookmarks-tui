import { readFileSync, writeFileSync } from 'fs';
import { BookmarkRepository } from './bookmarks/bookmark-repository';
import {
  BookmarkChangeRepository,
  createBookmark,
  isBookmark,
} from '@bookmarks-tui/common';
import { Db } from './utils/db';
import { getLinksFromHtml } from './utils/html-parser';
import { generateHtml } from './utils/html-generator';

export interface CliResult {
  exitCode: number;
  stdout?: string;
  stderr?: string;
}

import commandLineArgs, { type CommandLineOptions } from 'command-line-args';

export enum Commands {
  Import = 'import',
  Export = 'export',
}

export enum Format {
  Html = 'html',
  JSON = 'json',
}

const mainDefinitions = [
  { name: 'command', type: String, defaultOption: true },
  { name: 'help', alias: 'h', type: Boolean },
];

const exportDefinitions = [
  { name: 'filePath', alias: 'f', type: String },
  {
    name: 'format',
    alias: 'F',
    type: String,
    defaultValue: Format.Html,
  },
];

const importDefinitions = [
  { name: 'filePath', alias: 'f', type: String },
  {
    name: 'format',
    alias: 'F',
    type: String,
    defaultValue: Format.Html,
  },
  { name: 'ignoreHash', alias: 'i', type: Boolean },
];

export interface ExportOptions {
  filePath?: string;
  format?: Format;
}
export interface ImportOptions extends ExportOptions {
  ignoreHash?: boolean;
}

export interface MainOptions {
  command?: Commands;
  help?: boolean;
}

const DEFAULT_IMPORT_FORMAT = Format.Html;
const DEFAULT_EXPORT_FORMAT = Format.Html;

export const getUsage = (): string => {
  return `
Usage: bookmarks-tui [-h, --help] [command command-options]

Commands:
  import  Import bookmarks from file
  export  Export bookmarks

Main options:
  -h, --help            Display this help message

Import options:
  -f, --filePath <path> Path to file to import
  -F, --format <format> Format to use (html, json)
  -i, --ignoreHash      Ignore hash when importing

Export options:
  -f, --filePath <path> Path to file to import or export
  -F, --format <format> Format to use (html, json)


Examples:

  import bookmarks from html file:
      bookmarks-tui import -f /path/to/bookmarks.html

  export bookmarks to html file:
      bookmarks-tui export -f /path/to/bookmarks.html

  (advanced) use fzf and jq to pick a bookmark:
      bookmarks-tui export -F json | jq -r '.bookmarks[] | "\(.title)\t\(.url)"' | fzf --delimiter='\t' --with-nth=1 | cut -f2
`;
};

export const parseCliArgs = (): {
  mainOptions: MainOptions;
  importOptions: ImportOptions | undefined;
  exportOptions: ExportOptions | undefined;
} => {
  const mainOptions: CommandLineOptions = commandLineArgs(mainDefinitions, {
    stopAtFirstUnknown: true,
  });
  let importOptions: CommandLineOptions | undefined;
  let exportOptions: CommandLineOptions | undefined;
  const argv = mainOptions._unknown || [];
  if (mainOptions.command === Commands.Import) {
    importOptions = commandLineArgs(importDefinitions, { argv });
    importOptions.format = importOptions.format || DEFAULT_IMPORT_FORMAT;
  } else if (mainOptions.command === Commands.Export) {
    exportOptions = commandLineArgs(exportDefinitions, { argv });
    exportOptions.format = exportOptions.format || DEFAULT_EXPORT_FORMAT;
  } else if (!mainOptions.help) {
    if (mainOptions.command) {
      throw new Error('Unknown command: ' + mainOptions.command);
    }
    throw new Error('Unknown option(s): ' + mainOptions?._unknown?.join(', '));
  }
  return {
    mainOptions: mainOptions as unknown as MainOptions,
    importOptions: importOptions as unknown as ImportOptions,
    exportOptions: exportOptions as unknown as ExportOptions,
  };
};

const initBookmarkRepository = async (): Promise<BookmarkRepository> => {
  const db = new Db();
  await db.init();

  const bookmarkChangeRepository = new BookmarkChangeRepository(db);
  const bookmarkRepository = new BookmarkRepository(
    bookmarkChangeRepository,
    db,
  );
  await bookmarkRepository.init();
  return bookmarkRepository;
};

export const importBookmarks = async (
  importOptions: ImportOptions,
): Promise<CliResult> => {
  const { filePath, format } = importOptions;
  const bookmarkRepository = await initBookmarkRepository();
  let cliResult: CliResult = { exitCode: 0 };
  try {
    if (!filePath) {
      throw new Error('No file path provided!');
    }
    const fileContent = readFileSync(filePath, 'utf8');
    if (format === Format.Html) {
      const links = getLinksFromHtml(fileContent);
      await Promise.all(
        links.map((l) => bookmarkRepository.setBookmark(createBookmark(l))),
      );
      cliResult = {
        exitCode: 0,
        stdout: `Imported ${links.length} bookmarks from HTML file ${filePath}`,
      };
    } else if (format === Format.JSON) {
      const { bookmarks } = JSON.parse(fileContent);
      if (!bookmarks || !Array.isArray(bookmarks)) {
        throw new Error('Invalid JSON structure');
      }
      if (bookmarks.length === 0) {
        throw new Error('No bookmarks found in JSON file');
      }
      if (bookmarks.some((b) => !isBookmark(b))) {
        throw new Error('Invalid bookmark(s) in JSON file');
      }
      await Promise.all(
        bookmarks.map((b) => bookmarkRepository.setBookmark(b)),
      );

      cliResult = {
        exitCode: 0,
        stdout: `Imported ${bookmarks.length} bookmarks from JSON file ${filePath}`,
      };
    }
  } catch (e: unknown) {
    console.error(e);
    cliResult = {
      exitCode: 1,
      stderr: `ERROR: ${(e as Error).message || 'Unknown error'}`,
    };
  }
  return cliResult;
};

export const exportBookmarks = async (
  exportOptions: ExportOptions,
): Promise<CliResult> => {
  const { filePath, format } = exportOptions;
  const bookmarkRepository = await initBookmarkRepository();
  let cliResult: CliResult = { exitCode: 0 };
  try {
    if (format === Format.Html) {
      const htmlFileContent = generateHtml(bookmarkRepository.bookmarks);
      if (filePath) {
        writeFileSync(filePath, htmlFileContent);
        cliResult = {
          exitCode: 0,
          stdout: `Exported ${bookmarkRepository.size} bookmarks to HTML file ${filePath}`,
        };
      } else {
        cliResult = {
          exitCode: 0,
          stdout: htmlFileContent,
        };
      }
    } else if (format === Format.JSON) {
      const bookmarks = Array.from(bookmarkRepository.bookmarks);
      const jsonFileContent = JSON.stringify({ bookmarks }, null, 2);
      if (filePath) {
        writeFileSync(filePath, jsonFileContent);
        cliResult = {
          exitCode: 0,
          stdout: `Exported ${bookmarkRepository.size} bookmarks to JSON file ${filePath}`,
        };
      } else {
        cliResult = {
          exitCode: 0,
          stdout: jsonFileContent,
        };
      }
    }
  } catch (e: unknown) {
    cliResult = {
      exitCode: 1,
      stderr: (e as Error).message || 'Unknown error',
    };
  }
  return cliResult;
};
