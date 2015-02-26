describe('Amplitude', function() {
  var Amplitude = require('../src/amplitude.js');
  var localStorage = require('../src/localstorage.js');
  var Base64 = require('../src/base64.js');
  var cookie = require('../src/cookie.js');
  var querystring = require('querystring');
  var JSON = require('json');
  var apiKey = '000000';
  var userId = 'user';
  var amplitude;
  var server;

  beforeEach(function() {
    amplitude = new Amplitude();
    server = sinon.fakeServer.create();
  });

  afterEach(function() {
    server.restore();
  });

  it('amplitude object should exist', function() {
    assert.isObject(amplitude);
  });

  function reset() {
    localStorage.clear();
    cookie.remove(amplitude.options.cookieName);
    cookie.reset();
  }

  describe('init', function() {
    beforeEach(function() {
    });

    afterEach(function() {
      reset();
    });

    it('should accept userId', function() {
      amplitude.init(apiKey, userId);
      assert.equal(amplitude.options.userId, userId);
    });

    it('should set cookie', function() {
      amplitude.init(apiKey, userId);
      var stored = cookie.get(amplitude.options.cookieName);
      assert.property(stored, 'deviceId');
      assert.propertyVal(stored, 'userId', userId);
      assert.lengthOf(stored.deviceId, 36);
    });

    it('should set language', function() {
       amplitude.init(apiKey, userId);
       assert.property(amplitude.options, 'language');
       assert.isNotNull(amplitude.options.language);
    });

    it('should allow language override', function() {
      amplitude.init(apiKey, userId, {language: 'en-GB'});
      assert.propertyVal(amplitude.options, 'language', 'en-GB');
    });
  });

  describe('setUserProperties', function() {
    beforeEach(function() {
      amplitude.init(apiKey);
    });

    afterEach(function() {
      reset();
    });

    it('should set user properties', function() {
      amplitude.setUserProperties({'prop': true});
      assert.propertyVal(amplitude.options.userProperties, 'prop', true);
    });

    it('should merge user properties by default', function() {
      amplitude.setUserProperties({'prop': true, 'prop2': true});
      assert.propertyVal(amplitude.options.userProperties, 'prop', true);

      amplitude.setUserProperties({'prop': false, 'prop3': false});
      assert.propertyVal(amplitude.options.userProperties, 'prop', false);
      assert.propertyVal(amplitude.options.userProperties, 'prop2', true);
      assert.propertyVal(amplitude.options.userProperties, 'prop3', false);
    });

    it('should allow overwriting user properties', function() {
      amplitude.setUserProperties({'prop': true, 'prop2': true});
      assert.propertyVal(amplitude.options.userProperties, 'prop', true);

      amplitude.setUserProperties({'prop': false, 'prop3': false}, true);
      assert.notProperty(amplitude.options.userProperties, 'prop2');
      assert.propertyVal(amplitude.options.userProperties, 'prop', false);
      assert.propertyVal(amplitude.options.userProperties, 'prop3', false);
    });
  });

  describe('setDeviceId', function() {

    afterEach(function() {
      reset();
    });

    it('should change device id', function() {
      amplitude.setDeviceId('deviceId');
      amplitude.init(apiKey);
      assert.equal(amplitude.options.deviceId, 'deviceId');
    });

    it('should not change device id if empty', function() {
      amplitude.setDeviceId('');
      amplitude.init(apiKey);
      assert.notEqual(amplitude.options.deviceId, '');
    });

    it('should not change device id if null', function() {
      amplitude.setDeviceId(null);
      amplitude.init(apiKey);
      assert.notEqual(amplitude.options.deviceId, null);
    });

    it('should store device id in cookie', function() {
      amplitude.setDeviceId('deviceId');
      var stored = cookie.get(amplitude.options.cookieName);
      assert.propertyVal(stored, 'deviceId', 'deviceId');
    });
  });

  describe('logEvent', function() {

    beforeEach(function() {
      amplitude.init(apiKey);
    });

    afterEach(function() {
      reset();
    });

    it('should send request', function() {
      amplitude.logEvent('Event Type 1');
      assert.lengthOf(server.requests, 1);
      assert.equal(server.requests[0].url, 'http://api.amplitude.com/');
      assert.equal(server.requests[0].method, 'POST');
      assert.equal(server.requests[0].async, true);
    });

    it('should reject empty event types', function() {
      amplitude.logEvent();
      assert.lengthOf(server.requests, 0);
    });

    it('should send api key', function() {
      amplitude.logEvent('Event Type 2');
      assert.lengthOf(server.requests, 1);
      assert.equal(querystring.parse(server.requests[0].requestBody).client, apiKey);
    });

    it('should send api version', function() {
      amplitude.logEvent('Event Type 3');
      assert.lengthOf(server.requests, 1);
      assert.equal(querystring.parse(server.requests[0].requestBody).v, '2');
    });

    it('should send event JSON', function() {
      amplitude.logEvent('Event Type 4');
      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(querystring.parse(server.requests[0].requestBody).e);
      assert.equal(events.length, 1);
      assert.equal(events[0].event_type, 'Event Type 4');
    });

    it('should send language', function() {
      amplitude.logEvent('Event Should Send Language');
      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(querystring.parse(server.requests[0].requestBody).e);
      assert.equal(events.length, 1);
      assert.isNotNull(events[0].language);
    });

    it('should accept properties', function() {
      amplitude.logEvent('Event Type 5', {prop: true});
      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(querystring.parse(server.requests[0].requestBody).e);
      assert.deepEqual(events[0].event_properties, {prop: true});
    });

    it('should send browser and host os properties', function() {
      var agent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/537.36 " +
                  "(KHTML, like Gecko) Chrome/40.0.2214.115 Safari/537.36";
      amplitude._ua = detect.parse(agent);

      amplitude.logEvent('Browser Data Event', {prop: true});
      assert.lengthOf(server.requests, 1);

      var events = JSON.parse(querystring.parse(server.requests[0].requestBody).e);
      assert.equal(events[0].browser_name, "Chrome");
      assert.equal(events[0].browser_version, "40");
      assert.equal(events[0].host_os_name, "Mac");
      assert.equal(events[0].host_os_version, "10.10.2");
    });
  });

  describe('sessionId', function() {

    var clock;

    beforeEach(function() {
      clock = sinon.useFakeTimers();
      amplitude.init(apiKey);
    });

    afterEach(function() {
      reset();
      clock.restore();
    });

    it('should create new session IDs on timeout', function() {
      var sessionId = amplitude._sessionId;
      clock.tick(30 * 60 * 1000 + 1);
      amplitude.logEvent('Event Type 1');
      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(querystring.parse(server.requests[0].requestBody).e);
      assert.equal(events.length, 1);
      assert.notEqual(events[0].session_id, sessionId);
      assert.notEqual(amplitude._sessionId, sessionId);
      assert.equal(events[0].session_id, amplitude._sessionId);
    });
  });
});
