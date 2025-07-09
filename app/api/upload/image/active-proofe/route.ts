import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import { getAuthUser } from "@/lib/auth";
import Transactions from "@/models/TransactionsModel";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const authUser = await getAuthUser(req);

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();

    const orderId = formData.get("orderId");
    const image = formData.get("image");

    const transaction: any = await Transactions.findOne({
      order_id: orderId,
      buyer_id: authUser.userId,
    });

    if (transaction.active_proof) {
      return NextResponse.json(
        { error: "Transaction does have active proofe." },
        { status: 400 }
      );
    }

    if (image instanceof File) {
      const buffer = Buffer.from(await image.arrayBuffer());
      const imageName = Date.now() + "_" + image?.name;
      const imagePath = path.join(process.cwd(), "public/uploads/" + imageName);

      await writeFile(imagePath, buffer);
      transaction.active_proof = transaction.active_proof
        ? transaction.active_proof
        : `/uploads/${imageName}`;

      await transaction.save();

      return NextResponse.json({ message: "successfull" }, { status: 200 });
    }
  } catch (err) {
    console.error("Image upload error:", err);
    return NextResponse.json(
      { error: "Failed to upload image." },
      { status: 500 }
    );
  }
}
