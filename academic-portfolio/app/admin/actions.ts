"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { entities, type EntityConfig } from "@/lib/entities";
import { saveUpload } from "@/lib/upload";
import { getSession, requireAdmin } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const expected = process.env.ADMIN_PASSWORD || "changeme";
  if (password !== expected) {
    redirect("/admin/login?error=1");
  }
  const session = await getSession();
  session.isAdmin = true;
  await session.save();
  redirect("/admin");
}

export async function logoutAction() {
  const session = await getSession();
  session.destroy();
  redirect("/admin/login");
}

async function buildData(entity: EntityConfig, formData: FormData) {
  const data: Record<string, unknown> = {};
  for (const field of entity.fields) {
    const raw = formData.get(field.name);
    if (field.type === "file") {
      const file = raw as File | null;
      if (file && typeof file === "object" && "size" in file && file.size > 0) {
        data[field.name] = await saveUpload(file);
      }
      continue;
    }
    if (raw == null) continue;
    const value = String(raw).trim();
    if (value === "" && !field.required) continue;
    if (field.type === "number") {
      const n = Number(value);
      data[field.name] = Number.isFinite(n) ? n : 0;
    } else {
      data[field.name] = value;
    }
  }
  return data;
}

export async function upsertAction(entityKey: string, id: string | null, formData: FormData) {
  if (!(await requireAdmin())) redirect("/admin/login");

  const entity = entities[entityKey];
  if (!entity) throw new Error(`Unknown entity: ${entityKey}`);
  const data = await buildData(entity, formData);

  const model = (prisma as unknown as Record<string, { create: Function; update: Function; upsert: Function }>)[
    entity.prismaModel
  ];
  if (!model) throw new Error(`Missing model: ${entity.prismaModel}`);

  if (entity.prismaModel === "profile") {
    const existing = await prisma.profile.findFirst();
    if (existing) {
      await prisma.profile.update({ where: { id: existing.id }, data: data as never });
    } else {
      await prisma.profile.create({ data: data as never });
    }
  } else if (id) {
    await model.update({ where: { id }, data });
  } else {
    await model.create({ data });
  }

  revalidatePath("/", "layout");
  redirect(entity.listUrl);
}

export async function deleteAction(entityKey: string, id: string) {
  if (!(await requireAdmin())) redirect("/admin/login");
  const entity = entities[entityKey];
  if (!entity) throw new Error(`Unknown entity: ${entityKey}`);
  const model = (prisma as unknown as Record<string, { delete: Function }>)[entity.prismaModel];
  await model.delete({ where: { id } });
  revalidatePath("/", "layout");
  redirect("/admin");
}
