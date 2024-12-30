import { NextResponse } from 'next/server';
import dbConnect from '../../lib/db';
import Section from '../../models/Section';

export async function GET() {
  try {
    await dbConnect();
    const sections = await Section.find({});
    return NextResponse.json({ 
      sections, 
      success: true 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch sections' }, 
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    
    // Check if section already exists
    const existingSection = await Section.findOne({ 
      name: data.name 
    });
    
    if (existingSection) {
      return NextResponse.json(
        { error: 'Section already exists' }, 
        { status: 400 }
      );
    }

    // Create new section
    const section = await Section.create(data);
    
    return NextResponse.json({ 
      section, 
      success: true 
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create section' }, 
      { status: 500 }
    );
  }
}