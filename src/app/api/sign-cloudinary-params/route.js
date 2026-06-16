import { v2 as cloudinary } from 'cloudinary';

// Configureer Cloudinary SDK voor Node (server-side)
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  const body = await request.json();
  const { paramsToSign } = body;

  try {
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );
    return Response.json({ signature });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
