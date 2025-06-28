import { NextRequest, NextResponse } from "next/server";
import WebShells from "@/models/WebShellsModel";
import { createWebShellSchema } from "@/lib/validation";
import connectDB from "@/lib/connectDB";
import { getAuthUser } from "@/lib/auth";

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

    const webshellData = createWebShellSchema.safeParse(body);

    if (!webshellData.success) {
      const errorMessages = webshellData.error.errors.map((e) => e.message);
      return NextResponse.json({ error: errorMessages[0] }, { status: 400 });
    }

    const {
      name,
      description,
      file_path,
      language,
      category,
      tags,
      is_active
    } = webshellData.data;

    const exists = await WebShells.findOne({ file_path: file_path.trim() });

    if (exists) {
      return NextResponse.json(
        { error: "A web shell with this file path already exists." },
        { status: 409 }
      );
    }

    const newShell = await WebShells.create({
      name,
      description,
      file_path: file_path.trim(),
      language,
      category,
      tags,
      is_active,
      uploaded_by: authUser.userId,
    });

    return NextResponse.json(
      { message: "Web shell successfully submitted.", shell: newShell },
      { status: 201 }
    );
  } catch (error) {
    console.error("Web shell creation error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while submitting the web shell." },
      { status: 500 }
    );
  }
}
