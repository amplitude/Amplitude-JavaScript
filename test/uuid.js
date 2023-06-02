import UUID from '../src/uuid.js';

describe('UUID', function () {
  it('should generate a valid UUID-4', function () {
    var uuid = UUID();
    assert.equal(36, uuid.length);
    assert.equal('4', uuid.substring(14, 15));
  });

  it('should generate a unique UUID-4', () => {
    const ids = new Set();
    for (let i = 0; i < 10000; i++) {
      const id = UUID();
      assert.isFalse(ids.has(id));
      ids.add(id);
    }
  });
});
