const jwt = require("jsonwebtoken");

/**
 * JWT_SECRET — секретная строка, которой сервер:
 * 1) подписывает токен (jwt.sign)
 * 2) потом проверяет подпись токена (jwt.verify)
 *
 * Важно:
 * - Если поменять JWT_SECRET, то ВСЕ старые токены станут недействительными.
 * - В реальных проектах секрет хранится в переменных окружения (env), а не в коде.
 */
const JWT_SECRET = process.env.JWT_SECRET || "access_secret";
//берём process.env.JWT_SECRET, если он задан, иначе используем строку по умолчанию "access_secret"

/**
 * REFRESH_SECRET — отдельный секрет для REFRESH токена (Практика 9).
 * Зачем отдельный:
 * - чтобы refresh нельзя было использовать как access
 * - чтобы проверка refresh была отделена от проверки access
 */
const REFRESH_SECRET = process.env.REFRESH_SECRET || "refresh_secret"

/**
 * Срок жизни токенов (формат, который понимает jsonwebtoken):
 * - "15m" = 15 минут
 * - "7d"  = 7 дней
 *
 * Практика 9:
 * - accessToken короткий (часто обновляется)
 * - refreshToken длинный (нужен для автоматического перевыпуска accessToken)
 */
const ACCESS_EXPIRES_IN = process.env.ACCESS_EXPIRES_IN || "15m";
const REFRESH_EXPIRES_IN = process.env.REFRESH_EXPIRES_IN || "7d";

/**
 * authMiddleware — "охранник" перед защищёнными маршрутами.
 *
 * Что он проверяет:
 * - клиент обязан прислать заголовок:
 *   Authorization: Bearer <token>
 *
 * Если всё ок:
 * - jwt.verify(token, JWT_SECRET) вернёт payload (то, что мы положили в jwt.sign)
 * - middleware кладёт payload в req.user
 * - вызывает next() → запрос идёт дальше в обработчик роутера
 *
 * Если не ок:
 * - возвращаем 401 и НЕ пускаем дальше
 */
function authMiddleware(req, res, next) {
  // Забираем заголовок Authorization (если его нет — будет пустая строка)
  const header = req.headers.authorization || "";

  // header должен быть вида: "Bearer eyJhbGciOi..."
  const [scheme, token] = header.split(" ");

  // 1) Нет "Bearer" или нет токена → сразу 401
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      error: "auth_header_missing",
      message: "Нужен заголовок Authorization: Bearer <token>",
    });
  }

  try {
    // 2) Проверяем подпись токена и срок действия (exp)
    const payload = jwt.verify(token, JWT_SECRET);

    // payload — это объект, который мы подписали при логине.
    // Например: { sub: userId, email, iat, exp }
    req.user = payload;

    // 3) Пропускаем запрос дальше → к защищённому обработчику
    next();
  } catch (err) {
    // Сюда попадём, если токен:
    // - подделан
    // - протух (expired)
    // - подписан другим секретом
    return res.status(401).json({
      error: "token_invalid",
      message: "Токен недействителен или срок действия истёк",
    });
  }
}

function requireRole(requiredRole) {
  return (req, res, next) => {
    const actualRole = req.user?.role;
    if (actualRole !== requiredRole) {
      return res.status(403).json({
        error: "forbidden",
        message: `Доступ запрещён. Нужна роль: ${requiredRole}`,
      });
    }
    next();
  };
}

module.exports = { authMiddleware, requireRole, JWT_SECRET, REFRESH_SECRET, ACCESS_EXPIRES_IN, REFRESH_EXPIRES_IN };