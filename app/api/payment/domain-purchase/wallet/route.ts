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
  return Date.now().toString().slice(-9);
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

    const domain = await Domains.findOne({ id: domainId });
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

    if (domain.price == null) {
      return NextResponse.json(
        { success: false, error: "Domain price is not set" },
        { status: 400 }
      );
    }

    const buyer = await User.findById(authUser.userId);
    const seller = await User.findById(domain.seller_id);

    if (!buyer || !seller) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const domainPrice = domain.price;
    const totalCost = domainPrice * 1.05;

    if (buyer.balance < totalCost) {
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

    buyer.balance -= totalCost;
    await buyer.save();

    seller.balance += domainPrice;
    await seller.save();

    const orderId = `domain-${domain.id}-${buyer._id}-${Date.now()}`;
    const trackId = generateTrackId();

    const transactionData: any = {
      order_id: orderId,
      track_id: trackId,
      domain_id: domainId,
      seller_id: seller._id,
      buyer_id: buyer._id,
      amount: domainPrice,
      status: "paid",
      payment_method: "wallet",
      completed_at: new Date(),
      created_at: new Date(),
    };

    const buyerReferralId = buyer.parent_referral;
    const isReferralValid =
      buyerReferralId &&
      seller.referral_code &&
      buyerReferralId !== seller.referral_code;

    if (isReferralValid) {
      const parentReferral = await User.findOne({
        referral_code: buyerReferralId,
      });
      if (parentReferral) {
        const commission = domainPrice * 0.25;
        parentReferral.balance += commission;
        await parentReferral.save();

        transactionData.commission_amount = commission;
        transactionData.parent_referral_id = parentReferral._id;
      }
    }

    const transaction = new Transactions(transactionData);
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
