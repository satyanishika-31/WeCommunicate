const apiOrigin = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api')
  .replace(/\/api\/?$/, '');

export const getMediaUrl = (src) => {
  if (!src) return '';
  if (/^(?:https?:)?\/\//i.test(src) || src.startsWith('data:') || src.startsWith('blob:')) {
    return src;
  }
  const normalized = src.startsWith('/') ? src : `/${src}`;
  return `${apiOrigin}${normalized}`;
};
