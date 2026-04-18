"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { IonIcon } from "@/components/IonIcon";
import { useUi } from "@/components/providers/UiProvider";
import { ACC } from "@/lib/accordion";
import { A } from "@/lib/paths";

function AccordionMenu({
  index,
  title,
  children,
}: {
  index: number;
  title: string;
  children: ReactNode;
}) {
  const { openAccordionIndex, toggleAccordion } = useUi();
  const active = openAccordionIndex === index;
  return (
    <>
      <button
        type="button"
        className={`accordion-menu ${active ? "active" : ""}`}
        data-accordion-btn
        onClick={() => toggleAccordion(index)}
      >
        <p className="menu-title">{title}</p>
        <div className="accordion-menu-icons">
          {active ? (
            <IonIcon name="remove-outline" className="remove-icon" aria-hidden />
          ) : (
            <IonIcon name="add-outline" className="add-icon" aria-hidden />
          )}
        </div>
      </button>
      <ul className={`submenu-category-list ${active ? "active" : ""}`} data-accordion>
        {children}
      </ul>
    </>
  );
}

export function Header() {
  const { activeMobilePanel, openMobilePanel, closeMobilePanels, openAccordionIndex, toggleAccordion } =
    useUi();

  const navActive = activeMobilePanel === 0;
  const sidebarActive = activeMobilePanel === 1;

  const langActive = openAccordionIndex === ACC.MOBILE_LANGUAGE;
  const curActive = openAccordionIndex === ACC.MOBILE_CURRENCY;

  return (
    <header>
      <div className="header-top">
        <div className="container">
          <ul className="header-social-container">
            <li>
              <a href="#" className="social-link">
                <IonIcon name="logo-facebook" />
              </a>
            </li>
            <li>
              <a href="#" className="social-link">
                <IonIcon name="logo-twitter" />
              </a>
            </li>
            <li>
              <a href="#" className="social-link">
                <IonIcon name="logo-instagram" />
              </a>
            </li>
            <li>
              <a href="#" className="social-link">
                <IonIcon name="logo-linkedin" />
              </a>
            </li>
          </ul>

          <div className="header-alert-news">
            <p>
              <b>Free Shipping</b>
              This Week Order Over - $55
            </p>
          </div>

          <div className="header-top-actions">
            <select name="currency" defaultValue="usd">
              <option value="usd">USD $</option>
              <option value="eur">EUR €</option>
            </select>
            <select name="language" defaultValue="en-US">
              <option value="en-US">English</option>
              <option value="es-ES">Español</option>
              <option value="fr">Français</option>
            </select>
          </div>
        </div>
      </div>

      <div className="header-main">
        <div className="container">
          <Link href="/" className="header-logo">
            <img src={A("images/logo/logo.svg")} alt="Anon's logo" width={120} height={36} />
          </Link>

          <div className="header-search-container">
            <input
              type="search"
              name="search"
              className="search-field"
              placeholder="Enter your product name..."
            />
            <button type="button" className="search-btn">
              <IonIcon name="search-outline" />
            </button>
          </div>

          <div className="header-user-actions">
            <button type="button" className="action-btn">
              <IonIcon name="person-outline" />
            </button>
            <button type="button" className="action-btn">
              <IonIcon name="heart-outline" />
              <span className="count">0</span>
            </button>
            <button type="button" className="action-btn">
              <IonIcon name="bag-handle-outline" />
              <span className="count">0</span>
            </button>
          </div>
        </div>
      </div>

      <nav className="desktop-navigation-menu">
        <div className="container">
          <ul className="desktop-menu-category-list">
            <li className="menu-category">
              <Link href="/" className="menu-title">
                Home
              </Link>
            </li>

            <li className="menu-category">
              <a href="#" className="menu-title">
                Categories
              </a>
              <div className="dropdown-panel">
                <ul className="dropdown-panel-list">
                  <li className="menu-title">
                    <a href="#">Electronics</a>
                  </li>
                  <li className="panel-list-item">
                    <a href="#">Desktop</a>
                  </li>
                  <li className="panel-list-item">
                    <a href="#">Laptop</a>
                  </li>
                  <li className="panel-list-item">
                    <a href="#">Camera</a>
                  </li>
                  <li className="panel-list-item">
                    <a href="#">Tablet</a>
                  </li>
                  <li className="panel-list-item">
                    <a href="#">Headphone</a>
                  </li>
                  <li className="panel-list-item">
                    <a href="#">
                      <img
                        src={A("images/electronics-banner-1.jpg")}
                        alt="headphone collection"
                        width={250}
                        height={119}
                      />
                    </a>
                  </li>
                </ul>
                <ul className="dropdown-panel-list">
                  <li className="menu-title">
                    <a href="#">Men&apos;s</a>
                  </li>
                  <li className="panel-list-item">
                    <a href="#">Formal</a>
                  </li>
                  <li className="panel-list-item">
                    <a href="#">Casual</a>
                  </li>
                  <li className="panel-list-item">
                    <a href="#">Sports</a>
                  </li>
                  <li className="panel-list-item">
                    <a href="#">Jacket</a>
                  </li>
                  <li className="panel-list-item">
                    <a href="#">Sunglasses</a>
                  </li>
                  <li className="panel-list-item">
                    <a href="#">
                      <img src={A("images/mens-banner.jpg")} alt="men's fashion" width={250} height={119} />
                    </a>
                  </li>
                </ul>
                <ul className="dropdown-panel-list">
                  <li className="menu-title">
                    <a href="#">Women&apos;s</a>
                  </li>
                  <li className="panel-list-item">
                    <a href="#">Formal</a>
                  </li>
                  <li className="panel-list-item">
                    <a href="#">Casual</a>
                  </li>
                  <li className="panel-list-item">
                    <a href="#">Perfume</a>
                  </li>
                  <li className="panel-list-item">
                    <a href="#">Cosmetics</a>
                  </li>
                  <li className="panel-list-item">
                    <a href="#">Bags</a>
                  </li>
                  <li className="panel-list-item">
                    <a href="#">
                      <img
                        src={A("images/womens-banner.jpg")}
                        alt="women's fashion"
                        width={250}
                        height={119}
                      />
                    </a>
                  </li>
                </ul>
                <ul className="dropdown-panel-list">
                  <li className="menu-title">
                    <a href="#">Electronics</a>
                  </li>
                  <li className="panel-list-item">
                    <a href="#">Smart Watch</a>
                  </li>
                  <li className="panel-list-item">
                    <a href="#">Smart TV</a>
                  </li>
                  <li className="panel-list-item">
                    <a href="#">Keyboard</a>
                  </li>
                  <li className="panel-list-item">
                    <a href="#">Mouse</a>
                  </li>
                  <li className="panel-list-item">
                    <a href="#">Microphone</a>
                  </li>
                  <li className="panel-list-item">
                    <a href="#">
                      <img
                        src={A("images/electronics-banner-2.jpg")}
                        alt="mouse collection"
                        width={250}
                        height={119}
                      />
                    </a>
                  </li>
                </ul>
              </div>
            </li>

            <li className="menu-category">
              <a href="#" className="menu-title">
                Men&apos;s
              </a>
              <ul className="dropdown-list">
                <li className="dropdown-item">
                  <a href="#">Shirt</a>
                </li>
                <li className="dropdown-item">
                  <a href="#">Shorts & Jeans</a>
                </li>
                <li className="dropdown-item">
                  <a href="#">Safety Shoes</a>
                </li>
                <li className="dropdown-item">
                  <a href="#">Wallet</a>
                </li>
              </ul>
            </li>

            <li className="menu-category">
              <a href="#" className="menu-title">
                Women&apos;s
              </a>
              <ul className="dropdown-list">
                <li className="dropdown-item">
                  <a href="#">Dress & Frock</a>
                </li>
                <li className="dropdown-item">
                  <a href="#">Earrings</a>
                </li>
                <li className="dropdown-item">
                  <a href="#">Necklace</a>
                </li>
                <li className="dropdown-item">
                  <a href="#">Makeup Kit</a>
                </li>
              </ul>
            </li>

            <li className="menu-category">
              <a href="#" className="menu-title">
                Jewelry
              </a>
              <ul className="dropdown-list">
                <li className="dropdown-item">
                  <a href="#">Earrings</a>
                </li>
                <li className="dropdown-item">
                  <a href="#">Couple Rings</a>
                </li>
                <li className="dropdown-item">
                  <a href="#">Necklace</a>
                </li>
                <li className="dropdown-item">
                  <a href="#">Bracelets</a>
                </li>
              </ul>
            </li>

            <li className="menu-category">
              <a href="#" className="menu-title">
                Perfume
              </a>
              <ul className="dropdown-list">
                <li className="dropdown-item">
                  <a href="#">Clothes Perfume</a>
                </li>
                <li className="dropdown-item">
                  <a href="#">Deodorant</a>
                </li>
                <li className="dropdown-item">
                  <a href="#">Flower Fragrance</a>
                </li>
                <li className="dropdown-item">
                  <a href="#">Air Freshener</a>
                </li>
              </ul>
            </li>

            <li className="menu-category">
              <Link href="/blog" className="menu-title">
                Blog
              </Link>
            </li>

            <li className="menu-category">
              <Link href="/hot-offers" className="menu-title">
                Hot Offers
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      <div className="mobile-bottom-navigation">
        <button type="button" className="action-btn" data-mobile-menu-open-btn onClick={() => openMobilePanel(0)}>
          <IonIcon name="menu-outline" />
        </button>
        <button type="button" className="action-btn">
          <IonIcon name="bag-handle-outline" />
          <span className="count">0</span>
        </button>
        <Link href="/" className="action-btn">
          <IonIcon name="home-outline" />
        </Link>
        <button type="button" className="action-btn">
          <IonIcon name="heart-outline" />
          <span className="count">0</span>
        </button>
        <button type="button" className="action-btn" data-mobile-menu-open-btn onClick={() => openMobilePanel(1)}>
          <IonIcon name="grid-outline" />
        </button>
      </div>

      <nav className={`mobile-navigation-menu  has-scrollbar ${navActive ? "active" : ""}`} data-mobile-menu>
        <div className="menu-top">
          <h2 className="menu-title">Menu</h2>
          <button type="button" className="menu-close-btn" data-mobile-menu-close-btn onClick={closeMobilePanels}>
            <IonIcon name="close-outline" />
          </button>
        </div>

        <ul className="mobile-menu-category-list">
          <li className="menu-category">
            <Link href="/" className="menu-title">
              Home
            </Link>
          </li>

          <li className="menu-category">
            <AccordionMenu index={ACC.MOBILE_MENS} title="Men's">
              <li className="submenu-category">
                <a href="#" className="submenu-title">
                  Shirt
                </a>
              </li>
              <li className="submenu-category">
                <a href="#" className="submenu-title">
                  Shorts & Jeans
                </a>
              </li>
              <li className="submenu-category">
                <a href="#" className="submenu-title">
                  Safety Shoes
                </a>
              </li>
              <li className="submenu-category">
                <a href="#" className="submenu-title">
                  Wallet
                </a>
              </li>
            </AccordionMenu>
          </li>

          <li className="menu-category">
            <AccordionMenu index={ACC.MOBILE_WOMENS} title="Women's">
              <li className="submenu-category">
                <a href="#" className="submenu-title">
                  Dress & Frock
                </a>
              </li>
              <li className="submenu-category">
                <a href="#" className="submenu-title">
                  Earrings
                </a>
              </li>
              <li className="submenu-category">
                <a href="#" className="submenu-title">
                  Necklace
                </a>
              </li>
              <li className="submenu-category">
                <a href="#" className="submenu-title">
                  Makeup Kit
                </a>
              </li>
            </AccordionMenu>
          </li>

          <li className="menu-category">
            <AccordionMenu index={ACC.MOBILE_JEWELRY} title="Jewelry">
              <li className="submenu-category">
                <a href="#" className="submenu-title">
                  Earrings
                </a>
              </li>
              <li className="submenu-category">
                <a href="#" className="submenu-title">
                  Couple Rings
                </a>
              </li>
              <li className="submenu-category">
                <a href="#" className="submenu-title">
                  Necklace
                </a>
              </li>
              <li className="submenu-category">
                <a href="#" className="submenu-title">
                  Bracelets
                </a>
              </li>
            </AccordionMenu>
          </li>

          <li className="menu-category">
            <AccordionMenu index={ACC.MOBILE_PERFUME} title="Perfume">
              <li className="submenu-category">
                <a href="#" className="submenu-title">
                  Clothes Perfume
                </a>
              </li>
              <li className="submenu-category">
                <a href="#" className="submenu-title">
                  Deodorant
                </a>
              </li>
              <li className="submenu-category">
                <a href="#" className="submenu-title">
                  Flower Fragrance
                </a>
              </li>
              <li className="submenu-category">
                <a href="#" className="submenu-title">
                  Air Freshener
                </a>
              </li>
            </AccordionMenu>
          </li>

          <li className="menu-category">
            <Link href="/blog" className="menu-title">
              Blog
            </Link>
          </li>

          <li className="menu-category">
            <Link href="/hot-offers" className="menu-title">
              Hot Offers
            </Link>
          </li>
        </ul>

        <div className="menu-bottom">
          <ul className="menu-category-list">
            <li className="menu-category">
              <button
                type="button"
                className={`accordion-menu ${langActive ? "active" : ""}`}
                data-accordion-btn
                onClick={() => toggleAccordion(ACC.MOBILE_LANGUAGE)}
              >
                <p className="menu-title">Language</p>
                <IonIcon name="caret-back-outline" className="caret-back" />
              </button>
              <ul className={`submenu-category-list ${langActive ? "active" : ""}`} data-accordion>
                <li className="submenu-category">
                  <a href="#" className="submenu-title">
                    English
                  </a>
                </li>
                <li className="submenu-category">
                  <a href="#" className="submenu-title">
                    Español
                  </a>
                </li>
                <li className="submenu-category">
                  <a href="#" className="submenu-title">
                    French
                  </a>
                </li>
              </ul>
            </li>

            <li className="menu-category">
              <button
                type="button"
                className={`accordion-menu ${curActive ? "active" : ""}`}
                data-accordion-btn
                onClick={() => toggleAccordion(ACC.MOBILE_CURRENCY)}
              >
                <p className="menu-title">Currency</p>
                <IonIcon name="caret-back-outline" className="caret-back" />
              </button>
              <ul className={`submenu-category-list ${curActive ? "active" : ""}`} data-accordion>
                <li className="submenu-category">
                  <a href="#" className="submenu-title">
                    USD $
                  </a>
                </li>
                <li className="submenu-category">
                  <a href="#" className="submenu-title">
                    EUR €
                  </a>
                </li>
              </ul>
            </li>
          </ul>

          <ul className="menu-social-container">
            <li>
              <a href="#" className="social-link">
                <IonIcon name="logo-facebook" />
              </a>
            </li>
            <li>
              <a href="#" className="social-link">
                <IonIcon name="logo-twitter" />
              </a>
            </li>
            <li>
              <a href="#" className="social-link">
                <IonIcon name="logo-instagram" />
              </a>
            </li>
            <li>
              <a href="#" className="social-link">
                <IonIcon name="logo-linkedin" />
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
