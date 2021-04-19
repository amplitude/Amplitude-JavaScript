import queryString from 'query-string';

/*
 * Simple AJAX request object
 */
var Request = function (url, data, headers) {
  this.url = url;
  this.data = data || {};
  this.headers = headers;
};

function setHeaders(xhr, headers) {
  for (const header in headers) {
    xhr.setRequestHeader(header, headers[header]);
  }
}

Request.prototype.send = function (callback) {
  var isIE = window.XDomainRequest ? true : false;
  if (isIE) {
    var xdr = new window.XDomainRequest();
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
  } else {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', this.url, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        callback(xhr.status, xhr.responseText);
      }
    };
    setHeaders(xhr, this.headers);
    xhr.send(queryString.stringify(this.data));
  }
  //log('sent request to ' + this.url + ' with data ' + decodeURIComponent(queryString(this.data)));
};

export default Request;
