import Link from "next/link";

interface BannerValues {
  title?: string;
  description?: string | null;
  tag?: string | null;
  imageUrl?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  sortOrder?: number;
  active?: boolean;
}

interface Props {
  action: (formData: FormData) => void | Promise<void>;
  banner?: BannerValues;
  submitLabel?: string;
}

const inputClass =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand focus:ring-1 focus:ring-brand";
const labelClass = "block text-sm font-medium text-ink mb-1";

export default function BannerForm({
  action,
  banner,
  submitLabel = "Сохранить",
}: Props) {
  return (
    <form action={action} className="max-w-2xl space-y-5">
      <div>
        <label className={labelClass} htmlFor="tag">Тег (маленькая плашка сверху)</label>
        <input
          id="tag"
          name="tag"
          defaultValue={banner?.tag ?? ""}
          className={inputClass}
          placeholder="Например: Скидки до 30%"
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="title">Заголовок *</label>
        <input
          id="title"
          name="title"
          required
          defaultValue={banner?.title ?? ""}
          className={inputClass}
          placeholder="Например: Тысячи товаров с быстрой доставкой"
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="description">Описание</label>
        <textarea
          id="description"
          name="description"
          rows={2}
          defaultValue={banner?.description ?? ""}
          className={inputClass}
          placeholder="Короткий текст под заголовком"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="ctaLabel">Текст кнопки</label>
          <input
            id="ctaLabel"
            name="ctaLabel"
            defaultValue={banner?.ctaLabel ?? ""}
            className={inputClass}
            placeholder="Например: Перейти в каталог"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="ctaHref">Ссылка кнопки</label>
          <input
            id="ctaHref"
            name="ctaHref"
            defaultValue={banner?.ctaHref ?? ""}
            className={inputClass}
            placeholder="/catalog"
          />
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-line p-4">
        <label className={labelClass} htmlFor="image">Фото (загрузить файл)</label>
        <input
          id="image"
          name="image"
          type="file"
          accept="image/*"
          className="block w-full text-sm text-body file:mr-3 file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-2 file:text-sm file:text-white hover:file:bg-brand-hover"
        />
        {banner?.imageUrl && (
          <div className="mt-3 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={banner.imageUrl} alt="" className="h-16 w-24 rounded-lg object-cover" />
            <span className="text-xs text-muted">Текущее фото</span>
          </div>
        )}
        <label className="mt-3 block text-sm text-muted" htmlFor="imageUrl">
          …или укажите ссылку на фото:
        </label>
        <input
          id="imageUrl"
          name="imageUrl"
          defaultValue={banner?.imageUrl ?? ""}
          className={`${inputClass} mt-1`}
          placeholder="https://..."
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="sortOrder">Порядок (меньше — раньше)</label>
          <input
            id="sortOrder"
            name="sortOrder"
            type="number"
            step="1"
            defaultValue={banner?.sortOrder ?? 0}
            className={inputClass}
          />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm font-medium text-ink">
            <input
              type="checkbox"
              name="active"
              defaultChecked={banner?.active ?? true}
              className="h-4 w-4 rounded border-line text-brand focus:ring-brand"
            />
            Показывать на сайте
          </label>
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
          href="/admin/banners"
          className="rounded-xl border border-line px-5 py-2.5 text-sm font-medium text-body hover:bg-gray-50"
        >
          Отмена
        </Link>
      </div>
    </form>
  );
}
