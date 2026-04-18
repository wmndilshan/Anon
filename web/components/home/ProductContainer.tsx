import { ProductFeaturedDeal } from "./ProductFeaturedDeal";
import { ProductGrid } from "./ProductGrid";
import { ProductMinimalSection } from "./ProductMinimalSection";
import { ProductSidebar } from "./ProductSidebar";

export function ProductContainer() {
  return (
    <div className="product-container">
      <div className="container">
        <ProductSidebar />
        <div className="product-box">
          <ProductMinimalSection />
          <ProductFeaturedDeal />
          <ProductGrid />
        </div>
      </div>
    </div>
  );
}
