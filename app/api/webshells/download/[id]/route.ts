import { NextRequest, NextResponse } from "next/server";
import WebShells from "@/models/WebShellsModel";
import connectDB from "@/lib/connectDB";
import https from "https";

function getFileExtension(language: string): string {
  switch (language.toLowerCase()) {
    case "php":
      return "php";
    case "asp":
    case "aspx":
      return "asp";
    case "jsp":
      return "jsp";
    case "python":
      return "py";
    case "perl":
      return "pl";
    case "javascript":
      return "js";
    default:
      return "txt";
  }
}

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = context.params;

    const shell = await WebShells.findById(id);

    if (!shell || !shell.file_path) {
      return NextResponse.json({ error: "Shell not found" }, { status: 404 });
    }

    const urlParts = shell.file_path.split("/");
    const filename =
      urlParts[urlParts.length - 1] ||
      `${shell.name.replace(/\s+/g, "_")}.${getFileExtension(shell.language)}`;

    const fileBuffer: Buffer = await new Promise((resolve, reject) => {
      https.get(shell.file_path, (res) => {
        const data: Uint8Array[] = [];
        res.on("data", (chunk) => data.push(chunk));
        res.on("end", () => resolve(Buffer.concat(data)));
        res.on("error", reject);
      });
    });

    await WebShells.findByIdAndUpdate(id, {
      $inc: { download_count: 1 },
    });

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Download failed" },
      { status: 500 }
    );
  }
}
