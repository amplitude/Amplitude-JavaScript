/*
 * amplitude.js
 * Javascript SDK for Amplitude
 *
 * Created by Curtis Liu
 * Copyright (c) 2014 Sonalight, Inc. All rights reserved.
 */
(function(window, document) {

    var log = function(s) {
        console.log('[Amplitude] ' + s);
    };

    /*
     * Checks if an object is an array
     */
    var isArray = Array.isArray || function(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    };

    /*
     * Converts a dictionary into a url safe query string
     */
    var queryString = function(p) {
        var pairs = []
        for (var key in p) {
            var value = p[key];
            if (isArray(value)) {
                for (var i = 0; i < value.length; i++) {
                    pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(value[i]));
                }
            } else {
                pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
            }
        }
        return pairs.join('&');
    };

    /*
     * Returns a random 128-bit string in hex (32 hex digits)
     */
    var UUID = function() {
        var s = [];
        for (var i = 0; i < 32; i++) {
            s[i] = Math.floor(Math.random() * 16).toString(16);
        }
        var uuid = s.join('');
        return uuid;
    };

    /*
     * Implement localStorage to support Firefox 2-3 and IE 5-7
     */
    var localStorage;
    if (window.localStorage) {
        localStorage = window.localStorage;
    } else if (window.globalStorage) {
        // Firefox 2-3 use globalStorage
        // See https://developer.mozilla.org/en/dom/storage#globalStorage
        try {
            localStorage = window.globalStorage[window.location.hostname];
        } catch (e) {
            // Something bad happened...
        }
    } else {
        // IE 5-7 use userData
        // See http://msdn.microsoft.com/en-us/library/ms531424(v=vs.85).aspx
        var div = document.createElement('div'),
            attrKey = 'localStorage';
        div.style.display = 'none';
        document.getElementsByTagName('head')[0].appendChild(div);
        if (div.addBehavior) {
            div.addBehavior('#default#userdata');
            localStorage = {
                length: 0,
                setItem: function(k, v) {
                    div.load(attrKey);
                    if (!div.getAttribute(k)) {
                        this.length++;
                    }
                    div.setAttribute(k, v);
                    div.save(attrKey);
                },
                getItem: function(k) {
                    div.load(attrKey);
                    return div.getAttribute(k);
                },
                removeItem: function(k) {
                    div.load(attrKey);
                    if (div.getAttribute(k)) {
                        this.length--;
                    }
                    div.removeAttribute(k);
                    div.save(attrKey);
                },
                clear: function() {
                    div.load(attrKey);
                    var i = 0;
                    var attr;
                    while (attr = div.XMLDocument.documentElement.attributes[i++]) {
                        div.removeAttribute(attr.name);
                    }
                    div.save(attrKey);
                    this.length = 0;
                },
                key: function(k) {
                    div.load(attrKey);
                    return div.XMLDocument.documentElement.attributes[k];
                }
            }
            div.load(attrKey);
            localStorage.length = div.XMLDocument.documentElement.attributes.length;
        } else {
            /* Nothing we can do ... */
        }
    }
    if (!localStorage) {
        localStorage = {
            length: 0,
            setItem: function(k, v) {},
            getItem: function(k) {},
            removeItem: function(k) {},
            clear: function() {},
            key: function(k) {}
        }
    }

    /*
     * UTF-8 encoder/decoder
     * http://www.webtoolkit.info/
     */
    var UTF8 = {
        encode: function (s) {
            s = s.replace(/\r\n/g,'\n');
            var utftext = '';

            for (var n = 0; n < s.length; n++) {
                var c = s.charCodeAt(n);

                if (c < 128) {
                    utftext += String.fromCharCode(c);
                }
                else if((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
                else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
            }
            return utftext;
        },

        decode: function (utftext) {
            var s = '';
            var i = 0;
            var c = 0, c1 = 0, c2 = 0;

            while ( i < utftext.length ) {
                c = utftext.charCodeAt(i);
                if (c < 128) {
                    s += String.fromCharCode(c);
                    i++;
                }
                else if((c > 191) && (c < 224)) {
                    c1 = utftext.charCodeAt(i+1);
                    s += String.fromCharCode(((c & 31) << 6) | (c1 & 63));
                    i += 2;
                }
                else {
                    c1 = utftext.charCodeAt(i+1);
                    c2 = utftext.charCodeAt(i+2);
                    s += String.fromCharCode(((c & 15) << 12) | ((c1 & 63) << 6) | (c2 & 63));
                    i += 3;
                }
            }
            return s;
        }
    };

    /*
     * Base64 encoder/decoder
     * http://www.webtoolkit.info/
     */
    var Base64 = {
        _keyStr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',

        encode: function (input) {
            try {
                if (window.btoa && window.atob) {
                    return window.btoa(unescape(encodeURIComponent(input)));
                }
            } catch (e) {
                //log(e);
            }
            return Base64._encode(input);
        },

        _encode: function (input) {
            var output = '';
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            var i = 0;

            input = UTF8.encode(input);

            while (i < input.length) {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                Base64._keyStr.charAt(enc1) + Base64._keyStr.charAt(enc2) +
                Base64._keyStr.charAt(enc3) + Base64._keyStr.charAt(enc4);
            }
            return output;
        },

        decode: function (input) {
            try {
                if (window.btoa && window.atob) {
                    return decodeURIComponent(escape(window.atob(input)));
                }
            } catch (e) {
                //log(e);
            }
            return Base64._decode(input);
        },

        _decode: function (input) {
            var output = '';
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;

            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');

            while (i < input.length) {
                enc1 = Base64._keyStr.indexOf(input.charAt(i++));
                enc2 = Base64._keyStr.indexOf(input.charAt(i++));
                enc3 = Base64._keyStr.indexOf(input.charAt(i++));
                enc4 = Base64._keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }
            }
            output = UTF8.decode(output);
            return output;
        }
    };

    /*
     * MD5 Implementation
     * http://www.myersdaily.org/joseph/javascript/md5-text.html
     */
    (function (global) {

      var md5cycle = function (x, k) {
        var a = x[0],
          b = x[1],
          c = x[2],
          d = x[3];

        a = ff(a, b, c, d, k[0], 7, -680876936);
        d = ff(d, a, b, c, k[1], 12, -389564586);
        c = ff(c, d, a, b, k[2], 17, 606105819);
        b = ff(b, c, d, a, k[3], 22, -1044525330);
        a = ff(a, b, c, d, k[4], 7, -176418897);
        d = ff(d, a, b, c, k[5], 12, 1200080426);
        c = ff(c, d, a, b, k[6], 17, -1473231341);
        b = ff(b, c, d, a, k[7], 22, -45705983);
        a = ff(a, b, c, d, k[8], 7, 1770035416);
        d = ff(d, a, b, c, k[9], 12, -1958414417);
        c = ff(c, d, a, b, k[10], 17, -42063);
        b = ff(b, c, d, a, k[11], 22, -1990404162);
        a = ff(a, b, c, d, k[12], 7, 1804603682);
        d = ff(d, a, b, c, k[13], 12, -40341101);
        c = ff(c, d, a, b, k[14], 17, -1502002290);
        b = ff(b, c, d, a, k[15], 22, 1236535329);

        a = gg(a, b, c, d, k[1], 5, -165796510);
        d = gg(d, a, b, c, k[6], 9, -1069501632);
        c = gg(c, d, a, b, k[11], 14, 643717713);
        b = gg(b, c, d, a, k[0], 20, -373897302);
        a = gg(a, b, c, d, k[5], 5, -701558691);
        d = gg(d, a, b, c, k[10], 9, 38016083);
        c = gg(c, d, a, b, k[15], 14, -660478335);
        b = gg(b, c, d, a, k[4], 20, -405537848);
        a = gg(a, b, c, d, k[9], 5, 568446438);
        d = gg(d, a, b, c, k[14], 9, -1019803690);
        c = gg(c, d, a, b, k[3], 14, -187363961);
        b = gg(b, c, d, a, k[8], 20, 1163531501);
        a = gg(a, b, c, d, k[13], 5, -1444681467);
        d = gg(d, a, b, c, k[2], 9, -51403784);
        c = gg(c, d, a, b, k[7], 14, 1735328473);
        b = gg(b, c, d, a, k[12], 20, -1926607734);

        a = hh(a, b, c, d, k[5], 4, -378558);
        d = hh(d, a, b, c, k[8], 11, -2022574463);
        c = hh(c, d, a, b, k[11], 16, 1839030562);
        b = hh(b, c, d, a, k[14], 23, -35309556);
        a = hh(a, b, c, d, k[1], 4, -1530992060);
        d = hh(d, a, b, c, k[4], 11, 1272893353);
        c = hh(c, d, a, b, k[7], 16, -155497632);
        b = hh(b, c, d, a, k[10], 23, -1094730640);
        a = hh(a, b, c, d, k[13], 4, 681279174);
        d = hh(d, a, b, c, k[0], 11, -358537222);
        c = hh(c, d, a, b, k[3], 16, -722521979);
        b = hh(b, c, d, a, k[6], 23, 76029189);
        a = hh(a, b, c, d, k[9], 4, -640364487);
        d = hh(d, a, b, c, k[12], 11, -421815835);
        c = hh(c, d, a, b, k[15], 16, 530742520);
        b = hh(b, c, d, a, k[2], 23, -995338651);

        a = ii(a, b, c, d, k[0], 6, -198630844);
        d = ii(d, a, b, c, k[7], 10, 1126891415);
        c = ii(c, d, a, b, k[14], 15, -1416354905);
        b = ii(b, c, d, a, k[5], 21, -57434055);
        a = ii(a, b, c, d, k[12], 6, 1700485571);
        d = ii(d, a, b, c, k[3], 10, -1894986606);
        c = ii(c, d, a, b, k[10], 15, -1051523);
        b = ii(b, c, d, a, k[1], 21, -2054922799);
        a = ii(a, b, c, d, k[8], 6, 1873313359);
        d = ii(d, a, b, c, k[15], 10, -30611744);
        c = ii(c, d, a, b, k[6], 15, -1560198380);
        b = ii(b, c, d, a, k[13], 21, 1309151649);
        a = ii(a, b, c, d, k[4], 6, -145523070);
        d = ii(d, a, b, c, k[11], 10, -1120210379);
        c = ii(c, d, a, b, k[2], 15, 718787259);
        b = ii(b, c, d, a, k[9], 21, -343485551);

        x[0] = add32(a, x[0]);
        x[1] = add32(b, x[1]);
        x[2] = add32(c, x[2]);
        x[3] = add32(d, x[3]);

      }

      var cmn = function (q, a, b, x, s, t) {
        a = add32(add32(a, q), add32(x, t));
        return add32((a << s) | (a >>> (32 - s)), b);
      }

      var ff = function (a, b, c, d, x, s, t) {
        return cmn((b & c) | ((~b) & d), a, b, x, s, t);
      }

      var gg = function (a, b, c, d, x, s, t) {
        return cmn((b & d) | (c & (~d)), a, b, x, s, t);
      }

      var hh = function (a, b, c, d, x, s, t) {
        return cmn(b ^ c ^ d, a, b, x, s, t);
      }

      var ii = function (a, b, c, d, x, s, t) {
        return cmn(c ^ (b | (~d)), a, b, x, s, t);
      }

      var md51 = function (s) {
        s = UTF8.encode(s);
        var n = s.length,
          state = [1732584193, -271733879, -1732584194, 271733878],
          i;
        for (i = 64; i <= s.length; i += 64) {
          md5cycle(state, md5blk(s.substring(i - 64, i)));
        }
        s = s.substring(i - 64);
        var tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (i = 0; i < s.length; i++)
          tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
        tail[i >> 2] |= 0x80 << ((i % 4) << 3);
        if (i > 55) {
          md5cycle(state, tail);
          for (i = 0; i < 16; i++) tail[i] = 0;
        }
        tail[14] = n * 8;
        md5cycle(state, tail);
        return state;
      }

      /* there needs to be support for Unicode here,
       * unless we pretend that we can redefine the MD-5
       * algorithm for multi-byte characters (perhaps
       * by adding every four 16-bit characters and
       * shortening the sum to 32 bits). Otherwise
       * I suggest performing MD-5 as if every character
       * was two bytes--e.g., 0040 0025 = @%--but then
       * how will an ordinary MD-5 sum be matched?
       * There is no way to standardize text to something
       * like UTF-8 before transformation; speed cost is
       * utterly prohibitive. The JavaScript standard
       * itself needs to look at this: it should start
       * providing access to strings as preformed UTF-8
       * 8-bit unsigned value arrays.
       */
      var md5blk = function (s) { /* I figured global was faster.   */
        var md5blks = [],
          i; /* Andy King said do it this way. */
        for (i = 0; i < 64; i += 4) {
          md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
        }
        return md5blks;
      }

      var hex_chr = '0123456789abcdef'.split('');

      var rhex = function (n) {
        var s = '',
          j = 0;
        for (; j < 4; j++)
          s += hex_chr[(n >> (j * 8 + 4)) & 0x0F] + hex_chr[(n >> (j * 8)) & 0x0F];
        return s;
      }

      var hex = function (x) {
        for (var i = 0; i < x.length; i++)
          x[i] = rhex(x[i]);
        return x.join('');
      }

      var md5 = global.md5 = function (s) {
        return hex(md51(s));
      }

      /* this function is much faster,
      so if possible we use it. Some IEs
      are the only ones I know of that
      need the idiotic second function,
      generated by an if clause.  */

      var add32 = function (a, b) {
        return (a + b) & 0xFFFFFFFF;
      }

      if (md5('hello') != '5d41402abc4b2a76b9719d911017c592') {
        var add32 = function (x, y) {
          var lsw = (x & 0xFFFF) + (y & 0xFFFF),
            msw = (x >> 16) + (y >> 16) + (lsw >> 16);
          return (msw << 16) | (lsw & 0xFFFF);
        }
      }

    })(window);

    /*
     * JSON stringify/parse
     * https://github.com/douglascrockford/JSON-js
     * json2.js
     */
    var JSON = window.JSON;
    if (typeof JSON !== 'object') {
        JSON = {};
    }

    (function () {
        'use strict';

        function f(n) {
        // Format integers to have at least two digits.
            return n < 10 ? '0' + n : n;
        }

        if (typeof Date.prototype.toJSON !== 'function') {

            Date.prototype.toJSON = function (key) {

                return isFinite(this.valueOf())
                    ? this.getUTCFullYear()     + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate())      + 'T' +
                    f(this.getUTCHours())     + ':' +
                    f(this.getUTCMinutes())   + ':' +
                    f(this.getUTCSeconds())   + 'Z'
                    : null;
            };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
                Boolean.prototype.toJSON = function (key) {
                    return this.valueOf();
                };
        }

        var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


        function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

            escapable.lastIndex = 0;
            return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
                var c = meta[a];
            return typeof c === 'string'
                ? c
                    : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' : '"' + string + '"';
        }


        function str(key, holder) {

// Produce a string from holder[key].

            var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

            if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
                value = value.toJSON(key);
            }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

            if (typeof rep === 'function') {
                value = rep.call(holder, key, value);
            }

// What happens next depends on the value's type.

            switch (typeof value) {
            case 'string':
                return quote(value);

            case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

                return isFinite(value) ? String(value) : 'null';

            case 'boolean':
            case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

                return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

            case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

                if (!value) {
                    return 'null';
                }

// Make an array to hold the partial results of stringifying this object value.

                gap += indent;
                partial = [];

// Is the value an array?

                if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || 'null';
                    }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? '[]'
                        : gap
                        ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                        : '[' + partial.join(',') + ']';
                    gap = mind;
                    return v;
                }

// If the replacer is an array, use it to select the members to be stringified.

                if (rep && typeof rep === 'object') {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        if (typeof rep[i] === 'string') {
                            k = rep[i];
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                } else {

// Otherwise, iterate through all of the keys in the object.

                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? '{}'
                    : gap
                    ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                    : '{' + partial.join(',') + '}';
                gap = mind;
                return v;
            }
        }

// If the JSON object does not yet have a stringify method, give it one.

        if (typeof JSON.stringify !== 'function') {
            JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

                var i;
                gap = '';
                indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

                if (typeof space === 'number') {
                    for (i = 0; i < space; i += 1) {
                        indent += ' ';
                    }

// If the space parameter is a string, it will be used as the indent string.

                } else if (typeof space === 'string') {
                    indent = space;
                }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

                rep = replacer;
                if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                    throw new Error('JSON.stringify');
                }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

                return str('', {'': value});
            };
        }


// If the JSON object does not yet have a parse method, give it one.

        if (typeof JSON.parse !== 'function') {
            JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

                var j;

                function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                    var k, v, value = holder[key];
                    if (value && typeof value === 'object') {
                        for (k in value) {
                            if (Object.prototype.hasOwnProperty.call(value, k)) {
                                v = walk(value, k);
                                if (v !== undefined) {
                                    value[k] = v;
                                } else {
                                    delete value[k];
                                }
                            }
                        }
                    }
                    return reviver.call(holder, key, value);
                }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

                text = String(text);
                cx.lastIndex = 0;
                if (cx.test(text)) {
                    text = text.replace(cx, function (a) {
                    return '\\u' +
                            ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                    });
                }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

                if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                          .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                    j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                        ? walk({'': j}, '')
                    : j;
                }

// If the text is not JSON parseable, then a SyntaxError is thrown.

                throw new SyntaxError('JSON.parse');
            };
        }
    }());

    var userAgent = navigator.userAgent;
    var vendor = navigator.vendor;
    var platform = navigator.platform;

    /*
     * Browser/OS detection
     */
    var BrowserDetect = {
        init: function() {
            this.browser = this.searchString(this.dataBrowser) || null;
            this.version = this.searchVersion(navigator.userAgent) ||
                this.searchVersion(navigator.appVersion) || null;
            this.OS = this.searchString(this.dataOS) || null;
        },
        searchString: function(data) {
            for (var i=0; i<data.length; i++)	{
                var dataString = data[i].string;
                var dataProp = data[i].prop;
                this.versionSearchString = data[i].versionSearch || data[i].identity;
                if (dataString) {
                    if (dataString.indexOf(data[i].subString) != -1) {
                        return data[i].identity;
                    }
                }
                else if (dataProp) {
                    return data[i].identity;
                }
            }
        },
        searchVersion: function(dataString) {
            var index = dataString.indexOf(this.versionSearchString);
            if (index == -1) {
                return;
            }
            return parseFloat(dataString.substring(index + this.versionSearchString.length+1));
        },
        dataBrowser: [
            {
                string: userAgent,
                subString: 'Chrome',
                identity: 'Chrome'
            },
            { 	string: userAgent,
                subString: 'OmniWeb',
                versionSearch: 'OmniWeb/',
                identity: 'OmniWeb'
            },
            {
                string: vendor,
                subString: 'Apple',
                identity: 'Safari',
                versionSearch: 'Version'
            },
            {
                prop: window.opera,
                identity: 'Opera',
                versionSearch: 'Version'
            },
            {
                string: vendor,
                subString: 'iCab',
                identity: 'iCab'
            },
            {
                string: vendor,
                subString: 'KDE',
                identity: 'Konqueror'
            },
            {
                string: userAgent,
                subString: 'Firefox',
                identity: 'Firefox'
            },
            {
                string: vendor,
                subString: 'Camino',
                identity: 'Camino'
            },
            {		// for newer Netscapes (6+)
                string: userAgent,
                subString: 'Netscape',
                identity: 'Netscape'
            },
            {
                string: userAgent,
                subString: 'MSIE',
                identity: 'Explorer',
                versionSearch: 'MSIE'
            },
            {
                string: userAgent,
                subString: 'Gecko',
                identity: 'Mozilla',
                versionSearch: 'rv'
            },
            { 		// for older Netscapes (4-)
                string: userAgent,
                subString: 'Mozilla',
                identity: 'Netscape',
                versionSearch: 'Mozilla'
            }
        ],
        dataOS : [
            {
                string: platform,
                subString: 'Win',
                identity: 'Windows'
            },
            {
                string: platform,
                subString: 'Mac',
                identity: 'Mac'
            },
            {
                string: userAgent,
                subString: 'iPhone',
                identity: 'iPhone/iPod'
            },
            {
                string: userAgent,
                subString: 'Android',
                identity: 'Android'
            },
            {
                string: platform,
                subString: 'Linux',
                identity: 'Linux'
            }
        ]

    };
    BrowserDetect.init();

    /*
     * Simple AJAX request object
     */
    var Request = function(url, data) {
        this.url = url;
        this.data = data || {};
    };

    Request.prototype.send = function(callback) {
        var isIE = window.XDomainRequest ? true : false;
        if (isIE) {
            var xdr = new window.XDomainRequest();
	    xdr.open('POST', this.url, true);
	    xdr.onload = function() {
                callback(xdr.responseText);
            };
	    xdr.send(queryString(this.data));
        } else {
            var xhr = new XMLHttpRequest();
            xhr.open('POST', this.url, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200) {
                        callback(xhr.responseText);
                    }
                }
            }
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
            xhr.send(queryString(this.data));
        }
        //log('sent request to ' + this.url + ' with data ' + decodeURIComponent(queryString(this.data)));
    };

    /*
     * Cookie data
     */
    var Cookie = {
        get: function(name) {
            var nameEq = name + '=';
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1, c.length);
                }
                if (c.indexOf(nameEq) == 0) {
                    return c.substring(nameEq.length, c.length);
                }
            }
            return null;
        },
        set: function(name, value, days, domain) {
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                var expires = '; expires=' + date.toGMTString();
            } else {
                var expires = '';
            }
            var cookieString = name + '=' + value + expires + '; path=/' + (domain ? (";domain=" + domain) : "");
            document.cookie = cookieString;
        },
        remove: function(name, domain) {
            Cookie.set(name, '', -1, domain);
        }
    };

    /*
     * Amplitude API
     */
    var Amplitude = function() {};
    Amplitude.SDK_VERSION = "1.3";
    Amplitude.API_VERSION = 2;

    var options = {
        apiEndpoint: 'api.amplitude.com',
        cookieName: 'amplitude_id',
        cookieExpiration: 365 * 10,
        unsentKey: 'amplitude_unsent',
        saveEvents: true,
        domain: '',
        sessionTimeout: 30 * 60 * 1000
    };

    var eventId = 0;
    var unsentEvents = [];
    var sending = false;
    var lastEventTime = null;
    var sessionId = null;
    var LocalStorageKeys = {
      LAST_EVENT_TIME: 'amplitude_lastEventTime',
      SESSION_ID: 'amplitude_sessionId'
    };

    var nextEventId = function() {
        eventId++;
        return eventId;
    };

    /**
     * Initializes Amplitude.
     * apiKey The API Key for your app
     * opt_userId An identifier for this user
     * opt_config Configuration options
     *   - saveEvents (boolean) Whether to save events to local storage. Defaults to true.
     */
    Amplitude.prototype.init = function(apiKey, opt_userId, opt_config) {
        try {
            this.options = options;
            options.apiKey = apiKey;
            if (opt_config) {
                if (opt_config.saveEvents !== undefined) {
                    options.saveEvents = !!opt_config.saveEvents;
                }
            }

            loadCookieData();

            options.deviceId = (opt_config.deviceId !== undefined && opt_config.deviceId !== null && opt_config.deviceId) ||
                options.deviceId || UUID();
            options.userId = (opt_userId !== undefined && opt_userId !== null && opt_userId) || options.userId || null;
            saveCookieData();

            //log('initialized with apiKey=' + apiKey);
            //opt_userId !== undefined && opt_userId !== null && log('initialized with userId=' + opt_userId);
            eventId = 0;

            if (options.saveEvents) {
                var savedUnsentEventsString = localStorage.getItem(options.unsentKey);
                if (savedUnsentEventsString) {
                    try {
                        unsentEvents = JSON.parse(savedUnsentEventsString);
                    } catch (e) {
                        //log(e);
                    }
                }
            }
            if (unsentEvents.length > 0) {
                this.sendEvents();
            }

            lastEventTime = parseInt(localStorage.getItem(LocalStorageKeys.LAST_EVENT_TIME)) || null;
            sessionId = parseInt(localStorage.getItem(LocalStorageKeys.SESSION_ID)) || null;
            var now = new Date().getTime();
            if (!sessionId || !lastEventTime || now - lastEventTime > options.sessionTimeout) {
              sessionId = now;
              localStorage.setItem(LocalStorageKeys.SESSION_ID, sessionId);
            }
            lastEventTime = now;
            localStorage.setItem(LocalStorageKeys.LAST_EVENT_TIME, lastEventTime);
        } catch (e) {
            log(e);
        }
    };

    var loadCookieData = function() {
        var cookie = Cookie.get(options.cookieName);
        var cookieData = null;
        if (cookie) {
            try {
                cookieData = JSON.parse(Base64.decode(cookie));
                if (cookieData) {
                    if (cookieData.deviceId) {
                        options.deviceId = cookieData.deviceId;
                    }
                    if (cookieData.userId) {
                        options.userId = cookieData.userId;
                    }
                    if (cookieData.globalUserProperties) {
                        options.globalUserProperties = cookieData.globalUserProperties;
                    }
                }
            } catch (e) {
                //log(e);
            }
        }
    };

    var saveCookieData = function() {
        Cookie.set(options.cookieName, Base64.encode(JSON.stringify({
                deviceId: options.deviceId,
                userId: options.userId,
                globalUserProperties: options.globalUserProperties
        })), options.cookieExpiration, options.domain);
    };

    var saveEvents = function() {
        try {
            localStorage.setItem(options.unsentKey, JSON.stringify(unsentEvents));
        } catch (e) {
            //log(e);
        }
    };

    Amplitude.prototype.setDomain = function(domain) {
        try {
            options.domain = (domain !== undefined && domain !== null && ('' + domain)) || null;
            options.cookieName = "amplitude_id" + (options.domain || '');
            loadCookieData();
            saveCookieData();
            //log('set domain=' + domain);
        } catch (e) {
            log(e);
        }
    };

    Amplitude.prototype.setUserId = function(userId) {
        try {
            options.userId = (userId !== undefined && userId !== null && ('' + userId)) || null;
            saveCookieData();
            //log('set userId=' + userId);
        } catch (e) {
            log(e);
        }
    };

    Amplitude.prototype.setUserProperties = function(userProperties) {
        try {
            options.globalUserProperties = userProperties;
            saveCookieData();
            //log('set userProperties=' + JSON.stringify(userProperties));
        } catch (e) {
            log(e);
        }
    };

    Amplitude.prototype.setVersionName = function(versionName) {
        try {
            options.versionName = versionName;
            //log('set versionName=' + versionName);
        } catch (e) {
            log(e);
        }
    };

    Amplitude.prototype.logEvent = function(eventType, eventProperties) {
        try {
            var eventTime = new Date().getTime();
            if (!sessionId || !lastEventTime || eventTime - lastEventTime > options.sessionTimeout) {
              sessionId = eventTime;
              localStorage.setItem(LocalStorageKeys.SESSION_ID, sessionId);
            }
            lastEventTime = eventTime;
            localStorage.setItem(LocalStorageKeys.LAST_EVENT_TIME, lastEventTime);
            eventProperties = eventProperties || {};
            var event = {
                device_id: options.deviceId,
                user_id: options.userId || options.deviceId,
                timestamp: eventTime,
                event_id: nextEventId(),
                session_id: sessionId || -1,
                event_type: eventType,
                // api_properties: {
                    // location: this.getLocation()
                // },
                client: BrowserDetect.browser,
                version_code: 0,
                version_name: options.versionName || null,
                build_version_sdk: 0,
                build_version_release: BrowserDetect.version,
                // phone_manufacturer: null,
                // phone_brand: null,
                phone_model: BrowserDetect.OS,
                custom_properties: eventProperties,
                global_properties: options.globalUserProperties || {}
                // country: null,
                // language: null,
                // phone_carrier: null
            };
            unsentEvents.push(event);
            if (options.saveEvents) {
                saveEvents();
            }
            //log('logged eventType=' + eventType + ', properties=' + JSON.stringify(eventProperties));
            this.sendEvents();
        } catch (e) {
            log(e);
        }
    };

    Amplitude.prototype.sendEvents = function() {
        if (!sending) {
            sending = true;
            var url = ('https:' == window.location.protocol ? 'https' : 'http') + '://' +
                options.apiEndpoint + '/';
            var events = JSON.stringify(unsentEvents);
            var uploadTime = new Date().getTime();
            var data = {
                client: options.apiKey,
                e: events,
                v: Amplitude.API_VERSION,
                upload_time: uploadTime,
                checksum: md5(Amplitude.API_VERSION + options.apiKey + events + uploadTime)
            };
            var numEvents = unsentEvents.length;
            var scope = this;
            new Request(url, data).send(function(response) {
                sending = false;
                try {
                    if (response == 'success') {
                        //log('sucessful upload');
                        unsentEvents.splice(0, numEvents);
                        if (options.saveEvents) {
                            saveEvents();
                        }
                        if (unsentEvents.length > 0) {
                            scope.sendEvents();
                        }
                    }
                } catch (e) {
                    //log('failed upload');
                }
            });
        }
    };

    /**
     *  @deprecated
     */
    Amplitude.prototype.setGlobalUserProperties = Amplitude.prototype.setUserProperties;

    Amplitude.prototype.__VERSION__ = '1.3.0';

    var old = window.amplitude || {};
    var q = old._q || [];
    var instance = new Amplitude();

    window.amplitude = instance;

    // Apply the queued commands
    for (var i = 0; i < q.length; i++) {
        var fn = instance[q[i][0]];
        fn && fn.apply(instance, q[i].slice(1));
    }

})(window, document)
