import { NextResponse, type NextRequest } from "next/server";
import connectDB from "@/lib/connectDB";
import { getAuthUser } from "@/lib/auth";
import WebShells from "@/models/WebShellsModel";

type WebShellType = {
  _id: string;
  [key: string]: any;
};

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = context.params;

    const webshell = await WebShells.findOne({
      _id: id,
      deleted_at: null,
      is_active: true,
    })
      .populate("uploaded_by", "username email")
      .select("-__v")
      .lean();

    if (!webshell) {
      return NextResponse.json(
        { error: "Webshell not found" },
        { status: 404 }
      );
    }

    const { _id, uploaded_by, ...rest } = webshell as WebShellType;

    return NextResponse.json(
      { id: _id, uploader: uploaded_by, ...rest },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch webshell" },
      { status: 500 }
    );
  }
}
