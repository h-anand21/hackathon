const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const srcImage = path.join(__dirname, 'ui-desgine', 'landing_page', 'home.png');
const destDir = path.join(__dirname, 'public');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Bounding boxes for each asset to crop from home.png (1205 x 1305)
const assets = [
  {
    name: 'less_busywork_banner.png',
    crop: { left: 50, top: 615, width: 1105, height: 100 } // torn-edge banner
  },
  {
    name: 'bonsai_footer.png',
    crop: { left: 5, top: 1195, width: 125, height: 105 } // bonsai tree
  },
  {
    name: 'hanko_stamp_focus.png',
    crop: { left: 1070, top: 1215, width: 85, height: 85 } // corrected red hanko focus stamp (集中)
  },
  {
    name: 'hanko_logo.png',
    crop: { left: 60, top: 20, width: 62, height: 62 } // top left DootAI logo stamp
  },
  {
    name: 'connect_arrow.png',
    crop: { left: 415, top: 345, width: 45, height: 45 } // hand-drawn arrow next to Google button
  },
  {
    name: 'bamboo_decor.png',
    crop: { left: 1135, top: 560, width: 70, height: 640 } // bamboo decorations on the right side
  },
  // Feature Illustrations
  {
    name: 'illustration_inbox.png',
    crop: { left: 95, top: 725, width: 210, height: 105 }
  },
  {
    name: 'illustration_scheduler.png',
    crop: { left: 360, top: 725, width: 210, height: 105 }
  },
  {
    name: 'illustration_writer.png',
    crop: { left: 625, top: 725, width: 210, height: 105 }
  },
  {
    name: 'illustration_search.png',
    crop: { left: 890, top: 725, width: 210, height: 105 }
  },
  {
    name: 'illustration_actions.png',
    crop: { left: 95, top: 975, width: 210, height: 105 }
  },
  {
    name: 'illustration_tasks.png',
    crop: { left: 360, top: 975, width: 210, height: 105 }
  },
  {
    name: 'illustration_briefing.png',
    crop: { left: 625, top: 975, width: 210, height: 105 }
  },
  {
    name: 'illustration_updates.png',
    crop: { left: 890, top: 975, width: 210, height: 105 }
  }
];

async function runCrop() {
  console.log(`Starting clean crop from ${srcImage}...`);
  
  // 1. First crop standard assets
  for (const asset of assets) {
    const destPath = path.join(destDir, asset.name);
    try {
      await sharp(srcImage)
        .extract(asset.crop)
        .toFile(destPath);
      console.log(`Cropped and saved: ${asset.name} (${asset.crop.width}x${asset.crop.height})`);
    } catch (err) {
      console.error(`Failed to crop ${asset.name}:`, err.message);
    }
  }

  // 2. Perform the advanced seamless paper patching for hero_illustration.png
  try {
    const heroDestPath = path.join(destDir, 'hero_illustration.png');
    
    // Crop a piece of clean, empty paper texture from the top-middle area of the mockup (completely text-free)
    const paperPatchBuffer = await sharp(srcImage)
      .extract({ left: 200, top: 120, width: 75, height: 180 })
      .toBuffer();
      
    // Crop the hero illustration, and composite the empty textured paper over the left edge to mask the "t!" text leak
    await sharp(srcImage)
      .extract({ left: 470, top: 65, width: 730, height: 530 })
      .composite([{
        input: paperPatchBuffer,
        top: 80,
        left: 0
      }])
      .toFile(heroDestPath);
      
    console.log('Cropped and saved: hero_illustration.png (730x530) [Seamless textured paper patching applied]');
  } catch (err) {
    console.error('Failed to crop hero_illustration.png with seamless patch:', err.message);
  }

  console.log('All cropping operations completed.');
}

runCrop();
