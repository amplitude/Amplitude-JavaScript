# Solution Summary: Guides Footer Click Tracking

## Task
Track clicks on the "Powered by Amplitude" footer in Amplitude Guides & Surveys to measure the effectiveness of this marketing touchpoint.

## Challenge
The footer is implemented in the `@amplitude/engagement-browser` package, which is:
- **Not open source** - Source code not available in public Amplitude GitHub repositories
- **Served from CDN** - Compiled bundle at `https://cdn.amplitude.com/engagement-browser/prod/index.min.js.gz`
- **Private repository** - Likely in an internal Amplitude codebase

## Investigation Summary

Searched the following locations without finding source code:
- ✗ amplitude/Amplitude-JavaScript
- ✗ amplitude/Amplitude-TypeScript (uses engagement-browser as external dependency)
- ✗ amplitude/Amplitude-Engagement-Swift (iOS only)
- ✗ All public Amplitude GitHub repositories (100+ repos checked)
- ✗ NPM package (contains only compiled code)
- ✗ Houston GitHub organization (unrelated project)

## Solution Delivered

Since the source code is inaccessible, I've created a **workaround solution** that can be deployed immediately:

### Files Created

1. **`guides-footer-tracking.js`**
   - Client-side tracking helper using DOM event delegation
   - Works with dynamically rendered guides/surveys
   - Can be deployed without modifying engagement-browser source

2. **`FOOTER_TRACKING_README.md`**
   - Complete documentation
   - Usage instructions
   - Integration examples
   - Event schema specification

3. **`FOOTER_CLICK_TRACKING_SPEC.md`**
   - Technical specification
   - Analysis of compiled code
   - Required changes for proper source code fix

4. **`examples/guides-footer-tracking-example.html`**
   - Interactive demo
   - Shows how tracking works
   - Testing interface

5. **`test/guides-footer-tracking.test.js`**
   - Unit tests for tracking functionality
   - Integration tests
   - Property extraction tests

## How It Works

The workaround solution:

1. **Listens** for clicks on document using event delegation
2. **Identifies** footer elements by text content and link destination
3. **Tracks** event with properties before link opens
4. **Continues** normal footer behavior (opens link)

```javascript
// Simple integration
amplitude.init('YOUR_API_KEY');
window.AmplitudeGuidesFooterTracking.enableGuidesFooterTracking(amplitude);
```

## Event Tracked

**Event Name**: `Guides Footer Clicked`

**Properties**:
- `destination_url`: "https://app.amplitude.com/guides-surveys"
- `component`: "powered_by_footer"
- `footer_text`: "Powered by Amplitude"
- `guide_id`: (if available)
- `guide_type`: modal/popover/pin/etc (if available)
- `organization_id`: (if available)

## Deployment Options

### Option A: Immediate Workaround (This Solution)
- Deploy `guides-footer-tracking.js` to Amplitude's web infrastructure
- Include in pages that show guides/surveys
- Works immediately without SDK changes

### Option B: Proper Source Fix (Recommended)
- Access `@amplitude/engagement-browser` source repository
- Modify footer click handler to include tracking
- Build and deploy updated SDK version
- More reliable and maintainable

## Recommendations

1. **Short-term**: Deploy the workaround solution provided in this repository
2. **Long-term**: Implement tracking directly in the engagement-browser source code
3. **Immediate action needed**: Locate and access the `@amplitude/engagement-browser` source repository

## Source Code Changes Needed

When source repository is accessed, modify the footer click handler:

**Current** (from minified code analysis):
```javascript
ov=()=>{window.open("https://app.amplitude.com/guides-surveys","_blank")}
```

**Should be**:
```javascript
ov=(analytics)=>{
  analytics?.track('Guides Footer Clicked', {
    destination_url: 'https://app.amplitude.com/guides-surveys',
    component: 'powered_by_footer',
    footer_text: 'Powered by Amplitude'
  });
  window.open("https://app.amplitude.com/guides-surveys","_blank");
}
```

## Success Metrics

Once deployed, monitor:
- `Guides Footer Clicked` event volume
- Conversion from footer click to guides-surveys page visits
- Engagement with guides after footer clicks
- Attribution of new leads/signups to footer clicks

## Status

- ✅ Investigation complete
- ✅ Workaround solution implemented
- ✅ Documentation created
- ✅ Tests written
- ✅ Example created
- ⏳ **Pending**: Access to source repository for proper fix
- ⏳ **Pending**: Deployment of workaround
- ⏳ **Pending**: Source code modification

## Contact

For questions or to access the source repository:
- Engagement SDK maintainers: curtis@amplitude.com, nirmal@amplitude.com
- SDK Team: sdk.dev@amplitude.com
