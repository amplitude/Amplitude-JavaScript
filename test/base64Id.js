import base64Id from '../src/base64Id';

describe('base64Id', () => {
  it('should return an id with length 22', () => {
    assert.equal(base64Id().length, 22);
  });

  // If this test fails randomly it'll be frustrating to reproduce.  Ideally
  // there would be some reproducible seed we would print for every test run.
  it('should return an id of safe base64 characters', () => {
    assert.equal(true, /^[a-zA-Z0-9\-_]*$/.test(base64Id()));
  });

  it('should generate a unique base64Id', () => {
    const ids = new Set();
    const count = 10000;
    for (let i = 0; i < count; i++) {
      ids.add(base64Id(););
    }
    assert.isEqual(ids.size, count);
  });
});
