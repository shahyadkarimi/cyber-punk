import { NextRequest, NextResponse } from "next/server";
import Domains from "@/models/DomainsModel";
import Transactions from "@/models/TransactionsModel";
import { getAuthUser } from "@/lib/auth";
import User from "@/models/UsersModel";

const url =
  process.env.NODE_ENV === "production"
    ? "https://xteamsec.com"
    : "http://localhost:3000";

function generateTrackId(): string {
  const timestamp = Date.now().toString();
  return timestamp.slice(-9);
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { domainId } = data;

    const authUser = await getAuthUser(request);

    if (!authUser) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    if (!domainId) {
      return NextResponse.json(
        { success: false, error: "Missing domainId" },
        { status: 400 }
      );
    }

    const domain = await Domains.findOne({
      id: domainId,
    });

    if (!domain) {
      return NextResponse.json(
        { success: false, error: "Domain not found" },
        { status: 404 }
      );
    }

    if (domain.buyer_id) {
      return NextResponse.json(
        { success: false, error: "Domain already sold" },
        { status: 400 }
      );
    }

    const user = await User.findById(authUser.userId);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Wallet not found" },
        { status: 404 }
      );
    }

    if (domain.price == null) {
      return NextResponse.json(
        { success: false, error: "Domain price is not set" },
        { status: 400 }
      );
    }

    if (user.balance < domain?.price) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Insufficient balance. Please add funds or choose another payment method.",
        },
        { status: 400 }
      );
    }

    domain.buyer_id = authUser.userId;
    domain.status = "sold";
    await domain.save();

    user.balance -= domain.price;
    await user.save();

    const orderId = `domain-${domain.id}-${user._id}-${Date.now()}`;

    const transaction = new Transactions({
      order_id: orderId,
      track_id: generateTrackId(),
      domain_id: domainId,
      seller_id: domain.seller_id,
      buyer_id: authUser.userId,
      amount: domain.price,
      status: "paid",
      payment_method: "wallet",
      completed_at: new Date(),
      created_at: new Date(),
    });

    await transaction.save();

    return NextResponse.json({
      success: true,
      message: "Domain purchased successfully",
      successUrl: `${url}/payment-status?orderId=${orderId}`,
    });
  } catch (error) {
    console.error("Purchase domain error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
