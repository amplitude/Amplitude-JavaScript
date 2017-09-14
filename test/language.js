import language from '../src/language.js';

describe('language', function() {
    it('should return a language', function() {
        assert.isNotNull(language.language);
    });
});
