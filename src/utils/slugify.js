import slugify from 'slugify';

export const slugifyString = (str) => {
  return slugify(str, {
    lower: true,
    strict: true,
    replacement: '-'
  });
};
