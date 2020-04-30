/* jshint expr:true */
import Amplitude from  './amplitude';

const old = window.amplitude || {};
const newInstance = new Amplitude();
newInstance._q = old._q || [];
for (let instance in old._iq) { // migrate each instance's queue
  if (old._iq.hasOwnProperty(instance)) {
    newInstance.getInstance(instance)._q = old._iq[instance]._q || [];
  }
}

if (BUILD_COMPAT_SNIPPET) {
  newInstance.runQueuedFunctions();
}

// export the instance
export default newInstance;
