const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const dir = path.join(__dirname, 'ui-desgine', 'working _page', 'boarding');
const files = ['1-bording.png', '2-bording.png', '3-bording.png', '4-boarding.png', '5-boarding.png'];
const outFile = path.join(__dirname, 'boarding-info.txt');

async function inspect() {
  let output = '';
  for (const file of files) {
    const imgPath = path.join(dir, file);
    try {
      const meta = await sharp(imgPath).metadata();
      output += `${file}: ${meta.width} x ${meta.height} (${meta.format})\n`;
    } catch (err) {
      output += `Error reading ${file}: ${err.message}\n`;
    }
  }
  fs.writeFileSync(outFile, output);
  console.log('Inspection complete. Info written to boarding-info.txt');
}

inspect();
