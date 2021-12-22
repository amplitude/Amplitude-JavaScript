// Entry point
import Amplitude from './amplitude';

const old = (typeof globalThis !== 'undefined' && globalThis.amplitude) || {};
const newInstance = new Amplitude();
newInstance._q = old._q || [];

/**
 * Instantiates Amplitude object and runs all queued function logged by stubbed methods provided by snippets
 * Event queue allows async loading of SDK to not blocking client's app
 */
for (let instance in old._iq) {
  // migrate each instance's queue
  if (Object.prototype.hasOwnProperty.call(old._iq, instance)) {
    newInstance.getInstance(instance)._q = old._iq[instance]._q || [];
  }
}

// If SDK is enabled as snippet, process the events queued by stubbed function
if (BUILD_COMPAT_SNIPPET) {
  newInstance.runQueuedFunctions();
}

// export the instance
export default newInstance;
