const sharp = require('sharp');
const path = require('path');

const imgPath = path.join(__dirname, 'ui-desgine', 'landing_page', 'home.png');

sharp(imgPath)
  .metadata()
  .then(metadata => {
    console.log('Image dimensions:', metadata.width, 'x', metadata.height, 'format:', metadata.format);
  })
  .catch(err => {
    console.error('Error reading metadata:', err);
  });
