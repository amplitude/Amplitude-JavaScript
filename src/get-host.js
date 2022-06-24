import GlobalScope from './global-scope';

const getHost = (url) => {
  const defaultHostname = GlobalScope.location ? GlobalScope.location.hostname : '';
  if (url) {
    if (typeof document !== 'undefined') {
      const a = document.createElement('a');
      a.href = url;
      return a.hostname || defaultHostname;
    }
    if (typeof URL === 'function') {
      const u = new URL(url);
      return u.hostname || defaultHostname;
    }
  }
  return defaultHostname;
};

export default getHost;
