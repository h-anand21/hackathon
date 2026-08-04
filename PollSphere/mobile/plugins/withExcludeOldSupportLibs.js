const { withProjectBuildGradle, withAppBuildGradle } = require('@expo/config-plugins');

// Fix: Duplicate class android.support.* vs androidx.*
// Caused by: com.android.support:support-compat:25.3.1 (from solana-mobile via clerk-js)
// conflicting with androidx.core:core:1.17.0
const withExcludeOldSupportLibs = (config) => {
  // Patch root android/build.gradle — add exclusion inside allprojects block
  config = withProjectBuildGradle(config, (mod) => {
    if (mod.modResults.contents.includes('exclude group: \'com.android.support\'')) {
      return mod;
    }
    // Try inserting after allprojects { (handles different whitespace)
    const patched = mod.modResults.contents.replace(
      /(allprojects\s*\{)/,
      `$1\n    configurations.all {\n        exclude group: 'com.android.support'\n    }`
    );
    // If regex didn't match, append at end of file as standalone block
    if (patched === mod.modResults.contents) {
      mod.modResults.contents += `\nconfigurations.all {\n    exclude group: 'com.android.support'\n}\n`;
    } else {
      mod.modResults.contents = patched;
    }
    return mod;
  });

  // Also patch app/build.gradle for extra safety
  config = withAppBuildGradle(config, (mod) => {
    if (mod.modResults.contents.includes('exclude group: \'com.android.support\'')) {
      return mod;
    }
    mod.modResults.contents = mod.modResults.contents.replace(
      /(android\s*\{)/,
      `configurations.all {\n    exclude group: 'com.android.support'\n}\n\n$1`
    );
    return mod;
  });

  return config;
};

module.exports = withExcludeOldSupportLibs;
