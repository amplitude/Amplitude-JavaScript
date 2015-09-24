(function(window, document) {
  var amplitude = window.amplitude || {};
  var as = document.createElement('script');
  as.type = 'text/javascript';
  as.async = true;
  as.src = 'https://d24n15hnbwhuhn.cloudfront.net/libs/amplitude-2.4.1-min.gz.js';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(as, s);
  var identifyFuncs = {'add':['a', false], 'set':['s', false], 'setOnce':['so', false], 'unset':['u', true]};
  amplitude.Identify = function(){ this.p = {}; Object.keys(identifyFuncs).forEach(function (key) {
    this.p[identifyFuncs[key][0]] = {};
  }.bind(this));};
  function proxyIdentifyFunc(fn, dict, overrideValue) {
    amplitude.Identify.prototype[fn] = function(k,v) { this.p[dict][k]=overrideValue?'-':v; return this; };
  }
  Object.keys(identifyFuncs).forEach(function (key) {
    proxyIdentifyFunc(key, identifyFuncs[key][0], identifyFuncs[key][1]);
  });
  amplitude._q = [];
  function proxy(fn) {
    amplitude[fn] = function() {
      amplitude._q.push([fn].concat(Array.prototype.slice.call(arguments, 0)));
    };
  }
  var funcs = ["init", "logEvent", "logRevenue", "setUserId", "setUserProperties",
               "setOptOut", "setVersionName", "setDomain", "setDeviceId",
               "setGlobalUserProperties", "identify"];
  for (var i = 0; i < funcs.length; i++) {
    proxy(funcs[i]);
  }
  window.amplitude = amplitude;
})(window, document);
