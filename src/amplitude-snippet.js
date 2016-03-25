(function(window, document) {
  var amplitude = window.amplitude || {'_q':[], '_iq':{}};
  var as = document.createElement('script');
  as.type = 'text/javascript';
  as.async = true;
  as.src = 'https://d24n15hnbwhuhn.cloudfront.net/libs/amplitude-3.0.0b-min.gz.js';
  as.onload = function() {window.amplitude.runQueuedFunctions();};
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(as, s);
  var Identify = function() {this._q = []; return this;};
  function proxyIdentify(fn) {
    Identify.prototype[fn] = function() {
      this._q.push([fn].concat(Array.prototype.slice.call(arguments, 0))); return this;
    };
  }
  var identifyFuncs = ['add', 'append', 'clearAll', 'prepend', 'set', 'setOnce', 'unset'];
  for (var i = 0; i < identifyFuncs.length; i++) {proxyIdentify(identifyFuncs[i]);}
  amplitude.Identify = Identify;
  var funcs = ['init', 'logEvent', 'logRevenue', 'setUserId', 'setUserProperties',
               'setOptOut', 'setVersionName', 'setDomain', 'setDeviceId',
               'setGlobalUserProperties', 'identify', 'clearUserProperties'];
  function setUpProxy(instance) {
    function proxy(fn) {
      instance[fn] = function() {
        instance._q.push([fn].concat(Array.prototype.slice.call(arguments, 0)));
      };
    }
    for (var j = 0; j < funcs.length; j++) {proxy(funcs[j]);}
  }
  setUpProxy(amplitude);
  amplitude.getInstance = function(instance) {
    instance = ((!instance || instance.length === 0) ? '$default_instance' : instance).toLowerCase();
    if (!amplitude._iq.hasOwnProperty(instance)) {
      amplitude._iq[instance] = {'_q':[]}; setUpProxy(amplitude._iq[instance]);
    }
    return amplitude._iq[instance];
  };
  window.amplitude = amplitude;
})(window, document);
