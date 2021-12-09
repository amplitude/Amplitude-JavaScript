// eslint-disable-next-line no-undef
importScripts('/base/amplitude.js');

var isTrue = function (a) {
  if (!a) {
    throw new Error('Assertion failed: object is falsey.');
  }
};

describe('web worker', function () {
  describe('init', () => {
    it('should call init successfully', () => {
      let successCallbackCalled = false;
      let errorCallbackCalled = false;
      amplitude.init(
        'API_KEY',
        undefined,
        {
          onError: function onError() {
            errorCallbackCalled = true;
          },
          eventUploadThreshold: 1,
        },
        function callback() {
          successCallbackCalled = true;
        },
      );
      isTrue(amplitude.getInstance()._isInitialized);
      isTrue(amplitude.getInstance()._newSession);
      isTrue(successCallbackCalled);
      isTrue(errorCallbackCalled === false);
    });
  });

  describe('logEvent', () => {
    it('should call log event successfully', () => {
      let sendEventsCalled = false;
      let errorCallbackCalled = false;
      amplitude.getInstance().sendEvents = () => {
        sendEventsCalled = true;
      };
      amplitude.logEvent(
        'event',
        {},
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        function errorCallback() {
          errorCallbackCalled = true;
        },
      );
      isTrue(sendEventsCalled);
      isTrue(errorCallbackCalled === false);
    });
  });
});
