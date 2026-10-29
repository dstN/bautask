// The same gate as lighthouserc.cjs, with Lighthouse's desktop preset.
const base = require('./lighthouserc.cjs');

module.exports = {
  ci: {
    ...base.ci,
    collect: { ...base.ci.collect, settings: { ...base.ci.collect.settings, preset: 'desktop' } },
    upload: { ...base.ci.upload, outputDir: '.lighthouseci/reports-desktop' },
  },
};
