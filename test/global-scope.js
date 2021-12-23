import GlobalScope from '../src/global-scope';

describe('GlobalScope', function () {
  it('should return true', function () {
    assert.isTrue(GlobalScope === window);
  });
});
