import { IonIcon } from "@/components/IonIcon";
import { A } from "@/lib/paths";

function ActionButtons() {
  return (
    <div className="showcase-actions">
      <button type="button" className="btn-action">
        <IonIcon name="heart-outline" />
      </button>
      <button type="button" className="btn-action">
        <IonIcon name="eye-outline" />
      </button>
      <button type="button" className="btn-action">
        <IonIcon name="repeat-outline" />
      </button>
      <button type="button" className="btn-action">
        <IonIcon name="bag-add-outline" />
      </button>
    </div>
  );
}

export function ProductGrid() {
  return (
    <div className="product-main">
      <h2 className="title">New Products</h2>
      <div className="product-grid">
        <div className="showcase">
          <div className="showcase-banner">
            <img
              src={A("images/products/jacket-3.jpg")}
              alt="Mens Winter Leathers Jackets"
              width={300}
              className="product-img default"
            />
            <img
              src={A("images/products/jacket-4.jpg")}
              alt="Mens Winter Leathers Jackets"
              width={300}
              className="product-img hover"
            />
            <p className="showcase-badge">15%</p>
            <ActionButtons />
          </div>
          <div className="showcase-content">
            <a href="#" className="showcase-category">
              jacket
            </a>
            <a href="#">
              <h3 className="showcase-title">Mens Winter Leathers Jackets</h3>
            </a>
            <div className="showcase-rating">
              <IonIcon name="star" />
              <IonIcon name="star" />
              <IonIcon name="star" />
              <IonIcon name="star-outline" />
              <IonIcon name="star-outline" />
            </div>
            <div className="price-box">
              <p className="price">$48.00</p>
              <del>$75.00</del>
            </div>
          </div>
        </div>

        <div className="showcase">
          <div className="showcase-banner">
            <img
              src={A("images/products/shirt-1.jpg")}
              alt="Pure Garment Dyed Cotton Shirt"
              className="product-img default"
              width={300}
            />
            <img
              src={A("images/products/shirt-2.jpg")}
              alt="Pure Garment Dyed Cotton Shirt"
              className="product-img hover"
              width={300}
            />
            <p className="showcase-badge angle black">sale</p>
            <ActionButtons />
          </div>
          <div className="showcase-content">
            <a href="#" className="showcase-category">
              shirt
            </a>
            <h3>
              <a href="#" className="showcase-title">
                Pure Garment Dyed Cotton Shirt
              </a>
            </h3>
            <div className="showcase-rating">
              <IonIcon name="star" />
              <IonIcon name="star" />
              <IonIcon name="star" />
              <IonIcon name="star-outline" />
              <IonIcon name="star-outline" />
            </div>
            <div className="price-box">
              <p className="price">$45.00</p>
              <del>$56.00</del>
            </div>
          </div>
        </div>

        <div className="showcase">
          <div className="showcase-banner">
            <img
              src={A("images/products/jacket-5.jpg")}
              alt="MEN Yarn Fleece Full-Zip Jacket"
              className="product-img default"
              width={300}
            />
            <img
              src={A("images/products/jacket-6.jpg")}
              alt="MEN Yarn Fleece Full-Zip Jacket"
              className="product-img hover"
              width={300}
            />
            <ActionButtons />
          </div>
          <div className="showcase-content">
            <a href="#" className="showcase-category">
              Jacket
            </a>
            <h3>
              <a href="#" className="showcase-title">
                MEN Yarn Fleece Full-Zip Jacket
              </a>
            </h3>
            <div className="showcase-rating">
              <IonIcon name="star" />
              <IonIcon name="star" />
              <IonIcon name="star" />
              <IonIcon name="star-outline" />
              <IonIcon name="star-outline" />
            </div>
            <div className="price-box">
              <p className="price">$58.00</p>
              <del>$65.00</del>
            </div>
          </div>
        </div>

        <div className="showcase">
          <div className="showcase-banner">
            <img
              src={A("images/products/clothes-3.jpg")}
              alt="Black Floral Wrap Midi Skirt"
              className="product-img default"
              width={300}
            />
            <img
              src={A("images/products/clothes-4.jpg")}
              alt="Black Floral Wrap Midi Skirt"
              className="product-img hover"
              width={300}
            />
            <p className="showcase-badge angle pink">new</p>
            <ActionButtons />
          </div>
          <div className="showcase-content">
            <a href="#" className="showcase-category">
              skirt
            </a>
            <h3>
              <a href="#" className="showcase-title">
                Black Floral Wrap Midi Skirt
              </a>
            </h3>
            <div className="showcase-rating">
              <IonIcon name="star" />
              <IonIcon name="star" />
              <IonIcon name="star" />
              <IonIcon name="star" />
              <IonIcon name="star" />
            </div>
            <div className="price-box">
              <p className="price">$25.00</p>
              <del>$35.00</del>
            </div>
          </div>
        </div>

        <div className="showcase">
          <div className="showcase-banner">
            <img
              src={A("images/products/shoe-2.jpg")}
              alt="Casual Men's Brown shoes"
              className="product-img default"
              width={300}
            />
            <img
              src={A("images/products/shoe-2_1.jpg")}
              alt="Casual Men's Brown shoes"
              className="product-img hover"
              width={300}
            />
            <ActionButtons />
          </div>
          <div className="showcase-content">
            <a href="#" className="showcase-category">
              casual
            </a>
            <h3>
              <a href="#" className="showcase-title">
                Casual Men&apos;s Brown shoes
              </a>
            </h3>
            <div className="showcase-rating">
              <IonIcon name="star" />
              <IonIcon name="star" />
              <IonIcon name="star" />
              <IonIcon name="star" />
              <IonIcon name="star" />
            </div>
            <div className="price-box">
              <p className="price">$99.00</p>
              <del>$105.00</del>
            </div>
          </div>
        </div>

        <div className="showcase">
          <div className="showcase-banner">
            <img
              src={A("images/products/watch-3.jpg")}
              alt="Pocket Watch Leather Pouch"
              className="product-img default"
              width={300}
            />
            <img
              src={A("images/products/watch-4.jpg")}
              alt="Pocket Watch Leather Pouch"
              className="product-img hover"
              width={300}
            />
            <p className="showcase-badge angle black">sale</p>
            <ActionButtons />
          </div>
          <div className="showcase-content">
            <a href="#" className="showcase-category">
              watches
            </a>
            <h3>
              <a href="#" className="showcase-title">
                Pocket Watch Leather Pouch
              </a>
            </h3>
            <div className="showcase-rating">
              <IonIcon name="star" />
              <IonIcon name="star" />
              <IonIcon name="star" />
              <IonIcon name="star-outline" />
              <IonIcon name="star-outline" />
            </div>
            <div className="price-box">
              <p className="price">$150.00</p>
              <del>$170.00</del>
            </div>
          </div>
        </div>

        <div className="showcase">
          <div className="showcase-banner">
            <img
              src={A("images/products/watch-1.jpg")}
              alt="Smart watche Vital Plus"
              className="product-img default"
              width={300}
            />
            <img
              src={A("images/products/watch-2.jpg")}
              alt="Smart watche Vital Plus"
              className="product-img hover"
              width={300}
            />
            <ActionButtons />
          </div>
          <div className="showcase-content">
            <a href="#" className="showcase-category">
              watches
            </a>
            <h3>
              <a href="#" className="showcase-title">
                Smart watche Vital Plus
              </a>
            </h3>
            <div className="showcase-rating">
              <IonIcon name="star" />
              <IonIcon name="star" />
              <IonIcon name="star" />
              <IonIcon name="star" />
              <IonIcon name="star-outline" />
            </div>
            <div className="price-box">
              <p className="price">$100.00</p>
              <del>$120.00</del>
            </div>
          </div>
        </div>

        <div className="showcase">
          <div className="showcase-banner">
            <img
              src={A("images/products/party-wear-1.jpg")}
              alt="Womens Party Wear Shoes"
              className="product-img default"
              width={300}
            />
            <img
              src={A("images/products/party-wear-2.jpg")}
              alt="Womens Party Wear Shoes"
              className="product-img hover"
              width={300}
            />
            <p className="showcase-badge angle black">sale</p>
            <ActionButtons />
          </div>
          <div className="showcase-content">
            <a href="#" className="showcase-category">
              party wear
            </a>
            <h3>
              <a href="#" className="showcase-title">
                Womens Party Wear Shoes
              </a>
            </h3>
            <div className="showcase-rating">
              <IonIcon name="star" />
              <IonIcon name="star" />
              <IonIcon name="star" />
              <IonIcon name="star-outline" />
              <IonIcon name="star-outline" />
            </div>
            <div className="price-box">
              <p className="price">$25.00</p>
              <del>$30.00</del>
            </div>
          </div>
        </div>

        <div className="showcase">
          <div className="showcase-banner">
            <img
              src={A("images/products/jacket-1.jpg")}
              alt="Mens Winter Leathers Jackets"
              className="product-img default"
              width={300}
            />
            <img
              src={A("images/products/jacket-2.jpg")}
              alt="Mens Winter Leathers Jackets"
              className="product-img hover"
              width={300}
            />
            <ActionButtons />
          </div>
          <div className="showcase-content">
            <a href="#" className="showcase-category">
              jacket
            </a>
            <h3>
              <a href="#" className="showcase-title">
                Mens Winter Leathers Jackets
              </a>
            </h3>
            <div className="showcase-rating">
              <IonIcon name="star" />
              <IonIcon name="star" />
              <IonIcon name="star" />
              <IonIcon name="star" />
              <IonIcon name="star-outline" />
            </div>
            <div className="price-box">
              <p className="price">$32.00</p>
              <del>$45.00</del>
            </div>
          </div>
        </div>

        <div className="showcase">
          <div className="showcase-banner">
            <img
              src={A("images/products/sports-2.jpg")}
              alt="Trekking & Running Shoes - black"
              className="product-img default"
              width={300}
            />
            <img
              src={A("images/products/sports-4.jpg")}
              alt="Trekking & Running Shoes - black"
              className="product-img hover"
              width={300}
            />
            <p className="showcase-badge angle black">sale</p>
            <ActionButtons />
          </div>
          <div className="showcase-content">
            <a href="#" className="showcase-category">
              sports
            </a>
            <h3>
              <a href="#" className="showcase-title">
                Trekking & Running Shoes - black
              </a>
            </h3>
            <div className="showcase-rating">
              <IonIcon name="star" />
              <IonIcon name="star" />
              <IonIcon name="star" />
              <IonIcon name="star-outline" />
              <IonIcon name="star-outline" />
            </div>
            <div className="price-box">
              <p className="price">$58.00</p>
              <del>$64.00</del>
            </div>
          </div>
        </div>

        <div className="showcase">
          <div className="showcase-banner">
            <img
              src={A("images/products/shoe-1.jpg")}
              alt="Men's Leather Formal Wear shoes"
              className="product-img default"
              width={300}
            />
            <img
              src={A("images/products/shoe-1_1.jpg")}
              alt="Men's Leather Formal Wear shoes"
              className="product-img hover"
              width={300}
            />
            <ActionButtons />
          </div>
          <div className="showcase-content">
            <a href="#" className="showcase-category">
              formal
            </a>
            <h3>
              <a href="#" className="showcase-title">
                Men&apos;s Leather Formal Wear shoes
              </a>
            </h3>
            <div className="showcase-rating">
              <IonIcon name="star" />
              <IonIcon name="star" />
              <IonIcon name="star" />
              <IonIcon name="star" />
              <IonIcon name="star-outline" />
            </div>
            <div className="price-box">
              <p className="price">$50.00</p>
              <del>$65.00</del>
            </div>
          </div>
        </div>

        <div className="showcase">
          <div className="showcase-banner">
            <img
              src={A("images/products/shorts-1.jpg")}
              alt="Better Basics French Terry Sweatshorts"
              className="product-img default"
              width={300}
            />
            <img
              src={A("images/products/shorts-2.jpg")}
              alt="Better Basics French Terry Sweatshorts"
              className="product-img hover"
              width={300}
            />
            <p className="showcase-badge angle black">sale</p>
            <ActionButtons />
          </div>
          <div className="showcase-content">
            <a href="#" className="showcase-category">
              shorts
            </a>
            <h3>
              <a href="#" className="showcase-title">
                Better Basics French Terry Sweatshorts
              </a>
            </h3>
            <div className="showcase-rating">
              <IonIcon name="star" />
              <IonIcon name="star" />
              <IonIcon name="star" />
              <IonIcon name="star-outline" />
              <IonIcon name="star-outline" />
            </div>
            <div className="price-box">
              <p className="price">$78.00</p>
              <del>$85.00</del>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
