import cookie from '../src/base-cookie';
import { mockCookie, restoreCookie, getCookie } from './mock-cookie';

describe('cookie', function() {
  beforeEach(() => {
    mockCookie();
  })

  afterEach(() => {
    restoreCookie();
  });

  describe('set', () => {
    it('should set the secure flag with the secure option', () => {
      cookie.set('key', 'val', {secure: true});
      assert.include(getCookie('key').options, 'Secure');
    })

    it('should set the same site value with the sameSite option', () => {
      cookie.set('key', 'val', {sameSite: "Lax"});
      assert.include(getCookie('key').options, 'SameSite=Lax');
    })
  })
});
