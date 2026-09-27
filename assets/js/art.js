/* ============================================================
   ART ENGINE — draws every product as clean vector luggage.
   No stock photos to break, recolours instantly on swatch click.
   Add a photo path in products.js and the photo wins; the drawing
   becomes the fallback.
   ============================================================ */

/* ---------- colour maths: derive all shading from one hex ---------- */
function _hex2rgb(h) {
  const n = parseInt(h.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function _rgb2hex(r, g, b) {
  const c = v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return "#" + c(r) + c(g) + c(b);
}
/** amt > 0 lightens toward white, amt < 0 darkens toward black (−100…100) */
function shade(hex, amt) {
  const [r, g, b] = _hex2rgb(hex);
  const t = amt / 100;
  const f = v => (t >= 0 ? v + (255 - v) * t : v * (1 + t));
  return _rgb2hex(f(r), f(g), f(b));
}
/** rgba() string from hex + alpha */
function rgba(hex, a) {
  const [r, g, b] = _hex2rgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

const METAL = {
  brass:  { hi: "#EFD9A0", lo: "#997530" },
  silver: { hi: "#E6E9EC", lo: "#959CA3" }
};

/* Each shape is a function of a palette context C, drawn on a
   320 x 340 canvas with the bag centred near y = 200. */
const BAG_SHAPES = {};

/* ---------------- structured open tote ---------------- */
BAG_SHAPES.tote = C => `
  <path d="M96 128 C96 84 126 84 126 128" stroke="${C.deep}" stroke-width="10" fill="none" stroke-linecap="round"/>
  <path d="M194 128 C194 84 224 84 224 128" stroke="${C.deep}" stroke-width="10" fill="none" stroke-linecap="round"/>
  <path d="M78 126 h164 l-9 150 q-1 10 -11 10 h-124 q-10 0 -11 -10 Z" fill="url(#${C.uid}body)"/>
  <path d="M78 126 h164 l-2.6 46 h-159 Z" fill="${rgba(shade(C.hex, 55), 0.18)}"/>
  <rect x="74" y="117" width="172" height="15" rx="7.5" fill="url(#${C.uid}panel)"/>
  <rect x="145" y="192" width="30" height="18" rx="4" fill="url(#${C.uid}metal)"/>
  <path d="M92 143 h136 l-6 130 h-124 Z" ${C.stitch}/>
  <path d="M90 282 q70 16 140 0" fill="none" stroke="${C.deep}" stroke-width="2" opacity=".5"/>
  <path d="M78 126 h164" stroke="${C.deep}" stroke-width="2" opacity=".35"/>`;

/* ---------------- curved baguette shoulder bag ---------------- */
BAG_SHAPES.satchel = C => `
  <path d="M106 152 C112 98 208 98 214 152" stroke="${C.deep}" stroke-width="9" fill="none" stroke-linecap="round"/>
  <path d="M60 160 q100 -42 200 0 q10 62 -14 108 q-86 24 -172 0 q-24 -46 -14 -108 Z" fill="url(#${C.uid}body)"/>
  <path d="M60 160 q100 -42 200 0 q4 26 -2 46 q-98 32 -196 0 q-6 -20 -2 -46 Z" fill="url(#${C.uid}panel)"/>
  <path d="M144 208 h32 v24 q-16 11 -32 0 Z" fill="url(#${C.uid}metal)"/>
  <path d="M74 216 q86 26 172 0" fill="none" stroke="${C.deep}" stroke-width="2" opacity=".5"/>
  <path d="M74 172 q86 -34 172 0" ${C.stitch}/>
  <path d="M80 230 q80 24 160 0" ${C.stitch}/>
  <circle cx="160" cy="220" r="4" fill="${C.deep}" opacity=".45"/>`;
/* ---------------- compact flap crossbody on web strap ---------------- */
BAG_SHAPES.crossbody = C => `
  <path d="M78 206 C64 92 256 92 242 206" stroke="${C.deep}" stroke-width="12" fill="none" stroke-linecap="round"/>
  <path d="M78 206 C64 92 256 92 242 206" stroke="${rgba(shade(C.hex, 55), 0.45)}" stroke-width="4" fill="none" stroke-dasharray="2 11"/>
  <rect x="96" y="152" width="128" height="112" rx="18" fill="url(#${C.uid}body)"/>
  <path d="M96 170 q0 -18 18 -18 h92 q18 0 18 18 v42 q-64 26 -128 0 Z" fill="url(#${C.uid}panel)"/>
  <rect x="146" y="190" width="28" height="13" rx="3.5" fill="url(#${C.uid}metal)"/>
  <path d="M106 166 h108 v26 q-54 22 -108 0 Z" ${C.stitch}/>
  <path d="M104 240 h112" stroke="${C.deep}" stroke-width="2" opacity=".4"/>
  <rect x="92" y="254" width="136" height="12" rx="6" fill="${C.mid}" opacity=".85"/>`;

/* ---------------- rigid fold-over clutch + hidden chain ---------------- */
BAG_SHAPES.clutch = C => `
  <path d="M118 132 q42 28 84 0" stroke="url(#${C.uid}metal)" stroke-width="4" fill="none" stroke-dasharray="3 5"/>
  <path d="M70 174 h180 l-11 98 q-2 12 -14 12 h-130 q-12 0 -14 -12 Z" fill="url(#${C.uid}body)"/>
  <path d="M70 174 l15 -36 q3 -8 12 -8 h86 q9 0 12 8 l15 36 Z" fill="url(#${C.uid}panel)"/>
  <path d="M70 174 h180" stroke="${C.deep}" stroke-width="2.4" opacity=".5"/>
  <rect x="148" y="164" width="24" height="17" rx="4" fill="url(#${C.uid}metal)"/>
  <path d="M86 192 h148 l-8 74 h-132 Z" ${C.stitch}/>
  <path d="M96 282 q64 12 128 0" fill="none" stroke="${C.deep}" stroke-width="2" opacity=".42"/>`;

/* ---------------- crescent hobo ---------------- */
BAG_SHAPES.hobo = C => `
  <path d="M70 212 q10 -106 90 -106 q80 0 90 106 q-90 30 -180 0 Z" fill="url(#${C.uid}body)"/>
  <path d="M116 118 q44 -32 88 0 q-16 46 -88 46 q-72 0 -88 -46 q42 -16 88 0 Z" fill="url(#${C.uid}panel)" opacity=".92"/>
  <path d="M70 212 q90 30 180 0 q-8 48 -30 76 q-60 20 -120 0 q-22 -28 -30 -76 Z" fill="url(#${C.uid}body)"/>
  <path d="M150 228 h20 v32 q-10 8 -20 0 Z" fill="url(#${C.uid}metal)" opacity=".92"/>
  <path d="M96 234 q64 22 128 0" ${C.stitch}/>
  <path d="M106 122 q54 -24 108 0" ${C.stitch}/>
  <path d="M108 286 q52 14 104 0" fill="none" stroke="${C.deep}" stroke-width="2" opacity=".42"/>`;

/* ---------------- drawstring bucket on a stiff base ---------------- */
BAG_SHAPES.bucket = C => `
  <path d="M98 178 q62 22 124 0 l14 92 h-152 Z" fill="url(#${C.uid}body)"/>
  <path d="M106 152 q54 20 108 0 l8 28 q-62 22 -124 0 Z" fill="url(#${C.uid}panel)"/>
  <path d="M114 146 q46 18 92 0" fill="none" stroke="${C.deep}" stroke-width="3.4" stroke-linecap="round"/>
  <path d="M206 150 q28 -16 32 8" fill="none" stroke="${shade(C.hex, 34)}" stroke-width="6" stroke-linecap="round"/>
  <circle cx="240" cy="162" r="8" fill="url(#${C.uid}metal)"/>
  <path d="M96 268 h128 l5 16 q-69 12 -138 0 Z" fill="${C.mid}"/>
  <path d="M114 194 q46 18 92 0 l10 72 h-112 Z" ${C.stitch}/>`;
/* ---------------- two-way belt bag on web strap ---------------- */
BAG_SHAPES.beltbag = C => `
  <path d="M28 200 h58 M234 200 h58" stroke="${C.deep}" stroke-width="16" stroke-linecap="round"/>
  <path d="M28 200 h58 M234 200 h58" stroke="${rgba(shade(C.hex, 62), .35)}" stroke-width="6" stroke-dasharray="2 9" stroke-linecap="round"/>
  <rect x="78" y="182" width="20" height="36" rx="5" fill="${C.deep}"/>
  <rect x="222" y="182" width="20" height="36" rx="5" fill="${C.deep}"/>
  <path d="M92 176 q68 -22 136 0 q16 6 16 26 v26 q0 22 -24 22 h-120 q-24 0 -24 -22 v-26 q0 -20 16 -26 Z" fill="url(#${C.uid}body)"/>
  <path d="M96 178 q64 -20 128 0" fill="none" stroke="${C.deep}" stroke-width="6" stroke-linecap="round"/>
  <path d="M96 178 q64 -20 128 0" fill="none" stroke="url(#${C.uid}metal)" stroke-width="2.6" stroke-dasharray="1 6" stroke-linecap="round"/>
  <rect x="150" y="168" width="22" height="14" rx="4" fill="url(#${C.uid}metal)"/>
  <path d="M104 200 h112 v24 q-56 14 -112 0 Z" ${C.stitch}/>`;

/* ---------------- top-load backpack ---------------- */
BAG_SHAPES.backpack = C => `
  <path d="M110 118 q0 -26 50 -26 q50 0 50 26" fill="none" stroke="${C.deep}" stroke-width="12" stroke-linecap="round"/>
  <path d="M104 150 q-30 46 -26 132 M216 150 q30 46 26 132" stroke="${C.deep}" stroke-width="14" fill="none" stroke-linecap="round" opacity=".85"/>
  <path d="M96 132 h128 q26 0 26 28 v102 q0 24 -26 24 h-128 q-26 0 -26 -24 v-102 q0 -28 26 -28 Z" fill="url(#${C.uid}body)"/>
  <path d="M70 176 q90 -34 180 0 q4 30 -4 52 q-86 26 -172 0 q-8 -22 -4 -52 Z" fill="url(#${C.uid}panel)"/>
  <rect x="142" y="212" width="36" height="15" rx="4" fill="url(#${C.uid}metal)"/>
  <path d="M112 246 h96 v34 q-48 12 -96 0 Z" fill="${C.mid}" opacity=".8"/>
  <path d="M112 250 h96" ${C.stitch}/>
  <path d="M84 190 q76 -28 152 0" ${C.stitch}/>
  <path d="M100 132 h120" stroke="${C.deep}" stroke-width="2.6" opacity=".45"/>`;

/* ---------------- weekend duffel ---------------- */
BAG_SHAPES.duffel = C => `
  <path d="M120 150 q40 -58 80 0" fill="none" stroke="${C.deep}" stroke-width="10" stroke-linecap="round"/>
  <path d="M62 166 q98 -34 196 0 q16 6 16 40 v28 q0 40 -34 40 h-160 q-34 0 -34 -40 v-28 q0 -34 16 -40 Z" fill="url(#${C.uid}body)"/>
  <path d="M62 166 q98 -34 196 0 q6 18 4 34 q-102 26 -204 0 q-2 -16 4 -34 Z" fill="url(#${C.uid}panel)" opacity=".9"/>
  <path d="M70 244 h180 v22 q-90 14 -180 0 Z" fill="${C.mid}"/>
  <rect x="98" y="160" width="18" height="96" rx="6" fill="${C.deep}" opacity=".8"/>
  <rect x="204" y="160" width="18" height="96" rx="6" fill="${C.deep}" opacity=".8"/>
  <rect x="146" y="206" width="28" height="17" rx="4" fill="url(#${C.uid}metal)"/>
  <path d="M84 186 q76 -22 152 0" ${C.stitch}/>
  <circle cx="112" cy="200" r="6" fill="url(#${C.uid}metal)" opacity=".9"/>
  <circle cx="208" cy="200" r="6" fill="url(#${C.uid}metal)" opacity=".9"/>`;

/* ---------------- framed briefcase ---------------- */
BAG_SHAPES.briefcase = C => `
  <path d="M132 130 q0 -22 28 -22 q28 0 28 22" fill="none" stroke="${C.deep}" stroke-width="11" stroke-linecap="round"/>
  <path d="M62 134 h196 q12 0 12 12 v122 q0 12 -12 12 h-196 q-12 0 -12 -12 v-122 q0 -12 12 -12 Z" fill="url(#${C.uid}body)"/>
  <path d="M50 178 h220" stroke="${C.deep}" stroke-width="2.6" opacity=".45"/>
  <path d="M62 148 h196 v28 h-196 Z" fill="url(#${C.uid}panel)" opacity=".7"/>
  <rect x="144" y="166" width="32" height="26" rx="5" fill="url(#${C.uid}metal)"/>
  <path d="M62 190 h60 v100 h-60 Z M198 190 h60 v100 h-60 Z" fill="url(#${C.uid}panel)" opacity=".45"/>
  <path d="M74 152 h172 v130 h-172 Z" ${C.stitch}/>
  <circle cx="76" cy="280" r="6" fill="${C.deep}"/>
  <circle cx="244" cy="280" r="6" fill="${C.deep}"/>`;
/* ---------------- slim bifold cardholder ---------------- */
BAG_SHAPES.wallet = C => `
  <path d="M86 158 h148 q14 0 14 14 v96 q0 14 -14 14 h-148 q-14 0 -14 -14 v-96 q0 -14 14 -14 Z" fill="url(#${C.uid}body)"/>
  <path d="M86 158 h148 q14 0 14 14 v34 q-88 18 -176 0 v-34 q0 -14 14 -14 Z" fill="url(#${C.uid}panel)" opacity=".8"/>
  <path d="M160 158 v124" stroke="${C.deep}" stroke-width="2.4" opacity=".5"/>
  <path d="M100 206 h44 M176 206 h44" stroke="${C.deep}" stroke-width="7" stroke-linecap="round" opacity=".45"/>
  <path d="M100 232 h44 M176 232 h44" stroke="${C.deep}" stroke-width="7" stroke-linecap="round" opacity=".3"/>
  <path d="M96 170 h128 v104 h-128 Z" ${C.stitch}/>
  <rect x="150" y="248" width="20" height="10" rx="3" fill="url(#${C.uid}metal)"/>`;

/* ---------------- wide-mouth dopp kit ---------------- */
BAG_SHAPES.pouch = C => `
  <path d="M138 146 q22 -20 44 0" fill="none" stroke="${C.deep}" stroke-width="9" stroke-linecap="round"/>
  <path d="M74 168 h172 q10 0 10 12 v88 q0 16 -16 16 h-160 q-16 0 -16 -16 v-88 q0 -12 10 -12 Z" fill="url(#${C.uid}body)"/>
  <path d="M74 168 h172 q10 0 10 12 v18 h-192 v-18 q0 -12 10 -12 Z" fill="url(#${C.uid}panel)"/>
  <path d="M80 172 h160" stroke="${C.deep}" stroke-width="6" stroke-linecap="round"/>
  <path d="M80 172 h160" stroke="url(#${C.uid}metal)" stroke-width="2.4" stroke-dasharray="1 6" stroke-linecap="round"/>
  <rect x="196" y="164" width="16" height="16" rx="4" fill="url(#${C.uid}metal)"/>
  <path d="M88 202 h144 v66 h-144 Z" ${C.stitch}/>
  <path d="M160 202 v66" stroke="${C.deep}" stroke-width="2" opacity=".35"/>`;

/* ---------------------------------------------------------------------
   bagSVG(type, hex, opts) -> a complete <svg> string
   --------------------------------------------------------------------- */
function bagSVG(type, hex, opts = {}) {
  const uid   = "g" + String(opts.key || "x").replace(/[^a-z0-9]/gi, "") + "_" + type;
  const metal = METAL[opts.metal === "silver" ? "silver" : "brass"];
  const C = {
    uid, hex,
    light: shade(hex, 24),
    hi:    shade(hex, 44),
    mid:   shade(hex, -14),
    dark:  shade(hex, -32),
    deep:  shade(hex, -54)
  };
  C.stitch = opts.stitch === false
    ? 'fill="none" stroke="none"'
    : `fill="none" stroke="${rgba(shade(hex, 62), 0.42)}" stroke-width="1.4" stroke-dasharray="5 4.5"`;
  const shape = BAG_SHAPES[type] || BAG_SHAPES.tote;

  return `<svg class="bag-art" viewBox="0 0 320 340" role="presentation" focusable="false">
  <defs>
    <linearGradient id="${uid}body" x1="0.1" y1="0" x2="0.85" y2="1">
      <stop offset="0" stop-color="${C.hi}"/>
      <stop offset="0.26" stop-color="${C.light}"/>
      <stop offset="0.66" stop-color="${hex}"/>
      <stop offset="1" stop-color="${C.dark}"/>
    </linearGradient>
    <linearGradient id="${uid}panel" x1="0" y1="0" x2="0.7" y2="1">
      <stop offset="0" stop-color="${C.hi}"/>
      <stop offset="1" stop-color="${C.mid}"/>
    </linearGradient>
    <linearGradient id="${uid}metal" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${metal.hi}"/>
      <stop offset="0.5" stop-color="${metal.lo}"/>
      <stop offset="1" stop-color="${metal.hi}"/>
    </linearGradient>
  </defs>
  <ellipse cx="160" cy="306" rx="96" ry="12" fill="rgba(36,27,22,0.15)"/>
  <ellipse cx="160" cy="304" rx="56" ry="7" fill="rgba(36,27,22,0.12)"/>
  ${shape(C)}
</svg>`;
}
/* productArt: uses a real photo when products.js supplies one for the
   selected colour, otherwise draws the vector. The drawing travels in a
   data attribute so a missing photo falls back silently instead of
   showing a broken-image icon. */
function productArt(p, colorIdx = 0) {
  const c = p.colors[Math.min(colorIdx, p.colors.length - 1)] || { name: "", hex: "#6E2A2A" };
  const svg = bagSVG(p.type, c.hex, { key: p.id + colorIdx });
  const src = p.photo && p.photo[c.name];
  if (!src) return svg;
  return `<img class="bag-photo" src="${src}" alt="${p.name} in ${c.name}" loading="lazy"
    data-fallback="${encodeURIComponent(svg)}">`;
}

/* Letterpress badge with type set on a circle (rotates in CSS) */
function badgeSVG(line1, line2) {
  return `<svg class="badge" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
  <defs><path id="badge-path" d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0"/></defs>
  <circle cx="100" cy="100" r="95" fill="none" stroke="currentColor" stroke-width="1" opacity=".3"/>
  <circle cx="100" cy="100" r="64" fill="none" stroke="currentColor" stroke-width="1" opacity=".22"/>
  <text font-size="14.5" letter-spacing="4.4" fill="currentColor">
    <textPath href="#badge-path" startOffset="0">${line1} · ${line2} · ${line1} · ${line2}</textPath>
  </text>
  <g fill="currentColor" opacity=".7"><circle cx="100" cy="100" r="3"/><circle cx="85" cy="100" r="1.5"/><circle cx="115" cy="100" r="1.5"/></g>
</svg>`;
}

/* UI icons — single-colour strokes, so they inherit text colour */
const ICONS = {
  bag:    '<path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9.5 8.5V6.2A2.5 2.5 0 0 1 12 3.7a2.5 2.5 0 0 1 2.5 2.5V8.5"/>',
  heart:  '<path d="M12 20s-7-4.4-7-9.4A3.9 3.9 0 0 1 12 7.6 3.9 3.9 0 0 1 19 10.6c0 5-7 9.4-7 9.4Z"/>',
  star:   '<path d="M12 3.6l2.5 5.3 5.8.8-4.2 4.1 1 5.8-5.1-2.9-5.1 2.9 1-5.8L3.7 9.7l5.8-.8L12 3.6Z"/>',
  close:  '<path d="M6 6l12 12M18 6 6 18"/>',
  plus:   '<path d="M12 5v14M5 12h14"/>',
  minus:  '<path d="M5 12h14"/>',
  check:  '<path d="M4.5 12.5 9.5 17.5 19.5 7"/>',
  arrow:  '<path d="M4 12h15M13 6l6 6-6 6"/>',
  down:   '<path d="M12 4v15M6 13l6 6 6-6"/>',
  wa:     '<path d="M20 11.7A7.9 7.9 0 0 1 8.2 18L4 19.3l1.4-4.1A7.9 7.9 0 1 1 20 11.7Z"/><path d="M9.2 9.1c-.3 1.6 1.1 3.4 2 4.2.9.8 2.6 1.8 3.6 1.2.6-.4.9-1.4.6-1.8l-1.3-.9-.9.8c-.7-.3-1.6-1.2-1.9-1.9l.8-.9-.9-1.3c-.4-.3-1.5 0-2 .5Z"/>',
  ig:     '<rect x="4" y="4" width="16" height="16" rx="4.6"/><circle cx="12" cy="12" r="3.6"/><circle cx="16.6" cy="7.4" r=".9" fill="currentColor"/>',
  mail:   '<rect x="3.5" y="6" width="17" height="12" rx="2"/><path d="M4 7.5 12 13l8-5.5"/>',
  pin:    '<path d="M12 21s6-6.3 6-10.4A6 6 0 0 0 6 10.6C6 14.7 12 21 12 21Z"/><circle cx="12" cy="10.4" r="2.3"/>',
  truck:  '<path d="M2.6 7.5h10.2v9H2.6zM12.8 11h4.4l2.2 3v2.5h-6.6z"/><circle cx="6.4" cy="18.4" r="1.6"/><circle cx="16.2" cy="18.4" r="1.6"/>',
  leaf:   '<path d="M5 19C4 12 9 5.6 19.4 4.8 20 14.4 14 19.6 7.4 18.2"/><path d="M6.6 17.4C9.8 12.6 13.4 9.6 17.4 7.6"/>',
  shield: '<path d="M12 3.4l6.6 2.4v6c0 4.2-3 7-6.6 8.8-3.6-1.8-6.6-4.6-6.6-8.8v-6Z"/><path d="M9.2 11.8 11.4 14l3.6-3.8"/>',
  gift:   '<rect x="4" y="9.4" width="16" height="10.4" rx="1.6"/><path d="M4 13.4h16M12 9.4v10.4"/><path d="M12 9.4S9.4 4.4 7.4 5.6 9.6 9.4 12 9.4Zm0 0s2.6-5 4.6-3.8S14.4 9.4 12 9.4Z"/>',
  sparkle:'<path d="M12 4l1.7 4.6L18 10l-4.3 1.4L12 16l-1.7-4.6L6 10l4.3-1.4L12 4Z"/><path d="M18.4 15.2l.8 2 1.9.8-1.9.8-.8 1.9-.8-1.9-2-.8 2-.8Z"/>'
};
function icon(name, cls = "") {
  return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ""}</svg>`;
}




