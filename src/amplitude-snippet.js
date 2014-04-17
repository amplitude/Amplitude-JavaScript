/*
 * amplitude-snippet.js
 *
 * Created by Curtis Liu
 * Copyright (c) 2013 Sonalight, Inc. All rights reserved.
 */
(function(window, document) {
  var amplitude = window.amplitude || {};
  var as = document.createElement('script');
  as.type = 'text/javascript';
  as.async = true;
  as.src = 'https://d24n15hnbwhuhn.cloudfront.net/libs/amplitude-1.0-min.js';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(as, s);
  amplitude._q = [];
  function proxy(fn) {
    amplitude[fn] = function() {
      amplitude._q.push([fn].concat(Array.prototype.slice.call(arguments, 0)));
    };
  }
  var funcs = ["init", "logEvent", "setUserId", "setGlobalUserProperties", "setVersionName", "setDomain"];
  for (var i = 0; i < funcs.length; i++) {
    proxy(funcs[i]);
  };
  window.amplitude = amplitude;
})(window, document);
