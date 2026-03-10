/**
 * Начальные данные (стартовые товары).
 * В практиках 3–4 мы используем in-memory массив (без БД).
 * Студенты могут расширить схему полями: category, description, stock, rating, imageUrl и т.д.
 */
module.exports = [
  {
    id: "p1",
    title: "Печенье",
    category: "Сладости",
    description: "Хрустящее печенье к чаю.",
    price: 79,
    stock: 20,
    rating: 4.6,
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvVKv44o91oykYyMd1cnPPkb8UmNpRgU6XKg&s"
  },
  {
    id: "p2",
    title: "Молоко",
    category: "Напитки",
    description: "Ультрапастеризованное 2.5%.",
    price: 99,
    stock: 15,
    rating: 4.3,
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvVKv44o91oykYyMd1cnPPkb8UmNpRgU6XKg&s"
  },
  {
    id: "p3",
    title: "Хлеб",
    category: "Выпечка",
    description: "Свежий, мягкий, 400 г.",
    price: 59,
    stock: 30,
    rating: 4.1,
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-NF_Rl-5TFKTWRdAE7XbB0Yfri8W-bCICng&s"
  }
];
