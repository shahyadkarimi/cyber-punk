import { NextRequest, NextResponse } from "next/server";
import WebShells from "@/models/WebShellsModel";
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

    const {
      id,
      name,
      description,
      file_path,
      language,
      category,
      tags,
      is_active,
    } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "WebShell ID is required." },
        { status: 400 }
      );
    }

    const shellData = await WebShells.findById(id);

    if (!shellData) {
      return NextResponse.json(
        { error: "WebShell not found." },
        { status: 404 }
      );
    }

    const existingFilePath = await WebShells.findOne({
          domain: shellData.file_path,
          _id: { $ne: id },
        });
    
        if (existingFilePath) {
          return Response.json(
            { error: "A web shell with this file path already exists." },
            { status: 400 }
          );
        }

    const editedShell = await WebShells.findByIdAndUpdate(
      id,
      {
        name,
        description,
        file_path,
        language,
        category,
        tags,
        is_active,
        updated_at: new Date(),
      },
      {
        new: true,
        select:
          "_id name description language category tags is_active created_at updated_at",
      }
    );

    return NextResponse.json(
      { message: "WebShell updated successfully.", shell: editedShell },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating WebShell:", error);
    return NextResponse.json(
      { error: "Failed to update WebShell." },
      { status: 500 }
    );
  }
}
