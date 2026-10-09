# How to Fix PR Title - Required Action

## 🚨 Action Required: Update PR Title on GitHub

The PR title check is failing because the title doesn't follow the required conventional commit format.

### Current Title (Invalid ❌)
```
Amplitude footer click event
```

### Required Title Format
The title must start with one of these prefixes:
- `feat:` or `feat(<scope>):` - for new features
- `fix:` or `fix(<scope>):` - for bug fixes
- `docs:`, `test:`, `refactor:`, `style:`, `build:`, `ci:`, `chore:`, or `revert:`

### Recommended New Title ✅
```
feat(guides): track powered by amplitude footer clicks
```

Or without scope:
```
feat: track powered by amplitude footer clicks
```

### How to Update

1. **Go to the PR**: https://github.com/amplitude/Amplitude-JavaScript/pull/623

2. **Click "Edit"** next to the PR title at the top of the page

3. **Change the title** to: `feat(guides): track powered by amplitude footer clicks`

4. **Save** - The CI check will automatically re-run and pass

### Why This Matters

Amplitude uses semantic versioning based on PR titles:
- `feat:` prefix → triggers **minor version** release (e.g., 8.21.10 → 8.22.0)
- `fix:` prefix → triggers **patch version** release (e.g., 8.21.10 → 8.21.11)
- Other prefixes → no release triggered

This feature warrants a minor release since it adds new tracking functionality.

### Reference

See `.github/workflows/semantic-pr.yml` for the exact validation logic.
See `CONTRIBUTING.md` for full PR title conventions.

---

**Note**: I attempted to update the PR title automatically via `gh pr edit`, but received a permission error. This requires manual update through the GitHub web interface.
