# Footer Click Event Tracking - Technical Specification

## Overview
This document specifies the changes needed to track clicks on the "Powered by Amplitude" footer in Amplitude Guides & Surveys.

## Current Implementation

### Location
The footer is implemented in the `@amplitude/engagement-browser` package (version 1.0.8), which is served from:
- CDN: `https://cdn.amplitude.com/engagement-browser/prod/index.min.js.gz`
- NPM: `@amplitude/engagement-browser`

### Current Code (Minified)
The footer click handler is currently implemented as:

```javascript
ov=()=>{
  window.open("https://app.amplitude.com/guides-surveys","_blank")
}
```

The footer component:
```javascript
WKe=({onClick:e})=>
  eF.default.createElement(BKe,{onClick:e},
    eF.default.createElement(j6,null),
    "Powered by Amplitude"
  ),
nv=WKe
```

Footer usage in step:
```javascript
Fse=({step:e})=>{
  var r;
  return((r=te().organization)==null?void 0:r.branding)!=="branded"||!vh(e)?null:
  tF.default.createElement(Bk,{
    style:{
      justifyContent:"center",
      background:"none",
      padding:"0px var(--layout-padding) var(--layout-padding) var(--layout-padding)"
    }
  },tF.default.createElement(nv,{onClick:()=>ov()}))
}
```

## Required Changes

### Source Code Repository
The source code for `@amplitude/engagement-browser` needs to be located. This is likely in a private Amplitude repository. Possible locations:
- Private amplitude repository
- Internal Amplitude monorepo
- Separate engagement/houston/guides-surveys codebase

### Code Changes Needed

The `ov()` function (or its source equivalent) should be modified to track an event before opening the link:

**Before:**
```typescript
const openGuidesAndSurveysPage = () => {
  window.open("https://app.amplitude.com/guides-surveys", "_blank");
};
```

**After:**
```typescript
const openGuidesAndSurveysPage = (analytics) => {
  // Track the footer click event
  analytics?.track('Guides Footer Clicked', {
    destination_url: 'https://app.amplitude.com/guides-surveys',
    component: 'powered_by_footer',
    footer_text: 'Powered by Amplitude'
  });
  
  // Open the link
  window.open("https://app.amplitude.com/guides-surveys", "_blank");
};
```

### Integration Points

The analytics instance should be passed through the component tree or accessed from the global context. Based on the engagement-browser architecture:

1. The SDK already integrates with Amplitude Analytics via the plugin system
2. The `window.engagement` object has access to analytics integrations
3. The tracking can be added using the existing integration bridge

### Event Properties

Recommended event properties for the footer click:

```javascript
{
  event_type: 'Guides Footer Clicked',
  event_properties: {
    destination_url: 'https://app.amplitude.com/guides-surveys',
    component: 'powered_by_footer',
    footer_text: 'Powered by Amplitude',
    guide_id: [current guide ID if available],
    guide_type: [modal/popover/pin if available],
    organization_id: [organization ID if available]
  }
}
```

## Implementation Steps

1. **Locate Source Repository**
   - Find the source code repository for `@amplitude/engagement-browser`
   - This is not in the public amplitude/Amplitude-TypeScript repository
   - Likely in a private Amplitude repository

2. **Find Footer Component**
   - Look for the "Powered by Amplitude" footer component
   - Should be in a React/TypeScript file
   - Component likely named something like `PoweredByFooter`, `BrandingFooter`, or similar

3. **Add Event Tracking**
   - Import analytics tracking function
   - Add `track()` call before window.open()
   - Include relevant event properties

4. **Test Changes**
   - Verify event is sent to Amplitude
   - Confirm link still opens correctly
   - Test in different guide form factors (modal, popover, etc.)
   - Verify on branded vs non-branded organizations

5. **Deploy**
   - Build updated bundle
   - Deploy to CDN
   - Publish new version to NPM
   - Update version in dependent packages

## Related Files

Based on the investigation, these files in the Amplitude-TypeScript repository may need updates:
- `packages/unified/package.json` - Update `@amplitude/engagement-browser` version
- Integration examples and documentation

## Reference: Similar Click Tracking

The `@amplitude/plugin-autocapture-browser` package shows how Amplitude tracks clicks:

```typescript
// From packages/plugin-autocapture-browser/src/autocapture/track-click.ts
return clicks.subscribe((click: ElementBasedTimestampedEvent<ElementBasedEvent>) => {
  amplitude?.track(AMPLITUDE_ELEMENT_CLICKED_EVENT, click.targetElementProperties);
});
```

The same pattern should be applied to the footer click, but with a specific event name like `'Guides Footer Clicked'`.

## Next Steps

1. **Immediate**: Identify and access the source repository for `@amplitude/engagement-browser`
2. **Development**: Implement the tracking as specified above
3. **Testing**: Verify tracking works across all guide types and configurations
4. **Deployment**: Release new version and update dependencies

## Notes

- The footer only appears when organization branding is not set to "branded"
- The link currently opens to `https://app.amplitude.com/guides-surveys`
- The SDK already has analytics integration capabilities via the plugin system
- This tracking will help measure the effectiveness of the "Powered by Amplitude" footer in driving awareness
