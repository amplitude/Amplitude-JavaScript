/* eslint-disable no-undef */
importScripts('/base/amplitude.js');
importScripts('/base/node_modules/sinon/pkg/sinon.js');
const { sandbox } = sinon;
/* eslint-enable no-undef */

var isTrue = function (a) {
  if (!a) {
    throw new Error('Assertion failed: object is falsey.');
  }
};

describe('web worker', function () {
  let sbox;
  beforeEach(function () {
    sbox = sandbox.create();
  });

  afterEach(function () {
    sbox.restore();
  });

  describe('init', () => {
    it('should init successfully', () => {
      const onSuccess = sbox.spy();
      const onError = sbox.spy();
      amplitude.init(
        'API_KEY',
        undefined,
        {
          onError: onError,
          eventUploadThreshold: 1,
        },
        onSuccess,
      );
      isTrue(amplitude.getInstance()._isInitialized);
      isTrue(amplitude.getInstance()._newSession);
      isTrue(onSuccess.calledOnce);
      isTrue(onError.notCalled);
    });
  });

  describe('logEvent', () => {
    it('should log event successfully', () => {
      const onError = sbox.spy();
      const sendEvents = sbox.stub(amplitude.getInstance(), 'sendEvents').returns(undefined);
      amplitude
        .getInstance()
        .logEvent('event', {}, undefined, undefined, undefined, undefined, undefined, undefined, onError);
      isTrue(sendEvents.calledOnce);
      isTrue(onError.notCalled);
    });
  });

  describe('logEventWithGroups', () => {
    it('should log event with groups successfully', () => {
      const callback = sbox.spy();
      const onError = sbox.spy();
      const outOfSession = false;
      const sendEvents = sbox.stub(amplitude.getInstance(), 'sendEvents').returns(undefined);
      amplitude.getInstance().logEventWithGroups('event', {}, undefined, callback, onError, outOfSession);
      isTrue(sendEvents.calledOnce);
      isTrue(onError.notCalled);
    });
  });

  describe('sendEvents', () => {
    it('should send event successfully', () => {
      const _unsentCount = sbox.stub(amplitude.getInstance(), '_unsentCount').returns(1);
      const _mergeEventsAndIdentifys = sbox.stub(amplitude.getInstance(), '_mergeEventsAndIdentifys').returns({
        eventsToSend: [{ event: {} }],
      });
      const _logErrorsOnEvents = sbox.stub(amplitude.getInstance(), '_logErrorsOnEvents').returns();
      amplitude.getInstance().sendEvents();
      isTrue(_unsentCount.callCount === 2);
      isTrue(_mergeEventsAndIdentifys.calledOnce);
      isTrue(_logErrorsOnEvents.notCalled);
    });
  });

  describe('identify', () => {
    it('should identify successfully', () => {
      const callback = sbox.spy();
      const errorCallback = sbox.spy();
      const outOfSession = false;
      const sendEvents = sbox.stub(amplitude.getInstance(), 'sendEvents').returns(undefined);
      const identity = new amplitude.Identify().set('colors', ['rose', 'gold']);
      amplitude.getInstance().identify(identity, callback, errorCallback, outOfSession);
      isTrue(sendEvents.calledOnce);
      isTrue(errorCallback.notCalled);
    });
  });

  describe('groupIdentify', () => {
    it('should group identify successfully', () => {
      const callback = sbox.spy();
      const errorCallback = sbox.spy();
      const outOfSession = false;
      const sendEvents = sbox.stub(amplitude.getInstance(), 'sendEvents').returns(undefined);
      const identity = new amplitude.Identify().set('colors', ['rose', 'gold']);
      amplitude.getInstance().groupIdentify('groupType', 'groupName', identity, callback, errorCallback, outOfSession);
      isTrue(sendEvents.calledOnce);
      isTrue(errorCallback.notCalled);
    });
  });

  describe('logRevenue', () => {
    it('should log revenue successfully', () => {
      const _logEvent = sbox.stub(amplitude.getInstance(), '_logEvent').returns(undefined);
      amplitude.logRevenue(1, 1, 'asdf');
      isTrue(_logEvent.calledOnce);
    });
  });

  describe('logRevenueV2', () => {
    it('should log revenue successfully', () => {
      const revenue = new amplitude.Revenue().setProductId('productIdentifier').setPrice(10.99);
      const sendEvents = sbox.stub(amplitude.getInstance(), 'sendEvents').returns(undefined);
      amplitude.logRevenueV2(revenue);
      isTrue(sendEvents.calledOnce);
    });
  });

  describe('setGroup', () => {
    it('should set group successfully', () => {
      const onError = sbox.spy();
      const sendEvents = sbox.stub(amplitude.getInstance(), 'sendEvents').returns(undefined);
      amplitude.getInstance().setGroup('groupType', 'groupName');
      isTrue(sendEvents.calledOnce);
      isTrue(onError.notCalled);
    });
  });

  describe('setUserProperties', () => {
    it('should set user properties successfully', () => {
      const identify = sbox.stub(amplitude.getInstance(), 'identify').returns(undefined);
      amplitude.getInstance().setUserProperties({ a: 1 });
      isTrue(identify.calledOnce);
    });
  });

  describe('setVersionName', () => {
    it('should set version name successfully', () => {
      amplitude.getInstance().setVersionName('1.1.1');
      isTrue(amplitude.getInstance().options.versionName === '1.1.1');
    });
  });

  describe('enableTracking', () => {
    it('should set domain successfully', () => {
      const runQueuedFunctions = sbox.stub(amplitude.getInstance(), 'runQueuedFunctions').returns(undefined);
      amplitude.getInstance().enableTracking();
      isTrue(runQueuedFunctions.calledOnce);
    });
  });

  describe('setGlobalUserProperties', () => {
    it('should set global user properties successfully', () => {
      const setUserProperties = sbox.stub(amplitude.getInstance(), 'setUserProperties').returns(undefined);
      amplitude.getInstance().setGlobalUserProperties();
      isTrue(setUserProperties.calledOnce);
    });
  });

  describe('clearUserProperties', () => {
    it('should call set user properties successfully', () => {
      const identify = sbox.stub(amplitude.getInstance(), 'identify').returns(undefined);
      amplitude.getInstance().clearUserProperties();
      isTrue(identify.calledOnce);
    });
  });

  describe('regenerateDeviceId', () => {
    it('should regenerate device id successfully', () => {
      const setDeviceId = sbox.stub(amplitude.getInstance(), 'setDeviceId').returns(undefined);
      amplitude.getInstance().regenerateDeviceId();
      isTrue(setDeviceId.calledOnce);
    });
  });

  describe('setSessionId', () => {
    it('should set new session id successfully', () => {
      amplitude.getInstance().setSessionId(123);
      isTrue(amplitude.getInstance().getSessionId() === 123);
    });
  });

  describe('resetSessionId', () => {
    it('should set new session id successfully', () => {
      amplitude.getInstance().resetSessionId();
      isTrue(amplitude.getInstance().getSessionId() !== 123);
    });
  });

  describe('setUseDynamicConfig', () => {
    it('should set use dynamic config successfully', () => {
      const _refreshDynamicConfig = sbox.stub(amplitude.getInstance(), '_refreshDynamicConfig').returns(undefined);
      amplitude.getInstance().setUseDynamicConfig(true);
      isTrue(_refreshDynamicConfig.calledOnce);
    });
  });
});
