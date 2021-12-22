const getHost = (url) => {
  if (url) {
    if (typeof document !== 'undefined') {
      const a = document.createElement('a');
      a.href = url;
      return a.hostname || globalThis.location.hostname;
    }
    if (typeof URL === 'function') {
      const u = new URL(url);
      return u.hostname || globalThis.location.hostname;
    }
  }
  return globalThis.location.hostname;
};

export default getHost;
