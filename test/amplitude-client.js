import AmplitudeClient from '../src/amplitude-client.js';
import getUtmData from '../src/utm.js';
import localStorage from '../src/localstorage.js';
import CookieStorage from '../src/cookiestorage.js';
import Base64 from '../src/base64.js';
import cookie from '../src/cookie.js';
import utils from '../src/utils.js';
import queryString from 'query-string';
import Identify from '../src/identify.js';
import Revenue from '../src/revenue.js';
import constants from '../src/constants.js';

// maintain for testing backwards compatability
describe('AmplitudeClient', function() {
  var apiKey = '000000';
  var keySuffix = '_' + apiKey.slice(0,6);
  var userId = 'user';
  var amplitude;
  var server;

  beforeEach(function() {
    amplitude = new AmplitudeClient();
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
    sessionStorage.clear();
    cookie.remove(amplitude.options.cookieName);
    cookie.remove(amplitude.options.cookieName + keySuffix);
    cookie.remove(amplitude.options.cookieName + '_new_app');
    cookie.reset();
  }

  describe('init', function() {
    beforeEach(function() {
      reset();
    });

    afterEach(function() {
      reset();
    });

    it('should make instanceName case-insensitive', function() {
      assert.equal(new AmplitudeClient('APP3')._instanceName, 'app3');
      assert.equal(new AmplitudeClient('$DEFAULT_INSTANCE')._instanceName, '$default_instance');
    });

    it('fails on invalid apiKeys', function() {
      amplitude.init(null);
      assert.equal(amplitude.options.apiKey, undefined);
      assert.equal(amplitude.options.deviceId, undefined);

      amplitude.init('');
      assert.equal(amplitude.options.apiKey, undefined);
      assert.equal(amplitude.options.deviceId, undefined);

      amplitude.init(apiKey);
      assert.equal(amplitude.options.apiKey, apiKey);
      assert.lengthOf(amplitude.options.deviceId, 37);
    });

    it('should accept userId', function() {
      amplitude.init(apiKey, userId);
      assert.equal(amplitude.options.userId, userId);
    });

    it('should accept numerical userIds', function() {
      const userId = 5;
      amplitude.init(apiKey, 5);
      assert.equal(amplitude.options.userId, '5');
    });

    it('should generate a random deviceId', function() {
      amplitude.init(apiKey, userId);
      assert.lengthOf(amplitude.options.deviceId, 37); // UUID is length 36, but we append 'R' at end
      assert.equal(amplitude.options.deviceId[36], 'R');
    });

    it('should validate config values', function() {
      var config = {
          apiEndpoint: 100,  // invalid type
          batchEvents: 'True',  // invalid type
          cookieExpiration: -1,   // negative number
          cookieName: '',  // empty string
          eventUploadPeriodMillis: '30', // 30s
          eventUploadThreshold: 0,   // zero value
          bogusKey: false
      };

      amplitude.init(apiKey, userId, config);
      assert.equal(amplitude.options.apiEndpoint, 'api.amplitude.com');
      assert.equal(amplitude.options.batchEvents, false);
      assert.equal(amplitude.options.cookieExpiration, 3650);
      assert.equal(amplitude.options.cookieName, 'amplitude_id');
      assert.equal(amplitude.options.eventUploadPeriodMillis, 30000);
      assert.equal(amplitude.options.eventUploadThreshold, 30);
      assert.equal(amplitude.options.bogusKey, undefined);
    });

    it('should set the default log level', function() {
      const config = {};

      amplitude.init(apiKey, userId, config);
      assert.equal(utils.getLogLevel(), 2);
    });

    it('should set log levels', function() {
      const config = {
          logLevel: 'INFO',
      };

      amplitude.init(apiKey, userId, config);
      assert.equal(utils.getLogLevel(), 3);
    });

    it('should set cookie', function() {
      amplitude.init(apiKey, userId);
      var stored = cookie.get(amplitude.options.cookieName + '_' + apiKey);
      assert.property(stored, 'deviceId');
      assert.propertyVal(stored, 'userId', userId);
      assert.lengthOf(stored.deviceId, 37); // increase deviceId length by 1 for 'R' character
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

    it ('should load the device id from url params if configured', function() {
      var deviceId = 'aa_bb_cc_dd';
      sinon.stub(amplitude, '_getUrlParams').returns('?utm_source=amplitude&utm_medium=email&gclid=12345&amp_device_id=aa_bb_cc_dd');
      amplitude.init(apiKey, userId, {deviceIdFromUrlParam: true});
      assert.equal(amplitude.options.deviceId, deviceId);

      var cookieData = cookie.get(amplitude.options.cookieName + '_' + apiKey);
      assert.equal(cookieData.deviceId, deviceId);

      amplitude._getUrlParams.restore();
    });

    it ('should not load device id from url params if not configured', function() {
      var deviceId = 'aa_bb_cc_dd';
      sinon.stub(amplitude, '_getUrlParams').returns('?utm_source=amplitude&utm_medium=email&gclid=12345&amp_device_id=aa_bb_cc_dd');
      amplitude.init(apiKey, userId, {deviceIdFromUrlParam: false});
      assert.notEqual(amplitude.options.deviceId, deviceId);

      var cookieData = cookie.get(amplitude.options.cookieName + '_' + apiKey);
      assert.notEqual(cookieData.deviceId, deviceId);

      amplitude._getUrlParams.restore();
    });

    it ('should prefer the device id in the config over the url params', function() {
      var deviceId = 'dd_cc_bb_aa';
      sinon.stub(amplitude, '_getUrlParams').returns('?utm_source=amplitude&utm_medium=email&gclid=12345&amp_device_id=aa_bb_cc_dd');
      amplitude.init(apiKey, userId, {deviceId: deviceId, deviceIdFromUrlParam: true});
      assert.equal(amplitude.options.deviceId, deviceId);

      var cookieData = cookie.get(amplitude.options.cookieName + '_' + apiKey);
      assert.equal(cookieData.deviceId, deviceId);

      amplitude._getUrlParams.restore();
    });

    it ('should migrate deviceId, userId, optOut from localStorage to cookie on default instance', function() {
      var deviceId = 'test_device_id';
      var userId = 'test_user_id';

      assert.isNull(cookie.get(amplitude.options.cookieName));
      localStorage.setItem('amplitude_deviceId' + keySuffix, deviceId);
      localStorage.setItem('amplitude_userId' + keySuffix, userId);
      localStorage.setItem('amplitude_optOut' + keySuffix, true);

      amplitude.init(apiKey);
      assert.equal(amplitude.options.deviceId, deviceId);
      assert.equal(amplitude.options.userId, userId);
      assert.isTrue(amplitude.options.optOut);

      var cookieData = cookie.get(amplitude.options.cookieName + '_' + apiKey);
      assert.equal(cookieData.deviceId, deviceId);
      assert.equal(cookieData.userId, userId);
      assert.isTrue(cookieData.optOut);
    });

    it('should not migrate any cookie or LS data for non-default instances', function() {
      var deviceId = 'testDeviceId';
      var userId = 'test_user_id';

      assert.isNull(cookie.get(amplitude.options.cookieName));
      localStorage.setItem('amplitude_deviceId' + keySuffix, deviceId);
      localStorage.setItem('amplitude_userId' + keySuffix, userId);
      localStorage.setItem('amplitude_optOut' + keySuffix, true);

      var amplitude2 = new AmplitudeClient('new_app');
      amplitude2.init(apiKey);
      assert.notEqual(amplitude2.options.deviceId, deviceId);
      assert.isNull(amplitude2.options.userId);
      assert.isFalse(amplitude2.options.optOut);

      var cookieData = cookie.get(amplitude.options.cookieName + '_' + apiKey + '_new_app');
      assert.equal(cookieData.deviceId, amplitude2.options.deviceId);
      assert.isNull(cookieData.userId);
      assert.isFalse(cookieData.optOut);
    });

    it('should migrate session and event info from localStorage to cookie', function() {
      var now = new Date().getTime();

      assert.isNull(cookie.get(amplitude.options.cookieName));
      localStorage.setItem('amplitude_sessionId', now);
      localStorage.setItem('amplitude_lastEventTime', now);
      localStorage.setItem('amplitude_lastEventId', 3000);
      localStorage.setItem('amplitude_lastIdentifyId', 4000);
      localStorage.setItem('amplitude_lastSequenceNumber', 5000);

      amplitude.init(apiKey);

      assert.equal(amplitude._sessionId, now);
      assert.isTrue(amplitude._lastEventTime >= now);
      assert.equal(amplitude._eventId, 3000);
      assert.equal(amplitude._identifyId, 4000);
      assert.equal(amplitude._sequenceNumber, 5000);

      var cookieData = cookie.get(amplitude.options.cookieName + '_' + apiKey);
      assert.equal(cookieData.sessionId, now);
      assert.equal(cookieData.lastEventTime, amplitude._lastEventTime);
      assert.equal(cookieData.eventId, 3000);
      assert.equal(cookieData.identifyId, 4000);
      assert.equal(cookieData.sequenceNumber, 5000);
    });

    it('should load device id from the cookie', function(){
      var now = new Date().getTime();

      // deviceId and sequenceNumber not set, init should load value from localStorage
      var cookieData = {
        deviceId: 'current_device_id',
      }

      cookie.set(amplitude.options.cookieName + '_' + apiKey, cookieData);

      amplitude.init(apiKey);
      assert.equal(amplitude.options.deviceId, 'current_device_id');
    });

    it('should migrate device id from old non name spaced cookie name (pre 4.10)', function(){
      var now = new Date().getTime();

      var cookieData = {
        deviceId: 'old_device_id',
        optOut: false,
        sessionId: now,
        lastEventTime: now,
        eventId: 50,
        identifyId: 60
      }

      cookie.set(amplitude.options.cookieName, cookieData);

      amplitude.init(apiKey);
      assert.equal(amplitude.options.deviceId, 'old_device_id');
    });

    it('should migrate cookie data from old cookie name and ignore local storage values', function(){
      var now = new Date().getTime();

      var cookieData = {
        userId: 'test_user_id',
        optOut: false,
        sessionId: now,
        lastEventTime: now,
        eventId: 50,
        identifyId: 60
      }

      cookie.set(amplitude.options.cookieName, cookieData);
      localStorage.setItem('amplitude_deviceId' + keySuffix, 'old_device_id');
      localStorage.setItem('amplitude_userId' + keySuffix, 'fake_user_id');
      localStorage.setItem('amplitude_optOut' + keySuffix, true);
      localStorage.setItem('amplitude_sessionId', now-1000);
      localStorage.setItem('amplitude_lastEventTime', now-1000);
      localStorage.setItem('amplitude_lastEventId', 20);
      localStorage.setItem('amplitude_lastIdentifyId', 30);
      localStorage.setItem('amplitude_lastSequenceNumber', 40);

      amplitude.init(apiKey);
      assert.equal(amplitude.options.deviceId, 'old_device_id');
      assert.equal(amplitude.options.userId, 'test_user_id');
      assert.isFalse(amplitude.options.optOut);
      assert.equal(amplitude._sessionId, now);
      assert.isTrue(amplitude._lastEventTime >= now);
      assert.equal(amplitude._eventId, 50);
      assert.equal(amplitude._identifyId, 60);
      assert.equal(amplitude._sequenceNumber, 40);
    });

    it('should skip the migration if the new cookie already has deviceId, sessionId, lastEventTime', function() {
      var now = new Date().getTime();

      cookie.set(amplitude.options.cookieName, {
        deviceId: 'new_device_id',
        sessionId: now,
        lastEventTime: now
      });

      localStorage.setItem('amplitude_deviceId' + keySuffix, 'fake_device_id');
      localStorage.setItem('amplitude_userId' + keySuffix, 'fake_user_id');
      localStorage.setItem('amplitude_optOut' + keySuffix, true);
      localStorage.setItem('amplitude_sessionId', now-1000);
      localStorage.setItem('amplitude_lastEventTime', now-1000);
      localStorage.setItem('amplitude_lastEventId', 20);
      localStorage.setItem('amplitude_lastIdentifyId', 30);
      localStorage.setItem('amplitude_lastSequenceNumber', 40);

      amplitude.init(apiKey, 'new_user_id');
      assert.equal(amplitude.options.deviceId, 'new_device_id');
      assert.equal(amplitude.options.userId, 'new_user_id');
      assert.isFalse(amplitude.options.optOut);
      assert.isTrue(amplitude._sessionId >= now);
      assert.isTrue(amplitude._lastEventTime >= now);
      assert.equal(amplitude._eventId, 0);
      assert.equal(amplitude._identifyId, 0);
      assert.equal(amplitude._sequenceNumber, 0);
    });

    it('should save cookie data to localStorage if cookies are not enabled', function() {
      var cookieStorageKey = 'amp_cookiestore_amplitude_id_' + apiKey;
      var deviceId = 'test_device_id';
      var clock = sinon.useFakeTimers();
      clock.tick(1000);

      localStorage.clear();
      sinon.stub(CookieStorage.prototype, '_cookiesEnabled').returns(false);
      var amplitude2 = new AmplitudeClient();
      CookieStorage.prototype._cookiesEnabled.restore();
      amplitude2.init(apiKey, userId, {'deviceId': deviceId});
      clock.restore();

      var cookieData = JSON.parse(localStorage.getItem(cookieStorageKey));
      assert.deepEqual(cookieData, {
        'deviceId': deviceId,
        'userId': userId,
        'optOut': false,
        'sessionId': 1000,
        'lastEventTime': 1000,
        'eventId': 0,
        'identifyId': 0,
        'sequenceNumber': 0
      });

      assert.isNull(cookie.get(amplitude2.options.cookieName)); // assert did not write to cookies
    });

    it('should load sessionId, eventId from cookie and ignore the one in localStorage', function() {
      var sessionIdKey = 'amplitude_sessionId';
      var lastEventTimeKey = 'amplitude_lastEventTime';
      var eventIdKey = 'amplitude_lastEventId';
      var identifyIdKey = 'amplitude_lastIdentifyId';
      var sequenceNumberKey = 'amplitude_lastSequenceNumber';
      var amplitude2 = new AmplitudeClient();

      var clock = sinon.useFakeTimers();
      clock.tick(1000);
      var sessionId = new Date().getTime();

      // the following values in localStorage will all be ignored
      localStorage.clear();
      localStorage.setItem(sessionIdKey, 3);
      localStorage.setItem(lastEventTimeKey, 4);
      localStorage.setItem(eventIdKey, 5);
      localStorage.setItem(identifyIdKey, 6);
      localStorage.setItem(sequenceNumberKey, 7);

      var cookieData = {
        deviceId: 'test_device_id',
        userId: 'test_user_id',
        optOut: true,
        sessionId: sessionId,
        lastEventTime: sessionId,
        eventId: 50,
        identifyId: 60,
        sequenceNumber: 70
      }
      cookie.set(amplitude2.options.cookieName, cookieData);

      clock.tick(10);
      amplitude2.init(apiKey);
      clock.restore();

      assert.equal(amplitude2._sessionId, sessionId);
      assert.equal(amplitude2._lastEventTime, sessionId + 10);
      assert.equal(amplitude2._eventId, 50);
      assert.equal(amplitude2._identifyId, 60);
      assert.equal(amplitude2._sequenceNumber, 70);
    });

    it('should load sessionId from localStorage if not in cookie', function() {
      var sessionIdKey = 'amplitude_sessionId';
      var lastEventTimeKey = 'amplitude_lastEventTime';
      var eventIdKey = 'amplitude_lastEventId';
      var identifyIdKey = 'amplitude_lastIdentifyId';
      var sequenceNumberKey = 'amplitude_lastSequenceNumber';
      var amplitude2 = new AmplitudeClient();

      var cookieData = {
        deviceId: 'test_device_id',
        userId: userId,
        optOut: true
      }
      cookie.set(amplitude2.options.cookieName, cookieData);

      var clock = sinon.useFakeTimers();
      clock.tick(1000);
      var sessionId = new Date().getTime();

      localStorage.clear();
      localStorage.setItem(sessionIdKey, sessionId);
      localStorage.setItem(lastEventTimeKey, sessionId);
      localStorage.setItem(eventIdKey, 50);
      localStorage.setItem(identifyIdKey, 60);
      localStorage.setItem(sequenceNumberKey, 70);

      clock.tick(10);
      amplitude2.init(apiKey, userId);
      clock.restore();

      assert.equal(amplitude2._sessionId, sessionId);
      assert.equal(amplitude2._lastEventTime, sessionId + 10);
      assert.equal(amplitude2._eventId, 50);
      assert.equal(amplitude2._identifyId, 60);
      assert.equal(amplitude2._sequenceNumber, 70);
    });

    it('should load saved events from localStorage for default instance', function() {
      var existingEvent = '[{"device_id":"test_device_id","user_id":"test_user_id","timestamp":1453769146589,' +
        '"event_id":49,"session_id":1453763315544,"event_type":"clicked","version_name":"Web","platform":"Web"' +
        ',"os_name":"Chrome","os_version":"47","device_model":"Mac","language":"en-US","api_properties":{},' +
        '"event_properties":{},"user_properties":{},"uuid":"3c508faa-a5c9-45fa-9da7-9f4f3b992fb0","library"' +
        ':{"name":"amplitude-js","version":"2.9.0"},"sequence_number":130,"groups":{}}]';
      var existingIdentify = '[{"device_id":"test_device_id","user_id":"test_user_id","timestamp":1453769338995,' +
        '"event_id":82,"session_id":1453763315544,"event_type":"$identify","version_name":"Web","platform":"Web"' +
        ',"os_name":"Chrome","os_version":"47","device_model":"Mac","language":"en-US","api_properties":{},' +
        '"event_properties":{},"user_properties":{"$set":{"age":30,"city":"San Francisco, CA"}},"uuid":"' +
        'c50e1be4-7976-436a-aa25-d9ee38951082","library":{"name":"amplitude-js","version":"2.9.0"},"sequence_number"' +
        ':131,"groups":{}}]';
      localStorage.setItem('amplitude_unsent', existingEvent);
      localStorage.setItem('amplitude_unsent_identify', existingIdentify);

      var amplitude2 = new AmplitudeClient('$default_Instance');
      amplitude2.init(apiKey, null, {batchEvents: true});

      // check event loaded into memory
      assert.deepEqual(amplitude2._unsentEvents, JSON.parse(existingEvent));
      assert.deepEqual(amplitude2._unsentIdentifys, JSON.parse(existingIdentify));

      // check local storage keys are still same for default instance
      assert.equal(localStorage.getItem('amplitude_unsent_' + apiKey), existingEvent);
      assert.equal(localStorage.getItem('amplitude_unsent_identify_' + apiKey), existingIdentify);
    });

    it('should load saved events for non-default instances', function() {
      var existingEvent = '[{"device_id":"test_device_id","user_id":"test_user_id","timestamp":1453769146589,' +
        '"event_id":49,"session_id":1453763315544,"event_type":"clicked","version_name":"Web","platform":"Web"' +
        ',"os_name":"Chrome","os_version":"47","device_model":"Mac","language":"en-US","api_properties":{},' +
        '"event_properties":{},"user_properties":{},"uuid":"3c508faa-a5c9-45fa-9da7-9f4f3b992fb0","library"' +
        ':{"name":"amplitude-js","version":"2.9.0"},"sequence_number":130,"groups":{}}]';
      var existingIdentify = '[{"device_id":"test_device_id","user_id":"test_user_id","timestamp":1453769338995,' +
        '"event_id":82,"session_id":1453763315544,"event_type":"$identify","version_name":"Web","platform":"Web"' +
        ',"os_name":"Chrome","os_version":"47","device_model":"Mac","language":"en-US","api_properties":{},' +
        '"event_properties":{},"user_properties":{"$set":{"age":30,"city":"San Francisco, CA"}},"uuid":"' +
        'c50e1be4-7976-436a-aa25-d9ee38951082","library":{"name":"amplitude-js","version":"2.9.0"},"sequence_number"' +
        ':131,"groups":{}}]';
      localStorage.setItem('amplitude_unsent_new_app', existingEvent);
      localStorage.setItem('amplitude_unsent_identify_new_app', existingIdentify);
      assert.isNull(localStorage.getItem('amplitude_unsent'));
      assert.isNull(localStorage.getItem('amplitude_unsent_identify'));

      var amplitude2 = new AmplitudeClient('new_app');
      amplitude2.init(apiKey, null, {batchEvents: true});

      // check event loaded into memory
      assert.deepEqual(amplitude2._unsentEvents, JSON.parse(existingEvent));
      assert.deepEqual(amplitude2._unsentIdentifys, JSON.parse(existingIdentify));

      // check local storage keys are still same
      assert.equal(localStorage.getItem('amplitude_unsent_' + apiKey +'_new_app'), existingEvent);
      assert.equal(localStorage.getItem('amplitude_unsent_identify_' + apiKey + '_new_app'), existingIdentify);
    });

    it('should validate event properties when loading saved events from localStorage', function() {
      var existingEvents = '[{"device_id":"15a82aaa-0d9e-4083-a32d-2352191877e6","user_id":"15a82aaa-0d9e-4083-a32d' +
        '-2352191877e6","timestamp":1455744744413,"event_id":2,"session_id":1455744733865,"event_type":"clicked",' +
        '"version_name":"Web","platform":"Web","os_name":"Chrome","os_version":"48","device_model":"Mac","language"' +
        ':"en-US","api_properties":{},"event_properties":"{}","user_properties":{},"uuid":"1b8859d9-e91e-403e-92d4-' +
        'c600dfb83432","library":{"name":"amplitude-js","version":"2.9.0"},"sequence_number":4},{"device_id":"15a82a' +
        'aa-0d9e-4083-a32d-2352191877e6","user_id":"15a82aaa-0d9e-4083-a32d-2352191877e6","timestamp":1455744746295,' +
        '"event_id":3,"session_id":1455744733865,"event_type":"clicked","version_name":"Web","platform":"Web",' +
        '"os_name":"Chrome","os_version":"48","device_model":"Mac","language":"en-US","api_properties":{},' +
        '"event_properties":{"10":"false","bool":true,"null":null,"string":"test","array":' +
        '[0,1,2,"3"],"nested_array":["a",{"key":"value"},["b"]],"object":{"key":"value"},"nested_object":' +
        '{"k":"v","l":[0,1],"o":{"k2":"v2","l2":["e2",{"k3":"v3"}]}}},"user_properties":{},"uuid":"650407a1-d705-' +
        '47a0-8918-b4530ce51f89","library":{"name":"amplitude-js","version":"2.9.0"},"sequence_number":5}]'
      localStorage.setItem('amplitude_unsent', existingEvents);

      var amplitude2 = new AmplitudeClient('$default_instance');
      amplitude2.init(apiKey, null, {batchEvents: true});

      var expected = {
        '10': 'false',
        'bool': true,
        'string': 'test',
        'array': [0, 1, 2, '3'],
        'nested_array': ['a'],
        'object': {'key':'value'},
        'nested_object': {'k':'v', 'l':[0,1], 'o':{'k2':'v2', 'l2': ['e2']}}
      }

      // check that event loaded into memory
      assert.deepEqual(amplitude2._unsentEvents[0].event_properties, {});
      assert.deepEqual(amplitude2._unsentEvents[1].event_properties, expected);
    });

    it('should validate user properties when loading saved identifys from localStorage', function() {
      var existingEvents = '[{"device_id":"15a82a' +
        'aa-0d9e-4083-a32d-2352191877e6","user_id":"15a82aaa-0d9e-4083-a32d-2352191877e6","timestamp":1455744746295,' +
        '"event_id":3,"session_id":1455744733865,"event_type":"$identify","version_name":"Web","platform":"Web",' +
        '"os_name":"Chrome","os_version":"48","device_model":"Mac","language":"en-US","api_properties":{},' +
        '"user_properties":{"$set":{"10":"false","bool":true,"null":null,"string":"test","array":' +
        '[0,1,2,"3"],"nested_array":["a",{"key":"value"},["b"]],"object":{"key":"value"},"nested_object":' +
        '{"k":"v","l":[0,1],"o":{"k2":"v2","l2":["e2",{"k3":"v3"}]}}}},"event_properties":{},"uuid":"650407a1-d705-' +
        '47a0-8918-b4530ce51f89","library":{"name":"amplitude-js","version":"2.9.0"},"sequence_number":5}]'
      localStorage.setItem('amplitude_unsent_identify', existingEvents);

      var amplitude2 = new AmplitudeClient();
      amplitude2.init(apiKey, null, {batchEvents: true});

      var expected = {
        '10': 'false',
        'bool': true,
        'string': 'test',
        'array': [0, 1, 2, '3'],
        'nested_array': ['a'],
        'object': {'key':'value'},
        'nested_object': {'k':'v', 'l':[0,1], 'o':{'k2':'v2', 'l2': ['e2']}}
      }

      // check that event loaded into memory
      assert.deepEqual(amplitude2._unsentIdentifys[0].user_properties, {'$set': expected});
    });

    it ('should load saved events from localStorage and send events for default instance', function() {
      var existingEvent = '[{"device_id":"test_device_id","user_id":"test_user_id","timestamp":1453769146589,' +
        '"event_id":49,"session_id":1453763315544,"event_type":"clicked","version_name":"Web","platform":"Web"' +
        ',"os_name":"Chrome","os_version":"47","device_model":"Mac","language":"en-US","api_properties":{},' +
        '"event_properties":{},"user_properties":{},"uuid":"3c508faa-a5c9-45fa-9da7-9f4f3b992fb0","library"' +
        ':{"name":"amplitude-js","version":"2.9.0"},"sequence_number":130}]';
      var existingIdentify = '[{"device_id":"test_device_id","user_id":"test_user_id","timestamp":1453769338995,' +
        '"event_id":82,"session_id":1453763315544,"event_type":"$identify","version_name":"Web","platform":"Web"' +
        ',"os_name":"Chrome","os_version":"47","device_model":"Mac","language":"en-US","api_properties":{},' +
        '"event_properties":{},"user_properties":{"$set":{"age":30,"city":"San Francisco, CA"}},"uuid":"' +
        'c50e1be4-7976-436a-aa25-d9ee38951082","library":{"name":"amplitude-js","version":"2.9.0"},"sequence_number"' +
        ':131}]';
      localStorage.setItem('amplitude_unsent', existingEvent);
      localStorage.setItem('amplitude_unsent_identify', existingIdentify);

      var amplitude2 = new AmplitudeClient();
      amplitude2.init(apiKey, null, {batchEvents: true, eventUploadThreshold: 2});
      server.respondWith('success');
      server.respond();

      // check event loaded into memory
      assert.deepEqual(amplitude2._unsentEvents, []);
      assert.deepEqual(amplitude2._unsentIdentifys, []);

      // check local storage keys are still same
      assert.equal(localStorage.getItem('amplitude_unsent_' + apiKey), JSON.stringify([]));
      assert.equal(localStorage.getItem('amplitude_unsent_identify_' + apiKey), JSON.stringify([]));

      // check request
      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
      assert.lengthOf(events, 2);
      assert.equal(events[0].event_id, 49);
      assert.equal(events[1].event_type, '$identify');
    });

it ('should load saved events from localStorage new keys and send events', function() {
      var existingEvent = '[{"device_id":"test_device_id","user_id":"test_user_id","timestamp":1453769146589,' +
        '"event_id":49,"session_id":1453763315544,"event_type":"clicked","version_name":"Web","platform":"Web"' +
        ',"os_name":"Chrome","os_version":"47","device_model":"Mac","language":"en-US","api_properties":{},' +
        '"event_properties":{},"user_properties":{},"uuid":"3c508faa-a5c9-45fa-9da7-9f4f3b992fb0","library"' +
        ':{"name":"amplitude-js","version":"2.9.0"},"sequence_number":130}]';
      var existingIdentify = '[{"device_id":"test_device_id","user_id":"test_user_id","timestamp":1453769338995,' +
        '"event_id":82,"session_id":1453763315544,"event_type":"$identify","version_name":"Web","platform":"Web"' +
        ',"os_name":"Chrome","os_version":"47","device_model":"Mac","language":"en-US","api_properties":{},' +
        '"event_properties":{},"user_properties":{"$set":{"age":30,"city":"San Francisco, CA"}},"uuid":"' +
        'c50e1be4-7976-436a-aa25-d9ee38951082","library":{"name":"amplitude-js","version":"2.9.0"},"sequence_number"' +
        ':131}]';
      localStorage.setItem('amplitude_unsent_new_app', existingEvent);
      localStorage.setItem('amplitude_unsent_identify_new_app', existingIdentify);

      var amplitude2 = new AmplitudeClient('new_app');
      amplitude2.init(apiKey, null, {batchEvents: true, eventUploadThreshold: 2});
      server.respondWith('success');
      server.respond();

      // check event loaded into memory
      assert.deepEqual(amplitude2._unsentEvents, []);
      assert.deepEqual(amplitude2._unsentIdentifys, []);

      // check local storage keys are still same
      assert.equal(localStorage.getItem('amplitude_unsent_' + apiKey + '_new_app'), JSON.stringify([]));
      assert.equal(localStorage.getItem('amplitude_unsent_identify_' + apiKey + '_new_app'), JSON.stringify([]));

      // check request
      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
      assert.lengthOf(events, 2);
      assert.equal(events[0].event_id, 49);
      assert.equal(events[1].event_type, '$identify');
    });

    it('should validate event properties when loading saved events from localStorage', function() {
      var existingEvents = '[{"device_id":"15a82aaa-0d9e-4083-a32d-2352191877e6","user_id":"15a82aaa-0d9e-4083-a32d' +
          '-2352191877e6","timestamp":1455744744413,"event_id":2,"session_id":1455744733865,"event_type":"clicked",' +
          '"version_name":"Web","platform":"Web","os_name":"Chrome","os_version":"48","device_model":"Mac","language"' +
          ':"en-US","api_properties":{},"event_properties":"{}","user_properties":{},"uuid":"1b8859d9-e91e-403e-92d4-' +
          'c600dfb83432","library":{"name":"amplitude-js","version":"2.9.0"},"sequence_number":4},{"device_id":"15a82a' +
          'aa-0d9e-4083-a32d-2352191877e6","user_id":"15a82aaa-0d9e-4083-a32d-2352191877e6","timestamp":1455744746295,' +
          '"event_id":3,"session_id":1455744733865,"event_type":"clicked","version_name":"Web","platform":"Web",' +
          '"os_name":"Chrome","os_version":"48","device_model":"Mac","language":"en-US","api_properties":{},' +
          '"event_properties":{"10":"false","bool":true,"null":null,"string":"test","array":' +
          '[0,1,2,"3"],"nested_array":["a",{"key":"value"},["b"]],"object":{"key":"value"},"nested_object":' +
          '{"k":"v","l":[0,1],"o":{"k2":"v2","l2":["e2",{"k3":"v3"}]}}},"user_properties":{},"uuid":"650407a1-d705-' +
          '47a0-8918-b4530ce51f89","library":{"name":"amplitude-js","version":"2.9.0"},"sequence_number":5}]';
      localStorage.setItem('amplitude_unsent', existingEvents);

      var amplitude2 = new AmplitudeClient();
      amplitude2.init(apiKey, null, {
        batchEvents: true
      });

      var expected = {
        '10': 'false',
        'bool': true,
        'string': 'test',
        'array': [0, 1, 2, '3'],
        'nested_array': ['a'],
        'object': {
          'key': 'value'
        },
        'nested_object': {
          'k': 'v',
          'l': [0, 1],
          'o': {
              'k2': 'v2',
              'l2': ['e2']
          }
        }
      }

      // check that event loaded into memory
      assert.deepEqual(amplitude2._unsentEvents[0].event_properties, {});
      assert.deepEqual(amplitude2._unsentEvents[1].event_properties, expected);
    });

    it('should not load saved events from another instances\'s localStorage', function() {
      var existingEvent = '[{"device_id":"test_device_id","user_id":"test_user_id","timestamp":1453769146589,' +
        '"event_id":49,"session_id":1453763315544,"event_type":"clicked","version_name":"Web","platform":"Web"' +
        ',"os_name":"Chrome","os_version":"47","device_model":"Mac","language":"en-US","api_properties":{},' +
        '"event_properties":{},"user_properties":{},"uuid":"3c508faa-a5c9-45fa-9da7-9f4f3b992fb0","library"' +
        ':{"name":"amplitude-js","version":"2.9.0"},"sequence_number":130}]';
      var existingIdentify = '[{"device_id":"test_device_id","user_id":"test_user_id","timestamp":1453769338995,' +
        '"event_id":82,"session_id":1453763315544,"event_type":"$identify","version_name":"Web","platform":"Web"' +
        ',"os_name":"Chrome","os_version":"47","device_model":"Mac","language":"en-US","api_properties":{},' +
        '"event_properties":{},"user_properties":{"$set":{"age":30,"city":"San Francisco, CA"}},"uuid":"' +
        'c50e1be4-7976-436a-aa25-d9ee38951082","library":{"name":"amplitude-js","version":"2.9.0"},"sequence_number"' +
        ':131}]';
      localStorage.setItem('amplitude_unsent_' + apiKey, existingEvent);
      localStorage.setItem('amplitude_unsent_identify_' + apiKey, existingIdentify);
      assert.isNull(localStorage.getItem('amplitude_unsent_' + apiKey + '_new_app'));
      assert.isNull(localStorage.getItem('amplitude_unsent_identify_' + apiKey + '_new_app'));

      var amplitude2 = new AmplitudeClient('new_app');
      amplitude2.init(apiKey, null, {batchEvents: true, eventUploadThreshold: 2});

      // check events not loaded into memory
      assert.deepEqual(amplitude2._unsentEvents, []);
      assert.deepEqual(amplitude2._unsentIdentifys, []);

      // check local storage
      assert.equal(localStorage.getItem('amplitude_unsent_' + apiKey), existingEvent);
      assert.equal(localStorage.getItem('amplitude_unsent_identify_' + apiKey), existingIdentify);
      assert.equal(localStorage.getItem('amplitude_unsent_' + apiKey + '_new_app'), '[]');
      assert.equal(localStorage.getItem('amplitude_unsent_identify_' + apiKey + '_new_app'), '[]');

      // check request
      assert.lengthOf(server.requests, 0);
    });

    it('should merge tracking options during parseConfig', function() {
      var trackingOptions = {
        city: false,
        ip_address: false,
        language: false,
        region: true,
      };

      var amplitude2 = new AmplitudeClient('new_app');
      amplitude2.init(apiKey, null, {trackingOptions: trackingOptions});

      // check config loaded correctly
      assert.deepEqual(amplitude2.options.trackingOptions, {
        city: false,
        country: true,
        device_model: true,
        dma: true,
        ip_address: false,
        language: false,
        os_name: true,
        os_version: true,
        platform: true,
        region: true,
        version_name: true
      });
    });

    it('should pregenerate tracking options for api properties', function() {
      var trackingOptions = {
        city: false,
        ip_address: false,
        language: false,
        region: true,
      };

      var amplitude2 = new AmplitudeClient('new_app');
      amplitude2.init(apiKey, null, {trackingOptions: trackingOptions});

      assert.deepEqual(amplitude2._apiPropertiesTrackingOptions, {tracking_options: {
        city: false,
        ip_address: false
      }});
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
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
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
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
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

  describe('clearUserProperties', function() {
    beforeEach(function() {
      amplitude.init(apiKey);
    });

    afterEach(function() {
      reset();
    });

    it('should log identify call from clear user properties', function() {
      assert.equal(amplitude._unsentCount(), 0);
      amplitude.clearUserProperties();

      assert.lengthOf(amplitude._unsentEvents, 0);
      assert.lengthOf(amplitude._unsentIdentifys, 1);
      assert.equal(amplitude._unsentCount(), 1);
      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
      assert.lengthOf(events, 1);
      assert.equal(events[0].event_type, '$identify');
      assert.deepEqual(events[0].event_properties, {});

      var expected = {
        '$clearAll': '-'
      };
      assert.deepEqual(events[0].user_properties, expected);
    });
  });

  describe('setGroup', function() {
    beforeEach(function() {
      reset();
      amplitude.init(apiKey);
    });

    afterEach(function() {
      reset();
    });

    it('should generate an identify event with groups set', function() {
      amplitude.setGroup('orgId', 15);
      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
      assert.lengthOf(events, 1);

      // verify identify event
      var identify = events[0];
      assert.equal(identify.event_type, '$identify');
      assert.deepEqual(identify.user_properties, {
        '$set': {'orgId': 15},
      });
      assert.deepEqual(identify.event_properties, {});
      assert.deepEqual(identify.groups, {
        'orgId': '15',
      });
    });

    it('should ignore empty string groupTypes', function() {
      amplitude.setGroup('', 15);
      assert.lengthOf(server.requests, 0);
    });

    it('should ignore non-string groupTypes', function() {
      amplitude.setGroup(10, 10);
      amplitude.setGroup([], 15);
      amplitude.setGroup({}, 20);
      amplitude.setGroup(true, false);
      assert.lengthOf(server.requests, 0);
    });
  });


describe('setVersionName', function() {
    beforeEach(function() {
      reset();
    });

    afterEach(function() {
      reset();
    });

    it('should set version name', function() {
      amplitude.init(apiKey, null, {batchEvents: true});
      amplitude.setVersionName('testVersionName1');
      amplitude.logEvent('testEvent1');
      assert.equal(amplitude._unsentEvents[0].version_name, 'testVersionName1');

      // should ignore non-string values
      amplitude.setVersionName(15000);
      amplitude.logEvent('testEvent2');
      assert.equal(amplitude._unsentEvents[1].version_name, 'testVersionName1');
    });
  });

  describe('regenerateDeviceId', function() {
    beforeEach(function() {
      reset();
    });

    afterEach(function() {
      reset();
    });

    it('should regenerate the deviceId', function() {
      var deviceId = 'oldDeviceId';
      amplitude.init(apiKey, null, {'deviceId': deviceId});
      amplitude.regenerateDeviceId();
      assert.notEqual(amplitude.options.deviceId, deviceId);
      assert.lengthOf(amplitude.options.deviceId, 37);
      assert.equal(amplitude.options.deviceId[36], 'R');
    });
  });

  describe('setDeviceId', function() {

    beforeEach(function() {
      reset();
    });

    afterEach(function() {
      reset();
    });

    it('should change device id', function() {
      amplitude.init(apiKey, null, {'deviceId': 'fakeDeviceId'});
      amplitude.setDeviceId('deviceId');
      assert.equal(amplitude.options.deviceId, 'deviceId');
    });

    it('should not change device id if empty', function() {
      amplitude.init(apiKey, null, {'deviceId': 'deviceId'});
      amplitude.setDeviceId('');
      assert.notEqual(amplitude.options.deviceId, '');
      assert.equal(amplitude.options.deviceId, 'deviceId');
    });

    it('should not change device id if null', function() {
      amplitude.init(apiKey, null, {'deviceId': 'deviceId'});
      amplitude.setDeviceId(null);
      assert.notEqual(amplitude.options.deviceId, null);
      assert.equal(amplitude.options.deviceId, 'deviceId');
    });

    it('should store device id in cookie', function() {
      amplitude.init(apiKey, null, {'deviceId': 'fakeDeviceId'});
      amplitude.setDeviceId('deviceId');
      var stored = cookie.get(amplitude.options.cookieName + '_' + apiKey);
      assert.propertyVal(stored, 'deviceId', 'deviceId');
    });
  });

  describe('resetSessionId', function() {
    let clock;

    beforeEach(function() {
      clock = sinon.useFakeTimers();
    });

    afterEach(function() {
      reset();
      clock.restore();
    });

    it('should reset the session Id', function() {
      clock.tick(10);
      amplitude.init(apiKey);

      clock.tick(100);
      amplitude.resetSessionId();

      clock.tick(200);

      assert.equal(amplitude._sessionId, 110);
    });
  });

  describe('identify', function() {
    let clock;

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
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
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
        ['prepend', 'key5', 'value6']
      ]};
      amplitude.identify(proxyObject);

      assert.lengthOf(amplitude._unsentEvents, 0);
      assert.lengthOf(amplitude._unsentIdentifys, 1);
      assert.equal(amplitude._unsentCount(), 1);
      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
      assert.lengthOf(events, 1);
      assert.equal(events[0].event_type, '$identify');
      assert.deepEqual(events[0].event_properties, {});
      assert.deepEqual(events[0].user_properties, {
        '$setOnce': {'key2': 'value4'},
        '$unset': {'key1': '-'},
        '$set': {'key4': 'value5'},
        '$prepend': {'key5': 'value6'}
      });
    });

    it('should run the callback after making the identify call', function() {
      var counter = 0;
      var value = -1;
      var message = '';
      var callback = function (status, response) {
        counter++;
        value = status;
        message = response;
      }
      var identify = new amplitude.Identify().set('key', 'value');
      amplitude.identify(identify, callback);

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

    it('should run the callback even if client not initialized with apiKey', function() {
      var counter = 0;
      var value = -1;
      var message = '';
      var callback = function (status, response) {
        counter++;
        value = status;
        message = response;
      }
      var identify = new amplitude.Identify().set('key', 'value');
      new AmplitudeClient().identify(identify, callback);

      // verify callback fired
      assert.equal(counter, 1);
      assert.equal(value, 0);
      assert.equal(message, 'No request sent');
    });

    it('should run the callback even with an invalid identify object', function() {
      var counter = 0;
      var value = -1;
      var message = '';
      var callback = function (status, response) {
        counter++;
        value = status;
        message = response;
      }
      amplitude.identify(null, callback);

      // verify callback fired
      assert.equal(counter, 1);
      assert.equal(value, 0);
      assert.equal(message, 'No request sent');
    });
  });

  describe('groupIdentify', function() {
    let clock;
    let group_type;
    let group_name;

    beforeEach(function() {
      clock = sinon.useFakeTimers();
      group_type = 'test group type';
      group_name = 'test group name';
      amplitude.init(apiKey);
    });

    afterEach(function() {
      reset();
      clock.restore();
    });

    it('should ignore inputs that are not identify objects', function() {
      amplitude.groupIdentify(group_type, group_name, 'This is a test');
      assert.lengthOf(amplitude._unsentIdentifys, 0);
      assert.lengthOf(server.requests, 0);

      amplitude.groupIdentify(group_type, group_name, 150);
      assert.lengthOf(amplitude._unsentIdentifys, 0);
      assert.lengthOf(server.requests, 0);

      amplitude.groupIdentify(group_type, group_name, ['test']);
      assert.lengthOf(amplitude._unsentIdentifys, 0);
      assert.lengthOf(server.requests, 0);

      amplitude.groupIdentify(group_type, group_name, {'user_prop': true});
      assert.lengthOf(amplitude._unsentIdentifys, 0);
      assert.lengthOf(server.requests, 0);
    });

    it('should generate an event from the identify object', function() {
      var identify = new Identify().set('prop1', 'value1').unset('prop2').add('prop3', 3).setOnce('prop4', true);
      amplitude.groupIdentify(group_type, group_name, identify);

      assert.lengthOf(amplitude._unsentEvents, 0);
      assert.lengthOf(amplitude._unsentIdentifys, 1);
      assert.equal(amplitude._unsentCount(), 1);
      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
      assert.lengthOf(events, 1);
      assert.equal(events[0].event_type, '$groupidentify');
      assert.deepEqual(events[0].event_properties, {});
      assert.deepEqual(events[0].user_properties, {});
      assert.deepEqual(events[0].group_properties, {
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
      assert.deepEqual(events[0].groups, {'test group type': 'test group name'});
    });

    it('should ignore empty identify objects', function() {
      amplitude.groupIdentify(group_type, group_name, new Identify());
      assert.lengthOf(amplitude._unsentIdentifys, 0);
      assert.lengthOf(server.requests, 0);
    });

    it('should ignore empty proxy identify objects', function() {
      amplitude.groupIdentify(group_type, group_name, {'_q': {}});
      assert.lengthOf(amplitude._unsentIdentifys, 0);
      assert.lengthOf(server.requests, 0);

      amplitude.groupIdentify(group_type, group_name, {});
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
        ['prepend', 'key5', 'value6']
      ]};
      amplitude.groupIdentify(group_type, group_name, proxyObject);

      assert.lengthOf(amplitude._unsentEvents, 0);
      assert.lengthOf(amplitude._unsentIdentifys, 1);
      assert.equal(amplitude._unsentCount(), 1);
      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
      assert.lengthOf(events, 1);
      assert.equal(events[0].event_type, '$groupidentify');
      assert.deepEqual(events[0].event_properties, {});
      assert.deepEqual(events[0].user_properties, {});
      assert.deepEqual(events[0].group_properties, {
        '$setOnce': {'key2': 'value4'},
        '$unset': {'key1': '-'},
        '$set': {'key4': 'value5'},
        '$prepend': {'key5': 'value6'}
      });
      assert.deepEqual(events[0].groups, {'test group type': 'test group name'});
    });

    it('should run the callback after making the identify call', function() {
      var counter = 0;
      var value = -1;
      var message = '';
      var callback = function (status, response) {
        counter++;
        value = status;
        message = response;
      }
      var identify = new amplitude.Identify().set('key', 'value');
      amplitude.groupIdentify(group_type, group_name, identify, callback);

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

    it('should run the callback even if client not initialized with apiKey', function() {
      var counter = 0;
      var value = -1;
      var message = '';
      var callback = function (status, response) {
        counter++;
        value = status;
        message = response;
      }
      var identify = new amplitude.Identify().set('key', 'value');
      new AmplitudeClient().groupIdentify(group_type, group_name, identify, callback);

      // verify callback fired
      assert.equal(counter, 1);
      assert.equal(value, 0);
      assert.equal(message, 'No request sent');
    });

    it('should run the callback even with an invalid identify object', function() {
      var counter = 0;
      var value = -1;
      var message = '';
      var callback = function (status, response) {
        counter++;
        value = status;
        message = response;
      }
      amplitude.groupIdentify(group_type, group_name, null, callback);

      // verify callback fired
      assert.equal(counter, 1);
      assert.equal(value, 0);
      assert.equal(message, 'No request sent');
    });
  });

  describe('logEvent with tracking options', function() {

    var clock;

    beforeEach(function() {
      clock = sinon.useFakeTimers();
      var trackingOptions = {
        city: false,
        country: true,
        ip_address: false,
        language: false,
        platform: false,
        region: true
      };
      amplitude.init(apiKey, null, {trackingOptions: trackingOptions});
    });

    afterEach(function() {
      reset();
      clock.restore();
    });

    it('should not track language or platform', function() {
      assert.equal(amplitude.options.trackingOptions.language, false);
      assert.equal(amplitude.options.trackingOptions.platform, false);
      amplitude.logEvent('Event Type 1');
      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
      assert.equal(events[0].language, null);
      assert.equal(events[0].platform, null);
    });

    it('should send trackingOptions in api properties', function() {
      amplitude.logEvent('Event Type 2');
      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);

      // verify country is not sent since it matches the default value of true
      assert.deepEqual(events[0].api_properties, {
        tracking_options: {
          city: false,
          ip_address: false,
        }
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
      amplitude.options.forceHttps = false;
      amplitude.logEvent('Event Type 1');
      assert.lengthOf(server.requests, 1);
      assert.equal(server.requests[0].url, 'http://api.amplitude.com/');
      assert.equal(server.requests[0].method, 'POST');
      assert.equal(server.requests[0].async, true);
    });

    it('should send https request', function() {
      amplitude.options.forceHttps = true;
      amplitude.logEvent('Event Type 1');
      assert.lengthOf(server.requests, 1);
      assert.equal(server.requests[0].url, 'https://api.amplitude.com/');
      assert.equal(server.requests[0].method, 'POST');
      assert.equal(server.requests[0].async, true);
    });

    it('should send https request by configuration', function() {
      amplitude.init(apiKey, null, { forceHttps: true });
      amplitude.logEvent('Event Type 1');
      assert.lengthOf(server.requests, 1);
      assert.equal(server.requests[0].url, 'https://api.amplitude.com/');
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
      assert.equal(queryString.parse(server.requests[0].requestBody).client, apiKey);
    });

    it('should send api version', function() {
      amplitude.logEvent('Event Type 3');
      assert.lengthOf(server.requests, 1);
      assert.equal(queryString.parse(server.requests[0].requestBody).v, '2');
    });

    it('should send event JSON', function() {
      amplitude.logEvent('Event Type 4');
      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
      assert.equal(events.length, 1);
      assert.equal(events[0].event_type, 'Event Type 4');
    });

    it('should send language', function() {
      amplitude.logEvent('Event Should Send Language');
      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
      assert.equal(events.length, 1);
      assert.isNotNull(events[0].language);
    });

    it('should not send trackingOptions in api properties', function() {
      amplitude.logEvent('Event Should Not Send Tracking Properties');
      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
      assert.equal(events.length, 1);
      assert.deepEqual(events[0].api_properties, {});
    });

    it('should send platform', function() {
      amplitude.logEvent('Event Should Send Platform');
      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
      assert.equal(events.length, 1);
      assert.equal(events[0].platform, 'Web');
    });

    it('should accept properties', function() {
      amplitude.logEvent('Event Type 5', {prop: true});
      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
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
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
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
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
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
      var events = JSON.parse(queryString.parse(server.requests[1].requestBody).e);
      assert.lengthOf(events, 1);
      assert.deepEqual(events[0].event_properties, {index: 4});
    });

    it('should save events', function() {
      amplitude.init(apiKey, null, {saveEvents: true});
      amplitude.logEvent('Event', {index: 1});
      amplitude.logEvent('Event', {index: 2});
      amplitude.logEvent('Event', {index: 3});

      var amplitude2 = new AmplitudeClient();
      amplitude2.init(apiKey);
      assert.deepEqual(amplitude2._unsentEvents, amplitude._unsentEvents);
    });

    it('should not save events', function() {
      amplitude.init(apiKey, null, {saveEvents: false});
      amplitude.logEvent('Event', {index: 1});
      amplitude.logEvent('Event', {index: 2});
      amplitude.logEvent('Event', {index: 3});

      var amplitude2 = new AmplitudeClient();
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
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
      assert.lengthOf(events, 10);
      assert.deepEqual(events[0].event_properties, {index: 0});
      assert.deepEqual(events[9].event_properties, {index: 9});

      server.respondWith('success');
      server.respond();

      assert.lengthOf(server.requests, 2);
      var events = JSON.parse(queryString.parse(server.requests[1].requestBody).e);
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
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
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
      var events = JSON.parse(queryString.parse(server.requests[1].requestBody).e);
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
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
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
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
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
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
      assert.lengthOf(events, 10);
      assert.deepEqual(events[0].event_properties, {index: 0});
      assert.deepEqual(events[9].event_properties, {index: 9});

      server.respondWith([413, {}, '']);
      server.respond();

      assert.lengthOf(server.requests, 2);
      var events = JSON.parse(queryString.parse(server.requests[1].requestBody).e);
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

      var events = JSON.parse(queryString.parse(server.requests[6].requestBody).e);
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
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
      assert.lengthOf(events, 16);

      // after 413 response received, callback should not have fired
      server.respondWith([413, {}, '']);
      server.respond();
      assert.equal(counter, 0);
      assert.equal(value, -1);
      assert.equal(message, '');

      // after sending first backoff batch, callback still should not have fired
      assert.lengthOf(server.requests, 2);
      var events = JSON.parse(queryString.parse(server.requests[1].requestBody).e);
      assert.lengthOf(events, 8);
      server.respondWith('success');
      server.respond();
      assert.equal(counter, 0);
      assert.equal(value, -1);
      assert.equal(message, '');

      // after sending second backoff batch, callback should fire
      assert.lengthOf(server.requests, 3);
      var events = JSON.parse(queryString.parse(server.requests[1].requestBody).e);
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
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
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
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
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
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
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
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
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
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
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

      var events = JSON.parse(queryString.parse(server.requests[2].requestBody).e);
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

      var events = JSON.parse(queryString.parse(server.requests[2].requestBody).e);
      assert.lengthOf(events, 1);
      assert.equal(events[0].event_type, 'test');
      assert.deepEqual(events[0].user_properties, {});
    });

    it('should truncate long event property strings', function() {
      var longString = new Array(5000).join('a');
      amplitude.logEvent('test', {'key': longString});
      var event = JSON.parse(queryString.parse(server.requests[0].requestBody).e)[0];

      assert.isTrue('key' in event.event_properties);
      assert.lengthOf(event.event_properties['key'], 4096);
    });

    it('should truncate long user property strings', function() {
      var longString = new Array(5000).join('a');
      amplitude.identify(new Identify().set('key', longString));
      var event = JSON.parse(queryString.parse(server.requests[0].requestBody).e)[0];

      assert.isTrue('$set' in event.user_properties);
      assert.lengthOf(event.user_properties['$set']['key'], 4096);
    });

    it('should increment the counters in local storage if cookies disabled', function() {
      localStorage.clear();
      var deviceId = 'test_device_id';
      var amplitude2 = new AmplitudeClient();

      sinon.stub(CookieStorage.prototype, '_cookiesEnabled').returns(false);
      amplitude2.init(apiKey, null, {deviceId: deviceId, batchEvents: true, eventUploadThreshold: 5});
      CookieStorage.prototype._cookiesEnabled.restore();

      amplitude2.logEvent('test');
      clock.tick(10); // starts the session
      amplitude2.logEvent('test2');
      clock.tick(20);
      amplitude2.setUserProperties({'key':'value'}); // identify event at time 30

      var cookieData = JSON.parse(localStorage.getItem('amp_cookiestore_amplitude_id_' + apiKey));
      assert.deepEqual(cookieData, {
        'deviceId': deviceId,
        'userId': null,
        'optOut': false,
        'sessionId': 10,
        'lastEventTime': 30,
        'eventId': 2,
        'identifyId': 1,
        'sequenceNumber': 3
      });
    });

    it('should validate event properties', function() {
      var e = new Error('oops');
      clock.tick(1);
      amplitude.init(apiKey, null, {batchEvents: true, eventUploadThreshold: 5});
      clock.tick(1);
      amplitude.logEvent('String event properties', '{}');
      clock.tick(1);
      amplitude.logEvent('Bool event properties', true);
      clock.tick(1);
      amplitude.logEvent('Number event properties', 15);
      clock.tick(1);
      amplitude.logEvent('Array event properties', [1, 2, 3]);
      clock.tick(1);
      amplitude.logEvent('Object event properties', {
        10: 'false', // coerce key
        'bool': true,
        'null': null, // should be ignored
        'function': console.log, // should be ignored
        'regex': /afdg/, // should be ignored
        'error': e, // coerce value
        'string': 'test',
        'array': [0, 1, 2, '3'],
        'nested_array': ['a', {'key': 'value'}, ['b']],
        'object': {'key':'value', 15: e},
        'nested_object': {'k':'v', 'l':[0,1], 'o':{'k2':'v2', 'l2': ['e2', {'k3': 'v3'}]}}
      });
      clock.tick(1);

      assert.lengthOf(amplitude._unsentEvents, 5);
      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
      assert.lengthOf(events, 5);

      assert.deepEqual(events[0].event_properties, {});
      assert.deepEqual(events[1].event_properties, {});
      assert.deepEqual(events[2].event_properties, {});
      assert.deepEqual(events[3].event_properties, {});
      assert.deepEqual(events[4].event_properties, {
        '10': 'false',
        'bool': true,
        'error': 'Error: oops',
        'string': 'test',
        'array': [0, 1, 2, '3'],
        'nested_array': ['a'],
        'object': {'key':'value', '15':'Error: oops'},
        'nested_object': {'k':'v', 'l':[0,1], 'o':{'k2':'v2', 'l2': ['e2']}}
      });
    });

    it('should validate user properties', function() {
      var identify = new Identify().set(10, 10);
      amplitude.init(apiKey, null, {batchEvents: true});
      amplitude.identify(identify);

      assert.deepEqual(amplitude._unsentIdentifys[0].user_properties, {'$set': {'10': 10}});
    });

    it('should ignore event and user properties with too many items', function() {
      amplitude.init(apiKey, null, {batchEvents: true, eventUploadThreshold: 2});
      var eventProperties = {};
      var userProperties = {};
      var identify = new Identify();
      for (var i = 0; i < constants.MAX_PROPERTY_KEYS + 1; i++) {
        eventProperties[i] = i;
        userProperties[i*2] = i*2;
        identify.set(i, i);
      }

      // verify that setUserProperties ignores the dict completely
      amplitude.setUserProperties(userProperties);
      assert.lengthOf(amplitude._unsentIdentifys, 0);
      assert.lengthOf(server.requests, 0);

      // verify that the event properties and user properties are scrubbed
      amplitude.logEvent('test event', eventProperties);
      amplitude.identify(identify);

      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
      assert.lengthOf(events, 2);

      assert.equal(events[0].event_type, 'test event');
      assert.deepEqual(events[0].event_properties, {});
      assert.deepEqual(events[0].user_properties, {});
      assert.equal(events[1].event_type, '$identify');
      assert.deepEqual(events[1].event_properties, {});
      assert.deepEqual(events[1].user_properties, {'$set': {}});
    });

    it('should synchronize event data across multiple amplitude instances that share the same cookie', function() {
      // this test fails if logEvent does not reload cookie data every time
      var amplitude1 = new AmplitudeClient();
      amplitude1.init(apiKey, null, {batchEvents: true, eventUploadThreshold: 5});
      var amplitude2 = new AmplitudeClient();
      amplitude2.init(apiKey, null, {batchEvents: true, eventUploadThreshold: 5});

      amplitude1.logEvent('test1');
      amplitude2.logEvent('test2');
      amplitude1.logEvent('test3');
      amplitude2.logEvent('test4');
      amplitude2.identify(new amplitude2.Identify().set('key', 'value'));
      amplitude1.logEvent('test5');

      // the event ids should all be sequential since amplitude1 and amplitude2 have synchronized cookies
      var eventId = amplitude1._unsentEvents[0]['event_id'];
      assert.equal(amplitude2._unsentEvents[0]['event_id'], eventId + 1);
      assert.equal(amplitude1._unsentEvents[1]['event_id'], eventId + 2);
      assert.equal(amplitude2._unsentEvents[1]['event_id'], eventId + 3);

      var sequenceNumber = amplitude1._unsentEvents[0]['sequence_number'];
      assert.equal(amplitude2._unsentIdentifys[0]['sequence_number'], sequenceNumber + 4);
      assert.equal(amplitude1._unsentEvents[2]['sequence_number'], sequenceNumber +  5);
    });

    it('should handle groups input', function() {
      var counter = 0;
      var value = -1;
      var message = '';
      var callback = function (status, response) {
        counter++;
        value = status;
        message = response;
      };

      var eventProperties = {
        'key': 'value'
      };

      var groups = {
        10: 1.23,  // coerce numbers to strings
        'array': ['test2', false, ['test', 23, null], null],  // should ignore nested array and nulls
        'dictionary': {160: 'test3'},  // should ignore dictionaries
        'null': null, // ignore null values
      }

      amplitude.logEventWithGroups('Test', eventProperties, groups, callback);
      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
      assert.lengthOf(events, 1);

      // verify event is correctly formatted
      var event = events[0];
      assert.equal(event.event_type, 'Test');
      assert.equal(event.event_id, 1);
      assert.deepEqual(event.user_properties, {});
      assert.deepEqual(event.event_properties, eventProperties);
      assert.deepEqual(event.groups, {
        '10': '1.23',
        'array': ['test2', 'false'],
      });

      // verify callback behavior
      assert.equal(counter, 0);
      assert.equal(value, -1);
      assert.equal(message, '');
      server.respondWith('success');
      server.respond();
      assert.equal(counter, 1);
      assert.equal(value, 200);
      assert.equal(message, 'success');
    });

    it('should track the raw user agent string', function() {
      // Unit test UA is set by phantomJS test environment, should be constant for all tests
      var userAgentString = navigator.userAgent;
      assert.isTrue(amplitude._userAgent.indexOf(userAgentString) > -1);

      // log an event and verify UA field is filled out
      amplitude.logEvent('testEvent');
      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
      assert.lengthOf(events, 1);
      assert.equal(events[0].event_type, 'testEvent');
      assert.isTrue(events[0].user_agent.indexOf(userAgentString) > -1);
    });

    it('should allow logging event with custom timestamp', function() {
      var timestamp = 2000;
      amplitude.logEventWithTimestamp('test', null, timestamp, null);
      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
      assert.lengthOf(events, 1);

      // verify the event is correct
      var event = events[0];
      assert.equal(event.event_type, 'test');
      assert.equal(event.event_id, 1);
      assert.equal(event.timestamp, timestamp);
    });

    it('should use current time if timestamp is null', function() {
      var timestamp = 5000;
      clock.tick(timestamp);
      amplitude.logEventWithTimestamp('test', null, null, null);
      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
      assert.lengthOf(events, 1);

      // verify the event is correct
      var event = events[0];
      assert.equal(event.event_type, 'test');
      assert.equal(event.event_id, 1);
      assert.isTrue(event.timestamp >= timestamp);
    });

    it('should use current time if timestamp is not valid form', function() {
      var timestamp = 6000;
      clock.tick(timestamp);
      amplitude.logEventWithTimestamp('test', null, 'invalid', null);
      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
      assert.lengthOf(events, 1);

      // verify the event is correct
      var event = events[0];
      assert.equal(event.event_type, 'test');
      assert.equal(event.event_id, 1);
      assert.isTrue(event.timestamp >= timestamp);
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

      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
      assert.lengthOf(events, 1);
    });

    it('should have state be persisted in the cookie', function() {
      var amplitude = new AmplitudeClient();
      amplitude.init(apiKey);
      assert.strictEqual(amplitude.options.optOut, false);

      amplitude.setOptOut(true);

      var amplitude2 = new AmplitudeClient();
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
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
      assert.lengthOf(events, 10);
      assert.deepEqual(events[0].user_properties, {$add: {'test': 6}});
      assert.deepEqual(events[9].user_properties, {$add: {'test': 100}});
    });
  });

  describe('gatherUtm', function() {
    var clock;
    beforeEach(function() {
      clock = sinon.useFakeTimers(100);
      amplitude.init(apiKey);
    });

    afterEach(function() {
      reset();
      cookie.remove('__utmz');
      cookie.reset();
      clock.restore();
    });

    it('should not send utm data when the includeUtm flag is false', function() {
      reset();
      cookie.set('__utmz', '133232535.1424926227.1.1.utmcct=top&utmccn=new');
      clock.tick(30 * 60 * 1000 + 1);
      amplitude.init(apiKey, undefined, {});

      amplitude.setUserProperties({user_prop: true});
      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
      assert.equal(events[0].user_properties.utm_campaign, undefined);
      assert.equal(events[0].user_properties.utm_content, undefined);
      assert.equal(events[0].user_properties.utm_medium, undefined);
      assert.equal(events[0].user_properties.utm_source, undefined);
      assert.equal(events[0].user_properties.utm_term, undefined);
    });

    it('should send utm data via identify when the includeUtm flag is true', function() {
      reset();
      cookie.set('__utmz', '133232535.1424926227.1.1.utmcct=top&utmccn=new');
      clock.tick(30 * 60 * 1000 + 1);
      amplitude.init(apiKey, undefined, {includeUtm: true, batchEvents: true, eventUploadThreshold: 2});

      amplitude.logEvent('UTM Test Event', {});

      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
      assert.equal(events[0].event_type, '$identify');
      assert.deepEqual(events[0].user_properties, {
        '$setOnce': {
          initial_utm_campaign: 'new',
          initial_utm_content: 'top'
        },
        '$set': {
          utm_campaign: 'new',
          utm_content: 'top'
        }
      });

      assert.equal(events[1].event_type, 'UTM Test Event');
      assert.deepEqual(events[1].user_properties, {});
    });

    it('should parse utm params', function() {
      reset();
      cookie.set('__utmz', '133232535.1424926227.1.1.utmcct=top&utmccn=new');
      var utmParams = '?utm_source=amplitude&utm_medium=email&utm_term=terms';
      clock.tick(30 * 60 * 1000 + 1);
      amplitude._initUtmData(utmParams);

      var expectedProperties = {
          utm_campaign: 'new',
          utm_content: 'top',
          utm_medium: 'email',
          utm_source: 'amplitude',
          utm_term: 'terms'
        }

      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
      assert.equal(events[0].event_type, '$identify');
      assert.deepEqual(events[0].user_properties, {
        '$setOnce': {
          initial_utm_campaign: 'new',
          initial_utm_content: 'top',
          initial_utm_medium: 'email',
          initial_utm_source: 'amplitude',
          initial_utm_term: 'terms'
        },
        '$set': expectedProperties
      });
      server.respondWith('success');
      server.respond();

      amplitude.logEvent('UTM Test Event', {});
      assert.lengthOf(server.requests, 2);
      var events = JSON.parse(queryString.parse(server.requests[1].requestBody).e);
      assert.deepEqual(events[0].user_properties, {});
    });

    it('should only send utm data once per session', function() {
      reset();
      const sessionTimeout = 100;
      cookie.set('__utmz', '133232535.1424926227.1.1.utmcct=top&utmccn=new');
      amplitude.init(apiKey, undefined, {includeUtm: true});

      // still same session, should not send any identify events
      assert.lengthOf(server.requests, 0);
      assert.lengthOf(amplitude._unsentEvents, 0);
      assert.lengthOf(amplitude._unsentIdentifys, 0);

      // advance clock to force new session
      clock.tick(sessionTimeout + 1);
      amplitude.init(apiKey, undefined, {includeUtm: true, sessionTimeout, batchEvents: true, eventUploadThreshold: 2});
      amplitude.logEvent('UTM Test Event', {});

      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
      assert.equal(events[0].event_type, '$identify');
      assert.deepEqual(events[0].user_properties, {
        '$setOnce': {
          initial_utm_campaign: 'new',
          initial_utm_content: 'top'
        },
        '$set': {
          utm_campaign: 'new',
          utm_content: 'top'
        }
      });

      assert.equal(events[1].event_type, 'UTM Test Event');
      assert.deepEqual(events[1].user_properties, {});
    });

    it('should send utm data more than once per session if configured', function() {
      reset();
      cookie.set('__utmz', '133232535.1424926227.1.1.utmcct=top&utmccn=new');
      amplitude.init(apiKey, undefined, {includeUtm: true, saveParamsReferrerOncePerSession: false});

      // even though same session, utm params are sent again
      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
      assert.equal(events[0].event_type, '$identify');
      assert.deepEqual(events[0].user_properties, {
        '$setOnce': {
          initial_utm_campaign: 'new',
          initial_utm_content: 'top'
        },
        '$set': {
          utm_campaign: 'new',
          utm_content: 'top'
        }
      });
    });

    it('should allow utm parameters to unset upon instantiating a new session', function(done) {
      reset();
      const sessionTimeout = 100;
      // send first $identify call with UTM params
      sinon.stub(amplitude, '_getUrlParams').returns('?utm_source=google&utm_campaign=(organic)&utm_medium=organic&utm_term=(none)&utm_content=link');
      amplitude.init(apiKey, undefined, {includeUtm: true, sessionTimeout, saveParamsReferrerOncePerSession: false, unsetParamsReferrerOnNewSession: true});

      // advance clock to force new session
      clock.tick(sessionTimeout + 1);
      amplitude._getUrlParams.restore();

      // send new session events
      amplitude.init(apiKey, undefined, {includeUtm: true, saveParamsReferrerOncePerSession: false, unsetParamsReferrerOnNewSession: true});
      amplitude.logEvent('UTM Test Event', {});

      // ensure the server has responded
      server.respondWith('success');
      server.respond();

      var firstSessionEvents = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
      var secondSessionEvents = JSON.parse(queryString.parse(server.requests[1].requestBody).e);
      var firstSessionInit = firstSessionEvents[0];
      var secondSessionInit = secondSessionEvents[0];
      var secondSessionEvent = secondSessionEvents[1];

      assert.equal(firstSessionInit.event_type, '$identify', 'should correctly called $identify');
      assert.deepEqual(firstSessionInit.user_properties, {
        $setOnce: {
            initial_utm_source: "google",
            initial_utm_medium: "organic",
            initial_utm_campaign: "(organic)",
            initial_utm_term: "(none)",
            initial_utm_content: "link"
        },
        $set: {
            utm_source: "google",
            utm_medium: "organic",
            utm_campaign: "(organic)",
            utm_term: "(none)",
            utm_content: "link"
        }
      }, 'should call $identify to set the correct UTM params');
      assert.equal(secondSessionInit.event_type, '$identify', 'should have re-called $identify to unset utm params upon a new session');
      assert.deepEqual(secondSessionInit.user_properties, {
        '$unset': {
          referrer: "-",
          utm_source:"-",
          utm_medium:"-",
          utm_campaign:"-",
          utm_term:"-",
          utm_content:"-"
        }
      }, 'should correctly unset UTM params');
      assert.deepEqual(secondSessionEvent.user_properties, {}, 'should correctly unset UTM params upon a new session');
      done()
    });

    it('should reset utm parameters if it has changed during a new session', function(done) {
      reset();
      const sessionTimeout = 100;
      // send first $identify call with UTM params
      sinon.stub(amplitude, '_getUrlParams').returns('?utm_source=google&utm_campaign=(organic)&utm_medium=organic&utm_term=(none)&utm_content=link');
      amplitude.init(apiKey, undefined, {includeUtm: true, sessionTimeout, saveParamsReferrerOncePerSession: false, unsetParamsReferrerOnNewSession: true});

      // advance clock to force new session, enter through a different campaign
      clock.tick(sessionTimeout + 1);
      amplitude._getUrlParams.restore();
      sinon.stub(amplitude, '_getUrlParams').returns('?utm_source=google&utm_campaign=(mail_promotion)&utm_medium=email&utm_term=(none)&utm_content=click');
      amplitude.init(apiKey, undefined, {includeUtm: true, saveParamsReferrerOncePerSession: false, unsetParamsReferrerOnNewSession: true});

      // send new session events
      amplitude.init(apiKey, undefined, {includeUtm: true, saveParamsReferrerOncePerSession: false, unsetParamsReferrerOnNewSession: true});
      amplitude.logEvent('UTM Test Event', {});

      // ensure the server has responded
      server.respondWith('success');
      server.respond();

      amplitude._getUrlParams.restore();
      var firstSessionEvents = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
      var secondSessionEvents = JSON.parse(queryString.parse(server.requests[1].requestBody).e);
      var firstSessionInit = firstSessionEvents[0];
      var secondSessionInit = secondSessionEvents[0];
      var secondSessionEvent = secondSessionEvents[1];

      assert.equal(firstSessionInit.event_type, '$identify', 'should correctly called $identify');
      assert.deepEqual(firstSessionInit.user_properties, {
        $setOnce: {
            initial_utm_source: "google",
            initial_utm_medium: "organic",
            initial_utm_campaign: "(organic)",
            initial_utm_term: "(none)",
            initial_utm_content: "link"
        },
        $set: {
            utm_source: "google",
            utm_medium: "organic",
            utm_campaign: "(organic)",
            utm_term: "(none)",
            utm_content: "link"
        }
      }, 'should call $identify to set the correct UTM params');
      assert.equal(secondSessionInit.event_type, '$identify', 'should have re-called $identify to unset utm params upon a new session');
      assert.deepEqual(secondSessionInit.user_properties, {
        '$unset': {
          referrer: "-",
          utm_source:"-",
          utm_medium:"-",
          utm_campaign:"-",
          utm_term:"-",
          utm_content:"-"
        }
      }, 'should correctly unset UTM params');
      assert.deepEqual(secondSessionEvent.user_properties, {
        $setOnce: {
            initial_utm_source: "google",
            initial_utm_medium: "email",
            initial_utm_campaign: "(mail_promotion)",
            initial_utm_term: "(none)",
            initial_utm_content: "click"
        },
        "$set": {
          "utm_source": "google",
          "utm_medium": "email",
          "utm_campaign": "(mail_promotion)",
          "utm_term": "(none)",
          "utm_content": "click"
        }
      }, 'should correctly set new UTM params upon a new session');
      done()
    });
  });

  describe('gatherReferrer', function() {
    var clock;
    beforeEach(function() {
      clock = sinon.useFakeTimers(100);
      amplitude.init(apiKey);
      sinon.stub(amplitude, '_getReferrer').returns('https://amplitude.com/contact');
    });

    afterEach(function() {
      amplitude._getReferrer.restore();
      clock.restore();
      reset();
    });

    it('should not send referrer data when the includeReferrer flag is false', function() {
      clock.tick(30 * 60 * 1000 + 1);
      amplitude.init(apiKey, undefined, {});

      amplitude.setUserProperties({user_prop: true});
      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
      assert.equal(events[0].user_properties.referrer, undefined);
      assert.equal(events[0].user_properties.referring_domain, undefined);
    });

    it('should only send referrer via identify call when the includeReferrer flag is true', function() {
      clock.tick(30 * 60 * 1000 + 1);  // force new session
      amplitude.init(apiKey, undefined, {includeReferrer: true, batchEvents: true, eventUploadThreshold: 2});
      amplitude.logEvent('Referrer Test Event', {});
      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
      assert.lengthOf(events, 2);

      // first event should be identify with initial_referrer and referrer
      assert.equal(events[0].event_type, '$identify');
      assert.deepEqual(events[0].user_properties, {
        '$set': {
          'referrer': 'https://amplitude.com/contact',
          'referring_domain': 'amplitude.com'
        },
        '$setOnce': {
          'initial_referrer': 'https://amplitude.com/contact',
          'initial_referring_domain': 'amplitude.com'
        }
      });

      // second event should be the test event with no referrer information
      assert.equal(events[1].event_type, 'Referrer Test Event');
      assert.deepEqual(events[1].user_properties, {});
    });

    it('should only send referrer once per session', function() {
      amplitude.init(apiKey, undefined, {includeReferrer: true});

      // still same session, no referrer sent
      assert.lengthOf(server.requests, 0);
      assert.lengthOf(amplitude._unsentEvents, 0);
      assert.lengthOf(amplitude._unsentIdentifys, 0);

      // advance the clock to force a new session
      clock.tick(30 * 60 * 1000 + 1);
      amplitude.init(apiKey, undefined, {includeReferrer: true, batchEvents: true, eventUploadThreshold: 2});
      amplitude.logEvent('Referrer Test Event', {});
      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
      assert.lengthOf(events, 2);

      // first event should be identify with initial_referrer and referrer
      assert.equal(events[0].event_type, '$identify');
      assert.deepEqual(events[0].user_properties, {
        '$set': {
          'referrer': 'https://amplitude.com/contact',
          'referring_domain': 'amplitude.com'
        },
        '$setOnce': {
          'initial_referrer': 'https://amplitude.com/contact',
          'initial_referring_domain': 'amplitude.com'
        }
      });

      // second event should be the test event with no referrer information
      assert.equal(events[1].event_type, 'Referrer Test Event');
      assert.deepEqual(events[1].user_properties, {});
    });

    it('should send referrer multiple times per session if configured', function() {
      amplitude.init(apiKey, undefined, {includeReferrer:true, saveParamsReferrerOncePerSession: false});

      // even though session is same, referrer is sent again
      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
      assert.lengthOf(events, 1);
      assert.equal(events[0].event_type, '$identify');
      assert.deepEqual(events[0].user_properties, {
        '$set': {
          'referrer': 'https://amplitude.com/contact',
          'referring_domain': 'amplitude.com'
        },
        '$setOnce': {
          'initial_referrer': 'https://amplitude.com/contact',
          'initial_referring_domain': 'amplitude.com'
        }
      });
    });

    it('should not delete unsent events saved to localStorage', function() {
      var existingEvent = '[{"device_id":"test_device_id","user_id":"test_user_id","timestamp":1453769146589,' +
        '"event_id":49,"session_id":1453763315544,"event_type":"clicked","version_name":"Web","platform":"Web"' +
        ',"os_name":"Chrome","os_version":"47","device_model":"Mac","language":"en-US","api_properties":{},' +
        '"event_properties":{},"user_properties":{},"uuid":"3c508faa-a5c9-45fa-9da7-9f4f3b992fb0","library"' +
        ':{"name":"amplitude-js","version":"2.9.0"},"sequence_number":130, "groups":{}}]';
      var existingIdentify = '[{"device_id":"test_device_id","user_id":"test_user_id","timestamp":1453769338995,' +
        '"event_id":82,"session_id":1453763315544,"event_type":"$identify","version_name":"Web","platform":"Web"' +
        ',"os_name":"Chrome","os_version":"47","device_model":"Mac","language":"en-US","api_properties":{},' +
        '"event_properties":{},"user_properties":{"$set":{"age":30,"city":"San Francisco, CA"}},"uuid":"' +
        'c50e1be4-7976-436a-aa25-d9ee38951082","library":{"name":"amplitude-js","version":"2.9.0"},"sequence_number"' +
        ':131, "groups":{}}]';
      localStorage.setItem('amplitude_unsent', existingEvent);
      localStorage.setItem('amplitude_unsent_identify', existingIdentify);

      clock.tick(30 * 60 * 1000 + 1);  // force new session
      amplitude.init(apiKey, undefined, {
        includeReferrer: true, batchEvents: true, eventUploadThreshold: 3, saveParamsReferrerOncePerSession: false
      });

      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
      assert.lengthOf(events, 3);

      // validate the events
      assert.equal(events[0].event_type, 'clicked');
      assert.equal(events[1].event_type, '$identify');
      assert.equal(events[2].event_type, '$identify');

      assert.deepEqual(events[1].user_properties, {'$set': {'age': 30, 'city': 'San Francisco, CA'}});
      assert.deepEqual(events[2].user_properties, {
        '$set': {
          'referrer': 'https://amplitude.com/contact',
          'referring_domain': 'amplitude.com'
        },
        '$setOnce': {
          'initial_referrer': 'https://amplitude.com/contact',
          'initial_referring_domain': 'amplitude.com'
        }
      });
    });
  });

  describe('gatherGclid', function() {
    var clock;
    beforeEach(function() {
      clock = sinon.useFakeTimers(100);
      amplitude.init(apiKey);
      sinon.stub(amplitude, '_getUrlParams').returns('?utm_source=amplitude&utm_medium=email&gclid=12345');
    });

    afterEach(function() {
      reset();
      amplitude._getUrlParams.restore();
      clock.restore();
    });

    it('should parse gclid once per session', function() {
      amplitude.init(apiKey, undefined, {includeGclid: true});

      // still same session, no gclid sent
      assert.lengthOf(server.requests, 0);
      assert.lengthOf(amplitude._unsentEvents, 0);
      assert.lengthOf(amplitude._unsentIdentifys, 0);

      // advance the clock to force a new session
      clock.tick(30 * 60 * 1000 + 1);
      amplitude.init(apiKey, undefined, {includeGclid: true, batchEvents: true, eventUploadThreshold: 2});
      amplitude.logEvent('Gclid test event', {});
      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
      assert.lengthOf(events, 2);

      // first event should be identify with gclid
      assert.equal(events[0].event_type, '$identify');
      assert.deepEqual(events[0].user_properties, {
        '$set': {'gclid': '12345'},
        '$setOnce': {'initial_gclid': '12345'}
      });

      // second event should be the test event with no gclid information
      assert.equal(events[1].event_type, 'Gclid test event');
      assert.deepEqual(events[1].user_properties, {});
    });

    it('should parse gclid multiple times per session if configured', function() {
      amplitude.init(apiKey, undefined, {includeGclid: true, saveParamsReferrerOncePerSession: false});

      // even though session is same, gclid is sent again
      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
      assert.lengthOf(events, 1);
      assert.equal(events[0].event_type, '$identify');
      assert.deepEqual(events[0].user_properties, {
        '$set': {'gclid': '12345'},
        '$setOnce': {'initial_gclid': '12345'}
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
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
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

  describe('logRevenueV2', function() {
    beforeEach(function() {
      reset();
      amplitude.init(apiKey);
    });

    afterEach(function() {
      reset();
    });

    it('should log with the Revenue object', function () {
      // ignore invalid revenue objects
      amplitude.logRevenueV2(null);
      assert.lengthOf(server.requests, 0);
      amplitude.logRevenueV2({});
      assert.lengthOf(server.requests, 0);
      amplitude.logRevenueV2(new amplitude.Revenue());

      // log valid revenue object
      var productId = 'testProductId';
      var quantity = 15;
      var price = 10.99;
      var revenueType = 'testRevenueType'
      var properties = {'city': 'San Francisco'};

      var revenue = new amplitude.Revenue().setProductId(productId).setQuantity(quantity).setPrice(price);
      revenue.setRevenueType(revenueType).setEventProperties(properties);

      amplitude.logRevenueV2(revenue);
      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
      assert.equal(events.length, 1);
      var event = events[0];
      assert.equal(event.event_type, 'revenue_amount');

      assert.deepEqual(event.event_properties, {
        '$productId': productId,
        '$quantity': quantity,
        '$price': price,
        '$revenueType': revenueType,
        'city': 'San Francisco'
      });

      // verify user properties empty
      assert.deepEqual(event.user_properties, {});

      // verify no revenue data in api_properties
      assert.deepEqual(event.api_properties, {});
    });

    it('should convert proxied Revenue object into real revenue object', function() {
      var fakeRevenue = {'_q':[
        ['setProductId', 'questionable'],
        ['setQuantity', 10],
        ['setPrice', 'key1']  // invalid price type, this will fail to generate revenue event
      ]};
      amplitude.logRevenueV2(fakeRevenue);
      assert.lengthOf(server.requests, 0);

      var proxyRevenue = {'_q':[
        ['setProductId', 'questionable'],
        ['setQuantity', 15],
        ['setPrice', 10.99],
        ['setRevenueType', 'purchase']
      ]};
      amplitude.logRevenueV2(proxyRevenue);
      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
      var event = events[0];
      assert.equal(event.event_type, 'revenue_amount');

      assert.deepEqual(event.event_properties, {
        '$productId': 'questionable',
        '$quantity': 15,
        '$price': 10.99,
        '$revenueType': 'purchase'
      });
    });
  });

  describe('sessionId', function() {
    var clock;
    beforeEach(function() {
      reset();
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
      var events = JSON.parse(queryString.parse(server.requests[0].requestBody).e);
      assert.equal(events.length, 1);
      assert.notEqual(events[0].session_id, sessionId);
      assert.notEqual(amplitude._sessionId, sessionId);
      assert.equal(events[0].session_id, amplitude._sessionId);
    });

    it('should be fetched correctly by getSessionId', function() {
      var timestamp = 1000;
      clock.tick(timestamp);
      var amplitude2 = new AmplitudeClient();
      amplitude2.init(apiKey);
      assert.equal(amplitude2._sessionId, timestamp);
      assert.equal(amplitude2.getSessionId(), timestamp);
      assert.equal(amplitude2.getSessionId(), amplitude2._sessionId);
    });

    it('should ignore bad session id values', function() {
      var timestamp = 1000;
      clock.tick(timestamp);
      var amplitude2 = new AmplitudeClient();
      amplitude2.init(apiKey);
      assert.equal(amplitude2._sessionId, timestamp);
      assert.equal(amplitude2.getSessionId(), timestamp);
      assert.equal(amplitude2.getSessionId(), amplitude2._sessionId);

      amplitude2.setSessionId('invalid session id');
      assert.equal(amplitude2._sessionId, timestamp);
      assert.equal(amplitude2.getSessionId(), timestamp);
      assert.equal(amplitude2.getSessionId(), amplitude2._sessionId);
    });

    it('should let user override sessionId with setSessionId', function() {
      var amplitude2 = new AmplitudeClient();
      var cookieStorage = new CookieStorage().getStorage();

      // set up initial session
      var sessionId = 1000;
      clock.tick(sessionId);
      amplitude2.init(apiKey);
      assert.equal(amplitude2._sessionId, sessionId);
      assert.equal(amplitude2.getSessionId(), sessionId);
      assert.equal(amplitude2.getSessionId(), amplitude2._sessionId);
      assert.equal(cookieStorage.get(amplitude2.options.cookieName + '_' + apiKey).sessionId, sessionId);

      // override sessionId with setSessionId
      var newSessionId = 10000;
      amplitude2.setSessionId(newSessionId);
      assert.equal(amplitude2._sessionId, newSessionId);
      assert.equal(amplitude2.getSessionId(), newSessionId);
      assert.equal(amplitude2.getSessionId(), amplitude2._sessionId);
      assert.equal(cookieStorage.get(amplitude2.options.cookieName + '_' + apiKey).sessionId, newSessionId);
    });
  });
});
