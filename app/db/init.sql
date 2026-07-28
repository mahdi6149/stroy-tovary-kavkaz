CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price_cents INTEGER NOT NULL,
  unit TEXT NOT NULL DEFAULT 'шт',
  image_url TEXT NOT NULL DEFAULT '',
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  comment TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new',
  total_cents INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  product_name TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  quantity INTEGER NOT NULL
);

INSERT INTO categories (name, slug) VALUES
  ('Цемент и смеси', 'cement'),
  ('Кирпич и блоки', 'brick'),
  ('Пиломатериалы', 'lumber'),
  ('Утеплители', 'insulation'),
  ('Крепёж и инструмент', 'tools')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (category_id, name, slug, description, price_cents, unit, image_url, stock) VALUES
  ((SELECT id FROM categories WHERE slug='cement'), 'Цемент М500 Д0, 50 кг', 'cement-m500-50kg', 'Портландцемент без добавок, для фундаментов и несущих конструкций.', 65000, 'мешок', '', 500),
  ((SELECT id FROM categories WHERE slug='cement'), 'Цементно-песчаная смесь М150, 25 кг', 'cps-m150-25kg', 'Готовая смесь для стяжки и кладочных работ.', 32000, 'мешок', '', 300),
  ((SELECT id FROM categories WHERE slug='cement'), 'Клей для плитки, 25 кг', 'tile-glue-25kg', 'Универсальный плиточный клей для внутренних и наружных работ.', 47000, 'мешок', '', 200),
  ((SELECT id FROM categories WHERE slug='brick'), 'Кирпич керамический рядовой М150', 'brick-ceramic-m150', 'Полнотелый рядовой кирпич, морозостойкость F50.', 1800, 'шт', '', 20000),
  ((SELECT id FROM categories WHERE slug='brick'), 'Блок газобетонный 600x300x200', 'aerated-block-600x300x200', 'Газобетонный блок D500 для стен и перегородок.', 21000, 'шт', '', 4000),
  ((SELECT id FROM categories WHERE slug='brick'), 'Блок керамзитобетонный 390x190x188', 'expanded-clay-block', 'Стеновой блок, хорошая тепло- и звукоизоляция.', 8900, 'шт', '', 3000),
  ((SELECT id FROM categories WHERE slug='lumber'), 'Доска обрезная 25x150x6000, сосна', 'board-25x150x6000', 'Сорт 1-2, естественная влажность.', 89000, 'шт', '', 800),
  ((SELECT id FROM categories WHERE slug='lumber'), 'Брус 100x100x6000, сосна', 'timber-100x100x6000', 'Строганый брус для каркасов и стропил.', 145000, 'шт', '', 400),
  ((SELECT id FROM categories WHERE slug='lumber'), 'Фанера ФК 1525x1525x18 мм', 'plywood-fk-18mm', 'Влагостойкая фанера для чернового пола и опалубки.', 285000, 'лист', '', 150),
  ((SELECT id FROM categories WHERE slug='insulation'), 'Минеральная вата 1000x600x50, 8 плит', 'mineral-wool-50mm', 'Базальтовая теплоизоляция для стен и кровли.', 189000, 'упаковка', '', 600),
  ((SELECT id FROM categories WHERE slug='insulation'), 'Пенополистирол ЭППС 1180x580x50', 'xps-50mm', 'Экструдированный пенополистирол для фундамента и цоколя.', 76000, 'лист', '', 500),
  ((SELECT id FROM categories WHERE slug='insulation'), 'Пароизоляционная плёнка, 70 м2', 'vapor-barrier-70m2', 'Плёнка для защиты утеплителя от влаги.', 145000, 'рулон', '', 250),
  ((SELECT id FROM categories WHERE slug='tools'), 'Саморезы по дереву 4.2x75, 1000 шт', 'screws-4x75-1000', 'Оцинкованные саморезы для дерева.', 68000, 'упаковка', '', 700),
  ((SELECT id FROM categories WHERE slug='tools'), 'Перфоратор SDS-Plus 800 Вт', 'hammer-drill-800w', 'Перфоратор для бетона и кирпича.', 450000, 'шт', '', 60),
  ((SELECT id FROM categories WHERE slug='tools'), 'Уровень строительный 1000 мм', 'level-1000mm', 'Алюминиевый профиль, 3 глазка.', 89000, 'шт', '', 300)
ON CONFLICT (slug) DO NOTHING;
