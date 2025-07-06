import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import { getAuthUser } from "@/lib/auth";
import Domains from "@/models/DomainsModel";
import WatchList from "@/models/WatchListModel";

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

    const { id } = await request.json();

    const domain = await Domains.findOne({ id });
    
    if (!domain) {
      return NextResponse.json({ error: "Domain not found." }, { status: 404 });
    }

    const existing = await WatchList.findOne({
      user: authUser.userId,
      domain: domain.id,
    });

    if (existing) {
      await WatchList.deleteOne({ _id: existing._id });

      return NextResponse.json(
        { message: "Domain removed from watchlist." },
        { status: 200 }
      );
    } else {
      await WatchList.create({
        user: authUser.userId,
        domain: domain.id,
        added_at: new Date(),
      });

      return NextResponse.json(
        { message: "Domain added to watchlist successfully." },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Toggle watchlist error:", error);
    return NextResponse.json(
      { error: "An error occurred while processing watchlist." },
      { status: 500 }
    );
  }
}
