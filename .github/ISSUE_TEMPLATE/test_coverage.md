---
name: Test Coverage Improvement
about: Suggest improvements to test coverage
title: '[TEST] '
labels: testing
assignees: ''

---

## 📊 Current Coverage
<!-- What's the current test coverage for this area? -->
- **File/Module**:
- **Current Coverage**: XX%
- **Target Coverage**: YY%

## 🎯 Areas Needing Tests
<!-- List specific areas that need test coverage -->
- [ ] Component/Function 1
- [ ] Component/Function 2
- [ ] Edge case: ...
- [ ] Error handling: ...

## 🧪 Test Types Needed
<!-- Check all that apply -->
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Security tests
- [ ] Performance tests

## 📝 Scenarios to Test
<!-- List specific scenarios -->
1. Happy path:
2. Error case:
3. Edge case:
4. Boundary condition:

## 🔍 Uncovered Code Paths
<!-- Highlight specific code paths not covered -->

```typescript
// Example code that needs testing
function exampleFunction() {
  // This branch is not tested
  if (condition) {
    // ...
  }
}
```

## 📋 Related Files
<!-- List related files that need testing -->
- `packages/web/src/...`
- `packages/api/src/...`

## 🎯 Priority
- [ ] Critical (95% coverage required)
- [ ] High (80-90% coverage)
- [ ] Medium (70% coverage)
- [ ] Low (60% coverage)
