import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

export const runtime = "nodejs";

export async function GET() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Товары");

  ws.columns = [
    { header: "Название", key: "name", width: 32 },
    { header: "Цена", key: "price", width: 12 },
    { header: "Старая цена", key: "oldPrice", width: 12 },
    { header: "Категория", key: "category", width: 20 },
    { header: "Описание", key: "description", width: 40 },
    { header: "Остаток", key: "stock", width: 10 },
    { header: "Артикул", key: "sku", width: 16 },
    { header: "Рейтинг", key: "rating", width: 10 },
    { header: "Отзывы", key: "reviewsCount", width: 10 },
    { header: "Изображения", key: "imageUrl", width: 60 },
  ];

  ws.getRow(1).font = { bold: true };
  ws.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFEFEFEF" },
  };

  ws.addRow({
    name: "Пример: Беспроводные наушники",
    price: 24990,
    oldPrice: 34990,
    category: "Электроника",
    description: "Описание товара",
    stock: 10,
    sku: "EL-001",
    rating: 4.8,
    reviewsCount: 1243,
    // Несколько фото — через запятую. Первое станет главным, остальные
    // попадут в слайдер на странице товара.
    imageUrl:
      "https://picsum.photos/seed/example1/600/600, https://picsum.photos/seed/example2/600/600, https://picsum.photos/seed/example3/600/600",
  });
  ws.addRow({
    name: "Пример: Футболка",
    price: 5990,
    oldPrice: 8990,
    category: "Одежда",
    description: "100% хлопок",
    stock: 100,
    sku: "CL-001",
    rating: 4.5,
    reviewsCount: 320,
    imageUrl: "https://picsum.photos/seed/tshirt/600/600",
  });

  const buffer = await wb.xlsx.writeBuffer();

  // Wrap in a Uint8Array so the body type is unambiguously a valid BodyInit.
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="import-template.xlsx"',
    },
  });
}
