import sinon from 'sinon';
import language from '../src/language.js';

describe('language', function () {
  var languagesStub, languageStub, userLanguageStub;

  before(function () {
    /* Sinon is unable to stub undefined properties so let's make sure all are defined
           https://github.com/sinonjs/sinon/pull/1557 */
    if (!('languages' in navigator)) {
      Object.defineProperty(navigator, 'languages', {
        value: null,
        configurable: true,
        writable: true,
      });
    }
    if (!('language' in navigator)) {
      Object.defineProperty(navigator, 'language', {
        value: null,
        configurable: true,
        writable: true,
      });
    }
    if (!('userLanguage' in navigator)) {
      Object.defineProperty(navigator, 'userLanguage', {
        value: null,
        configurable: true,
        writable: true,
      });
    }

    languagesStub = sinon.stub(navigator, 'languages').value(['some-locale', 'some-other-locale']);
    languageStub = sinon.stub(navigator, 'language').value('some-second-locale');
    userLanguageStub = sinon.stub(navigator, 'userLanguage').value('some-third-locale');
  });

  afterEach(function () {
    languagesStub.reset();
    languageStub.reset();
    userLanguageStub.reset();
  });

  after(function () {
    languagesStub.restore();
    languageStub.restore();
    userLanguageStub.restore();
  });

  it('should return a language', function () {
    assert.isNotNull(language.getLanguage());
  });

  it('should prioritize the first language of navigator.languages', function () {
    assert.equal(language.getLanguage(), 'some-locale');
  });

  it('should secondly use the language of navigator.language', function () {
    languagesStub.value(undefined);

    assert.equal(language.getLanguage(), 'some-second-locale');
  });

  it('should thirdly use the language of navigator.userLanguage', function () {
    languagesStub.value(undefined);
    languageStub.value(undefined);

    assert.equal(language.getLanguage(), 'some-third-locale');
  });

  it('should return empty string if navigator language is not set', function () {
    languagesStub.value(undefined);
    languageStub.value(undefined);
    userLanguageStub.value(undefined);

    assert.equal(language.getLanguage(), '');
  });
});
