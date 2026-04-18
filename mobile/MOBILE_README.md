# Anon E‑Commerce — React Native (Expo)

This document matches the requested deliverable: analysis, navigation, structure, run steps, and design notes.

---

## 1. Website-to-mobile analysis

**Reference:** Legacy `index.html` + Next.js `web/` (same Anon branding: Poppins, salmon-pink accents, eerie-black text, cultured greys, banner → category strip → product sidebar + grids → testimonial/CTA/services → blog).

| Website section | Mobile mapping |
|-----------------|----------------|
| Header (logo, search, bag/heart counts) | Home top bar + tab **Cart** badge; search opens **Search** stack screen |
| Desktop mega-menu / categories | **Shop** tab = category grid; tap → **CategoryProducts** |
| Horizontal category strip | Home horizontal chips → same routes as website “Show all” |
| Banner slider | Home horizontal scroll (same 3 JPG assets) |
| Product grid / cards | **ProductCard** (2-column), badges SALE/NEW/% |
| Deal of the day | Home bottom card + **p-deal** product in mock data |
| Sidebar filters | Category list + search query (filters via `fetchProducts`) |
| Footer links | Profile rows + Settings placeholder |
| Blog block | Not a separate tab (website blog is marketing); focus on shop flows |
| Wishlist / heart | **Wishlist** tab + heart on cards (AsyncStorage-backed IDs) |
| Cart | **Cart** tab, persisted cart lines (productId + qty) |
| Auth | **Login** / **Register** stack screens (mock persistence) |
| Checkout | **Checkout** stack screen (mock submit → clears cart) |

**Backend:** No public API in the reference repo — `EXPO_PUBLIC_API_BASE_URL` defaults to `https://api.example.com/v1`; `USE_MOCK_API` is true, so all product calls use `src/data/mockProducts.ts`.

---

## 2. Navigation architecture

- **Root stack** (`RootNavigator`): `MainTabs` + modal-style flows: `ProductDetail`, `Search`, `Checkout`, `Login`, `Register`, `Orders`, `Settings`, `CategoryProducts`.
- **Bottom tabs** (`MainTabNavigator`): **Home** | **Categories** (Shop) | **Cart** (badge) | **Wishlist** | **Account** (Profile).
- Deep link from stack to tabs: `navigation.navigate('MainTabs', { screen: 'Cart' })` after add-to-cart from **ProductDetail**.

---

## 3. Folder structure

```
mobile/
  App.tsx
  app.json
  babel.config.js
  package.json
  tsconfig.json
  .env.example
  assets/images/          # copied from web/public/assets/images
  src/
    api/                  # client + products (mock or HTTP)
    config/               # env / API base
    context/              # Auth, Cart, Wishlist
    data/                 # mockProducts, categories
    navigation/           # Root + tabs + types
    screens/              # all screens
    components/ui/        # ProductCard, PrimaryButton, EmptyState
    theme/                # colors + theme (from CSS variables)
```

---

## 4. Design language reused

- **Colors:** `src/theme/colors.ts` — ports `:root` from `style-prefix.css` (eerie-black, salmon-pink, cultured, sonic-silver, etc.).
- **Typography:** `@expo-google-fonts/poppins` — same family as the website `<link>` to Google Fonts.
- **Components:** Rounded cards (`--border-radius-md` → `theme.radii.md`), pink price emphasis, badge treatment for sale/new/percent.
- **Ionicons:** Same icon family as the web build (`ion-icon` on site → `@expo/vector-icons` Ionicons on native).

---

## 5. Mobile-only adaptations

- SVG category icons on web → Ionicons glyphs in `CATEGORIES` (same labels/counts).
- Logo SVG → wordmark **“Anon”** text (RN image pipeline for SVG would need `react-native-svg` + transformer).
- Desktop multi-column + sidebar → 2-column grid + category/shop screens; filters via category slug + search string.
- “Newsletter” modal on web → not duplicated; settings note references future language/currency parity.

---

## 6. Run instructions

```bash
cd mobile
npm install
npx expo start
```

- Press `i` for iOS simulator (macOS), `a` for Android emulator, or scan QR in Expo Go.
- Copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_BASE_URL` when a real API exists; implement response shapes in `src/api/products.ts`.

---

## 7. Validation checklist

- [x] Theme aligned with website CSS variables  
- [x] Navigation: tabs + stack, no orphan routes  
- [x] Cart / wishlist / auth persisted (AsyncStorage)  
- [x] Mock API abstraction for swap to HTTP  
- [x] Assets bundled under `assets/images`  
- [x] Safe areas via `react-native-safe-area-context`  
- [ ] Replace placeholder when backend contract is known (orders, real auth)

---

## 8. Interpretation / gaps

- **Blog / Hot offers** exist as routes on Next.js; mobile prioritizes shopping — “Hot offers” is represented by the home **Deal of the day** block and **p-deal** product.
- **Orders** UI is empty until an API exists.
- **Settings** includes a single notifications toggle; full language/currency like the web header is documented as a follow-up.
