import GlobalScope from './global-scope';

const getHost = (url) => {
  if (url) {
    if (typeof document !== 'undefined') {
      const a = document.createElement('a');
      a.href = url;
      return a.hostname || GlobalScope.location.hostname;
    }
    if (typeof URL === 'function') {
      const u = new URL(url);
      return u.hostname || GlobalScope.location.hostname;
    }
  }
  return GlobalScope.location.hostname;
};

export default getHost;
