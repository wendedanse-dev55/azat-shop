import ImportForm from "@/components/ImportForm";

export const dynamic = "force-dynamic";

export default function ImportPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Импорт товаров из Excel</h1>

      <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-700">
        <p className="font-medium text-gray-900">Как это работает</p>
        <ol className="mt-2 list-inside list-decimal space-y-1">
          <li>Скачайте шаблон Excel с нужными колонками.</li>
          <li>Заполните строки товарами (одна строка — один товар).</li>
          <li>Загрузите файл ниже — товары появятся в каталоге.</li>
        </ol>
        <p className="mt-3">
          Колонки: <b>Название</b> (обязательно), <b>Цена</b>,{" "}
          <b>Старая цена</b>, <b>Категория</b>, <b>Описание</b>, <b>Остаток</b>,{" "}
          <b>Артикул</b>, <b>Рейтинг</b>, <b>Отзывы</b>, <b>Изображение</b>.
        </p>
        <p className="mt-2 text-gray-500">
          Новые категории создаются автоматически. Если указан <b>Артикул</b> и
          товар с таким артикулом уже есть — он будет обновлён.
        </p>

        <a
          href="/api/import/template"
          className="mt-4 inline-block rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          ⬇ Скачать шаблон Excel
        </a>
      </div>

      <ImportForm />
    </div>
  );
}
