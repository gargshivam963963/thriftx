import { NextResponse } from 'next/server';
import { seedProducts } from '@/lib/products';

export async function POST() {
  try {
    const result = await seedProducts();
    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
