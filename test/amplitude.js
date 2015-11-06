describe('Amplitude', function() {
  var Amplitude = require('../src/amplitude.js');
  var localStorage = require('../src/localstorage.js');
  var Base64 = require('../src/base64.js');
  var cookie = require('../src/cookie.js');
  var querystring = require('querystring');
  var JSON = require('json');
  var Identify = require('../src/identify.js');
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

    it ('should not run callback if invalid callback', function() {
      amplitude.init(apiKey, userId, null, 'invalid callback');
    });

    it ('should run valid callbacks', function() {
      var counter = 0;
      var callback = function() {
        counter++;
      };
      amplitude.init(apiKey, userId, null, callback);
      assert.equal(counter, 1);
    });

    it ('should migrate deviceId, userId, optOut from localStorage to cookie', function() {
      var deviceId = 'test_device_id';
      var userId = 'test_user_id';

      assert.isNull(cookie.get(amplitude.options.cookieName));
      localStorage.setItem('amplitude_deviceId' + '_' + apiKey, deviceId);
      localStorage.setItem('amplitude_userId' + '_' + apiKey, userId);
      localStorage.setItem('amplitude_optOut' + '_' + apiKey, true);

      amplitude.init(apiKey);
      assert.equal(amplitude.options.deviceId, deviceId);
      assert.equal(amplitude.options.userId, userId);
      assert.isTrue(amplitude.options.optOut);

      var cookieData = cookie.get(amplitude.options.cookieName);
      assert.equal(cookieData.deviceId, deviceId);
      assert.equal(cookieData.userId, userId);
      assert.isTrue(cookieData.optOut);

      assert.isNull(localStorage.getItem('amplitude_deviceId' + '_' + apiKey));
      assert.isNull(localStorage.getItem('amplitude_userId' + '_' + apiKey));
      assert.isNull(localStorage.getItem('amplitude_optOut' + '_' + apiKey));
    });

    it ('should migrate data from localStorage to cookie but preserve existing values', function() {
      var deviceId = 'test_device_id2';
      var userId = 'test_user_id2';

      // use amplitude1 to set cookie values
      amplitude.init(apiKey, null, {deviceId: deviceId});
      assert.equal(amplitude.options.deviceId, deviceId);
      assert.isNull(amplitude.options.userId);
      assert.isFalse(amplitude.options.optOut);

      var cookieData = cookie.get(amplitude.options.cookieName);
      assert.equal(cookieData.deviceId, deviceId);
      assert.isNull(cookieData.userId);
      assert.isFalse(cookieData.optOut);

      // set local storage values and verify that they are ignored by the init migration
      localStorage.setItem('amplitude_deviceId' + '_' + apiKey, 'bad_test_device_id');  // ignored
      localStorage.setItem('amplitude_userId' + '_' + apiKey, userId);  // since userId null, use localStorage value
      localStorage.setItem('amplitude_optOut' + '_' + apiKey, true); // ignored

      var amplitude2 = new Amplitude();
      amplitude2.init(apiKey);
      assert.equal(amplitude2.options.deviceId, deviceId);
      assert.equal(amplitude2.options.userId, userId);
      assert.isFalse(amplitude2.options.optOut);

      cookieData = cookie.get(amplitude.options.cookieName);
      assert.equal(cookieData.deviceId, deviceId);
      assert.equal(cookieData.userId, userId);
      assert.isFalse(cookieData.optOut);

      assert.isNull(localStorage.getItem('amplitude_deviceId' + '_' + apiKey));
      assert.isNull(localStorage.getItem('amplitude_userId' + '_' + apiKey));
      assert.isNull(localStorage.getItem('amplitude_optOut' + '_' + apiKey));
    });
  });

  describe('runQueuedFunctions', function() {
    beforeEach(function() {
      amplitude.init(apiKey);
    });

    afterEach(function() {
      reset();
    });

    it('should run queued functions', function() {
      assert.equal(amplitude._unsentCount(), 0);
      assert.lengthOf(server.requests, 0);
      var userId = 'testUserId'
      var eventType = 'test_event'
      var functions = [
        ['setUserId', userId],
        ['logEvent', eventType]
      ];
      amplitude._q = functions;
      assert.lengthOf(amplitude._q, 2);
      amplitude.runQueuedFunctions();

      assert.equal(amplitude.options.userId, userId);
      assert.equal(amplitude._unsentCount(), 1);
      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(querystring.parse(server.requests[0].requestBody).e);
      assert.lengthOf(events, 1);
      assert.equal(events[0].event_type, eventType);

      assert.lengthOf(amplitude._q, 0);
    });
  });

  describe('setUserProperties', function() {
    beforeEach(function() {
      amplitude.init(apiKey);
    });

    afterEach(function() {
      reset();
    });

    it('should log identify call from set user properties', function() {
      assert.equal(amplitude._unsentCount(), 0);
      amplitude.setUserProperties({'prop': true, 'key': 'value'});

      assert.lengthOf(amplitude._unsentEvents, 0);
      assert.lengthOf(amplitude._unsentIdentifys, 1);
      assert.equal(amplitude._unsentCount(), 1);
      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(querystring.parse(server.requests[0].requestBody).e);
      assert.lengthOf(events, 1);
      assert.equal(events[0].event_type, '$identify');
      assert.deepEqual(events[0].event_properties, {});

      var expected = {
        '$set': {
          'prop': true,
          'key': 'value'
        }
      };
      assert.deepEqual(events[0].user_properties, expected);
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

  describe('identify', function() {

    beforeEach(function() {
      clock = sinon.useFakeTimers();
      amplitude.init(apiKey);
    });

    afterEach(function() {
      reset();
      clock.restore();
    });

    it('should ignore inputs that are not identify objects', function() {
      amplitude.identify('This is a test');
      assert.lengthOf(amplitude._unsentIdentifys, 0);
      assert.lengthOf(server.requests, 0);

      amplitude.identify(150);
      assert.lengthOf(amplitude._unsentIdentifys, 0);
      assert.lengthOf(server.requests, 0);

      amplitude.identify(['test']);
      assert.lengthOf(amplitude._unsentIdentifys, 0);
      assert.lengthOf(server.requests, 0);

      amplitude.identify({'user_prop': true});
      assert.lengthOf(amplitude._unsentIdentifys, 0);
      assert.lengthOf(server.requests, 0);
    });

    it('should generate an event from the identify object', function() {
      var identify = new Identify().set('prop1', 'value1').unset('prop2').add('prop3', 3).setOnce('prop4', true);
      amplitude.identify(identify);

      assert.lengthOf(amplitude._unsentEvents, 0);
      assert.lengthOf(amplitude._unsentIdentifys, 1);
      assert.equal(amplitude._unsentCount(), 1);
      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(querystring.parse(server.requests[0].requestBody).e);
      assert.lengthOf(events, 1);
      assert.equal(events[0].event_type, '$identify');
      assert.deepEqual(events[0].event_properties, {});
      assert.deepEqual(events[0].user_properties, {
        '$set': {
          'prop1': 'value1'
        },
        '$unset': {
          'prop2': '-'
        },
        '$add': {
          'prop3': 3
        },
        '$setOnce': {
          'prop4': true
        }
      });
    });

    it('should ignore empty identify objects', function() {
      amplitude.identify(new Identify());
      assert.lengthOf(amplitude._unsentIdentifys, 0);
      assert.lengthOf(server.requests, 0);
    });

    it('should ignore empty proxy identify objects', function() {
      amplitude.identify({'_q': {}});
      assert.lengthOf(amplitude._unsentIdentifys, 0);
      assert.lengthOf(server.requests, 0);

      amplitude.identify({});
      assert.lengthOf(amplitude._unsentIdentifys, 0);
      assert.lengthOf(server.requests, 0);
    });

    it('should generate an event from a proxy identify object', function() {
      var proxyObject = {'_q':[
        ['setOnce', 'key2', 'value4'],
        ['unset', 'key1'],
        ['add', 'key1', 'value1'],
        ['set', 'key2', 'value3'],
        ['set', 'key4', 'value5'],
      ]};
      amplitude.identify(proxyObject);

      assert.lengthOf(amplitude._unsentEvents, 0);
      assert.lengthOf(amplitude._unsentIdentifys, 1);
      assert.equal(amplitude._unsentCount(), 1);
      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(querystring.parse(server.requests[0].requestBody).e);
      assert.lengthOf(events, 1);
      assert.equal(events[0].event_type, '$identify');
      assert.deepEqual(events[0].event_properties, {});
      assert.deepEqual(events[0].user_properties, {
        '$setOnce': {'key2': 'value4'},
        '$unset': {'key1': '-'},
        '$set': {'key4': 'value5'}
      });
    });
  });

  describe('logEvent', function() {

    var clock;

    beforeEach(function() {
      clock = sinon.useFakeTimers();
      amplitude.init(apiKey);
    });

    afterEach(function() {
      reset();
      clock.restore();
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

    it('should queue events', function() {
      amplitude._sending = true;
      amplitude.logEvent('Event', {index: 1});
      amplitude.logEvent('Event', {index: 2});
      amplitude.logEvent('Event', {index: 3});
      amplitude._sending = false;

      amplitude.logEvent('Event', {index: 100});

      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(querystring.parse(server.requests[0].requestBody).e);
      assert.lengthOf(events, 4);
      assert.deepEqual(events[0].event_properties, {index: 1});
      assert.deepEqual(events[3].event_properties, {index: 100});
    });

    it('should limit events queued', function() {
      amplitude.init(apiKey, null, {savedMaxCount: 10});

      amplitude._sending = true;
      for (var i = 0; i < 15; i++) {
        amplitude.logEvent('Event', {index: i});
      }
      amplitude._sending = false;

      amplitude.logEvent('Event', {index: 100});

      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(querystring.parse(server.requests[0].requestBody).e);
      assert.lengthOf(events, 10);
      assert.deepEqual(events[0].event_properties, {index: 6});
      assert.deepEqual(events[9].event_properties, {index: 100});
    });

    it('should remove only sent events', function() {
      amplitude._sending = true;
      amplitude.logEvent('Event', {index: 1});
      amplitude.logEvent('Event', {index: 2});
      amplitude._sending = false;
      amplitude.logEvent('Event', {index: 3});

      server.respondWith('success');
      server.respond();

      amplitude.logEvent('Event', {index: 4});

      assert.lengthOf(server.requests, 2);
      var events = JSON.parse(querystring.parse(server.requests[1].requestBody).e);
      assert.lengthOf(events, 1);
      assert.deepEqual(events[0].event_properties, {index: 4});
    });

    it('should save events', function() {
      amplitude.init(apiKey, null, {saveEvents: true});
      amplitude.logEvent('Event', {index: 1});
      amplitude.logEvent('Event', {index: 2});
      amplitude.logEvent('Event', {index: 3});

      var amplitude2 = new Amplitude();
      amplitude2.init(apiKey);
      assert.deepEqual(amplitude2._unsentEvents, amplitude._unsentEvents);
    });

    it('should not save events', function() {
      amplitude.init(apiKey, null, {saveEvents: false});
      amplitude.logEvent('Event', {index: 1});
      amplitude.logEvent('Event', {index: 2});
      amplitude.logEvent('Event', {index: 3});

      var amplitude2 = new Amplitude();
      amplitude2.init(apiKey);
      assert.deepEqual(amplitude2._unsentEvents, []);
    });

    it('should limit events sent', function() {
      amplitude.init(apiKey, null, {uploadBatchSize: 10});

      amplitude._sending = true;
      for (var i = 0; i < 15; i++) {
        amplitude.logEvent('Event', {index: i});
      }
      amplitude._sending = false;

      amplitude.logEvent('Event', {index: 100});

      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(querystring.parse(server.requests[0].requestBody).e);
      assert.lengthOf(events, 10);
      assert.deepEqual(events[0].event_properties, {index: 0});
      assert.deepEqual(events[9].event_properties, {index: 9});

      server.respondWith('success');
      server.respond();

      assert.lengthOf(server.requests, 2);
      var events = JSON.parse(querystring.parse(server.requests[1].requestBody).e);
      assert.lengthOf(events, 6);
      assert.deepEqual(events[0].event_properties, {index: 10});
      assert.deepEqual(events[5].event_properties, {index: 100});
    });

    it('should batch events sent', function() {
      var eventUploadPeriodMillis = 10*1000;
      amplitude.init(apiKey, null, {
        batchEvents: true,
        eventUploadThreshold: 10,
        eventUploadPeriodMillis: eventUploadPeriodMillis
      });

      for (var i = 0; i < 15; i++) {
        amplitude.logEvent('Event', {index: i});
      }

      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(querystring.parse(server.requests[0].requestBody).e);
      assert.lengthOf(events, 10);
      assert.deepEqual(events[0].event_properties, {index: 0});
      assert.deepEqual(events[9].event_properties, {index: 9});

      server.respondWith('success');
      server.respond();

      assert.lengthOf(server.requests, 1);
      var unsentEvents = amplitude._unsentEvents;
      assert.lengthOf(unsentEvents, 5);
      assert.deepEqual(unsentEvents[4].event_properties, {index: 14});

      // remaining 5 events should be sent by the delayed sendEvent call
      clock.tick(eventUploadPeriodMillis);
      assert.lengthOf(server.requests, 2);
      server.respondWith('success');
      server.respond();
      assert.lengthOf(amplitude._unsentEvents, 0);
      var events = JSON.parse(querystring.parse(server.requests[1].requestBody).e);
      assert.lengthOf(events, 5);
      assert.deepEqual(events[4].event_properties, {index: 14});
    });

    it('should send events after a delay', function() {
      var eventUploadPeriodMillis = 10*1000;
      amplitude.init(apiKey, null, {
        batchEvents: true,
        eventUploadThreshold: 2,
        eventUploadPeriodMillis: eventUploadPeriodMillis
      });
      amplitude.logEvent('Event');

      // saveEvent should not have been called yet
      assert.lengthOf(amplitude._unsentEvents, 1);
      assert.lengthOf(server.requests, 0);

      // saveEvent should be called after delay
      clock.tick(eventUploadPeriodMillis);
      assert.lengthOf(server.requests, 1);
      server.respondWith('success');
      server.respond();
      var events = JSON.parse(querystring.parse(server.requests[0].requestBody).e);
      assert.lengthOf(events, 1);
      assert.deepEqual(events[0].event_type, 'Event');
    });

    it('should not send events after a delay if no events to send', function() {
      var eventUploadPeriodMillis = 10*1000;
      amplitude.init(apiKey, null, {
        batchEvents: true,
        eventUploadThreshold: 2,
        eventUploadPeriodMillis: eventUploadPeriodMillis
      });
      amplitude.logEvent('Event1');
      amplitude.logEvent('Event2');

      // saveEvent triggered by 2 event batch threshold
      assert.lengthOf(amplitude._unsentEvents, 2);
      assert.lengthOf(server.requests, 1);
      server.respondWith('success');
      server.respond();
      var events = JSON.parse(querystring.parse(server.requests[0].requestBody).e);
      assert.lengthOf(events, 2);
      assert.deepEqual(events[1].event_type, 'Event2');

      // saveEvent should be called after delay, but no request made
      assert.lengthOf(amplitude._unsentEvents, 0);
      clock.tick(eventUploadPeriodMillis);
      assert.lengthOf(server.requests, 1);
    });

    it('should not schedule more than one upload', function() {
      var eventUploadPeriodMillis = 5*1000; // 5s
      amplitude.init(apiKey, null, {
        batchEvents: true,
        eventUploadThreshold: 30,
        eventUploadPeriodMillis: eventUploadPeriodMillis
      });

      // log 2 events, 1 millisecond apart, second event should not schedule upload
      amplitude.logEvent('Event1');
      clock.tick(1);
      amplitude.logEvent('Event2');
      assert.lengthOf(amplitude._unsentEvents, 2);
      assert.lengthOf(server.requests, 0);

      // advance to upload period millis, and should have 1 server request
      // from the first scheduled upload
      clock.tick(eventUploadPeriodMillis-1);
      assert.lengthOf(server.requests, 1);
      server.respondWith('success');
      server.respond();

      // log 3rd event, advance 1 more millisecond, verify no 2nd server request
      amplitude.logEvent('Event3');
      clock.tick(1);
      assert.lengthOf(server.requests, 1);

      // the 3rd event, however, should have scheduled another upload after 5s
      clock.tick(eventUploadPeriodMillis-2);
      assert.lengthOf(server.requests, 1);
      clock.tick(1);
      assert.lengthOf(server.requests, 2);
    });

    it('should back off on 413 status', function() {
      amplitude.init(apiKey, null, {uploadBatchSize: 10});

      amplitude._sending = true;
      for (var i = 0; i < 15; i++) {
        amplitude.logEvent('Event', {index: i});
      }
      amplitude._sending = false;

      amplitude.logEvent('Event', {index: 100});

      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(querystring.parse(server.requests[0].requestBody).e);
      assert.lengthOf(events, 10);
      assert.deepEqual(events[0].event_properties, {index: 0});
      assert.deepEqual(events[9].event_properties, {index: 9});

      server.respondWith([413, {}, '']);
      server.respond();

      assert.lengthOf(server.requests, 2);
      var events = JSON.parse(querystring.parse(server.requests[1].requestBody).e);
      assert.lengthOf(events, 5);
      assert.deepEqual(events[0].event_properties, {index: 0});
      assert.deepEqual(events[4].event_properties, {index: 4});
    });

    it('should back off on 413 status all the way to 1 event with drops', function() {
      amplitude.init(apiKey, null, {uploadBatchSize: 9});

      amplitude._sending = true;
      for (var i = 0; i < 10; i++) {
        amplitude.logEvent('Event', {index: i});
      }
      amplitude._sending = false;
      amplitude.logEvent('Event', {index: 100});

      for (var i = 0; i < 6; i++) {
        assert.lengthOf(server.requests, i+1);
        server.respondWith([413, {}, '']);
        server.respond();
      }

      var events = JSON.parse(querystring.parse(server.requests[6].requestBody).e);
      assert.lengthOf(events, 1);
      assert.deepEqual(events[0].event_properties, {index: 2});
    });

    it ('should run callback if no eventType', function () {
      var counter = 0;
      var value = -1;
      var message = '';
      var callback = function (status, response) {
        counter++;
        value = status;
        message = response;
      }
      amplitude.logEvent(null, null, callback);
      assert.equal(counter, 1);
      assert.equal(value, 0);
      assert.equal(message, 'No request sent');
    });

    it ('should run callback if optout', function () {
      amplitude.setOptOut(true);
      var counter = 0;
      var value = -1;
      var message = '';
      var callback = function (status, response) {
        counter++;
        value = status;
        message = response;
      };
      amplitude.logEvent('test', null, callback);
      assert.equal(counter, 1);
      assert.equal(value, 0);
      assert.equal(message, 'No request sent');
    });

    it ('should not run callback if invalid callback and no eventType', function () {
      amplitude.logEvent(null, null, 'invalid callback');
    });

    it ('should run callback after logging event', function () {
      var counter = 0;
      var value = -1;
      var message = '';
      var callback = function (status, response) {
        counter++;
        value = status;
        message = response;
      };
      amplitude.logEvent('test', null, callback);

      // before server responds, callback should not fire
      assert.lengthOf(server.requests, 1);
      assert.equal(counter, 0);
      assert.equal(value, -1);
      assert.equal(message, '');

      // after server response, fire callback
      server.respondWith('success');
      server.respond();
      assert.equal(counter, 1);
      assert.equal(value, 200);
      assert.equal(message, 'success');
    });

    it ('should run callback if batchEvents but under threshold', function () {
      var eventUploadPeriodMillis = 5*1000;
      amplitude.init(apiKey, null, {
        batchEvents: true,
        eventUploadThreshold: 2,
        eventUploadPeriodMillis: eventUploadPeriodMillis
      });
      var counter = 0;
      var value = -1;
      var message = '';
      var callback = function (status, response) {
        counter++;
        value = status;
        message = response;
      };
      amplitude.logEvent('test', null, callback);
      assert.lengthOf(server.requests, 0);
      assert.equal(counter, 1);
      assert.equal(value, 0);
      assert.equal(message, 'No request sent');

      // check that request is made after delay, but callback is not run a second time
      clock.tick(eventUploadPeriodMillis);
      assert.lengthOf(server.requests, 1);
      server.respondWith('success');
      server.respond();
      assert.equal(counter, 1);
    });

    it ('should run callback once and only after all events are uploaded', function () {
      amplitude.init(apiKey, null, {uploadBatchSize: 10});
      var counter = 0;
      var value = -1;
      var message = '';
      var callback = function (status, response) {
        counter++;
        value = status;
        message = response;
      };

      // queue up 15 events, since batchsize 10, need to send in 2 batches
      amplitude._sending = true;
      for (var i = 0; i < 15; i++) {
        amplitude.logEvent('Event', {index: i});
      }
      amplitude._sending = false;

      amplitude.logEvent('Event', {index: 100}, callback);

      assert.lengthOf(server.requests, 1);
      server.respondWith('success');
      server.respond();

      // after first response received, callback should not have fired
      assert.equal(counter, 0);
      assert.equal(value, -1);
      assert.equal(message, '');

      assert.lengthOf(server.requests, 2);
      server.respondWith('success');
      server.respond();

      // after last response received, callback should fire
      assert.equal(counter, 1);
      assert.equal(value, 200);
      assert.equal(message, 'success');
    });

    it ('should run callback once and only after 413 resolved', function () {
      var counter = 0;
      var value = -1;
      var message = '';
      var callback = function (status, response) {
        counter++;
        value = status;
        message = response;
      };

      // queue up 15 events
      amplitude._sending = true;
      for (var i = 0; i < 15; i++) {
        amplitude.logEvent('Event', {index: i});
      }
      amplitude._sending = false;

      // 16th event with 413 will backoff to batches of 8
      amplitude.logEvent('Event', {index: 100}, callback);

      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(querystring.parse(server.requests[0].requestBody).e);
      assert.lengthOf(events, 16);

      // after 413 response received, callback should not have fired
      server.respondWith([413, {}, '']);
      server.respond();
      assert.equal(counter, 0);
      assert.equal(value, -1);
      assert.equal(message, '');

      // after sending first backoff batch, callback still should not have fired
      assert.lengthOf(server.requests, 2);
      var events = JSON.parse(querystring.parse(server.requests[1].requestBody).e);
      assert.lengthOf(events, 8);
      server.respondWith('success');
      server.respond();
      assert.equal(counter, 0);
      assert.equal(value, -1);
      assert.equal(message, '');

      // after sending second backoff batch, callback should fire
      assert.lengthOf(server.requests, 3);
      var events = JSON.parse(querystring.parse(server.requests[1].requestBody).e);
      assert.lengthOf(events, 8);
      server.respondWith('success');
      server.respond();
      assert.equal(counter, 1);
      assert.equal(value, 200);
      assert.equal(message, 'success');
    });

    it ('should run callback if server returns something other than 200 and 413', function () {
      var counter = 0;
      var value = -1;
      var message = '';
      var callback = function (status, response) {
        counter++;
        value = status;
        message = response;
      };

      amplitude.logEvent('test', null, callback);
      server.respondWith([404, {}, 'Not found']);
      server.respond();
      assert.equal(counter, 1);
      assert.equal(value, 404);
      assert.equal(message, 'Not found');
    });

    it('should send 3 identify events', function() {
      amplitude.init(apiKey, null, {batchEvents: true, eventUploadThreshold: 3});
      assert.equal(amplitude._unsentCount(), 0);

      amplitude.identify(new Identify().add('photoCount', 1));
      amplitude.identify(new Identify().add('photoCount', 1).set('country', 'USA'));
      amplitude.identify(new Identify().add('photoCount', 1));

      // verify some internal counters
      assert.equal(amplitude._eventId, 0);
      assert.equal(amplitude._identifyId, 3);
      assert.equal(amplitude._unsentCount(), 3);
      assert.lengthOf(amplitude._unsentEvents, 0);
      assert.lengthOf(amplitude._unsentIdentifys, 3);

      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(querystring.parse(server.requests[0].requestBody).e);
      assert.lengthOf(events, 3);
      for (var i = 0; i < 3; i++) {
        assert.equal(events[i].event_type, '$identify');
        assert.isTrue('$add' in events[i].user_properties);
        assert.deepEqual(events[i].user_properties['$add'], {'photoCount': 1});
        assert.equal(events[i].event_id, i+1);
        assert.equal(events[i].sequence_number, i+1);
      }

      // send response and check that remove events works properly
      server.respondWith('success');
      server.respond();
      assert.equal(amplitude._unsentCount(), 0);
      assert.lengthOf(amplitude._unsentIdentifys, 0);
    });

    it('should send 3 events', function() {
      amplitude.init(apiKey, null, {batchEvents: true, eventUploadThreshold: 3});
      assert.equal(amplitude._unsentCount(), 0);

      amplitude.logEvent('test');
      amplitude.logEvent('test');
      amplitude.logEvent('test');

      // verify some internal counters
      assert.equal(amplitude._eventId, 3);
      assert.equal(amplitude._identifyId, 0);
      assert.equal(amplitude._unsentCount(), 3);
      assert.lengthOf(amplitude._unsentEvents, 3);
      assert.lengthOf(amplitude._unsentIdentifys, 0);

      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(querystring.parse(server.requests[0].requestBody).e);
      assert.lengthOf(events, 3);
      for (var i = 0; i < 3; i++) {
        assert.equal(events[i].event_type, 'test');
        assert.equal(events[i].event_id, i+1);
        assert.equal(events[i].sequence_number, i+1);
      }

      // send response and check that remove events works properly
      server.respondWith('success');
      server.respond();
      assert.equal(amplitude._unsentCount(), 0);
      assert.lengthOf(amplitude._unsentEvents, 0);
    });

    it('should send 1 event and 1 identify event', function() {
      amplitude.init(apiKey, null, {batchEvents: true, eventUploadThreshold: 2});
      assert.equal(amplitude._unsentCount(), 0);

      amplitude.logEvent('test');
      amplitude.identify(new Identify().add('photoCount', 1));

      // verify some internal counters
      assert.equal(amplitude._eventId, 1);
      assert.equal(amplitude._identifyId, 1);
      assert.equal(amplitude._unsentCount(), 2);
      assert.lengthOf(amplitude._unsentEvents, 1);
      assert.lengthOf(amplitude._unsentIdentifys, 1);

      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(querystring.parse(server.requests[0].requestBody).e);
      assert.lengthOf(events, 2);

      // event should come before identify - maintain order using sequence number
      assert.equal(events[0].event_type, 'test');
      assert.equal(events[0].event_id, 1);
      assert.deepEqual(events[0].user_properties, {});
      assert.equal(events[0].sequence_number, 1);
      assert.equal(events[1].event_type, '$identify');
      assert.equal(events[1].event_id, 1);
      assert.isTrue('$add' in events[1].user_properties);
      assert.deepEqual(events[1].user_properties['$add'], {'photoCount': 1});
      assert.equal(events[1].sequence_number, 2);

      // send response and check that remove events works properly
      server.respondWith('success');
      server.respond();
      assert.equal(amplitude._unsentCount(), 0);
      assert.lengthOf(amplitude._unsentEvents, 0);
      assert.lengthOf(amplitude._unsentIdentifys, 0);
    });

    it('should properly coalesce events and identify events into a request', function() {
      amplitude.init(apiKey, null, {batchEvents: true, eventUploadThreshold: 6});
      assert.equal(amplitude._unsentCount(), 0);

      amplitude.logEvent('test1');
      clock.tick(1);
      amplitude.identify(new Identify().add('photoCount', 1));
      clock.tick(1);
      amplitude.logEvent('test2');
      clock.tick(1);
      amplitude.logEvent('test3');
      clock.tick(1);
      amplitude.logEvent('test4');
      amplitude.identify(new Identify().add('photoCount', 2));

      // verify some internal counters
      assert.equal(amplitude._eventId, 4);
      assert.equal(amplitude._identifyId, 2);
      assert.equal(amplitude._unsentCount(), 6);
      assert.lengthOf(amplitude._unsentEvents, 4);
      assert.lengthOf(amplitude._unsentIdentifys, 2);

      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(querystring.parse(server.requests[0].requestBody).e);
      assert.lengthOf(events, 6);

      // verify the correct coalescing
      assert.equal(events[0].event_type, 'test1');
      assert.deepEqual(events[0].user_properties, {});
      assert.equal(events[0].sequence_number, 1);
      assert.equal(events[1].event_type, '$identify');
      assert.isTrue('$add' in events[1].user_properties);
      assert.deepEqual(events[1].user_properties['$add'], {'photoCount': 1});
      assert.equal(events[1].sequence_number, 2);
      assert.equal(events[2].event_type, 'test2');
      assert.deepEqual(events[2].user_properties, {});
      assert.equal(events[2].sequence_number, 3);
      assert.equal(events[3].event_type, 'test3');
      assert.deepEqual(events[3].user_properties, {});
      assert.equal(events[3].sequence_number, 4);
      assert.equal(events[4].event_type, 'test4');
      assert.deepEqual(events[4].user_properties, {});
      assert.equal(events[4].sequence_number, 5);
      assert.equal(events[5].event_type, '$identify');
      assert.isTrue('$add' in events[5].user_properties);
      assert.deepEqual(events[5].user_properties['$add'], {'photoCount': 2});
      assert.equal(events[5].sequence_number, 6);

      // send response and check that remove events works properly
      server.respondWith('success');
      server.respond();
      assert.equal(amplitude._unsentCount(), 0);
      assert.lengthOf(amplitude._unsentEvents, 0);
      assert.lengthOf(amplitude._unsentIdentifys, 0);
    });

    it('should merged events supporting backwards compatability', function() {
      // events logged before v2.5.0 won't have sequence number, should get priority
      amplitude.init(apiKey, null, {batchEvents: true, eventUploadThreshold: 3});
      assert.equal(amplitude._unsentCount(), 0);

      amplitude.identify(new Identify().add('photoCount', 1));
      amplitude.logEvent('test');
      delete amplitude._unsentEvents[0].sequence_number; // delete sequence number to simulate old event
      amplitude._sequenceNumber = 1; // reset sequence number
      amplitude.identify(new Identify().add('photoCount', 2));

      // verify some internal counters
      assert.equal(amplitude._eventId, 1);
      assert.equal(amplitude._identifyId, 2);
      assert.equal(amplitude._unsentCount(), 3);
      assert.lengthOf(amplitude._unsentEvents, 1);
      assert.lengthOf(amplitude._unsentIdentifys, 2);

      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(querystring.parse(server.requests[0].requestBody).e);
      assert.lengthOf(events, 3);

      // event should come before identify - prioritize events with no sequence number
      assert.equal(events[0].event_type, 'test');
      assert.equal(events[0].event_id, 1);
      assert.deepEqual(events[0].user_properties, {});
      assert.isFalse('sequence_number' in events[0]);

      assert.equal(events[1].event_type, '$identify');
      assert.equal(events[1].event_id, 1);
      assert.isTrue('$add' in events[1].user_properties);
      assert.deepEqual(events[1].user_properties['$add'], {'photoCount': 1});
      assert.equal(events[1].sequence_number, 1);

      assert.equal(events[2].event_type, '$identify');
      assert.equal(events[2].event_id, 2);
      assert.isTrue('$add' in events[2].user_properties);
      assert.deepEqual(events[2].user_properties['$add'], {'photoCount': 2});
      assert.equal(events[2].sequence_number, 2);

      // send response and check that remove events works properly
      server.respondWith('success');
      server.respond();
      assert.equal(amplitude._unsentCount(), 0);
      assert.lengthOf(amplitude._unsentEvents, 0);
      assert.lengthOf(amplitude._unsentIdentifys, 0);
    });

    it('should drop event and keep identify on 413 response', function() {
      amplitude.init(apiKey, null, {batchEvents: true, eventUploadThreshold: 2});
      amplitude.logEvent('test');
      clock.tick(1);
      amplitude.identify(new Identify().add('photoCount', 1));

      assert.equal(amplitude._unsentCount(), 2);
      assert.lengthOf(server.requests, 1);
      server.respondWith([413, {}, '']);
      server.respond();

      // backoff and retry
      assert.equal(amplitude.options.uploadBatchSize, 1);
      assert.equal(amplitude._unsentCount(), 2);
      assert.lengthOf(server.requests, 2);
      server.respondWith([413, {}, '']);
      server.respond();

      // after dropping massive event, only 1 event left
      assert.equal(amplitude.options.uploadBatchSize, 1);
      assert.equal(amplitude._unsentCount(), 1);
      assert.lengthOf(server.requests, 3);

      var events = JSON.parse(querystring.parse(server.requests[2].requestBody).e);
      assert.lengthOf(events, 1);
      assert.equal(events[0].event_type, '$identify');
      assert.isTrue('$add' in events[0].user_properties);
      assert.deepEqual(events[0].user_properties['$add'], {'photoCount': 1});
    });

    it('should drop identify if 413 and uploadBatchSize is 1', function() {
      amplitude.init(apiKey, null, {batchEvents: true, eventUploadThreshold: 2});
      amplitude.identify(new Identify().add('photoCount', 1));
      clock.tick(1);
      amplitude.logEvent('test');

      assert.equal(amplitude._unsentCount(), 2);
      assert.lengthOf(server.requests, 1);
      server.respondWith([413, {}, '']);
      server.respond();

      // backoff and retry
      assert.equal(amplitude.options.uploadBatchSize, 1);
      assert.equal(amplitude._unsentCount(), 2);
      assert.lengthOf(server.requests, 2);
      server.respondWith([413, {}, '']);
      server.respond();

      // after dropping massive event, only 1 event left
      assert.equal(amplitude.options.uploadBatchSize, 1);
      assert.equal(amplitude._unsentCount(), 1);
      assert.lengthOf(server.requests, 3);

      var events = JSON.parse(querystring.parse(server.requests[2].requestBody).e);
      assert.lengthOf(events, 1);
      assert.equal(events[0].event_type, 'test');
      assert.deepEqual(events[0].user_properties, {});
    });

    it('should truncate long event property strings', function() {
      var longString = new Array(2000).join('a');
      amplitude.logEvent('test', {'key': longString});
      var event = JSON.parse(querystring.parse(server.requests[0].requestBody).e)[0];

      assert.isTrue('key' in event.event_properties);
      assert.lengthOf(event.event_properties['key'], 1024);
    });

    it('should  truncate long user property strings', function() {
      var longString = new Array(2000).join('a');
      amplitude.identify(new Identify().set('key', longString));
      var event = JSON.parse(querystring.parse(server.requests[0].requestBody).e)[0];

      assert.isTrue('$set' in event.user_properties);
      assert.lengthOf(event.user_properties['$set']['key'], 1024);
    });
  });

  describe('optOut', function() {
    beforeEach(function() {
      amplitude.init(apiKey);
    });

    afterEach(function() {
      reset();
    });

    it('should not send events while enabled', function() {
      amplitude.setOptOut(true);
      amplitude.logEvent('Event Type 1');
      assert.lengthOf(server.requests, 0);
    });

    it('should not send saved events while enabled', function() {
      amplitude.logEvent('Event Type 1');
      assert.lengthOf(server.requests, 1);

      amplitude._sending = false;
      amplitude.setOptOut(true);
      amplitude.init(apiKey);
      assert.lengthOf(server.requests, 1);
    });

    it('should start sending events again when disabled', function() {
      amplitude.setOptOut(true);
      amplitude.logEvent('Event Type 1');
      assert.lengthOf(server.requests, 0);

      amplitude.setOptOut(false);
      amplitude.logEvent('Event Type 1');
      assert.lengthOf(server.requests, 1);

      var events = JSON.parse(querystring.parse(server.requests[0].requestBody).e);
      assert.lengthOf(events, 1);
    });

    it('should have state be persisted in the cookie', function() {
      var amplitude = new Amplitude();
      amplitude.init(apiKey);
      assert.strictEqual(amplitude.options.optOut, false);

      amplitude.setOptOut(true);

      var amplitude2 = new Amplitude();
      amplitude2.init(apiKey);
      assert.strictEqual(amplitude2.options.optOut, true);
    });

    it('should limit identify events queued', function() {
      amplitude.init(apiKey, null, {savedMaxCount: 10});

      amplitude._sending = true;
      for (var i = 0; i < 15; i++) {
        amplitude.identify(new Identify().add('test', i));
      }
      amplitude._sending = false;

      amplitude.identify(new Identify().add('test', 100));
      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(querystring.parse(server.requests[0].requestBody).e);
      assert.lengthOf(events, 10);
      assert.deepEqual(events[0].user_properties, {$add: {'test': 6}});
      assert.deepEqual(events[9].user_properties, {$add: {'test': 100}});
    });
  });

  describe('gatherUtm', function() {
    beforeEach(function() {
      amplitude.init(apiKey);
    });

    afterEach(function() {
      reset();
    });

    it('should not send utm data when the includeUtm flag is false', function() {
      cookie.set('__utmz', '133232535.1424926227.1.1.utmcct=top&utmccn=new');
      reset();
      amplitude.init(apiKey, undefined, {});

      amplitude.setUserProperties({user_prop: true});
      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(querystring.parse(server.requests[0].requestBody).e);
      assert.equal(events[0].user_properties.utm_campaign, undefined);
      assert.equal(events[0].user_properties.utm_content, undefined);
      assert.equal(events[0].user_properties.utm_medium, undefined);
      assert.equal(events[0].user_properties.utm_source, undefined);
      assert.equal(events[0].user_properties.utm_term, undefined);
    });

    it('should send utm data when the includeUtm flag is true', function() {
      cookie.set('__utmz', '133232535.1424926227.1.1.utmcct=top&utmccn=new');
      reset();
      amplitude.init(apiKey, undefined, {includeUtm: true});

      amplitude.logEvent('UTM Test Event', {});

      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(querystring.parse(server.requests[0].requestBody).e);
      assert.deepEqual(events[0].user_properties, {
        utm_campaign: 'new',
        utm_content: 'top'
      });
    });

    it('should add utm params to the user properties', function() {
      cookie.set('__utmz', '133232535.1424926227.1.1.utmcct=top&utmccn=new');

      var utmParams = '?utm_source=amplitude&utm_medium=email&utm_term=terms';
      amplitude._initUtmData(utmParams);

      amplitude.setUserProperties({user_prop: true});
      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(querystring.parse(server.requests[0].requestBody).e);
      // identify event should not have utm properties
      assert.deepEqual(events[0].user_properties, {
        '$set': {
          'user_prop': true
        }
      });
      server.respondWith('success');
      server.respond();

      amplitude.logEvent('UTM Test Event', {});
      assert.lengthOf(server.requests, 2);
      var events = JSON.parse(querystring.parse(server.requests[1].requestBody).e);
      assert.deepEqual(events[0].user_properties, {
        utm_campaign: 'new',
        utm_content: 'top',
        utm_medium: 'email',
        utm_source: 'amplitude',
        utm_term: 'terms'
      });
    });

    it('should get utm params from the query string', function() {
      var query = '?utm_source=amplitude&utm_medium=email&utm_term=terms' +
                  '&utm_content=top&utm_campaign=new';
      var utms = Amplitude._getUtmData('', query);
      assert.deepEqual(utms, {
        utm_campaign: 'new',
        utm_content: 'top',
        utm_medium: 'email',
        utm_source: 'amplitude',
        utm_term: 'terms'
      });
    });

    it('should get utm params from the cookie string', function() {
      var cookie = '133232535.1424926227.1.1.utmcsr=google|utmccn=(organic)' +
                   '|utmcmd=organic|utmctr=(none)|utmcct=link';
      var utms = Amplitude._getUtmData(cookie, '');
      assert.deepEqual(utms, {
        utm_campaign: '(organic)',
        utm_content: 'link',
        utm_medium: 'organic',
        utm_source: 'google',
        utm_term: '(none)'
      });
    });

    it('should prefer utm params from the query string', function() {
      var query = '?utm_source=amplitude&utm_medium=email&utm_term=terms' +
                  '&utm_content=top&utm_campaign=new';
      var cookie = '133232535.1424926227.1.1.utmcsr=google|utmccn=(organic)' +
                   '|utmcmd=organic|utmctr=(none)|utmcct=link';
      var utms = Amplitude._getUtmData(cookie, query);
      assert.deepEqual(utms, {
        utm_campaign: 'new',
        utm_content: 'top',
        utm_medium: 'email',
        utm_source: 'amplitude',
        utm_term: 'terms'
      });
    });
  });

  describe('gatherReferrer', function() {
    beforeEach(function() {
      amplitude.init(apiKey);
      sinon.stub(amplitude, '_getReferrer').returns('https://amplitude.com/contact');
    });

    afterEach(function() {
      reset();
    });

    it('should not send referrer data when the includeReferrer flag is false', function() {
      amplitude.init(apiKey, undefined, {});

      amplitude.setUserProperties({user_prop: true});
      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(querystring.parse(server.requests[0].requestBody).e);
      assert.equal(events[0].user_properties.referrer, undefined);
      assert.equal(events[0].user_properties.referring_domain, undefined);
    });

    it('should send referrer data when the includeReferrer flag is true', function() {
      reset();
      amplitude.init(apiKey, undefined, {includeReferrer: true});

      amplitude.logEvent('Referrer Test Event', {});
      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(querystring.parse(server.requests[0].requestBody).e);
      assert.deepEqual(events[0].user_properties, {
        referrer: 'https://amplitude.com/contact',
        referring_domain: 'amplitude.com'
      });
    });

    it('should add referrer data to the user properties on events only', function() {
      reset();
      amplitude.init(apiKey, undefined, {includeReferrer: true});

      amplitude.setUserProperties({user_prop: true});
      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(querystring.parse(server.requests[0].requestBody).e);
      assert.deepEqual(events[0].user_properties, {
        $set: {
          'user_prop': true
        }
      });
      server.respondWith('success');
      server.respond();

      amplitude.logEvent('Referrer test event');
      assert.lengthOf(server.requests, 2);
      var events = JSON.parse(querystring.parse(server.requests[1].requestBody).e);
      assert.deepEqual(events[0].user_properties, {
        referrer: 'https://amplitude.com/contact',
        referring_domain: 'amplitude.com'
      });
    });
  });

  describe('logRevenue', function() {
    beforeEach(function() {
      amplitude.init(apiKey);
    });

    afterEach(function() {
      reset();
    });

    /**
     * Deep compare an object against the api_properties of the
     * event queued for sending.
     */
    function revenueEqual(api, event) {
      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(querystring.parse(server.requests[0].requestBody).e);
      assert.deepEqual(events[0].api_properties, api || {});
      assert.deepEqual(events[0].event_properties, event || {});
    }

    it('should log simple amount', function() {
      amplitude.logRevenue(10.10);
      revenueEqual({
        special: 'revenue_amount',
        price: 10.10,
        quantity: 1
      })
    });

    it('should log complex amount', function() {
      amplitude.logRevenue(10.10, 7);
      revenueEqual({
        special: 'revenue_amount',
        price: 10.10,
        quantity: 7
      })
    });

    it('shouldn\'t log invalid price', function() {
      amplitude.logRevenue('kitten', 7);
      assert.lengthOf(server.requests, 0);
    });

    it('shouldn\'t log invalid quantity', function() {
      amplitude.logRevenue(10.00, 'puppy');
      assert.lengthOf(server.requests, 0);
    });

    it('should log complex amount with product id', function() {
      amplitude.logRevenue(10.10, 7, 'chicken.dinner');
      revenueEqual({
        special: 'revenue_amount',
        price: 10.10,
        quantity: 7,
        productId: 'chicken.dinner'
      });
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

  describe('truncate', function() {
    var longString = new Array(2000).join('a');

    it('should truncate long strings', function() {
      eventProperties = amplitude._truncate({'test': longString});
      assert.lengthOf(eventProperties['test'], 1024);
    });

    it('should ignore keys', function() {
      var eventProperties = {};
      eventProperties[longString] = 'test';
      eventProperties = amplitude._truncate(eventProperties);
      assert.isTrue(longString in eventProperties);
    });

    it('should handle arrays', function() {
      var eventProperties = [longString, longString];
      eventProperties = amplitude._truncate(eventProperties);
      assert.lengthOf(eventProperties, 2);
      assert.lengthOf(eventProperties[0], 1024);
      assert.lengthOf(eventProperties[1], 1024);
    });

    it('should handle nested dictionaries', function() {
      var name = {'first': 'John', 'last': longString};
      var eventProperties = amplitude._truncate({'name': name});
      assert.lengthOf(Object.keys(eventProperties), 1);
      assert.lengthOf(Object.keys(eventProperties['name']), 2);
      assert.lengthOf(eventProperties['name']['first'], 4);
      assert.lengthOf(eventProperties['name']['last'], 1024);
    });

    it('should ignore boolean and number values', function() {
      var test = {'key1': 24, 'key2': false};
      assert.deepEqual(test, amplitude._truncate(test));
    });

    it('should handle nested arrays', function() {
      var test = [longString, 'test'];
      var eventProperties = amplitude._truncate([test, test]);
      assert.lengthOf(eventProperties, 2);
      assert.lengthOf(eventProperties[0], 2);
      assert.lengthOf(eventProperties[1], 2);
      assert.lengthOf(eventProperties[0][0], 1024);
      assert.lengthOf(eventProperties[0][1], 4);
      assert.lengthOf(eventProperties[1][0], 1024);
      assert.lengthOf(eventProperties[1][1], 4);
    });

    it('should handle arrays nested inside dictionaries', function() {
      var test = [longString, 'test'];
      var eventProperties = amplitude._truncate({'name': test});
      assert.lengthOf(Object.keys(eventProperties), 1);
      assert.lengthOf(eventProperties['name'], 2);
      assert.lengthOf(eventProperties['name'][0], 1024);
      assert.lengthOf(eventProperties['name'][1], 4);
    });
  });
});
