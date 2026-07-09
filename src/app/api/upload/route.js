import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
        },
      }
    );
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Je moet ingelogd zijn om bestanden te uploaden.' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({ error: 'No file received.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: formData.get('folder') || 'cattery_media', resource_type: 'auto' },
        function (error, result) {
          if (error) {
            reject(error);
            return;
          }
          resolve(result);
        }
      ).end(buffer);
    });

    return NextResponse.json({
      url: result.secure_url,
      public_id: result.public_id,
      resource_type: result.resource_type,
      format: result.format,
      bytes: result.bytes,
      original_filename: result.original_filename,
      mime_type: file.type || (result.format ? `${result.resource_type}/${result.format}` : null),
    });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
