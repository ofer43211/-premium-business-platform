/**
 * Merge Coverage Reports from all packages
 * Combines Jest coverage from web, mobile, api, and shared packages
 */
const fs = require('fs');
const path = require('path');

const PACKAGES = ['web', 'mobile', 'api', 'shared'];
const COVERAGE_DIR = path.join(__dirname, '..', 'coverage');
const PACKAGES_DIR = path.join(__dirname, '..', 'packages');

function mergeCoverage() {
  console.log('📊 Merging coverage reports...\n');

  const mergedCoverage = {
    total: {
      statements: { total: 0, covered: 0, skipped: 0, pct: 0 },
      branches: { total: 0, covered: 0, skipped: 0, pct: 0 },
      functions: { total: 0, covered: 0, skipped: 0, pct: 0 },
      lines: { total: 0, covered: 0, skipped: 0, pct: 0 },
    },
    packages: {},
  };

  let packagesProcessed = 0;

  PACKAGES.forEach(pkg => {
    const summaryPath = path.join(
      PACKAGES_DIR,
      pkg,
      'coverage',
      'coverage-summary.json'
    );

    if (!fs.existsSync(summaryPath)) {
      console.log(`⚠️  No coverage found for ${pkg}`);
      return;
    }

    const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
    const total = summary.total;

    mergedCoverage.packages[pkg] = total;

    // Add to merged totals
    ['statements', 'branches', 'functions', 'lines'].forEach(metric => {
      mergedCoverage.total[metric].total += total[metric].total;
      mergedCoverage.total[metric].covered += total[metric].covered;
      mergedCoverage.total[metric].skipped += total[metric].skipped;
    });

    packagesProcessed++;
    console.log(`✅ Processed ${pkg}: ${total.statements.pct}% statements`);
  });

  if (packagesProcessed === 0) {
    console.error('❌ No coverage reports found');
    process.exit(1);
  }

  // Calculate percentages
  ['statements', 'branches', 'functions', 'lines'].forEach(metric => {
    const { total, covered } = mergedCoverage.total[metric];
    mergedCoverage.total[metric].pct = total > 0 ? (covered / total) * 100 : 0;
  });

  // Create coverage directory if it doesn't exist
  if (!fs.existsSync(COVERAGE_DIR)) {
    fs.mkdirSync(COVERAGE_DIR, { recursive: true });
  }

  // Write merged coverage
  const outputPath = path.join(COVERAGE_DIR, 'coverage-summary.json');
  fs.writeFileSync(outputPath, JSON.stringify(mergedCoverage, null, 2));

  // Print summary
  console.log('\n📈 Coverage Summary:\n');
  console.log('┌─────────────┬──────────┬──────────┬───────────┬───────┐');
  console.log('│ Package     │ Stmts    │ Branches │ Functions │ Lines │');
  console.log('├─────────────┼──────────┼──────────┼───────────┼───────┤');

  PACKAGES.forEach(pkg => {
    if (mergedCoverage.packages[pkg]) {
      const cov = mergedCoverage.packages[pkg];
      console.log(
        `│ ${pkg.padEnd(11)} │ ${formatPct(cov.statements.pct)} │ ${formatPct(cov.branches.pct)} │ ${formatPct(cov.functions.pct)} │ ${formatPct(cov.lines.pct)} │`
      );
    }
  });

  console.log('├─────────────┼──────────┼──────────┼───────────┼───────┤');
  const total = mergedCoverage.total;
  console.log(
    `│ ${'TOTAL'.padEnd(11)} │ ${formatPct(total.statements.pct)} │ ${formatPct(total.branches.pct)} │ ${formatPct(total.functions.pct)} │ ${formatPct(total.lines.pct)} │`
  );
  console.log('└─────────────┴──────────┴──────────┴───────────┴───────┘\n');

  // Check thresholds
  const thresholds = {
    statements: 75,
    branches: 70,
    functions: 75,
    lines: 75,
  };

  let failed = false;
  Object.keys(thresholds).forEach(metric => {
    const actual = total[metric].pct;
    const threshold = thresholds[metric];
    const status = actual >= threshold ? '✅' : '❌';
    console.log(
      `${status} ${metric.padEnd(12)}: ${actual.toFixed(2)}% (threshold: ${threshold}%)`
    );
    if (actual < threshold) {
      failed = true;
    }
  });

  if (failed) {
    console.log('\n❌ Coverage thresholds not met\n');
    process.exit(1);
  } else {
    console.log('\n✅ All coverage thresholds met!\n');
  }
}

function formatPct(pct) {
  const formatted = pct.toFixed(2) + '%';
  return formatted.padStart(8);
}

mergeCoverage();
