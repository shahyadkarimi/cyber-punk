import { NextRequest, NextResponse } from "next/server";
import WebShells from "@/models/WebShellsModel";
import connectDB from "@/lib/connectDB";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // const { search, language, category } = await request.json();

    const query: any = {};
    const andConditions = [];

    // if (search) {
    //   const regex = new RegExp(search, "i");
    //   andConditions.push({
    //     $or: [{ name: regex }, { description: regex }],
    //   });
    // }

    // if (language) {
    //   andConditions.push({ language });
    // }

    // if (category) {
    //   andConditions.push({ category });
    // }

    // if (andConditions.length > 0) {
    //   query.$and = andConditions;
    // }

    const shells = await WebShells.find({ ...query, deleted_at: null, is_active:true })
      .select("-__v")
      .sort({ created_at: -1 })
      .limit(100);

    const formattedShells = shells.map((item) => {
      const obj = Object.fromEntries(
        Object.entries(item.toObject()).filter(([key]) => key !== "_id")
      );

      return {
        id: item._id,
        ...obj,
      };
    });

    return NextResponse.json({ shells: formattedShells }, { status: 200 });
  } catch (error) {
    console.error("Error fetching web shells:", error);
    return NextResponse.json(
      { error: "Failed to fetch web shells." },
      { status: 500 }
    );
  }
}
