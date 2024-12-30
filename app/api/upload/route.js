// app/api/upload/route.js
import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' }, 
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const filename = `${Date.now()}_${file.name}`;
    const path = join(process.cwd(), 'public/uploads', filename);

    // Save file
    await writeFile(path, buffer);

    // Return the file URL
    return NextResponse.json({
      success: true,
      url: `/uploads/${filename}`
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'File upload failed' }, 
      { status: 500 }
    );
  }
}