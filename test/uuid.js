import UUID from '../src/uuid.js';

describe('UUID', function () {
  it('should generate a valid UUID-4', function () {
    var uuid = UUID();
    assert.equal(36, uuid.length);
    assert.equal('4', uuid.substring(14, 15));
  });

  it('should generate a unique UUID-4', () => {
    const ids = new Set();
    const count = 10000;
    for (let i = 0; i < count; i++) {
      ids.add(UUID());
    }
    assert.equal(ids.size, count);
  });
});
