// Lighthouse CI gate (after rntm.de): 100 in all four categories on every built page, median of five runs.
// This file is the mobile run; lighthouserc.desktop.cjs reuses it with the desktop preset. `npm run lhci` runs both.
// Locally Chrome is found through CHROME_PATH; CI uses the runner's Chrome.
const gate = ['error', { minScore: 1, aggregationMethod: 'median-run' }];

module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      numberOfRuns: 5,
      maxAutodiscoverUrls: 0,
      settings: {
        chromeFlags: process.getuid && process.getuid() === 0 ? ['--no-sandbox'] : [],
        // Every page says noindex on purpose (an application, not a page to be found), which this one audit counts
        // against SEO. It is left out; every other SEO audit still has to pass for the 100.
        skipAudits: ['is-crawlable'],
      },
    },
    assert: {
      assertions: {
        'categories:performance': gate,
        'categories:accessibility': gate,
        'categories:best-practices': gate,
        'categories:seo': gate,
      },
    },
    upload: { target: 'filesystem', outputDir: '.lighthouseci/reports' },
  },
};
