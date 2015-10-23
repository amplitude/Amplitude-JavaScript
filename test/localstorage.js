describe('Localstorage', function() {
  var Amplitude = require('../src/amplitude.js');
  var localStorage = require('../src/localstorage.js');
  var cookieStorage = require('../src/localstorage-cookie.js');
  var Cookie = require('../src/cookie.js');

  var apiKey = '000000';
  var cookieKey = 'amplitude_id';
  var userId = 'test_user_id';
  var deviceId = 'test_device_id';
  var amplitude;

  var localStorageKeys = [
    'amplitude_lastEventId',
    'amplitude_lastIdentifyId',
    'amplitude_lastSequenceNumber',
    'amplitude_lastEventTime',
    'amplitude_sessionId',
    'amplitude_unsent',
    'amplitude_unsent_identify',
    'amplitude_deviceId',
    'amplitude_userId',
    'amplitude_optOut',
  ];

  beforeEach(function() {
    amplitude = new Amplitude();
    amplitude.options.apiKey = apiKey;

    for (var i = 0; i < localStorageKeys.length; i++) {
      var key = localStorageKeys[i];
      if (localStorage.getItem(key)) localStorage.removeItem(key);
      key = key + '_' + apiKey;
      if (localStorage.getItem(key)) localStorage.removeItem(key);
    }
  });

  afterEach(function() {
  });

  describe('cookie storage', function() {

    beforeEach(function() {
      cookieStorage.clear();
      assert.lengthOf(cookieStorage, 0);
    });

    it('should store values', function() {
      cookieStorage.setItem('key-a', 'value-a');
      assert.equal(cookieStorage.getItem('key-a'), 'value-a');
      assert.lengthOf(cookieStorage, 1);
    });

    it('should return null for unstored keys', function() {
      assert.isNull(cookieStorage.getItem('bogus_key'));
      cookieStorage.setItem('key-a', 'value-a');
      assert.isNull(cookieStorage.getItem('bogus_key'));
    });

    it('should remove values', function() {
      cookieStorage.setItem('key-a', 'value-a');
      assert.equal(cookieStorage.getItem('key-a'), 'value-a');
      assert.lengthOf(cookieStorage, 1);
      cookieStorage.removeItem('bogus_key');
      assert.lengthOf(cookieStorage, 1);
      cookieStorage.removeItem('key-a');
      assert.isNull(cookieStorage.getItem('key-a'));
      assert.lengthOf(cookieStorage, 0);
    });

    it('should replace values', function() {
      cookieStorage.setItem('key-a', 'value-a');
      assert.equal(cookieStorage.getItem('key-a'), 'value-a');
      assert.lengthOf(cookieStorage, 1);
      cookieStorage.setItem('key-a', 'value-b');
      assert.equal(cookieStorage.getItem('key-a'), 'value-b');
      assert.lengthOf(cookieStorage, 1);
    });

    it('should store values with entities', function() {
      cookieStorage.setItem('key-a', 'this&that;with=an?<>');
      assert.equal(cookieStorage.getItem('key-a'), 'this&that;with=an?<>');
    });

    it('should not store more than 4k', function() {
      var longString = new Array(3*1024).join('a');

      cookieStorage.setItem('key-a', longString);
      cookieStorage.setItem('key-b', longString);

      assert.equal(cookieStorage.getItem('key-a'), longString);
      assert.isNull(cookieStorage.getItem('key-b'));
    });

    it('should fetch the nth key', function() {
      cookieStorage.setItem('key-a', 'value-a');
      cookieStorage.setItem('key-b', 'value-b');

      assert.isNull(cookieStorage.key(5));
      assert.equal(cookieStorage.key(1), 'key-b');
    });
  });

  describe('upgrade', function() {

    it('should migrate cookie values to localstorage', function() {
      Cookie.set(cookieKey, {
        deviceId: deviceId,
        userId: userId,
        optOut: true
      });

      amplitude._upgradeStoredData();

      assert.equal(amplitude.getLocalStorage('DEVICE_ID'), deviceId);
      assert.equal(amplitude.getLocalStorage('USER_ID'), userId);
      assert.equal(amplitude.getLocalStorage('OPT_OUT'), 'true');
    });

    it('should update local storage keys and append with apiKey', function() {
      var lastEventId = 'amplitude_lastEventId';
      var lastIdentifyId = 'amplitude_lastIdentifyId'
      var lastSequenceNumber = 'amplitude_lastSequenceNumber';
      var lastEventTime = 'amplitude_lastEventTime';
      var sessionId = 'amplitude_sessionId';
      var unsentEvents = 'amplitude_unsent';
      var unsentIdentifys = 'amplitude_unsent_identify';

      localStorage.setItem(lastEventId, 1000);
      localStorage.setItem(lastIdentifyId, 2000);
      localStorage.setItem(lastSequenceNumber, 3000);
      localStorage.setItem(lastEventTime, 4000);
      localStorage.setItem(sessionId, 4000);
      localStorage.setItem(unsentEvents, 'unsent_events_string');
      localStorage.setItem(unsentIdentifys, 'unsent_identifys_string');

      amplitude._upgradeStoredData();

      assert.equal(amplitude.getLocalStorage('LAST_EVENT_ID'), '1000');
      assert.equal(amplitude.getLocalStorage('LAST_IDENTIFY_ID'), '2000');
      assert.equal(amplitude.getLocalStorage('LAST_SEQUENCE_NUMBER'), '3000');
      assert.equal(amplitude.getLocalStorage('LAST_EVENT_TIME'), '4000');
      assert.equal(amplitude.getLocalStorage('SESSION_ID'), '4000');
      assert.equal(amplitude.getLocalStorage('UNSENT_EVENTS'), 'unsent_events_string');
      assert.equal(amplitude.getLocalStorage('UNSENT_IDENTIFYS'), 'unsent_identifys_string');

      // assert new keys
      assert.equal(localStorage.getItem(lastEventId + '_' + apiKey), '1000');
      assert.equal(localStorage.getItem(lastIdentifyId + '_' + apiKey), '2000');
      assert.equal(localStorage.getItem(lastSequenceNumber + '_' + apiKey), '3000');
      assert.equal(localStorage.getItem(lastEventTime + '_' + apiKey), '4000');
      assert.equal(localStorage.getItem(sessionId + '_' + apiKey), '4000');
      assert.equal(localStorage.getItem(unsentEvents + '_' + apiKey), 'unsent_events_string');
      assert.equal(localStorage.getItem(unsentIdentifys + '_' + apiKey), 'unsent_identifys_string');

      // assert old keys removed
      assert.isNull(localStorage.getItem(lastEventId));
      assert.isNull(localStorage.getItem(lastIdentifyId));
      assert.isNull(localStorage.getItem(lastSequenceNumber));
      assert.isNull(localStorage.getItem(lastEventTime));
      assert.isNull(localStorage.getItem(sessionId));
      assert.isNull(localStorage.getItem(unsentEvents));
      assert.isNull(localStorage.getItem(unsentIdentifys));
    });

    it('should upgrade and set options correctly', function() {
      var curTime = new Date().getTime();

      Cookie.set(cookieKey, {
        deviceId: deviceId,
        userId: userId,
        optOut: true
      });

      localStorage.setItem('amplitude_lastEventId', 1000);
      localStorage.setItem('amplitude_lastIdentifyId', 2000);
      localStorage.setItem('amplitude_lastSequenceNumber', 3000);
      localStorage.setItem('amplitude_lastEventTime', curTime);
      localStorage.setItem('amplitude_sessionId', curTime);
      localStorage.setItem('amplitude_unsent', '{"event_type": "test", "event_id": 1}');
      localStorage.setItem('amplitude_unsent_identify', '{"event_type": "$identify", "event_id": 2}');

      amplitude.init(apiKey);

      assert.equal(amplitude._eventId, 1000);
      assert.equal(amplitude._identifyId, 2000);
      assert.equal(amplitude._sequenceNumber, 3000);
      assert.isTrue(amplitude._lastEventTime >= curTime);
      assert.equal(amplitude._sessionId, curTime);
      assert.deepEqual(amplitude._unsentEvents, {'event_type': 'test', 'event_id': 1});
      assert.deepEqual(amplitude._unsentIdentifys, {'event_type': '$identify', 'event_id': 2});

      assert.equal(amplitude.options.deviceId, deviceId);
      assert.equal(amplitude.options.userId, userId);
      assert.isTrue(amplitude.options.optOut);
    });

    it('should set options correctly with the new local storage keys', function() {
      var curTime = new Date().getTime();

      localStorage.setItem('amplitude_lastEventId' + '_' + apiKey, 1000);
      localStorage.setItem('amplitude_lastIdentifyId' + '_' + apiKey, 2000);
      localStorage.setItem('amplitude_lastSequenceNumber' + '_' + apiKey, 3000);
      localStorage.setItem('amplitude_lastEventTime' + '_' + apiKey, curTime)
      localStorage.setItem('amplitude_sessionId' + '_' + apiKey, curTime);
      localStorage.setItem('amplitude_unsent' + '_' + apiKey, '{"event_type": "test", "event_id": 1}');
      localStorage.setItem('amplitude_unsent_identify' + '_' + apiKey, '{"event_type": "$identify", "event_id": 2}');
      localStorage.setItem('amplitude_deviceId' + '_' + apiKey, deviceId);
      localStorage.setItem('amplitude_userId' + '_' + apiKey, userId);
      localStorage.setItem('amplitude_optOut' + '_' + apiKey, true);

      amplitude.init(apiKey);

      assert.equal(amplitude._eventId, 1000);
      assert.equal(amplitude._identifyId, 2000);
      assert.equal(amplitude._sequenceNumber, 3000);
      assert.isTrue(amplitude._lastEventTime >= curTime);
      assert.equal(amplitude._sessionId, curTime);
      assert.deepEqual(amplitude._unsentEvents, {'event_type': 'test', 'event_id': 1});
      assert.deepEqual(amplitude._unsentIdentifys, {'event_type': '$identify', 'event_id': 2});

      assert.equal(amplitude.options.deviceId, deviceId);
      assert.equal(amplitude.options.userId, userId);
      assert.isTrue(amplitude.options.optOut);
    });

    it('should not override new options', function() {
      Cookie.set(cookieKey, {
        deviceId: deviceId,
        userId: userId,
        optOut: true
      });

      amplitude.init(apiKey, 'NEW_USER_ID', {
        deviceId: 'NEW_DEVICE_ID'
      });
      amplitude.setOptOut(false);

      assert.equal(amplitude.options.deviceId, 'NEW_DEVICE_ID');
      assert.equal(amplitude.options.userId, 'NEW_USER_ID');
      assert.isFalse(amplitude.options.optOut);
    });
  });
});
