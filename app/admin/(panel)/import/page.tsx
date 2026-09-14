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
          <b>Артикул</b>, <b>Рейтинг</b>, <b>Отзывы</b>, <b>Изображения</b>,{" "}
          <b>Поставщик</b>, <b>Телефон поставщика</b>.
        </p>
        <p className="mt-2 text-gray-500">
          <b>Поставщик</b> и <b>Телефон поставщика</b> видны только в админке — при
          заказе будет понятно, чей товар и кому звонить. Покупатели их не видят.
        </p>
        <p className="mt-2 text-gray-500">
          В колонке <b>Изображения</b> можно указать <b>несколько ссылок через
          запятую</b> — первая станет главным фото, а все вместе покажутся
          слайдером на странице товара.
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
