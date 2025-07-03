import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import Transactions from "@/models/TransactionsModel";
import { z } from "zod";

const transactionSchema = z.object({
  domain_id: z.string().min(1, "Domain id is required"),
  seller_id: z.string().min(1, "Seller id is required"),
  buyer_id: z.string().min(1, "Buyer id is required"),
  amount: z.number().positive(),
  status: z.string().min(1, "Status is required"),
  payment_method: z.string().optional(),
  transaction_hash: z.string().optional(),
  order_id: z.string().min(3, "Order id is required"),
  track_id: z.string().min(3, "Track id is required"),
  currency: z.string().optional(),
  network: z.string().optional(),
  wallet_address: z.string().optional(),
  completed_at: z.string().datetime().optional(),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      return NextResponse.json(
        { error: "Invalid JSON payload." },
        { status: 400 }
      );
    }

    const validated = transactionSchema.safeParse(body);

    if (!validated.success) {
      const message = validated.error.errors[0]?.message || "Invalid input.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const {
      domain_id,
      seller_id,
      buyer_id,
      amount,
      status,
      payment_method,
      transaction_hash,
      order_id,
      track_id,
      currency,
      network,
      wallet_address,
      completed_at,
    } = validated.data;

    const existing = await Transactions.findOne({
      $or: [{ order_id }, { track_id }],
    });

    if (existing) {
      return NextResponse.json(
        { error: "Duplicate Order id or Track id." },
        { status: 409 }
      );
    }
// Format: domain-{domainId}-{userId}-{timestamp}
    const transaction = await Transactions.create({
      domain_id,
      seller_id,
      buyer_id,
      amount,
      status,
      payment_method,
      transaction_hash,
      order_id,
      track_id,
      currency,
      network,
      wallet_address,
      completed_at,
    });

    return NextResponse.json(
      { message: "Transaction created successfully.", transaction },
      { status: 201 }
    );
  } catch (error) {
    console.error("Transaction creation error:", error);
    return NextResponse.json(
      {
        error: "An unexpected error occurred while creating the transaction.",
      },
      { status: 500 }
    );
  }
}
