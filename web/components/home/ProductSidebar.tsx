"use client";

import type { ReactNode } from "react";
import { IonIcon } from "@/components/IonIcon";
import { useUi } from "@/components/providers/UiProvider";
import { ACC } from "@/lib/accordion";
import { A } from "@/lib/paths";

function SidebarAccordion({
  index,
  title,
  icon,
  iconAlt,
  children,
}: {
  index: number;
  title: string;
  icon: string;
  iconAlt: string;
  children: ReactNode;
}) {
  const { openAccordionIndex, toggleAccordion } = useUi();
  const active = openAccordionIndex === index;
  return (
    <li className="sidebar-menu-category">
      <button
        type="button"
        className={`sidebar-accordion-menu ${active ? "active" : ""}`}
        data-accordion-btn
        onClick={() => toggleAccordion(index)}
      >
        <div className="menu-title-flex">
          <img src={A(`images/icons/${icon}`)} alt={iconAlt} width={20} height={20} className="menu-title-img" />
          <p className="menu-title">{title}</p>
        </div>
        <div className="sidebar-accordion-icons">
          {active ? (
            <IonIcon name="remove-outline" className="remove-icon" aria-hidden />
          ) : (
            <IonIcon name="add-outline" className="add-icon" aria-hidden />
          )}
        </div>
      </button>
      <ul className={`sidebar-submenu-category-list ${active ? "active" : ""}`} data-accordion>
        {children}
      </ul>
    </li>
  );
}

function StockLink({ name, value, display }: { name: string; value: string; display?: string }) {
  return (
    <li className="sidebar-submenu-category">
      <a href="#" className="sidebar-submenu-title">
        <p className="product-name">{name}</p>
        <data value={value} className="stock" title="Available Stock">
          {display ?? value}
        </data>
      </a>
    </li>
  );
}

export function ProductSidebar() {
  const { activeMobilePanel, closeMobilePanels } = useUi();
  const sidebarOpen = activeMobilePanel === 1;

  return (
    <div className={`sidebar  has-scrollbar ${sidebarOpen ? "active" : ""}`} data-mobile-menu>
      <div className="sidebar-category">
        <div className="sidebar-top">
          <h2 className="sidebar-title">Category</h2>
          <button type="button" className="sidebar-close-btn" data-mobile-menu-close-btn onClick={closeMobilePanels}>
            <IonIcon name="close-outline" />
          </button>
        </div>

        <ul className="sidebar-menu-category-list">
          <SidebarAccordion index={ACC.SIDEBAR_CLOTHES} title="Clothes" icon="dress.svg" iconAlt="clothes">
            <StockLink name="Shirt" value="300" />
            <StockLink name="shorts & jeans" value="60" />
            <StockLink name="jacket" value="50" />
            <StockLink name="dress & frock" value="87" />
          </SidebarAccordion>

          <SidebarAccordion index={ACC.SIDEBAR_FOOTWEAR} title="Footwear" icon="shoes.svg" iconAlt="footwear">
            <StockLink name="Sports" value="45" />
            <StockLink name="Formal" value="75" />
            <StockLink name="Casual" value="35" />
            <StockLink name="Safety Shoes" value="26" />
          </SidebarAccordion>

          <SidebarAccordion index={ACC.SIDEBAR_JEWELRY} title="Jewelry" icon="jewelry.svg" iconAlt="clothes">
            <StockLink name="Earrings" value="46" />
            <StockLink name="Couple Rings" value="73" />
            <StockLink name="Necklace" value="61" />
          </SidebarAccordion>

          <SidebarAccordion index={ACC.SIDEBAR_PERFUME} title="Perfume" icon="perfume.svg" iconAlt="perfume">
            <StockLink name="Clothes Perfume" value="12" display="12 pcs" />
            <StockLink name="Deodorant" value="60" display="60 pcs" />
            <StockLink name="jacket" value="50" display="50 pcs" />
            <StockLink name="dress & frock" value="87" display="87 pcs" />
          </SidebarAccordion>

          <SidebarAccordion index={ACC.SIDEBAR_COSMETICS} title="Cosmetics" icon="cosmetics.svg" iconAlt="cosmetics">
            <StockLink name="Shampoo" value="68" />
            <StockLink name="Sunscreen" value="46" />
            <StockLink name="Body Wash" value="79" />
            <StockLink name="Makeup Kit" value="23" />
          </SidebarAccordion>

          <SidebarAccordion index={ACC.SIDEBAR_GLASSES} title="Glasses" icon="glasses.svg" iconAlt="glasses">
            <StockLink name="Sunglasses" value="50" />
            <StockLink name="Lenses" value="48" />
          </SidebarAccordion>

          <SidebarAccordion index={ACC.SIDEBAR_BAGS} title="Bags" icon="bag.svg" iconAlt="bags">
            <StockLink name="Shopping Bag" value="62" />
            <StockLink name="Gym Backpack" value="35" />
            <StockLink name="Purse" value="80" />
            <StockLink name="Wallet" value="75" />
          </SidebarAccordion>
        </ul>
      </div>

      <div className="product-showcase">
        <h3 className="showcase-heading">best sellers</h3>
        <div className="showcase-wrapper">
          <div className="showcase-container">
            <div className="showcase">
              <a href="#" className="showcase-img-box">
                <img src={A("images/products/1.jpg")} alt="baby fabric shoes" width={75} height={75} className="showcase-img" />
              </a>
              <div className="showcase-content">
                <a href="#">
                  <h4 className="showcase-title">baby fabric shoes</h4>
                </a>
                <div className="showcase-rating">
                  <IonIcon name="star" />
                  <IonIcon name="star" />
                  <IonIcon name="star" />
                  <IonIcon name="star" />
                  <IonIcon name="star" />
                </div>
                <div className="price-box">
                  <del>$5.00</del>
                  <p className="price">$4.00</p>
                </div>
              </div>
            </div>

            <div className="showcase">
              <a href="#" className="showcase-img-box">
                <img
                  src={A("images/products/2.jpg")}
                  alt="men's hoodies t-shirt"
                  className="showcase-img"
                  width={75}
                  height={75}
                />
              </a>
              <div className="showcase-content">
                <a href="#">
                  <h4 className="showcase-title">men&apos;s hoodies t-shirt</h4>
                </a>
                <div className="showcase-rating">
                  <IonIcon name="star" />
                  <IonIcon name="star" />
                  <IonIcon name="star" />
                  <IonIcon name="star" />
                  <IonIcon name="star-half-outline" />
                </div>
                <div className="price-box">
                  <del>$17.00</del>
                  <p className="price">$7.00</p>
                </div>
              </div>
            </div>

            <div className="showcase">
              <a href="#" className="showcase-img-box">
                <img src={A("images/products/3.jpg")} alt="girls t-shirt" className="showcase-img" width={75} height={75} />
              </a>
              <div className="showcase-content">
                <a href="#">
                  <h4 className="showcase-title">girls t-shirt</h4>
                </a>
                <div className="showcase-rating">
                  <IonIcon name="star" />
                  <IonIcon name="star" />
                  <IonIcon name="star" />
                  <IonIcon name="star" />
                  <IonIcon name="star-half-outline" />
                </div>
                <div className="price-box">
                  <del>$5.00</del>
                  <p className="price">$3.00</p>
                </div>
              </div>
            </div>

            <div className="showcase">
              <a href="#" className="showcase-img-box">
                <img
                  src={A("images/products/4.jpg")}
                  alt="woolen hat for men"
                  className="showcase-img"
                  width={75}
                  height={75}
                />
              </a>
              <div className="showcase-content">
                <a href="#">
                  <h4 className="showcase-title">woolen hat for men</h4>
                </a>
                <div className="showcase-rating">
                  <IonIcon name="star" />
                  <IonIcon name="star" />
                  <IonIcon name="star" />
                  <IonIcon name="star" />
                  <IonIcon name="star" />
                </div>
                <div className="price-box">
                  <del>$15.00</del>
                  <p className="price">$12.00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
