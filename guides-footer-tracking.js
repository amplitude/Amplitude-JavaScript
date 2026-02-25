/**
 * Amplitude Guides & Surveys Footer Click Tracking
 * 
 * This module adds event tracking for clicks on the "Powered by Amplitude" footer
 * in Amplitude Guides & Surveys. Since the footer is rendered by the engagement-browser
 * SDK, this uses DOM event delegation to capture clicks.
 * 
 * Usage:
 *   import { enableGuidesFooterTracking } from './guides-footer-tracking';
 *   
 *   // After initializing Amplitude
 *   amplitude.init('YOUR_API_KEY');
 *   enableGuidesFooterTracking(amplitude);
 */

/**
 * Enables click tracking for the "Powered by Amplitude" footer in guides/surveys
 * @param {Object} amplitudeInstance - The Amplitude SDK instance
 * @param {Object} options - Configuration options
 * @param {string} options.eventName - Custom event name (default: 'Guides Footer Clicked')
 * @param {Function} options.getProperties - Function to generate custom event properties
 */
function enableGuidesFooterTracking(amplitudeInstance, options = {}) {
  if (!amplitudeInstance || typeof amplitudeInstance.track !== 'function') {
    console.error('[Guides Footer Tracking] Invalid Amplitude instance provided');
    return;
  }

  const config = {
    eventName: options.eventName || 'Guides Footer Clicked',
    getProperties: options.getProperties || getDefaultEventProperties,
  };

  // Use event delegation on document to capture footer clicks
  // This works even when the footer is dynamically added by the engagement SDK
  document.addEventListener(
    'click',
    function (event) {
      // Check if the clicked element or its ancestors match the footer
      const footerElement = findFooterElement(event.target);

      if (footerElement && isAmplitudeFooter(footerElement)) {
        try {
          // Track the event
          const properties = config.getProperties(footerElement);
          amplitudeInstance.track(config.eventName, properties);

          console.log('[Guides Footer Tracking] Tracked footer click:', config.eventName, properties);
        } catch (error) {
          console.error('[Guides Footer Tracking] Error tracking footer click:', error);
        }
      }
    },
    true
  ); // Use capture phase to ensure we catch the event

  console.log('[Guides Footer Tracking] Footer click tracking enabled');
}

/**
 * Finds the footer element by traversing up the DOM tree
 * @param {Element} element - The clicked element
 * @returns {Element|null} The footer element if found
 */
function findFooterElement(element) {
  let current = element;
  let depth = 0;
  const maxDepth = 10; // Prevent infinite loops

  while (current && depth < maxDepth) {
    // Check if this is the footer or contains footer-related content
    if (isAmplitudeFooter(current)) {
      return current;
    }

    // Check parent element
    current = current.parentElement;
    depth++;
  }

  return null;
}

/**
 * Determines if an element is the Amplitude footer
 * @param {Element} element - The element to check
 * @returns {boolean} True if this is the Amplitude footer
 */
function isAmplitudeFooter(element) {
  if (!element) return false;

  const text = element.textContent || '';
  const href = element.getAttribute('href') || (element.closest('a') && element.closest('a').getAttribute('href')) || '';

  // Check for "Powered by Amplitude" text and guides-surveys link
  const hasFooterText = text.includes('Powered by Amplitude');
  const hasGuidesLink = href.includes('guides-surveys') || href.includes('guides-and-surveys');

  // Also check onclick handlers that open guides-surveys
  const onclickAttr = element.getAttribute('onclick') || '';
  const hasGuidesOnClick = onclickAttr.includes('guides-surveys');

  // Check if element or parent has specific styling/classes that indicate it's the footer
  // The footer typically has specific styling for bottom positioning
  const elementStyle = element.style || {};
  const computedStyle = window.getComputedStyle ? window.getComputedStyle(element) : {};

  return (
    hasFooterText &&
    (hasGuidesLink || hasGuidesOnClick || isLikelyFooterByPosition(element, computedStyle))
  );
}

/**
 * Checks if an element is likely a footer based on its position
 * @param {Element} element - The element to check
 * @param {CSSStyleDeclaration} computedStyle - The computed style
 * @returns {boolean} True if positioned like a footer
 */
function isLikelyFooterByPosition(element, computedStyle) {
  // Check for bottom positioning or footer-like layout
  const hasBottomPadding =
    computedStyle.padding && computedStyle.padding.includes('var(--layout-padding)');
  const hasJustifyCenter = computedStyle.justifyContent === 'center';

  return hasBottomPadding || hasJustifyCenter;
}

/**
 * Generates default event properties for footer clicks
 * @param {Element} footerElement - The footer element
 * @returns {Object} Event properties
 */
function getDefaultEventProperties(footerElement) {
  const properties = {
    destination_url: 'https://app.amplitude.com/guides-surveys',
    component: 'powered_by_footer',
    footer_text: 'Powered by Amplitude',
  };

  // Try to extract guide/nudge context from the DOM
  try {
    // Look for guide container or nudge wrapper
    const guideContainer = footerElement.closest('[data-guide-id], [data-nudge-id], [class*="guide"], [class*="nudge"]');

    if (guideContainer) {
      const guideId = guideContainer.getAttribute('data-guide-id') || 
                      guideContainer.getAttribute('data-nudge-id');
      if (guideId) {
        properties.guide_id = guideId;
      }

      // Try to determine guide type from classes or attributes
      const classList = guideContainer.classList || [];
      const classString = Array.from(classList).join(' ').toLowerCase();

      if (classString.includes('modal')) {
        properties.guide_type = 'modal';
      } else if (classString.includes('popover')) {
        properties.guide_type = 'popover';
      } else if (classString.includes('pin')) {
        properties.guide_type = 'pin';
      } else if (classString.includes('tooltip')) {
        properties.guide_type = 'tooltip';
      } else if (classString.includes('banner')) {
        properties.guide_type = 'banner';
      }
    }

    // Try to get organization info from engagement SDK global state
    if (window.engagement && window.engagement._ && window.engagement._.organization) {
      properties.organization_id = window.engagement._.organization.id;
      properties.organization_branding = window.engagement._.organization.branding;
    }

    // Try to get current nudge info
    if (window.engagement && window.engagement._analytics) {
      properties.has_booted = Boolean(window.engagement._analytics.hasBooted);
    }
  } catch (error) {
    console.warn('[Guides Footer Tracking] Could not extract additional properties:', error);
  }

  return properties;
}

/**
 * Alternative implementation using MutationObserver
 * This watches for footer elements being added to the DOM and attaches click handlers
 * @param {Object} amplitudeInstance - The Amplitude SDK instance
 * @param {Object} options - Configuration options
 */
function enableGuidesFooterTrackingWithObserver(amplitudeInstance, options = {}) {
  if (!amplitudeInstance || typeof amplitudeInstance.track !== 'function') {
    console.error('[Guides Footer Tracking] Invalid Amplitude instance provided');
    return;
  }

  const config = {
    eventName: options.eventName || 'Guides Footer Clicked',
    getProperties: options.getProperties || getDefaultEventProperties,
  };

  // Keep track of elements we've already instrumented
  const instrumentedElements = new WeakSet();

  function instrumentFooter(element) {
    if (!element || instrumentedElements.has(element)) return;
    if (!isAmplitudeFooter(element)) return;

    instrumentedElements.add(element);

    // Add click tracking
    element.addEventListener('click', function (event) {
      try {
        const properties = config.getProperties(element);
        amplitudeInstance.track(config.eventName, properties);
        console.log('[Guides Footer Tracking] Tracked footer click:', config.eventName, properties);
      } catch (error) {
        console.error('[Guides Footer Tracking] Error tracking footer click:', error);
      }
    }, true);

    console.log('[Guides Footer Tracking] Instrumented footer element');
  }

  // Check for existing footers
  function scanForFooters() {
    const allElements = document.querySelectorAll('*');
    for (const element of allElements) {
      const text = element.textContent || '';
      if (text.includes('Powered by Amplitude')) {
        instrumentFooter(element);
      }
    }
  }

  // Initial scan
  scanForFooters();

  // Watch for dynamically added footers
  const observer = new MutationObserver(function (mutations) {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const text = node.textContent || '';
          if (text.includes('Powered by Amplitude')) {
            instrumentFooter(node);
          }

          // Also check children
          const children = node.querySelectorAll ? node.querySelectorAll('*') : [];
          for (const child of children) {
            const childText = child.textContent || '';
            if (childText.includes('Powered by Amplitude')) {
              instrumentFooter(child);
            }
          }
        }
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  console.log('[Guides Footer Tracking] Footer tracking with observer enabled');

  return {
    disconnect: () => observer.disconnect(),
  };
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    enableGuidesFooterTracking,
    enableGuidesFooterTrackingWithObserver,
  };
}

if (typeof window !== 'undefined') {
  window.AmplitudeGuidesFooterTracking = {
    enableGuidesFooterTracking,
    enableGuidesFooterTrackingWithObserver,
  };
}
