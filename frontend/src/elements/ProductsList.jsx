import ProductCard from "./ProductCard";
import "../styles/ProductList.scss";

const ProductList = ({ products, editBars }) => {
  return (
    <div className="product-list">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} editBars={editBars} />
      ))}
    </div>
  );
};

export default ProductList;