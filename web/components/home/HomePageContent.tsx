import { BannerSection } from "./BannerSection";
import { BlogSection } from "./BlogSection";
import { CategorySection } from "./CategorySection";
import { ProductContainer } from "./ProductContainer";
import { TestimonialsCtaService } from "./TestimonialsCtaService";

export function HomePageContent() {
  return (
    <>
      <BannerSection />
      <CategorySection />
      <ProductContainer />
      <TestimonialsCtaService />
      <BlogSection />
    </>
  );
}
