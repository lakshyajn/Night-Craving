// app/api/sections/[id]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/db';
import Section from '../../../models/Section';
import Item from '@/app/models/Item';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json(); 
    await dbConnect(); 
    const section = await Section.findByIdAndUpdate(id, body, { new: true }); 
    return NextResponse.json({ section }, { status: 200 }); 
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 }); 
  }
}

export async function DELETE(request, { params }) {
  try {
    // Ensure database connection
    await dbConnect();

    const { id } = params;

    // Validate section ID
    if (!id) {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'Section ID is required' 
        }, 
        { status: 400 }
      );
    }

    // Check if section exists
    const section = await Section.findById(id);
    if (!section) {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'Section not found' 
        }, 
        { status: 404 }
      );
    }

    // Delete all items associated with the section
    const itemDeleteResult = await Item.deleteMany({ sectionId: id });

    // Delete the section
    const sectionDeleteResult = await Section.findByIdAndDelete(id);

    return NextResponse.json({ 
      status: 'success',
      message: 'Section and associated items deleted successfully',
      data: {
        sectionDeleted: !!sectionDeleteResult,
        itemsDeletedCount: itemDeleteResult.deletedCount
      }
    }, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Section delete error:', error);

    return NextResponse.json(
      { 
        status: 'error',
        message: 'Failed to delete section and associated items',
        ...(process.env.NODE_ENV === 'development' && { 
          errorDetails: error.message 
        })
      }, 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params; 
    const body = await request.json(); 
    await dbConnect(); 
    const section = await Section.findByIdAndUpdate(id, body, { new: true }); 
    return NextResponse.json({ section }, { status: 200 }); 
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 }); 
  }
}
