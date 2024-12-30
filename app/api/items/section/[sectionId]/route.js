import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import Item from '../../../../models/Item';
import Section from '@/app/models/Section';

export async function DELETE(request, context) {
  try {
    // Ensure database connection
    await dbConnect();

    const { params } = context;
    const { sectionId } = params;  // Use 'sectionId' for this specific route

    // Validate section ID
    if (!sectionId) {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'Section ID is required' 
        }, 
        { status: 400 }
      );
    }

    // Delete items associated with the section
    const deleteResult = await Item.deleteMany({ sectionId: sectionId });

    return NextResponse.json({ 
      status: 'success',
      message: 'Items deleted successfully',
      data: {
        deletedCount: deleteResult.deletedCount
      }
    }, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Bulk item delete error:', error);

    return NextResponse.json(
      { 
        status: 'error',
        message: 'Failed to delete items',
        ...(process.env.NODE_ENV === 'development' && { 
          errorDetails: error.message,
          errorStack: error.stack
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