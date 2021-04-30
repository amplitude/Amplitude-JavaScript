import sinon from 'sinon';
import cookie from '../src/base-cookie';
import base64Id from '../src/base64Id';
import Constants from '../src/constants';
import utils from '../src/utils';
import { mockCookie, restoreCookie, getCookie } from './mock-cookie';

describe('cookie', function () {
  afterEach(() => {
    restoreCookie();
  });

  describe('set', () => {
    it('should always set the path to /', () => {
      mockCookie();
      cookie.set('key', 'val', {});
      assert.include(getCookie('key').options, 'path=/');
    });

    it('should set the secure flag with the secure option', () => {
      mockCookie();
      cookie.set('key', 'val', { secure: true });
      assert.include(getCookie('key').options, 'Secure');
    });

    it('should set the same site value with the sameSite option', () => {
      mockCookie();
      cookie.set('key', 'val', { sameSite: 'Lax' });
      assert.include(getCookie('key').options, 'SameSite=Lax');
    });

    it('should set the expires option based on expirationDays', () => {
      mockCookie();
      const clock = sinon.useFakeTimers();
      cookie.set('key', 'val', { expirationDays: 54 });
      assert.include(getCookie('key').options, 'expires=Tue, 24 Feb 1970 00:00:00 GMT');
      clock.restore();
    });
  });

  describe('get', () => {
    it('should retrieve a cookie that has been set', () => {
      cookie.set('key', 'val', {});
      assert.equal(cookie.get('key='), 'val');
      cookie.set('key', null, {});
    });

    it('should return null when attempting to retrieve a cookie that does not exist', () => {
      assert.isNull(cookie.get('key='));
    });
  });

  describe('areCookiesEnabled', () => {
    before(() => {
      sinon.stub(Math, 'random').returns(1);
    });
    after(() => {
      sinon.restore();
    });
    afterEach(() => {
      restoreCookie();
      sinon.restore();
    });

    describe('when it can write to a cookie', () => {
      it('should return true', () => {
        assert.isTrue(cookie.areCookiesEnabled());
      });

      it('should cleanup cookies', () => {
        const cookieName = Constants.COOKIE_TEST_PREFIX + base64Id();
        cookie.areCookiesEnabled();
        assert.isNull(cookie.get(`${cookieName}=`), null);
      });
    });

    describe('when it cannot write to a cookie', () => {
      beforeEach(() => {
        mockCookie({ disabled: true });
      });

      it('should return false', () => {
        assert.isFalse(cookie.areCookiesEnabled());
      });

      it('should cleanup cookies', () => {
        const cookieName = Constants.COOKIE_TEST_PREFIX + base64Id();

        cookie.areCookiesEnabled();
        assert.isNull(cookie.get(`${cookieName}=`));
      });
    });

    describe('when error is thrown during check', () => {
      it('should cleanup cookies', () => {
        const stubLogInfo = sinon.stub(utils.log, 'info').throws('Stubbed Exception');
        const spyLogWarning = sinon.spy(utils.log, 'warn');
        const cookieName = Constants.COOKIE_TEST_PREFIX + base64Id();
        const res = cookie.areCookiesEnabled();
        assert.isFalse(res);
        assert.isTrue(spyLogWarning.calledWith('Error thrown when checking for cookies. Reason: "Stubbed Exception"'));
        assert.isNull(cookie.get(`${cookieName}=`));

        stubLogInfo.restore();
        spyLogWarning.restore();
      });
    });
  });
});
