## 📝 Description
<!-- Provide a detailed description of your changes -->

## 🎯 Type of Change
<!-- Check the relevant option(s) -->
- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📝 Documentation update
- [ ] 🎨 Style/UI update (no functional changes)
- [ ] ♻️ Refactoring (no functional changes)
- [ ] ⚡ Performance improvement
- [ ] 🧪 Test update
- [ ] 🔧 Configuration change

## 🔗 Related Issue(s)
<!-- Link related issues -->
Closes #(issue number)
Related to #(issue number)

## 🧪 Testing
<!-- Describe the tests you ran and how to reproduce -->

### Test Coverage
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated
- [ ] All tests passing locally
- [ ] Coverage meets requirements (see below)

**Coverage Results:**
```
Statements   : XX% ( YYY/ZZZ )
Branches     : XX% ( YYY/ZZZ )
Functions    : XX% ( YYY/ZZZ )
Lines        : XX% ( YYY/ZZZ )
```

### How to Test
1. Step 1
2. Step 2
3. Expected result

## 📸 Screenshots/Videos
<!-- If applicable, add screenshots or videos to demonstrate the changes -->

### Before
<!-- Screenshot/description of behavior before changes -->

### After
<!-- Screenshot/description of behavior after changes -->

## ✅ Checklist
<!-- Check all that apply -->

### Code Quality
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings or errors
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published

### Testing Requirements
- [ ] Coverage meets minimum thresholds
  - [ ] Overall: 75%+ (statements/functions/lines), 70%+ (branches)
  - [ ] Critical paths (billing, auth): 90%+
  - [ ] Payment/Stripe: 95%+
- [ ] All test suites passing
  - [ ] `npm test` passes
  - [ ] `npm run test:e2e` passes (if applicable)
  - [ ] Security rules tests pass (if applicable)
- [ ] No regressions in existing tests

### Security & Performance
- [ ] No security vulnerabilities introduced
- [ ] No sensitive data exposed
- [ ] Performance impact considered and acceptable
- [ ] Firestore security rules updated (if applicable)
- [ ] API rate limiting considered (if applicable)

### Documentation
- [ ] README updated (if needed)
- [ ] TESTING.md updated (if test changes)
- [ ] API documentation updated (if applicable)
- [ ] Comments added to complex code
- [ ] Type definitions added/updated

### Deployment
- [ ] Environment variables documented in `.env.example`
- [ ] Database migrations included (if applicable)
- [ ] Backward compatible or migration path provided
- [ ] Rollback plan considered

## 🔄 Breaking Changes
<!-- Describe any breaking changes and migration steps -->
- [ ] This PR contains breaking changes

**Breaking Changes:**
- Change 1: Description and migration steps
- Change 2: Description and migration steps

## 📋 Additional Notes
<!-- Any additional information that reviewers should know -->

## 🎯 Reviewer Focus Areas
<!-- Specific areas where you'd like reviewer attention -->
- [ ] Logic in `file.ts:lineNumber`
- [ ] Performance of `function()`
- [ ] Security implications of `feature`
- [ ] Test coverage of `component`

## 📚 References
<!-- Links to relevant documentation, discussions, or resources -->
- Design doc:
- Related PRs:
- External references:

---

**For Reviewers:**
- [ ] Code reviewed for quality and best practices
- [ ] Tests reviewed and adequate
- [ ] Documentation reviewed and clear
- [ ] Security implications considered
- [ ] Performance impact acceptable
- [ ] Ready to merge
