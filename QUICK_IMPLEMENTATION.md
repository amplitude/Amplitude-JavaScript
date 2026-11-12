# Quick Implementation Guide

## For Immediate Deployment (Workaround Solution)

If you need to add footer click tracking **right now** without waiting for source code access:

### Step 1: Copy the tracking helper

Add `guides-footer-tracking.js` to your web application.

### Step 2: Add to your HTML (Option A - Simple)

```html
<!-- After Amplitude SDK initialization -->
<script src="https://cdn.amplitude.com/libs/amplitude-8.21.10-min.gz.js"></script>
<script src="/path/to/guides-footer-tracking.js"></script>

<script>
  // Initialize Amplitude
  amplitude.init('YOUR_API_KEY');
  
  // Enable footer tracking
  window.AmplitudeGuidesFooterTracking.enableGuidesFooterTracking(amplitude);
</script>
```

### Step 3: Add to your application code (Option B - Module)

```javascript
import amplitude from 'amplitude-js';
import { enableGuidesFooterTracking } from './guides-footer-tracking';

// Initialize
amplitude.getInstance().init('YOUR_API_KEY');

// Enable tracking
enableGuidesFooterTracking(amplitude.getInstance());
```

### Step 4: Verify tracking works

1. Open a guide/survey that shows the footer
2. Click "Powered by Amplitude"
3. Check browser console for: `[Guides Footer Tracking] Tracked footer click`
4. Verify event appears in Amplitude: Event name `Guides Footer Clicked`

## For Proper Implementation (Source Code Fix)

### Required: Access to Source Repository

The `@amplitude/engagement-browser` package source code needs to be located. Contact:
- **SDK Team**: sdk.dev@amplitude.com
- **Maintainers**: curtis@amplitude.com, nirmal@amplitude.com

### Once Source is Accessed:

1. **Find the footer component** (likely `PoweredByFooter.tsx` or similar)

2. **Locate the click handler** currently:
```typescript
const handleFooterClick = () => {
  window.open("https://app.amplitude.com/guides-surveys", "_blank");
};
```

3. **Add tracking** before opening:
```typescript
const handleFooterClick = () => {
  // Track the click
  analytics?.track('Guides Footer Clicked', {
    destination_url: 'https://app.amplitude.com/guides-surveys',
    component: 'powered_by_footer',
    footer_text: 'Powered by Amplitude',
  });
  
  // Open the link
  window.open("https://app.amplitude.com/guides-surveys", "_blank");
};
```

4. **Ensure analytics instance is available** in the component:
   - Pass it as a prop
   - Get it from context
   - Import from global state

5. **Build and deploy**:
```bash
# Build the package
npm run build

# Deploy to CDN
npm run deploy

# Publish to NPM
npm publish
```

6. **Update dependent applications** to use new version

## Event Schema

Once deployed, you'll see events with:

```json
{
  "event_type": "Guides Footer Clicked",
  "event_properties": {
    "destination_url": "https://app.amplitude.com/guides-surveys",
    "component": "powered_by_footer",
    "footer_text": "Powered by Amplitude",
    "guide_id": "123",
    "guide_type": "modal",
    "organization_id": "456"
  }
}
```

## Testing Checklist

- [ ] Footer appears in modals
- [ ] Footer appears in popovers
- [ ] Footer appears in pins
- [ ] Footer appears in banners
- [ ] Click opens correct URL
- [ ] Event tracked before window opens
- [ ] Event includes correct properties
- [ ] Works on branded orgs (footer hidden)
- [ ] Works on non-branded orgs (footer shown)
- [ ] Works in US and EU server zones
- [ ] No console errors
- [ ] No duplicate events

## Rollback Plan

If issues arise:
1. Revert to previous engagement-browser version
2. Remove workaround script if deployed
3. Investigate and fix
4. Redeploy with fixes

## Success Metrics

Track in Amplitude:
- Daily `Guides Footer Clicked` events
- Unique users clicking footer
- Conversion from footer click to guides-surveys page
- Footer click rate by organization type
- Footer click rate by guide type

## Timeline

- **Immediate** (< 1 hour): Deploy workaround solution
- **Short-term** (1-2 weeks): Locate source repository
- **Mid-term** (2-4 weeks): Implement in source code
- **Long-term** (4-6 weeks): Deploy built-in tracking, remove workaround
