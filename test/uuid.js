import UUID from '../src/uuid.js';

describe('UUID', function () {
  it('should generate a valid UUID-4', function () {
    var uuid = UUID();
    assert.equal(36, uuid.length);
    assert.equal('4', uuid.substring(14, 15));
  });
});
