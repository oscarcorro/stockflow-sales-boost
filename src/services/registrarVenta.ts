import { supabase } from "@/lib/supabaseClient";

type RegisterSaleInput = {
  product_name: string;
  sku: string;
  size: string;
  color: string;
  quantity_sold: number;            // >= 1
  point_of_sale_id: string;         // store_id de la tienda actual
};

export async function registerSale(input: RegisterSaleInput) {
  const { error } = await supabase
    .from("sales_history")
    .insert({
      product_name: input.product_name,
      sku: input.sku,
      size: input.size,
      color: input.color,
      quantity_sold: input.quantity_sold,
      point_of_sale_id: input.point_of_sale_id,
    });

  if (error) throw error;
}
