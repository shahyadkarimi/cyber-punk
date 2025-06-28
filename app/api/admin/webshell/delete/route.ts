import { NextResponse, type NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import connectDB from "@/lib/connectDB";
import WebShells from "@/models/WebShellsModel";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (authUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Webshell ID is required" },
        { status: 400 }
      );
    }

    const webshell = await WebShells.findById(id);
    if (!webshell) {
      return NextResponse.json({ error: "Webshell not found" }, { status: 404 });
    }

    webshell.deleted_at = new Date();
    await webshell.save();

    return NextResponse.json({ success: "Webshell deleted" }, { status: 200 });
  } catch (error: any) {
    console.error("Admin soft delete error:", error);
    return NextResponse.json(
      { error: "Failed to soft delete webshell" },
      { status: 500 }
    );
  }
}
