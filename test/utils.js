import utils from '../src/utils.js';
import constants from '../src/constants.js';

describe('utils', function() {
  describe('isEmptyString', function() {
    it('should detect empty strings', function() {
      assert.isTrue(utils.isEmptyString(null));
      assert.isTrue(utils.isEmptyString(''));
      assert.isTrue(utils.isEmptyString(undefined));
      assert.isTrue(utils.isEmptyString(NaN));
      assert.isFalse(utils.isEmptyString(' '));
      assert.isFalse(utils.isEmptyString('string'));
      assert.isFalse(utils.isEmptyString("string"));
    });
  });

  describe('log', function() {
    beforeEach(function() {
      utils.setLogLevel('INFO');
      sinon.spy(console, 'log');
    });

    afterEach(function() {
      console.log.restore();
    });

    describe('setLogLevelShould ignore invalid log levels', function() {
      utils.setLogLevel('INVALID_LOGLEVEL');
      assert.strictEqual(utils.getLogLevel(), 2);
    });

    describe('logLevel is ERROR', function() {
      beforeEach(function() {
        utils.setLogLevel('ERROR');
      });

      it('should not log warnings', function() {
        utils.log.warn('warning');
        assert.isFalse(console.log.called);
      });

      it('should not log info', function() {
        utils.log.info('info');
        assert.isFalse(console.log.called);
      });

      it('should log errors', function() {
        utils.log.error('error');
        assert.isTrue(console.log.calledOnce);
      });
    });

    describe('logLevel is WARN', function() {
      beforeEach(function() {
        utils.setLogLevel('WARN');
      });

      it('should log warnings', function() {
        utils.log.warn('warning');
        assert.isTrue(console.log.calledOnce);
      });

      it('should log errors', function() {
        utils.log.error('errors');
        assert.isTrue(console.log.calledOnce);
      });

      it('should not log info', function() {
        utils.log.info('info');
        assert.isFalse(console.log.called);
      });
    });

    describe('logLevel is INFO', function() {
      beforeEach(function() {
        utils.setLogLevel('INFO');
      });

      it('should log errors', function() {
        utils.log.error('error');
        assert.isTrue(console.log.calledOnce);
      });

      it('should log warnings', function() {
        utils.log.warn('warn');
        assert.isTrue(console.log.calledOnce);
      });

      it('should log info', function() {
        utils.log.info('info');
        assert.isTrue(console.log.calledOnce);
      });
    });
  })

  describe('validateProperties', function() {
    it('should detect invalid event property formats', function() {
      assert.deepEqual({}, utils.validateProperties('string'));
      assert.deepEqual({}, utils.validateProperties(null));
      assert.deepEqual({}, utils.validateProperties(undefined));
      assert.deepEqual({}, utils.validateProperties(10));
      assert.deepEqual({}, utils.validateProperties(true));
      assert.deepEqual({}, utils.validateProperties(new Date()));
      assert.deepEqual({}, utils.validateProperties([]));
      assert.deepEqual({}, utils.validateProperties(NaN));
    });

    it('should not modify valid event property formats', function() {
      var properties = {
        'test': 'yes',
        'key': 'value',
        '15': '16'
      }
      assert.deepEqual(properties, utils.validateProperties(properties));
    });

    it('should coerce non-string keys', function() {
      var d = new Date();
      var dateString = String(d);

      var properties = {
        10: 'false',
        null: 'value',
        NaN: '16',
        d: dateString
      }
      var expected = {
        '10': 'false',
        'null': 'value',
        'NaN': '16',
        'd': dateString
      }
      assert.deepEqual(utils.validateProperties(properties), expected);
    });

    it('should ignore invalid event property values', function() {
      var properties = {
        'null': null,
        'undefined': undefined,
        'NaN': NaN,
        'function': utils.log.warn
      }
      assert.deepEqual({}, utils.validateProperties(properties));
    });

    it('should coerce error values', function() {
      var e = new Error('oops');

      var properties = {
        'error': e
      };
      var expected = {
        'error': String(e)
      }
      assert.deepEqual(utils.validateProperties(properties), expected);
    });

    it('should validate properties', function() {
      var e = new Error('oops');

      var properties = {
        10: 'false', // coerce key
        'bool': true,
        'null': null, // should be ignored
        'function': console.log, // should be ignored
        'regex': /afdg/, // should be ignored
        'error': e, // coerce value
        'string': 'test',
        'array': [0, 1, 2, '3'],
        'nested_array': ['a', {'key': 'value'}, ['b']],
        'object': {
          'key': 'value',
          15: e
        },
        'nested_object': {
          'k': 'v',
          'l': [0, 1],
          'o': {
              'k2': 'v2',
              'l2': ['e2', {'k3': 'v3'}]
          }
        }
      }
      var expected = {
        '10': 'false',
        'bool': true,
        'error': 'Error: oops',
        'string': 'test',
        'array': [0, 1, 2, '3'],
        'nested_array': ['a'],
        'object': {
          'key': 'value',
          '15': 'Error: oops'
        },
        'nested_object': {
          'k': 'v',
          'l': [0, 1],
          'o': {
              'k2': 'v2',
              'l2': ['e2']
          }
        }
      }
      assert.deepEqual(utils.validateProperties(properties), expected);
    });

    it('should block properties with too many items', function() {
      var properties = {};
      for (var i = 0; i < constants.MAX_PROPERTY_KEYS + 1; i++) {
        properties[i] = i;
      }
      assert.deepEqual(utils.validateProperties(properties), {});
    });
  });
});
