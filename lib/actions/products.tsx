"use server";
import { redirect } from "next/navigation";
import { getCurrentUser } from "../auth";
import { prisma } from "../prisma";
import {z} from "zod";

const ProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.coerce.number().nonnegative("Price must be non-negative"),
  quantity: z.coerce.number().int().min(0, "Quantity must be non-negative"),
  sku: z.string().optional(),
  lowStockAt: z.coerce.number().int().min(0).optional(),
});

export async function deleteProduct(formData: FormData){
const user =  await getCurrentUser();
const id = String(formData.get("id") || "");
await prisma.product.deleteMany({
    where:{id:id,userId: user.id},
});
}

export async function updateProduct(formData: FormData) {
  const user = await getCurrentUser();
  const id = String(formData.get("id") || "");

  // Collect only provided fields
  const name = formData.get("name");
  const price = formData.get("price");
  const quantity = formData.get("quantity");
   const lowStockAt = formData.get("lowStockAt");


  // Build dynamic update data object
  const data: any = {};
  if (name && name !== "") data.name = String(name);
  if (price && price !== "") data.price = Number(price);
  if (quantity && quantity !== "") data.quantity = Number(quantity);
  if (lowStockAt && lowStockAt !== "") data.lowStockAt = Number(lowStockAt);

  // Skip if nothing to update
  if (Object.keys(data).length === 0) {
    throw new Error("No fields provided for update");
  }

  await prisma.product.updateMany({
    where: {
      id: id,
      userId: user.id,
    },
    data,
  });
}


export async function createProduct(formData: FormData) {
  const user = await getCurrentUser();

  const parsed = ProductSchema.safeParse({
    name: formData.get("name"),
    price: formData.get("price"),
    quantity: formData.get("quantity"),
    sku: formData.get("sku") || undefined,
    lowStockAt: formData.get("lowStockAt") || undefined,
  });

  if (!parsed.success) {
    throw new Error("Validation failed");
  }

  try {
    await prisma.product.create({
      data: { ...parsed.data, userId: user.id },
    });
    
  } catch (error) {
    throw new Error("Failed to create product.");
  }
}