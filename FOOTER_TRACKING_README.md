# Guides & Surveys Footer Click Tracking

## Problem Statement

Track clicks on the "Powered by Amplitude" footer in Amplitude Guides & Surveys to measure awareness and engagement with this marketing touchpoint.

## Background

From the Slack thread (#guides-and-surveys-product-feedback):
- The footer was added to drive awareness and hand-raisers for Guides & Surveys
- It links to `https://app.amplitude.com/guides-surveys`
- Currently **no event tracking exists** for footer clicks
- Request: Add analytics to measure the effectiveness of this footer

## Current State

The footer is implemented in the `@amplitude/engagement-browser` package:

### Footer Implementation (Minified Code Analysis)
```javascript
// Opens the guides-surveys page
ov=()=>{window.open("https://app.amplitude.com/guides-surveys","_blank")}

// Footer component
WKe=({onClick:e})=>
  createElement(BKe,{onClick:e}, createElement(j6,null),"Powered by Amplitude")

// Rendered in guide steps
Fse=({step:e})=>{
  return organization.branding!=="branded"?
    createElement(Bk,{...style},createElement(nv,{onClick:()=>ov()}))
  :null
}
```

**Issue**: No analytics tracking when footer is clicked.

## Solution Approaches

### Option 1: Modify Source Code (Ideal)

**Status**: ⚠️ Source code repository not found in public Amplitude GitHub repos

The proper solution requires modifying the source code of `@amplitude/engagement-browser` to add event tracking:

```typescript
const openGuidesAndSurveysPage = (analytics) => {
  // Track the click event
  analytics?.track('Guides Footer Clicked', {
    destination_url: 'https://app.amplitude.com/guides-surveys',
    component: 'powered_by_footer',
    footer_text: 'Powered by Amplitude'
  });
  
  // Open the link  
  window.open("https://app.amplitude.com/guides-surveys", "_blank");
};
```

**Required**:
1. Access to `@amplitude/engagement-browser` source repository
2. Modify the footer click handler
3. Pass analytics instance to the handler
4. Build and deploy updated bundle to CDN
5. Publish new version to NPM

### Option 2: Client-Side Workaround (Interim Solution)

**Status**: ✅ Implemented in this repository

Since the source code is not accessible, a workaround solution using DOM event delegation has been created:

**File**: `guides-footer-tracking.js`

This solution:
- Uses event delegation to capture clicks on the footer
- Works with dynamically rendered guides/surveys
- Doesn't require modifying the engagement-browser source
- Can be deployed immediately

## Usage

### Basic Usage

```javascript
// Initialize Amplitude SDK
amplitude.init('YOUR_API_KEY');

// Enable footer tracking
window.AmplitudeGuidesFooterTracking.enableGuidesFooterTracking(amplitude);
```

### Advanced Usage with Custom Properties

```javascript
amplitude.init('YOUR_API_KEY');

window.AmplitudeGuidesFooterTracking.enableGuidesFooterTracking(amplitude, {
  eventName: 'Guides Footer Clicked',
  getProperties: function(footerElement) {
    return {
      destination_url: 'https://app.amplitude.com/guides-surveys',
      component: 'powered_by_footer',
      footer_text: footerElement.textContent.trim(),
      page_url: window.location.href,
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };
  }
});
```

### Using MutationObserver Approach

For better reliability with dynamically loaded content:

```javascript
const tracker = window.AmplitudeGuidesFooterTracking.enableGuidesFooterTrackingWithObserver(amplitude);

// Later, to stop tracking:
// tracker.disconnect();
```

## Event Schema

### Event Name
`Guides Footer Clicked`

### Event Properties
- `destination_url` (string): The URL that opens when clicked
- `component` (string): Always "powered_by_footer"
- `footer_text` (string): The footer text ("Powered by Amplitude")
- `guide_id` (string, optional): ID of the current guide
- `guide_type` (string, optional): Type of guide (modal, popover, pin, tooltip, banner)
- `organization_id` (string, optional): Organization ID
- `organization_branding` (string, optional): Branding setting
- `page_url` (string, optional): Current page URL

## Integration Points

### For Amplitude Internal Use (amplitude.com)

Add to your main application initialization:

```javascript
// After Amplitude SDK and Engagement SDK are initialized
if (window.amplitude && window.engagement) {
  const script = document.createElement('script');
  script.src = '/path/to/guides-footer-tracking.js';
  script.onload = function() {
    window.AmplitudeGuidesFooterTracking.enableGuidesFooterTracking(window.amplitude);
  };
  document.head.appendChild(script);
}
```

### For Guides & Surveys SDK Users

If you want to track footer clicks in your own implementation:

```html
<!-- Load Amplitude Analytics SDK -->
<script src="https://cdn.amplitude.com/libs/amplitude-8.21.10-min.gz.js"></script>

<!-- Load Engagement SDK -->
<script src="https://cdn.amplitude.com/engagement-browser/prod/index.min.js.gz"></script>

<!-- Load Footer Tracking Helper -->
<script src="guides-footer-tracking.js"></script>

<script>
  // Initialize
  amplitude.init('YOUR_API_KEY');
  window.engagement.init('YOUR_API_KEY');
  
  // Enable footer tracking
  window.AmplitudeGuidesFooterTracking.enableGuidesFooterTracking(amplitude);
</script>
```

## Testing

See `examples/guides-footer-tracking-example.html` for an interactive demo.

To test:
1. Open the example HTML file in a browser
2. Click "Simulate Guide with Footer"
3. Click on the simulated footer
4. Check browser console for tracking confirmation
5. Verify events in your Amplitude project

## Deployment

### Short-term (Workaround)
1. Deploy `guides-footer-tracking.js` to your CDN or web server
2. Include it in pages where guides/surveys are shown
3. Initialize tracking after Amplitude SDK loads

### Long-term (Proper Solution)
1. **Locate** the source repository for `@amplitude/engagement-browser`
2. **Modify** the footer click handler to include analytics tracking
3. **Test** across all guide form factors and configurations
4. **Deploy** updated bundle to CDN
5. **Publish** new npm package version
6. **Update** dependent applications

## Technical Notes

### Why DOM Event Delegation?

The engagement SDK dynamically renders guides/surveys, making it difficult to attach event handlers directly. Event delegation solves this by:
- Listening on document level (always available)
- Checking clicked elements for footer signatures
- Working regardless of when the footer is rendered

### Browser Compatibility

The solution works in all modern browsers that support:
- DOM Level 2 Events (`addEventListener`)
- `Element.closest()` (or with a polyfill)
- `MutationObserver` (for the observer approach)

### Performance Considerations

- Event delegation adds minimal overhead (single listener on document)
- Element matching uses fast text/attribute checks
- MutationObserver is throttled by the browser

## Limitations of Workaround

This client-side solution has some limitations:

1. **Timing**: Slight delay between SDK initialization and tracking activation
2. **Reliability**: Depends on DOM structure remaining consistent
3. **Maintenance**: May need updates if footer implementation changes
4. **Not in Source**: Tracking is not built into the SDK itself

**Recommendation**: Implement tracking directly in the `@amplitude/engagement-browser` source code for the most robust solution.

## Next Steps

1. ✅ Create workaround solution (this repository)
2. ⏳ Locate `@amplitude/engagement-browser` source repository
3. ⏳ Implement tracking in source code
4. ⏳ Deploy updated engagement-browser version
5. ⏳ Remove workaround once built-in tracking is available

## Questions?

Contact:
- SDK Team: sdk.dev@amplitude.com
- Engagement SDK Maintainers: See `npm info @amplitude/engagement-browser maintainers`

## Related Resources

- [Amplitude Guides & Surveys Docs](https://amplitude.com/docs/guides-and-surveys)
- [Guides & Surveys SDK](https://amplitude.com/docs/guides-and-surveys/sdk)
- [Amplitude JavaScript SDK](https://github.com/amplitude/Amplitude-JavaScript)
- [Amplitude TypeScript SDK](https://github.com/amplitude/Amplitude-TypeScript)
