import { readFileSync } from 'fs';
import { parse } from 'node-html-parser';

export const ipmortFromHtml = (
  filePath: string,
): { url: string; title: string }[] => {
  const htmlObj = parse(readFileSync(filePath, 'utf8'));
  const links = htmlObj.getElementsByTagName('a');
  if (!links) {
    throw new Error('No links found in HTML file');
  }
  return links.map((l) => {
    const url = l.attrs.href || '';
    const title = l.text;

    return {
      title,
      url,
    };
  });
};
