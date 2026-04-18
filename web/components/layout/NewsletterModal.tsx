"use client";

import { IonIcon } from "@/components/IonIcon";
import { useUi } from "@/components/providers/UiProvider";
import { A } from "@/lib/paths";

export function NewsletterModal() {
  const { modalClosed, closeModal } = useUi();
  return (
    <div className={`modal ${modalClosed ? "closed" : ""}`} data-modal>
      <div className="modal-close-overlay" data-modal-overlay onClick={closeModal} />

      <div className="modal-content">
        <button type="button" className="modal-close-btn" data-modal-close onClick={closeModal}>
          <IonIcon name="close-outline" />
        </button>

        <div className="newsletter-img">
          <img
            src={A("images/newsletter.png")}
            alt="subscribe newsletter"
            width={400}
            height={400}
          />
        </div>

        <div className="newsletter">
          <form action="#">
            <div className="newsletter-header">
              <h3 className="newsletter-title">Subscribe Newsletter.</h3>
              <p className="newsletter-desc">
                Subscribe the <b>Anon</b> to get latest products and discount update.
              </p>
            </div>
            <input
              type="email"
              name="email"
              className="email-field"
              placeholder="Email Address"
              required
            />
            <button type="submit" className="btn-newsletter">
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
