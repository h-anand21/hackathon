const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\ACER\\.gemini\\antigravity-ide\\brain\\8d234fbe-df63-4b6a-aba5-d3d6e13e117b';
const destDir = 'e:\\Hack-full-stack\\dootai\\public';

const files = {
  'doot_mascot_1781608531237.png': 'doot_mascot.png',
  'japanese_landscape_1781608550203.png': 'japanese_landscape.png',
  'bonsai_footer_1781608566741.png': 'bonsai_footer.png'
};

for (const [srcName, destName] of Object.entries(files)) {
  const srcPath = path.join(srcDir, srcName);
  const destPath = path.join(destDir, destName);
  try {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Successfully copied ${srcName} to ${destName}`);
  } catch (err) {
    console.error(`Failed to copy ${srcName}:`, err.message);
  }
}
