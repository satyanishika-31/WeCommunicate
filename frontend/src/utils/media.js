const apiOrigin = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api')
  .replace(/\/api\/?$/, '');

export const getMediaUrl = (src) => {
  if (!src || /^https?:\/\//i.test(src)) return src;
  return `${apiOrigin}${src}`;
};
