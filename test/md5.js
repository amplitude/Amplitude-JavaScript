var md5 = require('../src/md5.js');

describe('MD5', function() {
  var encodeCases = [
    ['', 'd41d8cd98f00b204e9800998ecf8427e'],
    ['foobar', '3858f62230ac3c915f300c664312c63f']
  ];

  it('should hash properly', function() {
    for (var i = 0; i < encodeCases.length; i++) {
      assert.equal(encodeCases[i][1], md5(encodeCases[i][0]));
    }
  });

  it('should hash unicode properly', function() {
    assert.equal('db36e9b42b9fa2863f94280206fb4d74', md5('\u2661'));
  });
});
