// app/api/items/[id]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/db';
import Item from '../../../models/Item';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    await dbConnect();
    const item = await Item.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json({ item }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    // Ensure database connection
    await dbConnect();

    const { id } = params;

    // Validate item ID
    if (!id) {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'Item ID is required' 
        }, 
        { status: 400 }
      );
    }

    // Check if item exists
    const item = await Item.findById(id);
    if (!item) {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'Item not found' 
        }, 
        { status: 404 }
      );
    }

    // Delete the item
    const deleteResult = await Item.findByIdAndDelete(id);

    return NextResponse.json({ 
      status: 'success',
      message: 'Item deleted successfully',
      data: {
        itemDeleted: !!deleteResult
      }
    }, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Item delete error:', error);

    return NextResponse.json(
      { 
        status: 'error',
        message: 'Failed to delete item',
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
    const item = await Item.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json({ item }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}