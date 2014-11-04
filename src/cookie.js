/**
 * Copyright Amplitude (c) 2014
 */

/*
 * Cookie data
 */
var Cookie = {
  get: function(name) {
    var nameEq = name + '=';
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1, c.length);
      }
      if (c.indexOf(nameEq) == 0) {
        return c.substring(nameEq.length, c.length);
      }
    }
    return null;
  },
  set: function(name, value, days, domain) {
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      var expires = '; expires=' + date.toGMTString();
    } else {
      var expires = '';
    }
    var cookieString = name + '=' + value + expires + '; path=/' + (domain ? (";domain=" + domain) : "");
    document.cookie = cookieString;
  },
  remove: function(name, domain) {
    Cookie.set(name, '', -1, domain);
  }
};

module.exports = Cookie;
