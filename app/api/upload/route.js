import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get('file');
  const rawFolder = formData.get('folder') || 'uploads';

  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

  // Keep the folder to safe path characters (no "..", no leading/trailing slashes)
  const folder = String(rawFolder)
    .replace(/[^a-zA-Z0-9/_-]/g, '')
    .split('/')
    .filter(Boolean)
    .join('/') || 'uploads';

  const buffer = Buffer.from(await file.arrayBuffer());

  // Unlike Cloudinary, R2 serves objects by exact key, so keep the extension on everything.
  const ext = file.name?.includes('.')
    ? file.name.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '')
    : '';
  const key = `${folder}/${randomUUID()}${ext ? `.${ext}` : ''}`;

  try {
    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: file.type || 'application/octet-stream',
      })
    );

    return NextResponse.json({
      url: `${process.env.R2_PUBLIC_URL.replace(/\/$/, '')}/${key}`,
      publicId: key, // same shape as before; this is the object key
    });
  } catch (err) {
    console.error('R2 upload failed:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}