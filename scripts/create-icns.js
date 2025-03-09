const sharp = require('sharp');
const path = require('path');
const { execSync } = require('child_process');

async function createIconSet() {
  const sizes = {
    '16x16': '16',
    '16x16@2x': '32',
    '32x32': '32',
    '32x32@2x': '64',
    '128x128': '128',
    '128x128@2x': '256',
    '256x256': '256',
    '256x256@2x': '512',
    '512x512': '512',
    '512x512@2x': '1024'
  };

  const svg = `
    <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <rect width="512" height="512" fill="none"/>
      <path d="M128 156h256M256 156v200" stroke="black" stroke-width="32" stroke-linecap="round"/>
    </svg>
  `;

  try {
    // 각 크기별 PNG 생성
    for (const [name, size] of Object.entries(sizes)) {
      await sharp(Buffer.from(svg))
        .resize(parseInt(size), parseInt(size))
        .png()
        .toFile(path.join(__dirname, `../assets/icon.iconset/icon_${name}.png`));
      
      console.log(`Created icon_${name}.png`);
    }

    // iconutil을 사용하여 .icns 파일 생성
    execSync('iconutil -c icns assets/icon.iconset -o assets/IconTemplate.icns');
    console.log('Created IconTemplate.icns');

  } catch (error) {
    console.error('Error creating icons:', error);
  }
}

createIconSet(); 