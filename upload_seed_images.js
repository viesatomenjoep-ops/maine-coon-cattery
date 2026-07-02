const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

const env = fs.readFileSync('.env.local', 'utf8');

const cloudName = env.match(/NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=(.*)/)[1].trim();
const apiKey = env.match(/CLOUDINARY_API_KEY=(.*)/)[1].trim();
const apiSecret = env.match(/CLOUDINARY_API_SECRET=(.*)/)[1].trim();

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

const images = [
  'adult_fluffy.png',
  'adult_regal.png',
  'adult_smoke.png',
  'junior_garden.png',
  'junior_window.png',
  'kitten_castor.png',
  'kitten_curious.png',
  'kitten_lyra.png',
  'kitten_playful.png',
  'kitten_pollux.png',
  'kitten_sleepy.png',
  'kitten_vega.png',
  'kittens_basket.png',
  'litter_terrace.png',
  'mother_kittens.png'
];

async function uploadImages() {
  for (const img of images) {
    const imgPath = path.join(__dirname, 'public', 'images', img);
    if (fs.existsSync(imgPath)) {
      try {
        const result = await cloudinary.uploader.upload(imgPath, {
          folder: 'maine_coon_cattery'
        });
        console.log(`✅ Opgeslagen in Cloudinary: ${img} -> ${result.secure_url}`);
      } catch (error) {
        console.error(`❌ Fout bij uploaden ${img}:`, error.message);
      }
    } else {
      console.error(`⚠️ Bestand niet gevonden: ${imgPath}`);
    }
  }
}

uploadImages();
