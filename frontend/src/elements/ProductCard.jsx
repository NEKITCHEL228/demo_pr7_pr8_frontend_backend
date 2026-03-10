const ProductCard = ({ product }) => {
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating ? '★' : '☆');
    }
    return stars.join('');
  };

  return (
    <div className="product-card">
      <img
        src={product.imageUrl}
        alt={product.title}
        onError={(e) => e.target.src = '../images/zaglushka.jpg'}
      />
      <h3 className="product-title">{product.title}</h3>
      <p className="product-category">Категория: {product.category}</p>
      <p className="product-description">{product.description}</p>
      <div className="product-rating">
        Рейтинг: {renderStars(product.rating)}
      </div>
      <div className="product-price-stock">
        <p className="product-price">{product.price.toFixed(2)} ₽</p>
        <p className="product-stock">В наличии: {product.stock} шт.</p>
      </div>
    </div>
  );
};

export default ProductCard;