import Link from "next/link";
import { productImages } from "@/lib/images";

interface Category {
  id: string;
  name: string;
}

interface ProductValues {
  name?: string;
  description?: string | null;
  price?: number;
  oldPrice?: number | null;
  stock?: number;
  sku?: string | null;
  imageUrl?: string | null;
  images?: string[] | null;
  supplier?: string | null;
  supplierPhone?: string | null;
  rating?: number;
  reviewsCount?: number;
  categoryId?: string | null;
}

interface Props {
  action: (formData: FormData) => void | Promise<void>;
  categories: Category[];
  product?: ProductValues;
  submitLabel?: string;
}

const inputClass =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand focus:ring-1 focus:ring-brand";
const labelClass = "block text-sm font-medium text-ink mb-1";

export default function ProductForm({
  action,
  categories,
  product,
  submitLabel = "Сохранить",
}: Props) {
  const currentImages = product ? productImages(product) : [];
  return (
    <form action={action} className="max-w-2xl space-y-5">
      <div>
        <label className={labelClass} htmlFor="name">Название *</label>
        <input
          id="name"
          name="name"
          required
          defaultValue={product?.name ?? ""}
          className={inputClass}
          placeholder="Например: Беспроводные наушники"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass} htmlFor="price">Цена</label>
          <input id="price" name="price" type="number" step="0.01" min="0" defaultValue={product?.price ?? 0} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="oldPrice">Старая цена</label>
          <input id="oldPrice" name="oldPrice" type="number" step="0.01" min="0" defaultValue={product?.oldPrice ?? ""} className={inputClass} placeholder="для скидки" />
        </div>
        <div>
          <label className={labelClass} htmlFor="stock">Остаток</label>
          <input id="stock" name="stock" type="number" step="1" min="0" defaultValue={product?.stock ?? 0} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass} htmlFor="sku">Артикул (SKU)</label>
          <input id="sku" name="sku" defaultValue={product?.sku ?? ""} className={inputClass} placeholder="EL-001" />
        </div>
        <div>
          <label className={labelClass} htmlFor="rating">Рейтинг (0–5)</label>
          <input id="rating" name="rating" type="number" step="0.1" min="0" max="5" defaultValue={product?.rating ?? 0} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="reviewsCount">Отзывы</label>
          <input id="reviewsCount" name="reviewsCount" type="number" step="1" min="0" defaultValue={product?.reviewsCount ?? 0} className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="categoryId">Категория</label>
        <select id="categoryId" name="categoryId" defaultValue={product?.categoryId ?? ""} className={inputClass}>
          <option value="">— без категории —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass} htmlFor="description">Описание</label>
        <textarea id="description" name="description" rows={4} defaultValue={product?.description ?? ""} className={inputClass} />
      </div>

      <div className="rounded-xl border border-dashed border-line p-4">
        <label className={labelClass} htmlFor="image">Загрузить файл (станет главным фото)</label>
        <input
          id="image"
          name="image"
          type="file"
          accept="image/*"
          className="block w-full text-sm text-body file:mr-3 file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-2 file:text-sm file:text-white hover:file:bg-brand-hover"
        />

        {currentImages.length > 0 && (
          <div className="mt-3">
            <span className="text-xs text-muted">
              Текущие изображения ({currentImages.length}) — первое главное:
            </span>
            <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto">
              {currentImages.map((src, i) => (
                <div key={`${src}-${i}`} className="relative shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-16 w-16 rounded-lg object-cover" />
                  {i === 0 && (
                    <span className="absolute left-0 top-0 rounded-br-lg rounded-tl-lg bg-brand px-1 text-[10px] font-semibold text-white">
                      главное
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <label className="mt-3 block text-sm text-muted" htmlFor="imageUrl">
          …или укажите ссылки на изображения (можно несколько — через запятую или с новой строки):
        </label>
        <textarea
          id="imageUrl"
          name="imageUrl"
          rows={3}
          defaultValue={currentImages.join("\n")}
          className={`${inputClass} mt-1`}
          placeholder={"https://.../photo-1.jpg,\nhttps://.../photo-2.jpg"}
        />
        <p className="mt-1 text-xs text-muted">
          Первая ссылка станет главным фото, остальные попадут в слайдер на странице товара.
        </p>
      </div>

      <div className="rounded-xl border border-line bg-brand-soft/40 p-4">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-sm font-semibold text-ink">Поставщик</span>
          <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-muted">
            только для админа — покупатели не видят
          </span>
        </div>
        <p className="mb-3 text-xs text-muted">
          Чтобы при заказе было видно, чей это товар и кому звонить.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="supplier">Название / имя</label>
            <input
              id="supplier"
              name="supplier"
              defaultValue={product?.supplier ?? ""}
              className={inputClass}
              placeholder="Например: ТОО Электроснаб"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="supplierPhone">Телефон</label>
            <input
              id="supplierPhone"
              name="supplierPhone"
              defaultValue={product?.supplierPhone ?? ""}
              className={inputClass}
              placeholder="+7 700 123 45 67"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
        >
          {submitLabel}
        </button>
        <Link
          href="/admin/products"
          className="rounded-xl border border-line px-5 py-2.5 text-sm font-medium text-body hover:bg-gray-50"
        >
          Отмена
        </Link>
      </div>
    </form>
  );
}
