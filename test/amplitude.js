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
      var threshold = 10;
      var additional = threshold/2;
      amplitude.init(apiKey, null, {batchEvents: true, eventUploadThreshold: threshold});

      for (var i = 0; i < (threshold + additional); i++) {
        amplitude.logEvent('Event', {index: i});
      }

      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(querystring.parse(server.requests[0].requestBody).e);
      assert.lengthOf(events, threshold);
      assert.deepEqual(events[0].event_properties, {index: 0});
      assert.deepEqual(events[9].event_properties, {index: 9});

      server.respondWith('success');
      server.respond();

      assert.lengthOf(server.requests, 1);
      var unsentEvents = amplitude._unsentEvents;
      assert.lengthOf(unsentEvents, additional);
      assert.deepEqual(unsentEvents[additional - 1].event_properties, {index: threshold + additional - 1});
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

      server.respondWith([413, {}, ""]);
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
        server.respondWith([413, {}, ""]);
        server.respond();
      }

      var events = JSON.parse(querystring.parse(server.requests[6].requestBody).e);
      assert.lengthOf(events, 1);
      assert.deepEqual(events[0].event_properties, {index: 2});
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
      amplitude.logEvent('UTM Test Event', {});
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
      amplitude.logEvent('UTM Test Event', {});

      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(querystring.parse(server.requests[0].requestBody).e);
      assert.deepEqual(events[0].user_properties, {
        user_prop: true,
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
      amplitude.logEvent('Referrer Test Event', {});
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

    it('should add referrer data to the user properties', function() {
      reset();
      amplitude.init(apiKey, undefined, {includeReferrer: true});

      amplitude.setUserProperties({user_prop: true});
      amplitude.logEvent('Referrer Test Event', {});

      assert.lengthOf(server.requests, 1);
      var events = JSON.parse(querystring.parse(server.requests[0].requestBody).e);
      assert.deepEqual(events[0].user_properties, {
        user_prop: true,
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
});
