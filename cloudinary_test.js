#!/usr/bin/env node

const cloudinary = require('cloudinary').v2;

// 1. Configure Cloudinary
cloudinary.config({
  cloud_name: 'dyf5158qn',
  api_key: '754793318694128',
  api_secret: 'HHvmNXvnIajuF6eTUQd3uXyeuu4'
});

async function run() {
  try {
    // 2. Upload an image
    console.log("Uploading image...");
    const uploadResult = await cloudinary.uploader.upload(
      'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      { public_id: 'test_sample' }
    );
    console.log("Upload successful!");
    console.log("Secure URL:", uploadResult.secure_url);
    console.log("Public ID:", uploadResult.public_id);
    
    // 3. Get image details
    console.log("\nImage details:");
    console.log("Width:", uploadResult.width);
    console.log("Height:", uploadResult.height);
    console.log("Format:", uploadResult.format);
    console.log("File size (bytes):", uploadResult.bytes);
    
    // 4. Transform the image
    // f_auto: Automatically formats the image to the most efficient format based on the requesting browser
    // q_auto: Automatically adjusts the image quality to balance visual quality and file size
    const transformedUrl = cloudinary.url(uploadResult.public_id, {
      fetch_format: 'auto',
      quality: 'auto'
    });
    
    console.log("\nDone! Click link below to see optimized version of the image. Check the size and the format.");
    console.log(transformedUrl);

  } catch (error) {
    console.error("An error occurred:", error);
  }
}

run();
