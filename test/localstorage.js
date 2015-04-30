describe('Localstorage', function () {
  var Amplitude = require('../src/amplitude.js');
  var localStorage = require('../src/localstorage');
  var cookieStorage = require('../src/localstorage-cookie');
  var Cookie = require('../src/cookie.js');
  var apiKey = '000000';

  beforeEach(function() {
    amplitude = new Amplitude();
  });

  afterEach(function() {
  });

  describe('cookie polyfill', function() {

    it('should store values', function () {
      cookieStorage.setItem("key-a", "value-a");
      assert.equal(cookieStorage.getItem("key-a"), "value-a");
    });

    it('should return undefined for unstored keys', function () {
      assert.equal(cookieStorage.getItem("unstored"), undefined);
    });

    it('should remove values', function () {
      cookieStorage.setItem("removed", "value-a");
      cookieStorage.removeItem("removed");
      assert.equal(cookieStorage.getItem("removed"), undefined);
    });

    it('should store values with entities', function () {
      cookieStorage.setItem("key-b", "this&that;with=an?<>");
      assert.equal(cookieStorage.getItem("key-b"), "this&that;with=an?<>");
    });

    it('should replace values', function () {
      cookieStorage.setItem("key-c", "value-a");
      cookieStorage.setItem("key-c", "value-b");
      assert.equal(cookieStorage.getItem("key-c"), "value-b");
    });

    it('should not store more than 4k', function () {
      var value = "";
      for (var i = 0; i < 3*1024; i++) {
        value += "A";
      }

      cookieStorage.removeItem("key-d");
      cookieStorage.removeItem("key-e");

      cookieStorage.setItem("key-d", value);
      cookieStorage.setItem("key-e", value);

      assert.equal(cookieStorage.getItem("key-d"), value);
      assert.equal(cookieStorage.getItem("key-e"), undefined);
    });
  });

  describe('upgrade', function() {
    var props = {A: 'a', B: 0, C: new Date(1).toString(), D: 5.5};

    it('should find values in cookies and copy to localstorage', function () {
      Cookie.set('amplitude_id', {
        deviceId: "DEVICE_ID",
        userId: "USER_ID",
        globalUserProperties: props,
        optOut: false
      });

      amplitude.options.apiKey = apiKey;
      amplitude._upgradeStoredData();

      assert.equal(amplitude.getLocalStorage("DEVICE_ID"), "DEVICE_ID");
      assert.equal(amplitude.getLocalStorage("USER_ID"), "USER_ID");
      assert.equal(amplitude.getLocalStorage("USER_PROPERTIES"), JSON.stringify(props));
      assert.equal(amplitude.getLocalStorage("OPT_OUT"), 'false');

      assert.equal(Cookie.get("amplitude_id"), undefined);
    });

    it('should find values in old keys and copy to new keys', function () {
      localStorage.setItem('amplitude_lastEventId', 1000);
      localStorage.setItem('amplitude_lastEventTime', 2000);
      localStorage.setItem('amplitude_sessionId', 3000);
      localStorage.setItem('amplitude_unsent', '{"eventId":1}');

      amplitude.options.apiKey = apiKey;
      amplitude._upgradeStoredData();

      assert.equal(amplitude.getLocalStorage("LAST_EVENT_ID"), "1000");
      assert.equal(amplitude.getLocalStorage("LAST_EVENT_TIME"), "2000");
      assert.equal(amplitude.getLocalStorage("SESSION_ID"), "3000");
      assert.equal(amplitude.getLocalStorage("UNSENT_EVENTS"), '{"eventId":1}');

      assert.equal(localStorage.getItem('amplitude_lastEventId', undefined));
      assert.equal(localStorage.getItem('amplitude_lastEventTime', undefined));
      assert.equal(localStorage.getItem('amplitude_sessionId', undefined));
      assert.equal(localStorage.getItem('amplitude_unsent', undefined));
    });

    it('should set options correctly', function () {
      var now = new Date().getTime();

      Cookie.set('amplitude_id', {
        deviceId: "DEVICE_ID",
        userId: "USER_ID",
        globalUserProperties: props,
        optOut: true
      });

      localStorage.setItem('amplitude_lastEventId', now + 1);
      localStorage.setItem('amplitude_lastEventTime', now + 2);
      localStorage.setItem('amplitude_sessionId', now + 3);
      localStorage.setItem('amplitude_unsent', '{"eventId":1}');

      amplitude.init(apiKey);

      assert.equal(amplitude._eventId, now + 1);
      assert.equal(amplitude._lastEventTime, amplitude.getLocalStorage("LAST_EVENT_TIME"));
      assert.equal(amplitude._sessionId, now + 3);
      assert.deepEqual(amplitude._unsentEvents, {"eventId":1});

      assert.equal(amplitude.options.deviceId, "DEVICE_ID");
      assert.equal(amplitude.options.userId, "USER_ID");
      assert.deepEqual(amplitude.options.userProperties, props);
      assert.equal(amplitude.options.optOut, true);
    });

    it('should not override new options', function () {
      Cookie.set('amplitude_id', {
        deviceId: "DEVICE_ID",
        userId: "USER_ID",
        globalUserProperties: props,
        optOut: true
      });

      amplitude.init(apiKey, "NEW_USER", {
        deviceId: "NEW_DEVICE",
      });
      amplitude.setOptOut(true);

      assert.equal(amplitude.options.deviceId, "NEW_DEVICE");
      assert.equal(amplitude.options.userId, "NEW_USER");
      assert.equal(amplitude.options.optOut, true);
    });

    it('should work with domain in config', function () {

    });

    it('should work with setDomain', function () {

    });
  });
});