import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  console.log('id', id);
  const { status } = await req.json();
  console.log('status', status);
  const sql = neon(`${process.env.NEXT_PUBLIC_NEON_DATABASE_URL}`);

  try {
    const updatedOrder = await sql`
      UPDATE orders
      SET status = ${status}
      WHERE order_id = ${id}
      RETURNING *;
    `;

    if (updatedOrder.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order: updatedOrder[0] }, { status: 200 });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const sql = neon(`${process.env.NEXT_PUBLIC_NEON_DATABASE_URL}`);

  try {
    await sql`
      DELETE FROM order_products WHERE order_id = ${id};
    `;
    const deletedOrder = await sql`
      DELETE FROM orders WHERE order_id = ${id} RETURNING *;
    `;

    if (deletedOrder.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Order deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
