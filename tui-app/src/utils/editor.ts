import { type Bookmark } from '@bookmarks-tui/common';
import { spawn } from 'child_process';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

const DEFAULT_EDITOR_COMMAND = 'vi';

export const openInEditor = async (
  bookmark?: Bookmark,
  editorCommand: string = process.env['EDITOR'] ?? DEFAULT_EDITOR_COMMAND,
): Promise<{ title: string; url: string }> => {
  const dir = join(tmpdir(), `bookmarks-tui-${Date.now()}`);
  await mkdir(dir, { recursive: true });
  const filePath = join(dir, 'bookmark.txt');

  const initialContent = bookmark ? `${bookmark.title}\n${bookmark.url}\n` : '';
  await writeFile(filePath, initialContent, 'utf-8');

  await new Promise<void>((resolve, reject) => {
    const child = spawn(editorCommand, [filePath], { stdio: 'inherit' });
    child.on('close', () => resolve());
    child.on('error', reject);
  });

  const raw = await readFile(filePath, 'utf-8');
  const lines = raw.split('\n').filter((line) => line.trim() !== '');

  if (lines.length < 2) throw new Error('Bookmark is missing title or url');

  const title = lines[0]!.trim();
  const url = lines[1]!.trim();

  return { title, url };
};
