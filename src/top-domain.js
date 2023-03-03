import baseCookie from './base-cookie';
import base64Id from './base64Id';
import utils from './utils';

// Utility that finds top level domain to write to
const topDomain = (url) => {
  const host = utils.getHost(url);
  const parts = host.split('.');
  const levels = [];
  const cname = '_tldtest_' + base64Id();

  if (utils.isWebWorkerEnvironment()) return '';

  for (let i = parts.length - 2; i >= 0; --i) {
    levels.push(parts.slice(i).join('.'));
  }

  for (let i = 0; i < levels.length; ++i) {
    const domain = levels[i];
    const opts = { domain: '.' + domain };

    baseCookie.set(cname, 1, opts);
    if (baseCookie.get(cname)) {
      baseCookie.set(cname, null, opts);
      return domain;
    }
  }

  return '';
};

export default topDomain;
