import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import WalletTransactions from "@/models/WalletTransactionsModel";
import { z } from "zod";
import { getAuthUser } from "@/lib/auth";

const transactionSchema = z.object({
  order_id: z.string().min(3, "Order id is required"),
  track_id: z.string().min(3, "Track id is required"),
  amount: z.number().positive(),
  status: z.string().min(1, "Status is required"),
  payment_method: z.string().optional(),
  transaction_hash: z.string().optional(),
  currency: z.string().optional(),
  network: z.string().optional(),
  wallet_address: z.string().optional(),
  completed_at: z.string().datetime().optional(),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const authUser = await getAuthUser(request);

    if (!authUser) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const validated = transactionSchema.safeParse(body);

    if (!validated.success) {
      const message = validated.error.errors[0]?.message || "Invalid input.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { order_id, track_id, amount, status } = validated.data;

    const transaction = await WalletTransactions.create({
      order_id,
      track_id,
      user_id: authUser.userId,
      amount,
      status,
      created_at: new Date(),
    });

    return NextResponse.json(
      { message: "Transaction created successfully.", transaction },
      { status: 201 }
    );
  } catch (error) {
    console.error("Transaction creation/update error:", error);
    return NextResponse.json(
      {
        error: "An unexpected error occurred while processing the transaction.",
      },
      { status: 500 }
    );
  }
}
