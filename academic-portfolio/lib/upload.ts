import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { nanoid } from "nanoid";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function saveUpload(file: File): Promise<string> {
  if (!file || file.size === 0) throw new Error("No file provided");
  await mkdir(UPLOAD_DIR, { recursive: true });
  const ext = path.extname(file.name) || "";
  const filename = `${Date.now()}-${nanoid(8)}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);
  return `/uploads/${filename}`;
}
