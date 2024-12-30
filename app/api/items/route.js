// app/api/items/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/db';
import Item from '@/app/models/Item';

export async function GET() {
  try {
    await dbConnect();
    const items = await Item.find({});
    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    await dbConnect();
    const item = await Item.create(body);
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}