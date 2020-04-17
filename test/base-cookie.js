import cookie from '../src/base-cookie';
import { mockCookie, restoreCookie, getCookie } from './mock-cookie';

describe('cookie', function() {
  afterEach(() => {
    restoreCookie();
  });

  describe('set', () => {
    it('should always set the path to /', () => {
      mockCookie();
      cookie.set('key', 'val', {});
      assert.include(getCookie('key').options, 'path=/');
    })

    it('should set the secure flag with the secure option', () => {
      mockCookie();
      cookie.set('key', 'val', {secure: true});
      assert.include(getCookie('key').options, 'Secure');
    })

    it('should set the same site value with the sameSite option', () => {
      mockCookie();
      cookie.set('key', 'val', {sameSite: "Lax"});
      assert.include(getCookie('key').options, 'SameSite=Lax');
    })

    it('should set the expires option based on expirationDays', () => {
      mockCookie();
      const clock = sinon.useFakeTimers();
      cookie.set('key', 'val', {expirationDays: 54});
      assert.include(getCookie('key').options, 'expires=Tue, 24 Feb 1970 00:00:00 GMT');
      clock.restore();
    })
  })

  describe('get', () => {
    it('should retrieve a cookie that has been set', () => {
      cookie.set('key', 'val', {});
      assert.equal(cookie.get('key='), 'val');
      cookie.set('key', null, {});
    });

    it('should return null when attempting to retrieve a cookie that does not exist', () => {
      assert.equal(cookie.get('key='), null);
    });
  });

  describe('areCookiesEnabled', () => {
    it('return false when it cannot write to a cookie', () => {
      mockCookie({disabled: true});
      assert.equal(cookie.areCookiesEnabled(), false);
    });

    it('should return true when it can write to a cookie', () => {
      assert.equal(cookie.areCookiesEnabled(), true);
    });
  });
});
