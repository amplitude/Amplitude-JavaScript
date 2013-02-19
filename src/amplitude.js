/*
 * amplitude.js
 * Javascript SDK for Amplitude
 *
 * Created by Curtis Liu
 * Copyright (c) 2013 Sonalight, Inc. All rights reserved.
 */
(function(window, document) {

    var log = function(s) {
        console.log('[Amplitude] ' + s);
    };

    /*
     * Checks if an object is an array
     */
    var isArray = Array.isArray || function(obj) {
        return toString.call(obj) === '[object Array]';
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
                return Base64._encode(input);
            }
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
                return Base64._decode(input);
            }
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
        var xhr = new XMLHttpRequest();
        xhr.open('POST', this.url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                callback(xhr.status, xhr.responseText);
            }
        }
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        xhr.send(queryString(this.data));
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
        set: function(name, value, days) {
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                var expires = '; expires=' + date.toGMTString();
            } else {
                var expires = '';
            }
            document.cookie = name + '=' + value + expires + '; path=/';
        },
        remove: function(name) {
            Cookie.set(name, '', -1);
        }
    };

    /*
     * Amplitude API
     */
    var Amplitude = function() {};

    var options = {
        apiEndpoint: 'api.amplitude.com',
        cookieName: 'amplitude_id',
        cookieExpiration: 365 * 10,
        unsentKey: 'amplitude_unsent'
    };

    var eventId = 0;
    var unsentEvents = [];
    var sending = false;

    var nextEventId = function() {
        eventId++;
        return eventId;
    };

    Amplitude.prototype.init = function(apiKey, opt_userId) {
        this.options = options;
        options.apiKey = apiKey;

        // Load cookie data
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

        options.deviceId = options.deviceId || UUID();
        options.userId = (opt_userId !== undefined && opt_userId !== null && opt_userId) || options.userId || null;
        saveCookieData();

        //log('initialized with apiKey=' + apiKey);
        //opt_userId !== undefined && opt_userId !== null && log('initialized with userId=' + opt_userId);
        eventId = 0;

        var savedUnsentEventsString = localStorage.getItem(options.unsentKey);
        var unsentEvents = []
        if (savedUnsentEventsString) {
            try {
                unsentEvents = JSON.parse(savedUnsentEventsString);
            } catch (e) {
                //log(e);
            }
        }
        if (unsentEvents.length > 0) {
            this.sendEvents();
        }
    };

    var saveCookieData = function() {
        Cookie.set(options.cookieName, Base64.encode(JSON.stringify({
                deviceId: options.deviceId,
                userId: options.userId,
                globalUserProperties: options.globalUserProperties
            })), options.cookieExpiration);
    };

    Amplitude.prototype.setUserId = function(userId) {
        options.userId = (userId !== undefined && userId !== null && ('' + userId)) || null;
        saveCookieData();
        //log('set userId=' + userId);
    };

    Amplitude.prototype.setGlobalUserProperties = function(globalUserProperties) {
        options.globalUserProperties = globalUserProperties;
        saveCookieData();
        //log('set globalUserProperties=' + JSON.stringify(globalUserProperties));
    };

    Amplitude.prototype.setVersionName = function(versionName) {
        options.versionName = versionName;
        //log('set versionName=' + versionName);
    };

    Amplitude.prototype.logEvent = function(eventType, customProperties) {
        var eventTime = new Date().getTime();
        customProperties = customProperties || {};
        var event = {
            device_id: options.deviceId,
            user_id: options.userId || options.deviceId,
            timestamp: eventTime,
            event_id: nextEventId(),
            session_id: -1,
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
            custom_properties: customProperties,
            global_properties: options.globalUserProperties || {}
            // country: null,
            // language: null,
            // phone_carrier: null
        };
        unsentEvents.push(event);
        try {
            localStorage.setItem(options.unsentKey, JSON.stringify(unsentEvents));
        } catch (e) {
            //log(e);
        }
        //log('logged eventType=' + eventType + ', properties=' + JSON.stringify(customProperties));
        this.sendEvents();
    };

    Amplitude.prototype.sendEvents = function() {
        if (!sending) {
            sending = true;
            var url = ('https:' == window.location.protocol ? 'https' : 'http') + '://' +
                options.apiEndpoint + '/';
            var data = {
                client: options.apiKey,
                e: JSON.stringify(unsentEvents)
            }
            var numEvents = unsentEvents.length;
            var scope = this;
            new Request(url, data).send(function(status, response) {
                sending = false;
                try {
                    if (status == 200 && JSON.parse(response).added == numEvents) {
                        //log('sucessful upload');
                        unsentEvents.splice(0, numEvents);
                        try {
                            localStorage.setItem(options.unsentKey, JSON.stringify(unsentEvents));
                        } catch (e) {
                            //log(e);
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
