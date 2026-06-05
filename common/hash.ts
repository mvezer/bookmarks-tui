import { Bookmark } from './bookmark';

// simple, unsafe but very useful and effective hash function
// thank you JavaSpring.net!
// see https://www.javaspring.net/blog/simple-non-secure-hash-function-for-javascript/
export const hash = (input: string): string => {
  let hashA = 0x811c9dc5;
  let hashB = 0x01000193;

  for (let i = 0; i < input.length; i++) {
    const charCode = input.charCodeAt(i);
    hashA = (hashA * 0x01000193) ^ charCode;
    hashB = (hashB * 0x0100018d) ^ charCode;
  }

  const hashC = hashA ^ (hashB << 16);
  const hashD = hashB ^ (hashA >> 16);

  const toHex32 = (num: number) => {
    const hex = (num >>> 0).toString(16);
    return hex.padStart(8, '0').slice(-8);
  };

  return toHex32(hashA) + toHex32(hashB) + toHex32(hashC) + toHex32(hashD);
};

export const createBookmarkHash = (
  bookmark: Pick<Bookmark, 'title' | 'url'>,
): string => {
  return hash(bookmark.title + bookmark.url);
};
