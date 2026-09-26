import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const VALID_OPTIONS: Record<string, string> = {
  "1": "option-1-quantum-ticket.svg",
  "2": "option-2-infinity-flow.svg",
  "3": "option-3-prism-spark.svg",
  "4": "option-4-sonic-stage.svg",
};

export async function POST(request: Request) {
  try {
    const { option } = await request.json();
    const fileName = VALID_OPTIONS[String(option)];

    if (!fileName) {
      return NextResponse.json(
        { error: "Invalid icon option. Must be 1, 2, 3, or 4." },
        { status: 400 }
      );
    }

    const sourcePath = path.join(process.cwd(), "public", "icons", fileName);
    if (!fs.existsSync(sourcePath)) {
      return NextResponse.json(
        { error: `Icon asset ${fileName} not found on disk.` },
        { status: 404 }
      );
    }

    const svgContent = fs.readFileSync(sourcePath, "utf-8");

    // Update src/app/icon.svg, public/icon.svg, and public/logo.svg
    const appIconPath = path.join(process.cwd(), "src", "app", "icon.svg");
    const publicIconPath = path.join(process.cwd(), "public", "icon.svg");
    const publicLogoPath = path.join(process.cwd(), "public", "logo.svg");

    fs.writeFileSync(appIconPath, svgContent, "utf-8");
    fs.writeFileSync(publicIconPath, svgContent, "utf-8");
    fs.writeFileSync(publicLogoPath, svgContent, "utf-8");

    return NextResponse.json({
      success: true,
      selectedOption: option,
      fileName,
      message: `Active application icon updated to Option ${option} (${fileName}) successfully!`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update icon." },
      { status: 500 }
    );
  }
}
