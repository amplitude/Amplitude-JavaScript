# ⚠️ ACTION REQUIRED: Footer Click Tracking Implementation

## Summary

This branch contains a **working workaround solution** for tracking clicks on the "Powered by Amplitude" footer in Guides & Surveys. However, the **proper long-term fix** requires access to the source repository for `@amplitude/engagement-browser`, which is not publicly available.

## What's Been Delivered

✅ **Workaround Solution** (`guides-footer-tracking.js`)
- DOM event delegation-based tracking
- Works without modifying engagement-browser source
- Can be deployed immediately
- Full documentation included

✅ **Documentation**
- `FOOTER_TRACKING_README.md` - Complete usage guide
- `QUICK_IMPLEMENTATION.md` - Step-by-step deployment
- `FOOTER_CLICK_TRACKING_SPEC.md` - Technical specifications
- `SOLUTION_SUMMARY.md` - Investigation summary

✅ **Examples & Tests**
- `examples/guides-footer-tracking-example.html` - Interactive demo
- `test/guides-footer-tracking.test.js` - Unit tests

## What's Missing

❌ **Source Repository Access**

The source code for the `@amplitude/engagement-browser` package could not be located in:
- amplitude/Amplitude-JavaScript
- amplitude/Amplitude-TypeScript
- Any public Amplitude GitHub repository
- NPM package (contains only compiled code)

The footer UI code is served from `https://cdn.amplitude.com/engagement-browser/prod/index.min.js.gz` but the source repository is private or not publicly accessible.

## IMMEDIATE ACTIONS REQUIRED

### Action 1: Deploy Workaround (Quick Fix)

**Who**: DevOps / Web Team
**Timeline**: Immediate (< 1 day)
**Steps**:
1. Copy `guides-footer-tracking.js` to Amplitude's web application
2. Include in pages that use guides/surveys
3. Initialize after Amplitude SDK loads
4. Verify events appear in Amplitude

**Code to add**:
```html
<script src="/static/guides-footer-tracking.js"></script>
<script>
  window.AmplitudeGuidesFooterTracking.enableGuidesFooterTracking(amplitude);
</script>
```

### Action 2: Locate Source Repository

**Who**: Engineering Manager / SDK Team Lead
**Timeline**: Urgent (< 1 week)
**Required**:
- Identify where `@amplitude/engagement-browser` source code is maintained
- Grant access to engineer implementing the fix
- Possible locations:
  - Private Amplitude GitHub repository
  - Internal GitLab/Bitbucket
  - Separate engagement/houston codebase
  - Third-party vendor code

**Contact**:
- SDK maintainers: curtis@amplitude.com, nirmal@amplitude.com, sdk.dev@amplitude.com
- Search internal docs/wikis for "engagement-browser", "houston", "guides-surveys"

### Action 3: Implement Proper Fix

**Who**: Engagement SDK Engineer
**Timeline**: Short-term (1-2 weeks after source access)
**Required**:
1. Access to source repository (from Action 2)
2. Modify footer click handler to add tracking
3. Build and deploy updated bundle
4. Publish new npm version
5. Remove workaround

**Specific change needed**:
```typescript
// In the footer component (e.g., PoweredByFooter.tsx)
const handleClick = () => {
  // ADD THIS:
  analytics?.track('Guides Footer Clicked', {
    destination_url: 'https://app.amplitude.com/guides-surveys',
    component: 'powered_by_footer',
    footer_text: 'Powered by Amplitude',
  });
  
  // EXISTING:
  window.open("https://app.amplitude.com/guides-surveys", "_blank");
};
```

## Decision Points

### Should we deploy the workaround?

**YES, if**:
- You need tracking data immediately
- Source repository location unclear
- Low risk of conflict with future SDK updates

**NO, if**:
- Source repository access is imminent (< 1 week)
- Prefer to wait for proper fix
- Concerns about maintenance overhead

### How long to keep the workaround?

**Remove workaround when**:
- ✅ Proper tracking is implemented in engagement-browser source
- ✅ New version deployed to CDN
- ✅ New version adopted by Amplitude web application
- ✅ Verified events are tracked correctly
- ✅ Workaround script removed from deployment

## Success Criteria

### Workaround Success
- [ ] Script deployed to production
- [ ] Events appearing in Amplitude
- [ ] No console errors
- [ ] Footer still opens correct link

### Proper Fix Success  
- [ ] Source repository located
- [ ] Tracking added to source code
- [ ] New version published
- [ ] Events tracked from built-in code
- [ ] Workaround removed
- [ ] No regression in functionality

## Risk Assessment

### Workaround Risks
- **Low**: Script adds minimal overhead
- **Low**: Uses standard DOM APIs
- **Medium**: May need updates if footer structure changes
- **Low**: Easy to remove when proper fix is ready

### No Tracking Risks
- **High**: Missing valuable product analytics
- **High**: Can't measure footer effectiveness
- **Medium**: Marketing impact unmeasured

**Recommendation**: Deploy workaround immediately while pursuing proper fix.

## Questions?

**For implementation help**:
- See `QUICK_IMPLEMENTATION.md`
- Check `FOOTER_TRACKING_README.md`
- Review example in `examples/guides-footer-tracking-example.html`

**For source code access**:
- Contact SDK team (sdk.dev@amplitude.com)
- Check with Engineering Manager
- Search internal docs for "engagement-browser" or "houston"

**For tracking questions**:
- Product team: Olly Smyth, lucas.h (from Slack thread)
- Check #guides-and-surveys-product-feedback channel

## Files in This Branch

1. `guides-footer-tracking.js` - Main tracking helper (workaround)
2. `FOOTER_TRACKING_README.md` - Complete documentation
3. `QUICK_IMPLEMENTATION.md` - Quick start guide
4. `FOOTER_CLICK_TRACKING_SPEC.md` - Technical specification
5. `SOLUTION_SUMMARY.md` - Investigation findings
6. `ACTION_REQUIRED.md` - This file
7. `examples/guides-footer-tracking-example.html` - Interactive demo
8. `test/guides-footer-tracking.test.js` - Unit tests

## Next Step

**CHOOSE ONE**:

**Option A - Quick Deploy** (Recommended)
→ Follow `QUICK_IMPLEMENTATION.md` to deploy workaround today

**Option B - Wait for Proper Fix**
→ Complete "Action 2" above to locate source, then "Action 3" to implement

**Option C - Both** (Best)
→ Deploy workaround now + implement proper fix in parallel
