/* jshint expr:true */
import Amplitude from  './amplitude';

var old = window.amplitude || {};
var newInstance = new Amplitude();
newInstance._q = old._q || [];
for (var instance in old._iq) { // migrate each instance's queue
  if (old._iq.hasOwnProperty(instance)) {
    newInstance.getInstance(instance)._q = old._iq[instance]._q || [];
  }
}

if(newInstance.runQueuedFunctions){
  newInstance.runQueuedFunctions();
} else {
  console.error("[Amplitude] Error: could not load SDK");
}
  

// export the instance
export default newInstance;
