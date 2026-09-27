# Gabriel One Stop Shop — static storefront

Hand-picked bags for her and him. Prices in Philippine pesos, orders go out
through WhatsApp, pickup in Santa Maria, Bulacan with J&T Express nationwide.

**Zero build step.** Open `index.html` in a browser, or deploy the folder as-is
to any static host (Vercel, Netlify, GitHub Pages).

## Files

| File | What it is |
|---|---|
| `index.html` | All page structure and static copy |
| `assets/css/styles.css` | All styling |
| `assets/js/products.js` | **Edit this one** — prices, products, contact details |
| `assets/js/app.js` | Rendering, bag, filters, quick view, WhatsApp message |
| `assets/js/art.js` | Vector illustrations for every bag (fallback if a photo is missing) |

## Changing things (all in `products.js`)

- **Prices / sale tags** — edit `price` / `compareAt` on any product.
- **Free shipping threshold** — `SHOP.freeShipOver` (currently `5000`).
- **Gifting shelf** — `SHOP.giftMax` (currently `3000`, shelf auto-updates).
- **WhatsApp number** — `SHOP.whatsapp` must stay digits-only with country
  code, e.g. `"639171234567"`. The display version is `SHOP.phoneDisplay`.
- **Payments line** — `SHOP.payment`. Pickup/shipping lines — `SHOP.pickupNote`.
- **New product** — copy any product block, change `id`, or the grid breaks.
  `type` picks the illustration: tote, satchel, crossbody, clutch, hobo,
  bucket, beltbag, backpack, duffel, briefcase, wallet, pouch.
- **Real photos** — add `photo: { "Colour Name": "assets/img/file.jpg" }` to a
  product and the photo replaces the illustration for that colour.
  (Colour name must match exactly.)

## Order flow

1. Shopper adds pieces to the bag.
2. Checkout opens WhatsApp with the order written out (items, subtotal,
   shipping note, gift note).
3. You confirm stock + shipping fee, they pay via GCash / Maya / bank
   transfer / COD (Metro Manila), you pack and send tracking.

Nothing is charged on the page and no card details are ever collected.

## Dev tools (live outside the site folder, not deployed)

- `gab-check.js` — data + id-wiring audit (`node gab-check.js`)
- `gab-peso-check.js` — peso/locale verification (`node gab-peso-check.js`)
- `gab-test.bat` + `gab-e2e.ps1` — headless Edge end-to-end (cart math,
  WhatsApp message, filters, FAQ, sort)
