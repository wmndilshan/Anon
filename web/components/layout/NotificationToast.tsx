"use client";

import { IonIcon } from "@/components/IonIcon";
import { useUi } from "@/components/providers/UiProvider";
import { A } from "@/lib/paths";

export function NotificationToast() {
  const { toastClosed, closeToast } = useUi();
  return (
    <div className={`notification-toast ${toastClosed ? "closed" : ""}`} data-toast>
      <button type="button" className="toast-close-btn" data-toast-close onClick={closeToast}>
        <IonIcon name="close-outline" />
      </button>

      <div className="toast-banner">
        <img
          src={A("images/products/jewellery-1.jpg")}
          alt="Rose Gold Earrings"
          width={80}
          height={70}
        />
      </div>

      <div className="toast-detail">
        <p className="toast-message">Someone in new just bought</p>
        <p className="toast-title">Rose Gold Earrings</p>
        <p className="toast-meta">
          <time dateTime="PT2M">2 Minutes</time> ago
        </p>
      </div>
    </div>
  );
}
