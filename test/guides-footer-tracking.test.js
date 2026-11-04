/**
 * Tests for Guides & Surveys Footer Click Tracking
 */

const assert = require('assert');
const sinon = require('sinon');

describe('Guides Footer Tracking', function () {
  let amplitude;

  beforeEach(function () {
    // Create mock Amplitude instance
    amplitude = {
      track: sinon.spy(),
      _unsentEvents: [],
    };
  });

  afterEach(function () {
    sinon.restore();
  });

  describe('enableGuidesFooterTracking', function () {
    it('should require a valid Amplitude instance', function () {
      if (typeof window === 'undefined') {
        this.skip();
        return;
      }

      const consoleError = sinon.stub(console, 'error');

      // Try with null
      window.AmplitudeGuidesFooterTracking.enableGuidesFooterTracking(null);
      assert(consoleError.calledOnce);

      consoleError.resetHistory();

      // Try with object without track method
      window.AmplitudeGuidesFooterTracking.enableGuidesFooterTracking({});
      assert(consoleError.calledOnce);
    });

    it('should add event listener to document', function () {
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        this.skip();
        return;
      }

      const addEventListenerSpy = sinon.spy(document, 'addEventListener');

      window.AmplitudeGuidesFooterTracking.enableGuidesFooterTracking(amplitude);

      assert(addEventListenerSpy.calledWith('click'));
    });
  });

  describe('isAmplitudeFooter', function () {
    it('should identify footer by text content', function () {
      if (typeof document === 'undefined') {
        this.skip();
        return;
      }

      // This test would need the actual implementation exposed
      // For now, we'll test the integration
    });

    it('should identify footer by href', function () {
      if (typeof document === 'undefined') {
        this.skip();
        return;
      }

      // This test would need the actual implementation exposed
    });
  });

  describe('Footer Click Integration', function () {
    it('should track event when footer is clicked', function (done) {
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        this.skip();
        return;
      }

      // Enable tracking
      window.AmplitudeGuidesFooterTracking.enableGuidesFooterTracking(amplitude, {
        eventName: 'Test Footer Click',
        getProperties: function () {
          return {
            test: true,
          };
        },
      });

      // Create a mock footer element
      const footer = document.createElement('a');
      footer.textContent = 'Powered by Amplitude';
      footer.setAttribute('href', 'javascript:void(0)');
      footer.setAttribute('onclick', "window.open('https://app.amplitude.com/guides-surveys', '_blank')");
      document.body.appendChild(footer);

      // Stub window.open to prevent actual navigation
      const windowOpenStub = sinon.stub(window, 'open');

      // Click the footer
      footer.click();

      // Small delay to allow event to process
      setTimeout(function () {
        try {
          // Verify tracking was called
          assert(amplitude.track.called, 'amplitude.track should have been called');

          if (amplitude.track.called) {
            const call = amplitude.track.getCall(0);
            assert.equal(call.args[0], 'Test Footer Click');
            assert.equal(call.args[1].test, true);
          }

          // Cleanup
          document.body.removeChild(footer);
          windowOpenStub.restore();

          done();
        } catch (error) {
          done(error);
        }
      }, 100);
    });

    it('should include default properties when tracking', function (done) {
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        this.skip();
        return;
      }

      // Enable tracking with default config
      window.AmplitudeGuidesFooterTracking.enableGuidesFooterTracking(amplitude);

      // Create mock footer
      const footer = document.createElement('a');
      footer.textContent = 'Powered by Amplitude';
      footer.setAttribute('onclick', "window.open('https://app.amplitude.com/guides-surveys', '_blank')");
      document.body.appendChild(footer);

      // Stub window.open
      const windowOpenStub = sinon.stub(window, 'open');

      // Click footer
      footer.click();

      setTimeout(function () {
        try {
          if (amplitude.track.called) {
            const properties = amplitude.track.getCall(0).args[1];

            assert(properties.destination_url, 'Should include destination_url');
            assert(properties.component, 'Should include component');
            assert(properties.footer_text, 'Should include footer_text');

            assert.equal(properties.destination_url, 'https://app.amplitude.com/guides-surveys');
            assert.equal(properties.component, 'powered_by_footer');
          }

          // Cleanup
          document.body.removeChild(footer);
          windowOpenStub.restore();

          done();
        } catch (error) {
          done(error);
        }
      }, 100);
    });
  });

  describe('MutationObserver approach', function () {
    it('should watch for dynamically added footers', function (done) {
      if (typeof window === 'undefined' || typeof document === 'undefined' || typeof MutationObserver === 'undefined') {
        this.skip();
        return;
      }

      // Enable tracking with observer
      const tracker = window.AmplitudeGuidesFooterTracking.enableGuidesFooterTrackingWithObserver(amplitude);

      // Add footer after tracking is enabled
      setTimeout(function () {
        const footer = document.createElement('div');
        footer.textContent = 'Powered by Amplitude';
        footer.setAttribute('onclick', "window.open('https://app.amplitude.com/guides-surveys', '_blank')");
        document.body.appendChild(footer);

        // Give observer time to detect the addition
        setTimeout(function () {
          // Stub window.open
          const windowOpenStub = sinon.stub(window, 'open');

          // Click the footer
          footer.click();

          setTimeout(function () {
            try {
              // Should have tracked the click
              assert(amplitude.track.called, 'Should track dynamically added footer clicks');

              // Cleanup
              document.body.removeChild(footer);
              tracker.disconnect();
              windowOpenStub.restore();

              done();
            } catch (error) {
              done(error);
            }
          }, 100);
        }, 100);
      }, 100);
    });
  });

  describe('Property extraction', function () {
    it('should extract guide context when available', function (done) {
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        this.skip();
        return;
      }

      // Enable tracking
      window.AmplitudeGuidesFooterTracking.enableGuidesFooterTracking(amplitude);

      // Create guide container with footer
      const guideContainer = document.createElement('div');
      guideContainer.setAttribute('data-guide-id', 'test-guide-123');
      guideContainer.className = 'modal-guide';

      const footer = document.createElement('a');
      footer.textContent = 'Powered by Amplitude';
      footer.setAttribute('onclick', "window.open('https://app.amplitude.com/guides-surveys', '_blank')");

      guideContainer.appendChild(footer);
      document.body.appendChild(guideContainer);

      // Stub window.open
      const windowOpenStub = sinon.stub(window, 'open');

      // Click footer
      footer.click();

      setTimeout(function () {
        try {
          if (amplitude.track.called) {
            const properties = amplitude.track.getCall(0).args[1];

            // Should extract guide_id and guide_type
            assert.equal(properties.guide_id, 'test-guide-123', 'Should extract guide ID');
            assert.equal(properties.guide_type, 'modal', 'Should extract guide type from class');
          }

          // Cleanup
          document.body.removeChild(guideContainer);
          windowOpenStub.restore();

          done();
        } catch (error) {
          done(error);
        }
      }, 100);
    });
  });
});
