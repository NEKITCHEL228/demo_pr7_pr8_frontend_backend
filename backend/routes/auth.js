const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { nanoid } = require("nanoid");

const { authMiddleware, JWT_SECRET } = require("../middleware/authJwt");

const router = express.Router();

/**
 * Учебное хранилище пользователей.
 * Здесь НЕТ базы данных: пользователи живут в памяти процесса Node.js.
 *
 * Важно:
 * - После перезапуска сервера массив users очищается.
 * - В реальных проектах вместо users[] будет БД (Postgres, Mongo, SQLite) или файл.
 * - В users[] мы НЕ храним пароль, только bcrypt-хеш (passwordHash).
 */

/**
 * @swagger
 * components:
 *  schemas:
 *       User:
 *        type: object
 *        required:
 *          - email
 *          - first_name
 *          - last_name
 *          - password
 *        properties:
 *          id:
 *            type: string
 *            description: Уникальный ID пользователя
 *          email:
 *            type: string
 *            description: Email пользователя
 *          first_name:
 *            type: string
 *            description: Имя пользователя
 *          last_name:
 *            type: string
 *            description: Фамилия пользователя
 *          password:
 *            type: string
 *            description: Хэшированный пароль пользователя
 *        example:
 *          id: "u1"
 *          email: "user@example.com"
 *          first_name: "Иван"
 *          last_name: "Иванов"
 *          password: "hashed_password"
 */

const users = [];

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Регистрация и вход
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация пользователя
 *     description: Создаёт пользователя и сохраняет пароль в виде bcrypt-хеша.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, first_name, last_name, password]
 *             properties:
 *               email: { type: string, example: "ivan@mail.ru" }
 *               first_name: { type: string, example: "Иван" }
 *               last_name: { type: string, example: "Иванов" }
 *               password: { type: string, example: "qwerty123" }
 *     responses:
 *       201:
 *         description: Пользователь создан
 *       400:
 *         description: Некорректные данные
 */
router.post("/register", async (req, res) => {
  // 1) Из тела запроса (JSON) берём поля пользователя
  // req.body появляется благодаря app.use(express.json()) в app.js
  const { email, first_name, last_name, password } = req.body;

  // Убираем ведущие/концевые пробелы из имени/фамилии и приводим email к lowercase
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const trimmedFirstName = String(first_name || "").trim();
  const trimmedLastName = String(last_name || "").trim();
  const rawPassword = String(password || "");

  // 2) Минимальная валидация: все поля обязательны
  // - Email должен быть валидным
  // - Пароль должен быть достаточно длинным
  // - Имя/фамилия не должны быть пустыми после тримминга
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!normalizedEmail || !trimmedFirstName || !trimmedLastName || !rawPassword) {
    return res.status(400).json({
      error: "validation_error",
      message: "Нужны поля: email, first_name, last_name, password",
    });
  }

  if (!emailRegex.test(normalizedEmail)) {
    return res.status(400).json({
      error: "validation_error",
      message: "Неправильный формат email",
    });
  }

  if (rawPassword.length < 6) {
    return res.status(400).json({
      error: "validation_error",
      message: "Пароль должен содержать не менее 6 символов",
    });
  }

  // 3) Проверяем, что пользователь с таким email ещё не зарегистрирован
  const exists = users.find((u) => u.email === normalizedEmail);
  if (exists) {
    return res.status(400).json({
      error: "user_exists",
      message: "Пользователь с таким email уже зарегистрирован",
    });
  }

  // 4) bcrypt.hash — это “солёный” хеш пароля.
  // 10 — cost factor (сколько “тяжело” считать хеш). Чем больше, тем медленнее, но безопаснее.
  // Соль библиотека делает автоматически
  //  $2b$10$KYVbZ5JFVfqu0oV98LnF5eTk4QTe2e4PQG7QNYfhumEpGdi/867AO
  //  |--|--|----------------------|-------------------------------|
  //  |  |           |                          |
  //  |  |           |                          └─ итоговый хеш
  //  |  |           └─ соль
  //  |  └─ cost factor
  //  └─ версия bcrypt
  const passwordHash = await bcrypt.hash(String(password), 10);
  // 10 — cost factor; определяет, насколько вычисление хеша будет тяжёлым.
  //	•	8 — быстрее;
  //  •	10 — стандартно;
  //  •	12 — медленнее;
  //  •	14 — ещё тяжелее.

  // 5) Создаём пользователя (id — случайный)
  const user = {
    id: nanoid(8),
    email: normalizedEmail,
    first_name: String(first_name),
    last_name: String(last_name),
    passwordHash, // ВАЖНО: храним только хеш, не пароль
  };

  // 6) Сохраняем в "учебное хранилище" (память)
  users.push(user);

  // 7) Возвращаем публичные данные (НИКОГДА не возвращаем passwordHash клиенту)
  return res.status(201).json({
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
  });
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вход в систему
 *     description: Проверяет пароль и возвращает accessToken (JWT).
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: "ivan@mail.ru" }
 *               password: { type: string, example: "qwerty123" }
 *     responses:
 *       200:
 *         description: Успешный вход (JWT выдан)
 *       401:
 *         description: Неверные учётные данные
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // 1) Базовая проверка входных данных
  if (!email || !password) {
    return res.status(400).json({
      error: "validation_error",
      message: "Нужны поля: email, password",
    });
  }

  // 2) Находим пользователя по email
  const normalizedEmail = String(email).toLowerCase();
  const user = users.find((u) => u.email === normalizedEmail);
  if (!user) {
    // Важно: одинаковая ошибка и для “нет пользователя”, и для “неверный пароль”
    // чтобы не давать атакующему понять, существует ли email.
    return res.status(401).json({
      error: "invalid_credentials",
      message: "Неверный email или пароль",
    });
  }

  // 3) bcrypt.compare сравнивает “введённый пароль” с “хешем из хранилища”
  const ok = await bcrypt.compare(String(password), user.passwordHash);
  if (!ok) {
    return res.status(401).json({
      error: "invalid_credentials",
      message: "Неверный email или пароль",
    });
  }

  // 4) JWT — это токен, который клиент кладёт в заголовок:
  // Authorization: Bearer <token>
  //
  // payload (то что попадет в токен):
  // - sub (subject) = id пользователя
  // - email = для удобства
  //
  // expiresIn: "15m" — токен протухнет через 15 минут (токен с ограниченным сроком дейтсвия)
  const accessToken = jwt.sign(
    { sub: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: "15m" }
  );

  // JWT_SECRET - Это ключ подписи.

  return res.json({ accessToken });
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Возвращает текущего пользователя (по JWT)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Пользователь
 *       401:
 *         description: Нет токена или токен невалиден
 *       404:
 *         description: Пользователь не найден
 */

router.get("/me", authMiddleware, (req, res) => {
  // authMiddleware уже проверил JWT и положил payload в req.user
  // req.user = { sub, email, iat, exp }
  const userId = req.user.sub;

  // В учебной версии ищем пользователя в памяти
  const user = users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({
      error: "user_not_found",
      message: "Пользователь не найден",
    });
  }

  // Возвращаем “профиль” 
  return res.json({
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
  });
});

module.exports = router;