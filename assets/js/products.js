/* ============================================================
   GABRIEL ONE STOP SHOP — store data
   Edit THIS file to change prices, products, contact details.
   No design knowledge needed: save the file, refresh the page.
   ============================================================ */

const SHOP = {
  name:        "Gabriel One Stop Shop",
  monogram:    "G",
  since:       "2019",
  city:        "Santa Maria, PH",
  currency:    "₱",                  // Philippine peso
  priceNote:   "Prices in Philippine pesos, VAT included.",
  freeShipOver: 5000,                // free shipping threshold (₱)
  giftMax:      3000,                // the "gifting" shelf shows pieces under this
  whatsapp:    "639171234567",       // <-- REPLACE: 63 + your number, digits only
  phoneDisplay:"0917 123 4567",
  email:       "orders@gabrielonestopshop.com",
  instagram:   "gabrielonestopshop",
  payment:     "GCash, Maya, bank transfer, or cash on delivery in Metro Manila.",
  pickupNote:  "Pick up in Santa Maria, Bulacan — J&T Express nationwide in 1–3 days, same-day Lalamove into Metro Manila.",
  founder:     "Gabrielle",
  heroProduct: "amara"                 // <-- the piece the big banner shows
};

/* ------------------------------------------------------------------
   PRODUCTS
   type      -> which illustration gets drawn:
                tote | satchel | crossbody | clutch | hobo | bucket
                beltbag | backpack | duffel | briefcase | wallet | pouch
   audience  -> her | him | all
   tag       -> "New" | "Bestseller" | "Limited" | "Last few" | ""
   photo     -> OPTIONAL. Put real image paths in per colour and the
                drawing is replaced, e.g.
                photo: { "Oxblood": "assets/img/amara-oxblood.jpg" }
   ------------------------------------------------------------------ */

const PRODUCTS = [
  /* ---------------------------- FOR HER --------------------------- */
  {
    id: "amara", name: "The Amara Tote", type: "tote", audience: "her",
    price: 4890, compareAt: 6100, tag: "Bestseller",
    blurb: "Structured, roomy, holds a laptop and a lunch and still looks polite at dinner.",
    detail: "Full-grain textured vegan leather, magnetic side snap, suede-lined interior, one zip pocket plus two slip pockets. Fits a 13\" laptop.",
    materials: "Vegan leather · Suede lining · Brass hardware",
    size: "38 W × 28 H × 13 cm", strap: "Drop 23 cm — shoulder",
    rating: 4.9, reviews: 214,
    colors: [
      { name: "Oxblood",  hex: "#6E2A2A" },
      { name: "Bone",     hex: "#E4D8C2" },
      { name: "Espresso", hex: "#33261F" }
    ]
  },
  {
    id: "sable", name: "The Sable Shoulder", type: "satchel", audience: "her",
    price: 3590, tag: "New",
    blurb: "That curved baguette shape, but with a strap that actually stays on your shoulder.",
    detail: "Soft-structured body with a rounded gusset, detachable long strap, gold-tone clasp, microfiber lining.",
    materials: "Pebbled vegan leather · Alloy hardware",
    size: "30 W × 18 H × 8 cm", strap: "Drop 28–56 cm, adjustable",
    rating: 4.8, reviews: 62,
    colors: [
      { name: "Espresso",     hex: "#33261F" },
      { name: "Tobacco",      hex: "#A65E2B" },
      { name: "Whisper Pink", hex: "#E6C6BF" }
    ]
  },
  {
    id: "noor", name: "The Noor Crossbody", type: "crossbody", audience: "her",
    price: 2590, tag: "Bestseller",
    blurb: "Hands-free and small enough to forget you're carrying it.",
    detail: "Compact flap body, webbing-to-leather strap, one card slot inside. Fits phone, cards, keys, a lip gloss.",
    materials: "Saffiano-finish vegan leather · Nylon web strap",
    size: "20 W × 15 H × 6 cm", strap: "Drop 51–66 cm, adjustable",
    rating: 4.9, reviews: 341,
    colors: [
      { name: "Sage",   hex: "#7D8C6B" },
      { name: "Black",  hex: "#221E1C" },
      { name: "Butter", hex: "#E2CE93" }
    ]
  },
  {
    id: "celeste", name: "The Céleste Clutch", type: "clutch", audience: "her",
    price: 2190, tag: "Limited",
    blurb: "A quiet, architectural clutch. Comes with a wrist chain you can hide inside.",
    detail: "Fold-over top, rigid frame, satin lining, hidden chain tucks behind the inner wall.",
    materials: "Vegan suede body · Satin lining",
    size: "25 W × 15 H × 5 cm", strap: "Wrist chain 30 cm",
    rating: 4.7, reviews: 45,
    colors: [
      { name: "Champagne", hex: "#D8C29B" },
      { name: "Oxblood",   hex: "#6E2A2A" },
      { name: "Ink",       hex: "#2B2F3C" }
    ]
  },
  {
    id: "idris", name: "The Idris Hobo", type: "hobo", audience: "her",
    price: 4150,
    blurb: "Slouchy where it should be, supported exactly where it matters.",
    detail: "Single-piece crescent body, memory-shape shoulders, interior zip pocket, magnetic closure under the fold.",
    materials: "Butter-soft vegan leather · Cotton twill lining",
    size: "36 W × 25 H × 10 cm", strap: "Drop 20 cm",
    rating: 4.8, reviews: 128,
    colors: [
      { name: "Chestnut", hex: "#7E4A2C" },
      { name: "Fog",      hex: "#B9B2A6" },
      { name: "Black",    hex: "#221E1C" }
    ]
  },
  {
    id: "marlowe", name: "The Marlowe Bucket", type: "bucket", audience: "her",
    price: 3450, tag: "Last few",
    blurb: "Drawstring bucket with a base stiff enough to stand up on its own.",
    detail: "Reinforced base panel, lobster-clasp side ring, interior snap pouch that detaches as a mini pocket.",
    materials: "Vegan leather · Alloy D-ring",
    size: "23 W × 25 H × 15 cm", strap: "Drop 46 cm",
    rating: 4.6, reviews: 77,
    colors: [
      { name: "Clay", hex: "#B37C5B" },
      { name: "Moss", hex: "#5F6B4A" },
      { name: "Bone", hex: "#E4D8C2" }
    ]
  },
  {
    id: "lyra", name: "The Lyra Mini Bucket", type: "bucket", audience: "her",
    price: 2790, tag: "New",
    blurb: "The Marlowe's little sister. Fits the essentials and one very small notebook.",
    detail: "Unlined soft body, leather drawstring with bead stop, convertible crossbody strap.",
    materials: "Soft vegan leather",
    size: "17 W × 18 H × 11 cm", strap: "Drop 53 cm",
    rating: 4.7, reviews: 31,
    colors: [
      { name: "Whisper Pink", hex: "#E6C6BF" },
      { name: "Espresso",     hex: "#33261F" },
      { name: "Sage",         hex: "#7D8C6B" }
    ]
  },
  {
    id: "solene", name: "The Solène Work Tote", type: "tote", audience: "her",
    price: 5390,
    blurb: "Built for the commute: padded laptop sleeve, trolley slot, key leash.",
    detail: "Wide flat bottom, four interior pockets plus a pen loop, backing sleeve slides over suitcase handles.",
    materials: "Water-repellent coated canvas · Vegan trim",
    size: "41 W × 30 H × 15 cm", strap: "Drop 25 cm",
    rating: 4.9, reviews: 96,
    colors: [
      { name: "Espresso", hex: "#33261F" },
      { name: "Charcoal", hex: "#3C3F42" },
      { name: "Tobacco",  hex: "#A65E2B" }
    ]
  },
  {
    id: "vesper", name: "The Vesper Belt Bag", type: "beltbag", audience: "all",
    price: 1890, tag: "Bestseller",
    blurb: "Wear it on the hip, across the chest, or looped over a tote handle.",
    detail: "Two-way strap, water-resistant shell, hidden back pocket, sits flat under a coat.",
    materials: "Recycled ripstop · Leather trim",
    size: "23 W × 13 H × 5 cm", strap: "Waist 66–107 cm",
    rating: 4.8, reviews: 260,
    colors: [
      { name: "Black", hex: "#221E1C" },
      { name: "Olive", hex: "#5C6142" },
      { name: "Cream", hex: "#E7DECB" }
    ]
  },
  {
    id: "adaeze", name: "The Adaeze Woven Tote", type: "tote", audience: "her",
    price: 3990, tag: "Limited",
    blurb: "Hand-woven panels finished with leather bases — no two sit exactly the same.",
    detail: "Woven raffia body, reinforced leather corners, interior cotton liner with a slip pocket.",
    materials: "Woven raffia · Leather base",
    size: "36 W × 28 H × 13 cm", strap: "Drop 23 cm",
    rating: 5.0, reviews: 18,
    colors: [
      { name: "Natural", hex: "#D9BD8A" },
      { name: "Umber",   hex: "#8B5A34" }
    ]
  },
  {
    id: "petra", name: "The Petra Work Satchel", type: "satchel", audience: "her",
    price: 4490,
    blurb: "Boxy, calm, opens flat so security lines never become an event.",
    detail: "Frame top with a full 270° zip, two interior dividers, detachable shoulder strap, protective base feet.",
    materials: "Saffiano vegan leather · Brass feet",
    size: "33 W × 23 H × 13 cm", strap: "Drop 25–53 cm",
    rating: 4.8, reviews: 71,
    colors: [
      { name: "Black",    hex: "#221E1C" },
      { name: "Chestnut", hex: "#7E4A2C" },
      { name: "Fog",      hex: "#B9B2A6" }
    ]
  },

  /* ---------------------------- FOR HIM --------------------------- */
  {
    id: "roman", name: "The Roman Duffel", type: "duffel", audience: "him",
    price: 8290, compareAt: 9900, tag: "Bestseller",
    blurb: "Two nights away, one bag, no excuses. Shoe compartment included.",
    detail: "Rigid base, separate ventilated shoe bay, trolley sleeve, padded detachable shoulder strap, YKK zips throughout.",
    materials: "Waxed canvas · Vegan leather trim",
    size: "53 L × 28 H × 25 cm", strap: "Drop 46 cm, padded",
    rating: 4.9, reviews: 143,
    colors: [
      { name: "Field Green", hex: "#404A38" },
      { name: "Espresso",    hex: "#33261F" },
      { name: "Slate",       hex: "#4A5057" }
    ]
  },
  {
    id: "gideon", name: "The Gideon Sling", type: "crossbody", audience: "him",
    price: 2750, tag: "New",
    blurb: "One-strap carry for the guy who refuses to carry a bag. Works too well.",
    detail: "Reversible strap, quick-access front channel, water-resistant base, fits a 10-inch tablet.",
    materials: "Cordura weave · Leather pull tabs",
    size: "25 W × 18 H × 8 cm", strap: "Ambidextrous, 36–86 cm",
    rating: 4.7, reviews: 54,
    colors: [
      { name: "Black",       hex: "#221E1C" },
      { name: "Field Green", hex: "#404A38" }
    ]
  },
  {
    id: "tobias", name: "The Tobias Briefcase", type: "briefcase", audience: "him",
    price: 6100, tag: "Limited",
    blurb: "The doctor-bag silhouette, softened. Carries a suit and a laptop without creasing either.",
    detail: "Wide gusset, interior garment strap, two pen loops, lockable zip pull, brass feet on the base.",
    materials: "Vegan leather · Brass feet",
    size: "42 W × 29 H × 15 cm", strap: "Drop 23 cm + long strap",
    rating: 4.9, reviews: 26,
    colors: [
      { name: "Espresso", hex: "#33261F" },
      { name: "Chestnut", hex: "#7E4A2C" }
    ]
  },
  {
    id: "marcus", name: "The Marcus Cardholder", type: "wallet", audience: "him",
    price: 1350,
    blurb: "Six cards, folded notes, zero bulk in the back pocket.",
    detail: "Hand-burnished edges, RFID-blocking layer, foil-stamped initials available on request.",
    materials: "Full-layer vegan leather",
    size: "10 W × 7.5 H × 0.8 cm", strap: "none",
    rating: 4.8, reviews: 302,
    colors: [
      { name: "Espresso", hex: "#33261F" },
      { name: "Black",    hex: "#221E1C" },
      { name: "Chestnut", hex: "#7E4A2C" }
    ]
  },
  {
    id: "hugo", name: "The Hugo Dopp Kit", type: "pouch", audience: "him",
    price: 1690,
    blurb: "Wide-mouth toiletry kit that actually stands up on a hotel sink.",
    detail: "Wipe-clean lining, elastic toothbrush loop, removable mirror pocket, dries in an hour.",
    materials: "Coated canvas · Vegan trim",
    size: "25 L × 15 H × 13 cm", strap: "Grab handle",
    rating: 4.7, reviews: 88,
    colors: [
      { name: "Field Green", hex: "#404A38" },
      { name: "Espresso",    hex: "#33261F" },
      { name: "Fog",         hex: "#B9B2A6" }
    ]
  }
];

/* Departments rail ---------------------------------------------------- */
const COLLECTIONS = [
  { key: "her",  label: "For Her", line: "Totes · shoulder · clutches · buckets" },
  { key: "him",  label: "For Him", line: "Duffels · backpacks · slings · cardholders" },
  { key: "new",  label: "New In",  line: "Landed this week, small runs" },
  { key: "gift", label: "Gifting", line: "Under ₱3,000, wrapped by hand" }
];

/* Customer words ------------------------------------------------------ */
const TESTIMONIALS = [
  { quote: "Bought the Amara in oxblood in March. It has been to two weddings, a fiesta in Tayabas, and a very long Baguio haul, and it still looks new.", name: "Marisol D.", city: "Cebu City", bag: "The Amara Tote" },
  { quote: "Ordered the Roman duffel for my husband for a Baguio trip, then quietly ordered a second one for myself. No notes.", name: "Kaye B.", city: "Mandaluyong", bag: "The Roman Duffel" },
  { quote: "She answered me on WhatsApp at 9pm on a Sunday and had the clutch wrapped before the courier picked it up Monday morning. That's the whole review.", name: "Ayesha K.", city: "Alabang", bag: "The Céleste Clutch" },
  { quote: "Third purchase. The Noor crossbody survived three years of EDSA jeepney rides and a full typhoon season of rain. Unreasonable quality for the price.", name: "Jom R.", city: "Davao City", bag: "The Noor Crossbody" }
];

/* Small print rail ---------------------------------------------------- */
const FAQS = [
  { q: "Are these real leather?", a: "Most pieces are premium vegan leather or coated canvas — a few woven styles use leather bases and say so in the description. Every product page states materials plainly." },
  { q: "How does ordering work?", a: "Add what you like, then check out. It opens a WhatsApp message with your bag, colour, quantity and notes already written. We confirm stock and the shipping fee, you pay, we pack and send the tracking number the same or next day." },
  { q: "How do I pay?", a: "GCash, Maya, bank transfer, or cash on delivery if you're inside Metro Manila. Nothing is charged on this page and no card details are ever collected — we agree the total on WhatsApp first." },
  { q: "How long is delivery?", a: "Metro Manila is 1–2 days with J&T Express and same-day with Lalamove if you message before 2pm. Provincial is 2–4 days. Cebu, Davao and Iloilo usually land on day 2. Add-ons for holidays and typhoon days, and we always tell you before you pay." },
  { q: "What if the colour is wrong when it arrives?", a: "Message us with a photo within 7 days and we swap it. Unused, tags on. We cover the return label on the first exchange; after that the courier fee is on you." },
  { q: "Do you gift wrap?", a: "Every piece ships wrapped in tissue and ribbon, ready to hand over. Add a note at checkout if it's for someone — a birthday, a thank-you, whatever — and we'll make the unboxing nice." }
];


