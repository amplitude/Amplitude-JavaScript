import cookie from '../src/cookie.js';

describe('Cookie', () => {
  before(() => {
    cookie.reset();
  });

  afterEach(() => {
    cookie.remove('x');
    cookie.reset();
  });

  describe('get', () => {
    it('should get an existing cookie', () => {
      cookie.set('x', { a: 'b' });
      assert.deepEqual(cookie.get('x'), { a: 'b' });
    });

    it('should not throw an error on a malformed cookie', () => {
      document.cookie = 'x=y; path=/';
      assert.isNull(cookie.get('x'));
    });
  });

  describe('remove', () => {
    it('should remove a cookie', () => {
      cookie.set('x', { a: 'b' });
      assert.deepEqual(cookie.get('x'), { a: 'b' });
      cookie.remove('x');
      assert.isNull(cookie.get('x'));
    });
  });

  describe('options', () => {
    it('should set default options', () => {
      assert.deepEqual(cookie.options(), {
        expirationDays: undefined,
        domain: undefined,
      });
    });

    it('should save options', () => {
      cookie.options({ expirationDays: 1 });
      assert.equal(cookie.options().expirationDays, 1);
    });
  });
});
