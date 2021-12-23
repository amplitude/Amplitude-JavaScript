import Constants from './constants';
import { getDynamicConfigApi } from './server-zone';
import GlobalScope from './global-scope';
/**
 * Dynamic Configuration
 * Find the best server url automatically based on app users' geo location.
 */
class ConfigManager {
  constructor() {
    if (!ConfigManager.instance) {
      this.ingestionEndpoint = Constants.EVENT_LOG_URL;
      ConfigManager.instance = this;
    }
    return ConfigManager.instance;
  }

  refresh(serverZone, forceHttps, callback) {
    let protocol = 'https';
    if (!forceHttps && 'https:' !== GlobalScope.location.protocol) {
      protocol = 'http';
    }
    const dynamicConfigUrl = protocol + '://' + getDynamicConfigApi(serverZone);
    const self = this;
    const isIE = GlobalScope.XDomainRequest ? true : false;
    if (isIE) {
      const xdr = new GlobalScope.XDomainRequest();
      xdr.open('GET', dynamicConfigUrl, true);
      xdr.onload = function () {
        const response = JSON.parse(xdr.responseText);
        self.ingestionEndpoint = response['ingestionEndpoint'];
        if (callback) {
          callback();
        }
      };
      xdr.onerror = function () {};
      xdr.ontimeout = function () {};
      xdr.onprogress = function () {};
      xdr.send();
    } else {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', dynamicConfigUrl, true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          self.ingestionEndpoint = response['ingestionEndpoint'];
          if (callback) {
            callback();
          }
        }
      };
      xhr.send();
    }
  }
}

const instance = new ConfigManager();

export default instance;
