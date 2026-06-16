const sharp = require('sharp');
const path = require('path');

const dir = path.join(__dirname, 'ui-desgine', 'landing_page');
const files = ['home.png', 'feature.png', 'how it work .png', 'price.png', 'about.png'];

async function checkSizes() {
  for (const file of files) {
    const imgPath = path.join(dir, file);
    try {
      const meta = await sharp(imgPath).metadata();
      console.log(`${file}: ${meta.width} x ${meta.height} (${meta.format})`);
    } catch (err) {
      console.error(`Error reading ${file}:`, err.message);
    }
  }
}

checkSizes();
