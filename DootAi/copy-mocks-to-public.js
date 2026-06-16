const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'ui-desgine', 'landing_page');
const destDir = path.join(__dirname, 'public', 'mocks');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const mockFiles = [
  { src: 'home.png', dest: 'home.png' },
  { src: 'feature.png', dest: 'feature.png' },
  { src: 'how it work .png', dest: 'how-it-work.png' },
  { src: 'price.png', dest: 'price.png' },
  { src: 'about.png', dest: 'about.png' }
];

mockFiles.forEach(file => {
  const srcPath = path.join(srcDir, file.src);
  const destPath = path.join(destDir, file.dest);
  try {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${file.src} -> public/mocks/${file.dest}`);
  } catch (err) {
    console.error(`Failed to copy ${file.src}:`, err.message);
  }
});
