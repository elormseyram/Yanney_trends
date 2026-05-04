import { NextResponse } from "next/server";
import { notifyCustomer, type OrderStatusLite } from "@/lib/notificationService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { order_number, customer_name, customer_phone, status } = body;

    if (!order_number || !customer_phone || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Trigger the Arkesel SMS notification
    await notifyCustomer({
      order_number,
      customer_name,
      customer_phone,
    }, status as OrderStatusLite);

    return NextResponse.json({ success: true, message: `Notification sent for status: ${status}` });
  } catch {
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}
