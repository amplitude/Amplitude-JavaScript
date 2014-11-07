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

    it('should accept properties', function() {
      amplitude.logEvent('Event Type 5', {prop: true});
      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(querystring.parse(server.requests[0].requestBody).e);
      assert.deepEqual(events[0].event_properties, {prop: true});
    });
  });
});
