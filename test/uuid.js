import UUID from '../src/uuid.js';

describe('UUID', function () {
  it('should generate a valid UUID-4', function () {
    var uuid = UUID();
    assert.equal(36, uuid.length);
    assert.equal('4', uuid.substring(14, 15));
  });

  it('should generate a different UUID-4', () => {
    var uuid1 = UUID();
    var uuid2 = UUID();
    expect(uuid1).not.toEqual(uuid2);
  });
});
