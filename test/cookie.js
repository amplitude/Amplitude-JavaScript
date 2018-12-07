import cookie from '../src/cookie.js';
import baseCookie from '../src/base-cookie';
import getLocation from '../src/get-location';

describe('Cookie', function() {

  before(function() {
    cookie.reset();
  });

  afterEach(function() {
    cookie.remove('x');
    cookie.reset();
  });

  describe('get', function() {
    it('should get an existing cookie', function() {
      cookie.set('x', { a : 'b' });
      assert.deepEqual(cookie.get('x'), { a : 'b' });
    });

    it('should not throw an error on a malformed cookie', function () {
      document.cookie="x=y; path=/";
      assert.isNull(cookie.get('x'));
    });
  });

  describe('remove', function () {
    it('should remove a cookie', function() {
      cookie.set('x', { a : 'b' });
      assert.deepEqual(cookie.get('x'), { a : 'b' });
      cookie.remove('x');
      assert.isNull(cookie.get('x'));
    });
  });

  describe('options', function() {
    it('should set default options', function() {
      assert.deepEqual(cookie.options(), {
        expirationDays: undefined,
        domain: undefined
      });
    });

    it('should save options', function() {
      cookie.options({ expirationDays: 365 });
      assert.equal(cookie.options().expirationDays, 365);
    });
  });
});
