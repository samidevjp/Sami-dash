import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST(req: Request) {
  try {
    const { order } = await req.json();
    const {
      table_id,
      guest_first_name,
      guest_last_name,
      type,
      products,
      employee
    } = order;

    const localTimestamp = new Date().toISOString();

    if (
      // !table_id ||
      !guest_first_name ||
      !guest_last_name ||
      !employee ||
      !products ||
      products.length === 0
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const sql = neon(`${process.env.NEXT_PUBLIC_NEON_DATABASE_URL}`);

    // Insert the order into the orders table
    const orderResponse = await sql`
      INSERT INTO orders (table_id, guest_first_name, guest_last_name, employee_name, order_type, created_at, status)
      VALUES (${table_id}, ${guest_first_name}, ${guest_last_name}, ${employee}, ${type}, ${localTimestamp}, 'open')
      RETURNING *;
    `;

    const newOrder = orderResponse[0];

    // Insert the products into the order_products table
    for (const product of products) {
      await sql`
        INSERT INTO order_products (order_id, product_id, product_name, quantity, price, category_id, addons)
        VALUES (${newOrder.order_id}, ${product.id}, ${product.title}, ${
          product.quantity
        }, ${product.price}, ${product.category_id}, ${JSON.stringify(
          product.addOns
        )});
      `;
    }

    return NextResponse.json(
      { success: true, order: newOrder },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST function:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const sql = neon(`${process.env.NEXT_PUBLIC_NEON_DATABASE_URL}`);

    // Fetch all orders from the database
    const ordersResponse = await sql`
      SELECT o.*, array_agg(json_build_object(
        'product_id', op.product_id,
        'product_name', op.product_name,
        'quantity', op.quantity,
        'price', op.price,
        'category_id', op.category_id,
        'addons', op.addons
      )) AS products
      FROM orders o
      LEFT JOIN order_products op ON o.order_id = op.order_id
      GROUP BY o.order_id;
    `;

    return NextResponse.json({ orders: ordersResponse }, { status: 200 });
  } catch (error) {
    console.error('Error in GET function:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
