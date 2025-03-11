import { NextResponse } from 'next/server';
import Transaction from '../../../../models/Transaction';
import '../../../../lib/db';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();
    const transaction = await Transaction.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
    
    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(transaction);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const transaction = await Transaction.findByIdAndDelete(id);
    
    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
