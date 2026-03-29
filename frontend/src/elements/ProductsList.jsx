import ProductCard from "./ProductCard";
import "../styles/ProductList.scss";

const ProductList = ({ onSaved, products, editBars }) => {
  return (
    <div className="product-list">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} editBars={editBars} onSaved={onSaved}/>
      ))}
    </div>
  );
};

export default ProductList;