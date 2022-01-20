import queryString from 'query-string';
import GlobalScope from './global-scope';

/*
 * Simple AJAX request object
 */
var Request = function (url, data, headers) {
  this.url = url;
  this.data = data || {};
  this.headers = headers;
};

const CORS_HEADER = 'Cross-Origin-Resource-Policy';

function setHeaders(xhr, headers) {
  for (const header in headers) {
    if (header === CORS_HEADER && !headers[header]) {
      continue;
    }
    xhr.setRequestHeader(header, headers[header]);
  }
}

Request.prototype.send = function (callback) {
  var isIE = GlobalScope.XDomainRequest ? true : false;
  if (isIE) {
    var xdr = new GlobalScope.XDomainRequest();
    xdr.open('POST', this.url, true);
    xdr.onload = function () {
      callback(200, xdr.responseText);
    };
    xdr.onerror = function () {
      // status code not available from xdr, try string matching on responseText
      if (xdr.responseText === 'Request Entity Too Large') {
        callback(413, xdr.responseText);
      } else {
        callback(500, xdr.responseText);
      }
    };
    xdr.ontimeout = function () {};
    xdr.onprogress = function () {};
    xdr.send(queryString.stringify(this.data));
  } else if (typeof XMLHttpRequest !== 'undefined') {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', this.url, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        callback(xhr.status, xhr.responseText);
      }
    };
    setHeaders(xhr, this.headers);
    xhr.send(queryString.stringify(this.data));
  } else {
    let responseStatus = undefined;
    fetch(this.url, {
      method: 'POST',
      headers: this.headers,
      body: queryString.stringify(this.data),
    })
      .then((response) => {
        responseStatus = response.status;
        return response.text();
      })
      .then((responseText) => {
        callback(responseStatus, responseText);
      });
  }
  //log('sent request to ' + this.url + ' with data ' + decodeURIComponent(queryString(this.data)));
};

export default Request;
