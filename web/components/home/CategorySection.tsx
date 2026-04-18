import { A } from "@/lib/paths";

const categories = [
  { icon: "dress.svg", alt: "dress & frock", title: "Dress & frock", amount: "(53)" },
  { icon: "coat.svg", alt: "winter wear", title: "Winter wear", amount: "(58)" },
  { icon: "glasses.svg", alt: "glasses & lens", title: "Glasses & lens", amount: "(68)" },
  { icon: "shorts.svg", alt: "shorts & jeans", title: "Shorts & jeans", amount: "(84)" },
  { icon: "tee.svg", alt: "t-shirts", title: "T-shirts", amount: "(35)" },
  { icon: "jacket.svg", alt: "jacket", title: "Jacket", amount: "(16)" },
  { icon: "watch.svg", alt: "watch", title: "Watch", amount: "(27)" },
  { icon: "hat.svg", alt: "hat & caps", title: "Hat & caps", amount: "(39)" },
];

export function CategorySection() {
  return (
    <div className="category">
      <div className="container">
        <div className="category-item-container has-scrollbar">
          {categories.map((c) => (
            <div className="category-item" key={c.title}>
              <div className="category-img-box">
                <img src={A(`images/icons/${c.icon}`)} alt={c.alt} width={30} />
              </div>
              <div className="category-content-box">
                <div className="category-content-flex">
                  <h3 className="category-item-title">{c.title}</h3>
                  <p className="category-item-amount">{c.amount}</p>
                </div>
                <a href="#" className="category-btn">
                  Show all
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
