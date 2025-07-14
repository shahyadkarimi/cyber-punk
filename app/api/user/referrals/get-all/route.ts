import { NextResponse, type NextRequest } from "next/server";
import User from "@/models/UsersModel";
import Transactions from "@/models/TransactionsModel";
import { getAuthUser } from "@/lib/auth";
import connectDB from "@/lib/connectDB";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(authUser.userId);

    const referrals = await User.find({
      parent_referral: user.referral_code,
      is_active: true,
      deleted_at: null,
    }).select("username full_name avatar_url email role created_at");

    const referralTransactions = await Transactions.find({
      parent_referral_id: user._id,
    });

    const commissionByReferral = referralTransactions.reduce<
      Record<string, number>
    >((acc, transaction) => {
      const buyerId = transaction.buyer_id.toString();
      const commission = transaction.commission_amount || 0;

      if (!acc[buyerId]) {
        acc[buyerId] = 0;
      }

      acc[buyerId] += commission;

      return acc;
    }, {});

    const enrichedReferrals = referrals.map((ref) => {
      const totalCommission = commissionByReferral[ref._id.toString()] || 0;
      return {
        _id: ref._id,
        username: ref.username,
        full_name: ref.full_name,
        avatar_url: ref.avatar_url,
        email: ref.email,
        role: ref.role,
        created_at: ref.created_at,
        total_commission: totalCommission,
      };
    });

    return NextResponse.json({ referrals: enrichedReferrals }, { status: 200 });
  } catch (error: any) {
    console.error("Get referrals error:", error);
    return NextResponse.json(
      { error: "Failed to fetch referrals" },
      { status: 500 }
    );
  }
}
