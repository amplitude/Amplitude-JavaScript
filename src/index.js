/* jshint expr:true */

var Amplitude = require('./amplitude');

var old = window.amplitude || {};
var newInstance = new Amplitude();

// migrate old queue
newInstance._q = old._q || [];

// migrate each instance's queue
for (var instance in old._iq) {
  if (old._iq.hasOwnProperty(instance)) {
    newInstance.getInstance(instance)._q = old._iq[instance]._q || [];
  }
}

// export the instance
module.exports = newInstance;
