let rawCookieData = {};

let isMocked = false;

export const mockCookie = (options) => {
  const {disabled} = options || {};
  isMocked = true;

  document.__defineGetter__('cookie', function () {
    return Object.keys(rawCookieData).map(key => `${key}=${rawCookieData[key].val}`).join(";");
  });

  document.__defineSetter__('cookie', function (str) {
    if (disabled) {
      return '';
    }
    const indexEquals = str.indexOf("=");
    const key = str.substr(0, indexEquals);
    const remainingStr = str.substring(key.length + 1);
    const splitSemi = remainingStr.split(';').map((str)=> str.trim());

    rawCookieData[key] = {
      val: splitSemi[0],
      options: splitSemi.slice(1)
    };
    return str;
  });
};

export const restoreCookie = () => {
  if (isMocked) {
    delete document['cookie'];
    rawCookieData = {};
    isMocked = false;
  }
};

export const getCookie = (key) => {
  return rawCookieData[key];
};
