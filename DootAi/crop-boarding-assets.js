const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const srcDir = path.join(__dirname, 'ui-desgine', 'working _page', 'boarding');
const destDir = path.join(__dirname, 'public');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const crops = [
  {
    name: 'boarding_left_step1.png',
    src: '1-bording.png',
    crop: { left: 0, top: 0, width: 600, height: 1224 }
  },
  {
    name: 'boarding_left_step2.png',
    src: '2-bording.png',
    crop: { left: 0, top: 0, width: 580, height: 1118 }
  },
  {
    name: 'boarding_left_step3.png',
    src: '3-bording.png',
    crop: { left: 0, top: 0, width: 450, height: 1121 } // mascot-free left background
  },
  {
    name: 'boarding_left_step4.png',
    src: '4-boarding.png',
    crop: { left: 0, top: 0, width: 580, height: 1085 }
  },
  {
    name: 'boarding_left_step5.png',
    src: '5-boarding.png',
    crop: { left: 0, top: 0, width: 580, height: 1122 }
  },
  {
    name: 'boarding_step3_doot.png',
    src: '3-bording.png',
    crop: { left: 470, top: 185, width: 480, height: 280 } // Doot at desk illustration
  }
];

async function runCrop() {
  console.log('Starting onboarding assets crop...');
  for (const item of crops) {
    const srcPath = path.join(srcDir, item.src);
    const destPath = path.join(destDir, item.name);
    try {
      await sharp(srcPath)
        .extract(item.crop)
        .toFile(destPath);
      console.log(`Successfully cropped and saved: ${item.name} (${item.crop.width}x${item.crop.height})`);
    } catch (err) {
      console.error(`Failed to crop ${item.name}:`, err.message);
    }
  }
  console.log('Onboarding assets crop complete.');
}

runCrop();
