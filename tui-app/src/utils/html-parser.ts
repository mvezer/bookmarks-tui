import { parse } from 'node-html-parser';

export const getLinksFromHtml = (
  html: string,
): { url: string; title: string }[] => {
  const htmlObj = parse(html);
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
