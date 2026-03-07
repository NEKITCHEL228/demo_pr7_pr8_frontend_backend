const express = require("express");
const { nanoid } = require("nanoid");
const { authMiddleware } = require("../middleware/authJwt");

// JSON-store (лекция 2): чтение/запись товаров в backend/data/products.json
// Важно: products.json — локальное runtime-хранилище (в .gitignore), а стартовые данные — в products.seed.json
const productsStore = require("../store/productsStore");

const router = express.Router();

/**
 * products.js — маршруты (routes) для работы с товарами
 *
 * Как читать этот файл:
 * 1) Сверху подключаем зависимости (Express, nanoid, authMiddleware, productsStore).
 * 2) Создаём router = "мини-приложение" Express, куда складываем эндпоинты.
 * 3) Работаем с данными через productsStore (JSON-файл), а не через in-memory массив.
 *
 * Важно про хранение (лекция 2):
 * - productsStore.readAll() читает backend/data/products.json
 * - productsStore.add/patch/remove записывают изменения в products.json
 * - если products.json ещё не существует, store создаст его из products.seed.json
 *
 * Важно про "защиту" (Практика 8):
 * - authMiddleware проверяет JWT токен из заголовка:
 *   Authorization: Bearer <token>
 * - Если токена нет/он неверный → 401.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - title
 *         - price
 *         - description
 *         - category
 *       properties:
 *         id:
 *           type: string
 *           description: Уникальный ID товара
 *         title:
 *           type: string
 *           description: Название товара
 *         category:
 *           type: string
 *           description: Категория товара
 *         description:
 *           type: string
 *           description: Описание товара
 *         price:
 *           type: number
 *           description: Цена товара
 *         stock:
 *           type: integer
 *           description: Количество на складе
 *         rating:
 *           type: number
 *           description: Рейтинг (опционально)
 *         imageUrl:
 *           type: string
 *           description: URL картинки (опционально)
 *       example:
 *         id: "p1"
 *         title: "Печенье"
 *         category: "Сладости"
 *         description: "Хрустящее печенье к чаю."
 *         price: 79
 *         stock: 20
 *         rating: 4.6
 *         imageUrl: ""
 */

/**
 * TODO (Практика 8 — JWT):
 * - Сейчас защищены: GET /api/products/:id, PUT /api/products/:id, DELETE /api/products/:id
 * - PATCH /api/products/:id сейчас НЕ защищён.
 *   Сделайте его защищённым так же, как PUT/DELETE:
 *     router.patch("/:id", authMiddleware, ...)
 *
 * TODO (Практика 5 — Swagger):
 * - Допишите Swagger-аннотации для:
 *   - GET /api/products/:id
 *   - PUT /api/products/:id
 *   - PATCH /api/products/:id
 *   - DELETE /api/products/:id
 * - Для защищённых маршрутов добавьте:
 *     security:
 *       - bearerAuth: []
 *
 * TODO (Практика 3 — качество API):
 * - Добавьте строгую валидацию входных данных:
 *   title/category/description/price/stock (+ корректные типы, NaN, отрицательные значения)
 * - Приведите ошибки к единому формату:
 *   { error: "code", message: "Сообщение на русском" }
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Возвращает список товаров
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Список товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */

// GET /api/products — список товаров (публичный)
router.get("/", async (req, res, next) => {
  try {
    const list = await productsStore.readAll();
    res.json(list);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *  get:
 *    summary: Возвращает товар по ID
 *    tags: [Products]
 *    security:
 *     - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *          minLenght: 8
 *          maxLenght: 8
 *          example: 7pdGxNSBht
 *        required: true
 *        description: Индетификатор товара
 *    responses:
 *      200:
 *        description: Товар
 *        content: 
 *          application/json:
 *            schema:
 *              type: object
 *              $ref: '#/components/schemas/Product'
 *      404:
 *        description: Товар не найден
 */

// GET /api/products/:id — один товар (защищённый)
router.get("/:id", authMiddleware, async (req, res, next) => {
  try {
    const list = await productsStore.readAll();
    const product = list.find((p) => p.id === req.params.id) || null;

    if (!product) return res.status(404).json({ error: "product_not_found", message: "Товар не найден" });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создаёт новый товар
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - price
 *               - stock
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               rating:
 *                 type: number
 *               imageUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Товар успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Ошибка в теле запроса
 */

// POST /api/products — добавить товар (публичный)
router.post("/", async (req, res, next) => {
  try {
    const { title, category, description, price, stock, rating, imageUrl } = req.body;

    // TODO (студентам): полноценная валидация, иначе можно сохранить "мусор"
    if (typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({ error: "title is required (string)", message: "title обязателен и должен быть строкой" });
    }

    if (typeof price !== "number" || price.toString().trim() === "") {
      return res.status(400).json({ error: "price is required (number)", message: "price обязателен и должен быть числом" })
    }

    if (typeof stock !== "number" || stock.toString().trim() === "") {
      return res.status(400).json({ error: "stock is required (number)", message: "stock обязателен и должен быть числом" })
    }

    const newProduct = {
      id: nanoid(8),
      title: title.trim(),
      category: typeof category === "string" ? category.trim() : "Без категории",
      description: typeof description === "string" ? description.trim() : "",
      price: Number(price) || 0,
      stock: Number(stock) || 0,
      rating: rating !== undefined ? Number(rating) : undefined,
      imageUrl: typeof imageUrl === "string" ? imageUrl.trim() : "",
    };

    await productsStore.add(newProduct);
    res.status(201).json(newProduct);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Заменяет существующий товар
 *     tags: [Products]
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *          minLenght: 8
 *          maxLenght: 8
 *          example: 7pdGxNSBht
 *        required: true
 *        description: Индетификатор товара
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - price
 *               - stock
 *               - category
 *               - description
 *               - rating
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               rating:
 *                 type: number
 *               imageUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Товар успешно заменен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 */

// PUT /api/products/:id — полное обновление (защищённый маршрут в Практике 8)
router.put("/:id", authMiddleware, async (req, res, next) => {
  try {
    // Учебный вариант: используем patch под капотом.
    // TODO (студентам): реализовать строгий PUT (обязательные поля и типы)
    const updated = await productsStore.patch(req.params.id, req.body);

    if (!updated) return res.status(404).json({ error: "product_not_found", message: "Товар не найден" });
    res.status(201).json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   patch:
 *     summary: Изменяет существующий товар
 *     tags: [Products]
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *          minLenght: 8
 *          maxLenght: 8
 *          example: 7pdGxNSBht
 *        required: true
 *        description: Индетификатор товара
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               rating:
 *                 type: number
 *               imageUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Товар успешно изменен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 */

// PATCH /api/products/:id — частичное обновление (СЕЙЧАС НЕ ЗАЩИЩЁН, как TODO для Практики 8)
router.patch("/:id", async (req, res, next) => {
  try {
    const updated = await productsStore.patch(req.params.id, req.body);

    if (!updated) return res.status(404).json({ error: "product_not_found", message: "Товар не найден" });
    res.status(201).json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удаляет существующий товар
 *     tags: [Products]
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *          minLenght: 8
 *          maxLenght: 8
 *          example: 7pdGxNSBht
 *        required: true
 *        description: Индетификатор товара
 *     responses:
 *       204:
 *         description: Товар успешно удален
 *       404:
 *         description: Товар не найден
 */

// DELETE /api/products/:id — удалить товар (защищённый)
router.delete("/:id", authMiddleware, async (req, res, next) => {
  try {
    const ok = await productsStore.remove(req.params.id);

    if (!ok) return res.status(404).json({ error: "product_not_found", message: "Товар не найден" });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
