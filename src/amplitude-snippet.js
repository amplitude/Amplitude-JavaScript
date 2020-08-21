/**
* Imported in client browser via <script> tag
* Async capabilities: Interally creates stubbed window.amplitude object until real SDK loaded
* Stubbed functions keep track of funciton calls and their arguments
* These are sent once real SDK loaded through another <script> tag
*/
(function(window, document) {
  var amplitude = window.amplitude || {'_q':[],'_iq':{}};
  var as = document.createElement('script');
  as.type = 'text/javascript';
  as.integrity = 'sha384-cukXwabQy+j/QA1+RqiXSzxhgQg5Rrn3zVszlwH3pWj/bXJxlA8Ge7NhcD6vP2Ik';
  as.crossOrigin = 'anonymous';
  as.async = true;
  as.src = 'https://cdn.amplitude.com/libs/amplitude-7.1.0-min.gz.js';
  as.onload = function() {if(!window.amplitude.runQueuedFunctions) {console.log('[Amplitude] Error: could not load SDK');}};
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(as, s);
  function proxy(obj, fn) {
    obj.prototype[fn] = function() {
      this._q.push([fn].concat(Array.prototype.slice.call(arguments, 0))); return this;
    };
  }
  var Identify = function() {this._q = []; return this;};
  var identifyFuncs = ['add', 'append', 'clearAll', 'prepend', 'set', 'setOnce', 'unset'];
  for (var i = 0; i < identifyFuncs.length; i++) {proxy(Identify,identifyFuncs[i]);}
  amplitude.Identify = Identify;
  var Revenue = function() {this._q = []; return this;};
  var revenueFuncs = ['setProductId', 'setQuantity', 'setPrice', 'setRevenueType', 'setEventProperties'];
  for (var j = 0; j < revenueFuncs.length; j++) {proxy(Revenue, revenueFuncs[j]);}
  amplitude.Revenue = Revenue;
  var funcs = ['init', 'logEvent', 'logRevenue', 'setUserId', 'setUserProperties',
               'setOptOut', 'setVersionName', 'setDomain', 'setDeviceId', 'enableTracking',
               'setGlobalUserProperties', 'identify', 'clearUserProperties',
               'setGroup', 'logRevenueV2', 'regenerateDeviceId', 'groupIdentify', 'onInit',
               'logEventWithTimestamp', 'logEventWithGroups', 'setSessionId', 'resetSessionId'];
  function setUpProxy(instance) {
    function proxyMain(fn) {
      instance[fn] = function() {
        instance._q.push([fn].concat(Array.prototype.slice.call(arguments, 0)));
      };
    }
    for (var k = 0; k < funcs.length; k++) {proxyMain(funcs[k]);}
  }
  setUpProxy(amplitude);
  amplitude.getInstance = function(instance) {
    instance = ((!instance || instance.length===0) ? '$default_instance' : instance).toLowerCase();
    if (!amplitude._iq.hasOwnProperty(instance)) {
      amplitude._iq[instance] = {'_q':[]}; setUpProxy(amplitude._iq[instance]);
    }
    return amplitude._iq[instance];
  };
  window.amplitude = amplitude;
})(window, document);
