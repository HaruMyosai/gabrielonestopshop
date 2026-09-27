/* ============================================================
   APP — renders PRODUCTS into the page, runs the bag, and writes
   the Messenger order message.
   Anything the owner might change lives in products.js; this file
   only reads it.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- dom helpers ---------- */
  const $  = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));
  const on = (el, ev, fn, opt) => el && el.addEventListener(ev, fn, opt);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const money = n => {
    const v = Math.round(n * 100) / 100;
    return SHOP.currency + (Number.isInteger(v)
      ? v.toLocaleString("en-PH")
      : v.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  };
  const byId = id => PRODUCTS.filter(p => p.id === id)[0];

  /* ---------- persisted state ---------- */
  const KEY = "goss.v1";
  const readBack = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const stored = readBack();

  const state = {
    cart: Array.isArray(stored.cart) ? stored.cart : [],   // { id, color, qty }
    wish: Array.isArray(stored.wish) ? stored.wish : [],   // product ids
    aud: "all", type: "all", sort: "featured",
    savedOnly: false, heroColor: 0, openId: null
  };
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify({ cart: state.cart, wish: state.wish })); } catch (e) {} };

  const lineOf  = (id, color) => state.cart.filter(l => l.id === id && l.color === color)[0];
  const nUnits  = () => state.cart.reduce((n, l) => n + l.qty, 0);
  const subtotal = () => state.cart.reduce((n, l) => { const p = byId(l.id); return p ? n + p.price * l.qty : n; }, 0);

  /* ---------- toast ---------- */
  const toastBox = $("#toasts");
  function toast(msg, iconName) {
    if (!toastBox) return;
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = icon(iconName || "check") + "<span>" + esc(msg) + "</span>";
    toastBox.appendChild(t);
    setTimeout(() => { t.classList.add("is-out"); setTimeout(() => t.remove(), 400); }, 2400);
  }

  /* ---------- broken photo silently becomes the drawing ---------- */
  document.addEventListener("error", e => {
    const img = e.target;
    if (img && img.classList && img.classList.contains("bag-photo") && img.dataset.fallback) {
      const holder = document.createElement("div");
      holder.innerHTML = decodeURIComponent(img.dataset.fallback);
      if (holder.firstChild) img.replaceWith(holder.firstChild);
    }
  }, true);

  /* ---------- contact wiring pulled from SHOP ---------- */
  const messengerURL = () => SHOP.messenger || "#";
  const messengerNote = () => "Hi " + SHOP.founder + "! Question about a piece at " + SHOP.name + ".";

  function paintChrome() {
    ["#waLink", "#waAsk", "#footWa"].forEach(sel => { const el = $(sel); if (el) { el.href = messengerURL(); el.target = "_blank"; el.rel = "noopener"; } });
    const ig = $("#footIg");   if (ig)   ig.href = "https://instagram.com/" + SHOP.instagram;
    const mail = $("#footMail"); if (mail) mail.href = "mailto:" + SHOP.email;
    const tel = $("#footPhone");
    if (tel) { tel.textContent = SHOP.messengerName || "Message us"; tel.href = messengerURL(); tel.target = "_blank"; tel.rel = "noopener"; }

    const set = (sel, txt) => { const el = $(sel); if (el) el.textContent = txt; };
    set("#footerCity", SHOP.city.split(",")[0]);
    set("#footerNote", SHOP.pickupNote);
    set("#founderName", SHOP.founder);
    set("#year", String(new Date().getFullYear()));
    set(".plate__city", SHOP.city);
    set(".plate__est", "Est. " + SHOP.since);
    set(".plate__mono", SHOP.monogram);
    $$(".brand__stamp").forEach(s => { s.textContent = SHOP.monogram; });

    const newest = PRODUCTS.filter(p => p.tag === "New")[0] || PRODUCTS[0];
    const items = [
      "Free shipping over " + money(SHOP.freeShipOver),
      "New in — " + newest.name,
      SHOP.priceNote,
      SHOP.payment,
      "Tissue + ribbon gift wrapping",
      "Exchanges within 7 days",
      "Pickup in " + SHOP.city.split(",")[0],
      "Real photos on request"
    ];
    const row = items.map(t => "<span>" + esc(t) + "</span><i>✦</i>").join("");
    $$(".ticker__row").forEach(r => { r.innerHTML = row; });
  }
  /* ---------- masthead, scroll rail, burger ---------- */
  function initScroll() {
    const head = $("#masthead"), bar = $("#scrollBar"), nav = $("#nav"), burger = $("#burger");
    let ticking = false;
    const paint = () => {
      const y = window.scrollY || 0;
      if (head) head.classList.toggle("is-stuck", y > 18);
      if (bar) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (max > 0 ? clamp(y / max, 0, 1) * 100 : 0) + "%";
      }
      ticking = false;
    };
    on(window, "scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }, { passive: true });
    on(window, "resize", paint);
    paint();

    on(burger, "click", () => {
      const open = nav.classList.toggle("is-open");
      head.classList.toggle("menu-open", open);
      burger.setAttribute("aria-expanded", String(open));
    });
    on(nav, "click", e => {
      if (e.target.tagName !== "A") return;
      nav.classList.remove("is-open");
      head.classList.remove("menu-open");
      burger.setAttribute("aria-expanded", "false");
      const jump = e.target.dataset.jump;
      if (jump) { state.aud = jump; state.savedOnly = false; syncChips(); renderGrid(); }
      const type = e.target.dataset.type;
      if (type) { state.type = type; const sel = $("#typeSel"); if (sel) sel.value = type; renderGrid(); }
    });
  }

  /* ---------- reveal + count-up ---------- */
  function initReveal() {
    const targets = $$(".reveal-up, .section-head, .promise__item, .dept");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      targets.forEach(t => t.classList.add("is-in")); return;
    }
    targets.forEach(t => t.classList.add("reveal-up"));
    const io = new IntersectionObserver(entries => {
      entries.forEach((en, i) => {
        if (!en.isIntersecting) return;
        setTimeout(() => en.target.classList.add("is-in"), (i % 4) * 70);
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.08 });
    targets.forEach(t => io.observe(t));
  }

  function initCounters() {
    $$("[data-count]").forEach(el => {
      const target = parseFloat(el.dataset.count);
      const dec = parseInt(el.dataset.dec || "0", 10);
      const show = v => { el.textContent = (dec ? v.toFixed(dec) : Math.round(v).toLocaleString("en-PH")) + (target >= 1000 ? "+" : ""); };
      if (reduceMotion || !("IntersectionObserver" in window)) { show(target); return; }
      const io = new IntersectionObserver(es => {
        es.forEach(e => {
          if (!e.isIntersecting) return;
          io.disconnect();
          const t0 = performance.now(), dur = 1400;
          const step = now => {
            const t = clamp((now - t0) / dur, 0, 1);
            show(target * (1 - Math.pow(1 - t, 3)));
            if (t < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
      }, { threshold: 0.6 });
      io.observe(el);
    });
  }

  /* ---------- hero stage ---------- */
  function initHero() {
    const art = $("#heroArt"), swatchBox = $("#heroSwatches"), badge = $("#heroBadge"), card = $("#heroCard");
    const hero = byId("amara") || PRODUCTS[0];
    if (!hero || !art) return;

    const draw = () => { art.innerHTML = productArt(hero, state.heroColor); };
    draw();
    if (badge) badge.innerHTML = badgeSVG("HAND WRAPPED", "SMALL RUNS");

    if (swatchBox) {
      swatchBox.innerHTML = hero.colors.map((c, i) =>
        '<button type="button" data-c="' + i + '" style="background:' + c.hex +
        '" aria-label="' + esc(c.name) + '"' + (i === state.heroColor ? ' class="is-on"' : "") + "></button>").join("");
      on(swatchBox, "click", e => {
        const b = e.target.closest("button[data-c]"); if (!b) return;
        state.heroColor = parseInt(b.dataset.c, 10);
        $$("button", swatchBox).forEach(x => x.classList.toggle("is-on", x === b));
        draw();
      });
    }
    const hName = card && $(".hero__card-name", card), hPrice = card && $(".hero__card-price", card), hTag = card && $(".hero__card-tag", card);
    if (hName) hName.textContent = hero.name;
    if (hPrice) hPrice.innerHTML = money(hero.price) + (hero.compareAt ? " <s>" + money(hero.compareAt) + "</s>" : "");
    if (hTag) hTag.textContent = hero.tag || "Bestseller";
    if (card) card.setAttribute("aria-label", "Quick look: " + hero.name + ", " + money(hero.price));

    if (card) on(card, "click", () => openQuick(hero.id));

    /* the story plate carries a second, quieter illustration */
    const stack = $("#storyStack");
    if (stack) {
      const alt = byId("roman") || PRODUCTS[PRODUCTS.length - 1];
      stack.innerHTML = productArt(alt, 0);
    }
  }

  /* ---------- departments rail ---------- */
  function initDepartments() {
    const rail = $("#deptRail"); if (!rail) return;
    const artFor = {
      her:  (byId("sable") || PRODUCTS[0]),
      him:  (byId("roman") || PRODUCTS[0]),
      new:  (byId("sola") || PRODUCTS[1]),
      gift: (byId("marcus") || PRODUCTS[0])
    };
    rail.innerHTML = COLLECTIONS.map((c, i) => {
      const p = artFor[c.key];
      return '<button class="dept dept--' + c.key + ' reveal-up" type="button" data-dept="' + c.key + '">' +
        '<span class="dept__n">' + String(i + 1).padStart(2, "0") + "</span>" +
        '<span class="dept__label">' + esc(c.label) + "</span>" +
        '<span class="dept__line">' + esc(c.line) + "</span>" +
        (p ? '<span class="dept__art">' + productArt(p, 0) + "</span>" : "") +
        "</button>";
    }).join("");

    on(rail, "click", e => {
      const b = e.target.closest("[data-dept]"); if (!b) return;
      const key = b.dataset.dept;
      if (key === "gift") { document.getElementById("gift").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }); return; }
      if (key === "new") { state.sort = "new"; const s = $("#sortSel"); if (s) s.value = "new"; state.aud = "all"; }
      else state.aud = key;
      state.savedOnly = false;
      syncChips(); renderGrid();
      document.getElementById("shop").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    });
  }
  /* ---------- collection grid ---------- */
  const cardColor = {};                        // product id -> chosen colour index
  const isNew = p => (p.tag === "New" ? 2 : (p.tag === "Bestseller" ? 1 : 0));

  function visible() {
    let list = PRODUCTS.filter(p => {
      if (state.savedOnly) return state.wish.indexOf(p.id) > -1;
      const okAud = state.aud === "all" || p.audience === state.aud || p.audience === "all";
      const okType = state.type === "all" || p.type === state.type;
      return okAud && okType;
    });
    const s = state.sort;
    if (s === "low")    list = list.slice().sort((a, b) => a.price - b.price);
    if (s === "high")   list = list.slice().sort((a, b) => b.price - a.price);
    if (s === "rating") list = list.slice().sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    if (s === "new")    list = list.slice().sort((a, b) => isNew(b) - isNew(a));
    return list;
  }

  const starsHTML = p => icon("star") + p.rating.toFixed(1) + " · " + p.reviews + " reviews";

  function cardHTML(p, i) {
    const ci = cardColor[p.id] || 0;
    const held = state.wish.indexOf(p.id) > -1;
    const off = p.compareAt ? Math.round((1 - p.price / p.compareAt) * 100) : 0;
    return `
    <article class="card reveal-up" data-id="${p.id}" style="--i:${i}">
      <div class="card__media">
        ${p.tag ? `<span class="card__tag" data-tag="${esc(p.tag)}">${esc(p.tag)}</span>` : ""}
        <button class="card__save${held ? " is-on" : ""}" type="button" data-act="save"
                aria-label="${held ? "Remove from saved" : "Save this piece"}" aria-pressed="${held}">${icon("heart")}</button>
        <div class="card__art" data-art>${productArt(p, ci)}</div>
        ${off ? `<span class="card__sale">${off}% off</span>` : ""}
        <button class="card__quick" type="button" data-act="quick">Quick look</button>
      </div>
      <div class="card__body">
        <div class="card__top">
          <h3 class="card__name">${esc(p.name)}</h3>
          <span class="card__price">${money(p.price)}${p.compareAt ? `<s>${money(p.compareAt)}</s>` : ""}</span>
        </div>
        <p class="card__blurb">${esc(p.blurb)}</p>
        <div class="card__meta">
          <div class="swatches">
            ${p.colors.map((c, n) => `<button type="button" data-c="${n}" style="background:${c.hex}" title="${esc(c.name)}" aria-label="${esc(c.name)}"${n === ci ? ' class="is-on"' : ""}></button>`).join("")}
          </div>
          <span class="card__rating">${starsHTML(p)}</span>
        </div>
      </div>
      <button class="card__add" type="button" data-act="add">${icon("bag")}Add to bag</button>
    </article>`;
  }

  function renderGrid() {
    const grid = $("#grid"); if (!grid) return;
    const list = visible();
    grid.innerHTML = list.map(cardHTML).join("");
    const empty = $("#gridEmpty"); if (empty) empty.hidden = list.length > 0;
    const count = $("#resultCount");
    if (count) {
      count.textContent = state.savedOnly
        ? list.length + (list.length === 1 ? " saved piece" : " saved pieces")
        : list.length + (list.length === 1 ? " piece" : " pieces");
    }
    const cards = $$(".card", grid);
    if (reduceMotion) { cards.forEach(c => c.classList.add("is-in")); return; }
    requestAnimationFrame(() => cards.forEach((c, i) => setTimeout(() => c.classList.add("is-in"), Math.min(i, 9) * 55)));
  }

  function repaintCard(id) {
    const card = $('.card[data-id="' + id + '"]'); if (!card) return;
    const ci = cardColor[id] || 0;
    const holder = $("[data-art]", card); if (holder) holder.innerHTML = productArt(byId(id), ci);
    $$(".swatches button", card).forEach((b, n) => b.classList.toggle("is-on", n === ci));
  }

  function syncChips() {
    $$("#audChips .chip").forEach(c => c.classList.toggle("is-on", !state.savedOnly && c.dataset.aud === state.aud));
    const wish = $("#wishBtn"); if (wish) wish.classList.toggle("is-on", state.savedOnly);
  }

  function initFilters() {
    const chips = $("#audChips"), type = $("#typeSel"), sort = $("#sortSel"), empty = $("#gridEmpty"), grid = $("#grid");

    on(chips, "click", e => {
      const c = e.target.closest("[data-aud]"); if (!c) return;
      state.aud = c.dataset.aud; state.savedOnly = false;
      syncChips(); renderGrid();
    });
    on(type, "change", () => { state.type = type.value; renderGrid(); });
    on(sort, "change", () => { state.sort = sort.value; renderGrid(); });
    on(empty, "click", e => {
      if (!e.target.closest("[data-reset]")) return;
      state.aud = "all"; state.type = "all"; state.sort = "featured"; state.savedOnly = false;
      if (type) type.value = "all";
      if (sort) sort.value = "featured";
      syncChips(); renderGrid();
    });

    on(grid, "click", e => {
      const card = e.target.closest(".card"); if (!card) return;
      const p = byId(card.dataset.id); if (!p) return;
      const sw = e.target.closest("button[data-c]");
      if (sw) { cardColor[p.id] = parseInt(sw.dataset.c, 10); repaintCard(p.id); return; }
      const act = e.target.closest("[data-act]");
      if (act) {
        const what = act.dataset.act;
        if (what === "save") toggleWish(p.id, act);
        if (what === "quick") openQuick(p.id);
        if (what === "add") addToBag(p.id, cardColor[p.id] || 0, 1, act);
        return;
      }
      if (e.target.closest(".card__media") || e.target.closest(".card__body")) openQuick(p.id);
    });
  }
  /* ---------- saved pieces + header counts ---------- */
  function syncCounts() {
    const bag = $("#bagCount"), wish = $("#wishCount"), dn = $("#drawerN");
    const units = nUnits();
    if (bag) { bag.textContent = String(units); bag.classList.remove("pop"); void bag.offsetWidth; if (units) bag.classList.add("pop"); }
    if (wish) { wish.textContent = String(state.wish.length); wish.classList.remove("pop"); void wish.offsetWidth; if (state.wish.length) wish.classList.add("pop"); }
    if (dn) dn.textContent = String(units);
  }

  function toggleWish(id, btn) {
    const at = state.wish.indexOf(id);
    let now;
    if (at > -1) { state.wish.splice(at, 1); now = false; } else { state.wish.push(id); now = true; }
    persist(); syncCounts();

    const card = $('.card[data-id="' + id + '"]');
    if (card) {
      const heart = $(".card__save", card);
      if (heart) {
        heart.classList.toggle("is-on", now);
        heart.setAttribute("aria-pressed", String(now));
        heart.setAttribute("aria-label", now ? "Remove from saved" : "Save this piece");
      }
    }
    if (btn) btn.classList.toggle("is-on", now);
    const mh = $('#modal [data-act="save"]');
    if (mh && state.openId === id) mh.classList.toggle("is-on", now);

    toast(now ? "Saved — " + byId(id).name : "Taken off your list", now ? "heart" : "close");
    if (state.savedOnly) renderGrid();
  }

  function initWishButton() {
    const btn = $("#wishBtn");
    on(btn, "click", () => {
      if (!state.wish.length && !state.savedOnly) { toast("Nothing saved yet — tap the heart on any piece", "heart"); return; }
      state.savedOnly = !state.savedOnly;
      syncChips(); renderGrid();
      document.getElementById("shop").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- bag mutations ---------- */
  function addToBag(id, colorIdx, qty, btn) {
    const p = byId(id); if (!p) return;
    const color = p.colors[clamp(colorIdx, 0, p.colors.length - 1)];
    const line = lineOf(id, color.name);
    if (line) line.qty = clamp(line.qty + qty, 1, 20);
    else state.cart.push({ id: id, color: color.name, qty: clamp(qty, 1, 20) });
    persist(); syncCounts(); renderBag();
    if (btn) {
      const label = btn.innerHTML;
      btn.classList.add("is-done");
      btn.innerHTML = icon("check") + "In your bag";
      setTimeout(() => { btn.classList.remove("is-done"); btn.innerHTML = label; }, 1600);
    }
    toast(p.name + " in " + color.name + " — added", "bag");
  }

  function setQty(id, color, delta) {
    const line = lineOf(id, color); if (!line) return;
    line.qty += delta;
    if (line.qty <= 0) state.cart = state.cart.filter(l => l !== line);
    else line.qty = clamp(line.qty, 1, 20);
    persist(); syncCounts(); renderBag();
  }

  function removeLine(id, color) {
    const p = byId(id);
    state.cart = state.cart.filter(l => !(l.id === id && l.color === color));
    persist(); syncCounts(); renderBag();
    toast("Removed " + (p ? p.name : "that piece"), "close");
  }

  /* ---------- drawer render ---------- */
  function renderBag() {
    const box = $("#bagItems"), empty = $("#bagEmpty"), meter = $("#meter");
    if (!box) return;

    box.innerHTML = state.cart.map(l => {
      const p = byId(l.id); if (!p) return "";
      const c = p.colors.filter(x => x.name === l.color)[0] || p.colors[0];
      return `
      <div class="line" data-id="${p.id}" data-color="${esc(c.name)}">
        <div class="line__art">${productArt(p, p.colors.indexOf(c))}</div>
        <div>
          <p class="line__name">${esc(p.name)}</p>
          <p class="line__color"><i style="background:${c.hex}"></i>${esc(c.name)}</p>
          <div class="qty">
            <button type="button" data-act="dec" aria-label="One fewer">${icon("minus")}</button>
            <span>${l.qty}</span>
            <button type="button" data-act="inc" aria-label="One more">${icon("plus")}</button>
          </div>
        </div>
        <div class="line__end">
          <span class="line__price">${money(p.price * l.qty)}</span>
          <button class="line__rm" type="button" data-act="rm">Remove</button>
        </div>
      </div>`;
    }).join("");

    if (empty) empty.hidden = state.cart.length > 0;
    box.hidden = state.cart.length === 0;

    const sub = subtotal();
    const left = SHOP.freeShipOver - sub;
    const fill = $("#meterFill"), label = $("#meterLabel");
    if (meter) meter.style.display = state.cart.length ? "" : "none";
    if (fill) fill.style.width = clamp((sub / SHOP.freeShipOver) * 100, 0, 100) + "%";
    if (label) {
      label.innerHTML = left > 0
        ? "Add <b>" + money(left) + "</b> for free shipping"
        : "<b>Free shipping unlocked</b> — nice pick";
    }

    const free = sub >= SHOP.freeShipOver;
    set("#sumSubtotal", money(sub));
    set("#sumShip", sub === 0 ? "Quoted on Messenger" : (free ? "Free" : "Quoted on Messenger"));
    set("#sumTotal", money(sub));

    const out = $("#checkout");
    if (out) {
      out.disabled = state.cart.length === 0;
      out.style.opacity = state.cart.length ? "" : ".45";
      out.style.pointerEvents = state.cart.length ? "" : "none";
    }
  }
  /* shared text setter used by drawer + footer updates */
  function set(sel, txt) { const el = $(sel); if (el) el.textContent = txt; }

  /* ---------- open / close the bag ---------- */
  let lastFocus = null;
  const lockBody = yes => { document.body.style.overflow = yes ? "hidden" : ""; };
  const modalIsOpen = () => { const m = $("#modal"); return !!m && m.classList.contains("is-open"); };
  const bagIsOpen = () => { const d = $("#drawer"); return !!d && d.classList.contains("is-open"); };

  function openBag() {
    const drawer = $("#drawer"), scrim = $("#scrim");
    if (!drawer) return;
    lastFocus = document.activeElement;
    if (scrim) { scrim.hidden = false; requestAnimationFrame(() => scrim.classList.add("is-on")); }
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    lockBody(true);
    const close = $("#drawerClose"); if (close) setTimeout(() => close.focus(), 60);
  }

  function closeBag() {
    const drawer = $("#drawer"), scrim = $("#scrim");
    if (!drawer) return;
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    if (scrim) {
      scrim.classList.remove("is-on");
      setTimeout(() => { if (!modalIsOpen()) scrim.hidden = true; }, 450);
    }
    if (!modalIsOpen()) lockBody(false);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function initBag() {
    const box = $("#bagItems");
    on($("#bagBtn"), "click", openBag);
    on($("#drawerClose"), "click", closeBag);
    on($("#scrim"), "click", () => { closeModal(); closeBag(); });
    on(box, "click", e => {
      const line = e.target.closest(".line"); if (!line) return;
      const act = e.target.closest("[data-act]"); if (!act) return;
      const id = line.dataset.id, color = line.dataset.color;
      if (act.dataset.act === "inc") setQty(id, color, 1);
      if (act.dataset.act === "dec") setQty(id, color, -1);
      if (act.dataset.act === "rm") removeLine(id, color);
    });
    $$("[data-close-on-click]").forEach(a => on(a, "click", closeBag));

    on($("#checkout"), "click", () => {
      const msg = orderText();
      if (!msg) { toast("Your bag is empty", "bag"); return; }
      copyOrder(msg);
    });
  }

  /* ---------- Messenger can't take pre-filled text, so copy the order then open the chat ---------- */
  function copyOrder(msg) {
    const done = ok => {
      window.open(messengerURL(), "_blank", "noopener");
      toast(ok ? "Order copied — paste it to " + (SHOP.messengerName || "us") + " on Messenger"
               : "Long-press to copy your order, then paste it on Messenger", "wa");
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(msg).then(() => done(true), () => fallbackCopy(msg, done));
    } else fallbackCopy(msg, done);
  }
  function fallbackCopy(msg, done) {
    const ta = document.createElement("textarea");
    ta.value = msg; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (e) {}
    ta.remove(); done(ok);
  }

  /* ---------- the Messenger order message ---------- */
  function orderText() {
    if (!state.cart.length) return "";
    const lines = state.cart.map(l => {
      const p = byId(l.id); if (!p) return "";
      return l.qty + "× " + p.name + " — " + l.color + " — " + money(p.price * l.qty);
    });
    const sub = subtotal();
    const noteEl = $("#bagNote");
    const note = noteEl ? noteEl.value.trim() : "";
    return [
      "Hi " + SHOP.founder + "! I'd like to order:",
      "",
      lines.join("\n"),
      "",
      "Subtotal: " + money(sub) + (sub >= SHOP.freeShipOver ? " (free shipping)" : " (please quote shipping)"),
      note ? "Note: " + note : "Note: —",
      "",
      "Sent from the " + SHOP.name + " storefront."
    ].join("\n");
  }
  /* ---------- quick look ---------- */
  let qvQty = 1;

  function qvMarkup(p) {
    const ci = cardColor[p.id] || 0;
    const held = state.wish.indexOf(p.id) > -1;
    const also = PRODUCTS.filter(x => x.id !== p.id && (x.audience === p.audience || x.audience === "all")).slice(0, 6);
    return `
    <button class="x modal__close" type="button" data-qv="close" aria-label="Close">${icon("close")}</button>
    <div class="qv__art" data-qvart>${productArt(p, ci)}</div>
    <div class="qv__info">
      <p class="qv__eyebrow">${esc(p.materials)}${p.tag ? " · " + esc(p.tag) : ""}</p>
      <h2 class="qv__name" id="modalTitle">${esc(p.name)}</h2>
      <div class="qv__row">
        <span class="qv__price">${money(p.price)}</span>
        ${p.compareAt ? "<s>" + money(p.compareAt) + "</s>" : ""}
        <span class="qv__stars">${starsHTML(p)}</span>
      </div>
      <p class="qv__desc">${esc(p.detail)}</p>
      <p class="qv__label">Colour — <span data-qvcolor>${esc(p.colors[ci].name)}</span></p>
      <div class="qv__swatches">
        ${p.colors.map((c, n) => `<button type="button" data-qvc="${n}" style="background:${c.hex}" title="${esc(c.name)}" aria-label="${esc(c.name)}"${n === ci ? ' class="is-on"' : ""}></button>`).join("")}
      </div>
      <ul class="qv__specs">
        <li><span>Size</span>${esc(p.size)}</li>
        <li><span>Strap</span>${esc(p.strap)}</li>
        <li><span>Made of</span>${esc(p.materials)}</li>
        <li><span>Rated</span>${p.rating.toFixed(1)} / ${p.reviews} reviews</li>
      </ul>
      <div class="qv__buy">
        <div class="qty">
          <button type="button" data-qv="less" aria-label="One fewer">${icon("minus")}</button>
          <span data-qvqty>1</span>
          <button type="button" data-qv="more" aria-label="One more">${icon("plus")}</button>
        </div>
        <button class="btn btn--solid" type="button" data-qv="add">${icon("bag")}Add to bag</button>
        <button class="icon-btn${held ? " is-on" : ""}" type="button" data-act="save" aria-label="Save this piece" aria-pressed="${held}">${icon("heart")}</button>
      </div>
      <p class="qv__note">${esc(SHOP.pickupNote)}</p>
      <div class="qv__also">
        <h4>Also worth a look</h4>
        <div class="hscroll">
          ${also.map(x => `<button class="card" type="button" data-qvopen="${x.id}">
            <span class="card__media" style="display:block"><span class="card__art" style="position:absolute;inset:8% 10%">${productArt(x, 0)}</span></span>
            <span class="card__body" style="display:block;padding:10px 2px 0">
              <span class="card__name" style="font-size:.98rem">${esc(x.name)}</span>
              <span class="card__price" style="display:block;margin-top:.4em">${money(x.price)}</span>
            </span></button>`).join("")}
        </div>
      </div>
    </div>`;
  }

  function openQuick(id) {
    const p = byId(id), modal = $("#modal"), panel = $("#modalPanel");
    if (!p || !modal) return;
    state.openId = id; qvQty = 1;
    lastFocus = document.activeElement;
    panel.innerHTML = qvMarkup(p);
    const scrim = $("#scrim");
    if (scrim) { scrim.hidden = false; scrim.classList.add("is-on"); }
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    lockBody(true);
    const close = $(".modal__close", panel);
    if (close) setTimeout(() => close.focus(), 60);
  }

  function closeModal() {
    const modal = $("#modal"), scrim = $("#scrim");
    if (!modal || !modal.classList.contains("is-open")) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    state.openId = null;
    if (!bagIsOpen()) {
      lockBody(false);
      if (scrim) { scrim.classList.remove("is-on"); setTimeout(() => { if (!bagIsOpen()) scrim.hidden = true; }, 450); }
    }
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function initQuickView() {
    const modal = $("#modal"), panel = $("#modalPanel");
    if (!modal) return;

    on(modal, "click", e => {
      if (e.target === modal) { closeModal(); return; }            // backdrop
      const p = byId(state.openId); if (!p) return;

      const jump = e.target.closest("[data-qvopen]");
      if (jump) { openQuick(jump.dataset.qvopen); return; }

      if (e.target.closest('[data-qv="close"]')) { closeModal(); return; }

      const keep = e.target.closest('[data-act="save"]');
      if (keep) { toggleWish(p.id, keep); return; }

      const sw = e.target.closest("[data-qvc]");
      if (sw) {
        const n = parseInt(sw.dataset.qvc, 10);
        cardColor[p.id] = n;
        const art = $("[data-qvart]", panel); if (art) art.innerHTML = productArt(p, n);
        const lbl = $("[data-qvcolor]", panel); if (lbl) lbl.textContent = p.colors[n].name;
        $$(".qv__swatches button", panel).forEach((b, i) => b.classList.toggle("is-on", i === n));
        repaintCard(p.id);
        return;
      }

      const act = e.target.closest("[data-qv]");
      if (!act) return;
      const what = act.dataset.qv;
      if (what === "less" || what === "more") {
        qvQty = clamp(qvQty + (what === "more" ? 1 : -1), 1, 20);
        const q = $("[data-qvqty]", panel); if (q) q.textContent = String(qvQty);
      }
      if (what === "add") {
        addToBag(p.id, cardColor[p.id] || 0, qvQty, act);
        closeModal();
        setTimeout(openBag, 300);
      }
    });
  }

  /* ---------- keyboard ---------- */
  function initKeys() {
    on(document, "keydown", e => {
      const head = $("#masthead"), nav = $("#nav"), burger = $("#burger");
      if (e.key === "Escape") {
        if (modalIsOpen()) closeModal();
        else if (bagIsOpen()) closeBag();
        else if (head && head.classList.contains("menu-open")) {
          head.classList.remove("menu-open"); nav.classList.remove("is-open");
          if (burger) burger.setAttribute("aria-expanded", "false");
        }
        return;
      }
      if (e.key !== "Tab") return;
      const box = modalIsOpen() ? $("#modalPanel") : (bagIsOpen() ? $("#drawer") : null);
      if (!box) return;
      const list = $$('a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])', box)
        .filter(el => el.offsetParent !== null);
      if (!list.length) return;
      const first = list[0], last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ---------- gifting rail: the "under the gift budget" shelf ---------- */
  function initGiftRail() {
    const rail = $("#giftRail"); if (!rail) return;
    const cap = SHOP.giftMax || 3000;
    const picks = PRODUCTS.filter(p => p.price <= cap).sort((a, b) => a.price - b.price).slice(0, 8);
    rail.innerHTML = picks.map(p => `
      <button class="card" type="button" data-gift="${p.id}">
        <span class="card__media" style="display:block">
          <span class="card__art" style="position:absolute;inset:9% 12%">${productArt(p, 0)}</span>
        </span>
        <span class="card__body" style="display:block">
          <span class="card__name" style="font-size:1.02rem">${esc(p.name)}</span>
          <span class="card__blurb" style="display:block;margin-top:.4em">${esc(p.blurb)}</span>
          <span class="card__price" style="display:block;margin-top:.7em">${money(p.price)}</span>
        </span>
      </button>`).join("");
    on(rail, "click", e => {
      const b = e.target.closest("[data-gift]"); if (!b) return;
      openQuick(b.dataset.gift);
    });
  }

  /* ---------- reviews: score, bars, cards ---------- */
  function initVoices() {
    const total = PRODUCTS.reduce((n, p) => n + p.reviews, 0);
    const avg = PRODUCTS.reduce((n, p) => n + p.rating * p.reviews, 0) / total;
    set("#voiceScore", avg.toFixed(1));
    const vc = $("#voiceCount"); if (vc) vc.textContent = total.toLocaleString("en-PH");

    const bars = $("#voiceBars");
    if (bars) {
      const buckets = [5, 4, 3, 2, 1].map(star => {
        const weight = PRODUCTS.reduce((n, p) => {
          const d = Math.abs(Math.round(p.rating) - star);
          return n + p.reviews * (d === 0 ? 1 : d === 1 ? 0.16 : d === 2 ? 0.04 : 0.01);
        }, 0);
        return { star: star, pct: (weight / total) * 100 };
      });
      bars.innerHTML = buckets.map(b =>
        '<span>' + b.star + '★ <i data-w="' + b.pct.toFixed(1) + '"></i></span>').join("");
      const fill = () => $$("i", bars).forEach(i => { i.style.setProperty("--w", i.dataset.w + "%"); });
      if (reduceMotion || !("IntersectionObserver" in window)) fill();
      else {
        const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { io.disconnect(); setTimeout(fill, 120); } }), { threshold: 0.4 });
        io.observe(bars);
      }
    }

    const grid = $("#voiceGrid");
    if (grid) {
      grid.innerHTML = TESTIMONIALS.map(t => `
        <figure class="quote">
          <div class="quote__stars">${icon("star")}${icon("star")}${icon("star")}${icon("star")}${icon("star")}</div>
          <blockquote class="quote__text">“${esc(t.quote)}”</blockquote>
          <figcaption class="quote__who">
            <span class="quote__av">${esc(t.name.slice(0, 1))}</span>
            <span>
              <span class="quote__name">${esc(t.name)}</span>
              <span class="quote__meta">${esc(t.city)} · ${esc(t.bag)}</span>
            </span>
          </figcaption>
        </figure>`).join("");
    }
  }
  /* ---------- faq accordion ---------- */
  function initFaq() {
    const list = $("#faqList"); if (!list) return;
    list.innerHTML = FAQS.map((f, i) => `
      <div class="faq__item">
        <button class="faq__q" type="button" aria-expanded="false" aria-controls="faq-a-${i}">
          <span>${esc(f.q)}</span><span class="faq__sign" aria-hidden="true"></span>
        </button>
        <div class="faq__a" id="faq-a-${i}"><div><p>${esc(f.a)}</p></div></div>
      </div>`).join("");

    on(list, "click", e => {
      const q = e.target.closest(".faq__q"); if (!q) return;
      const item = q.parentElement;
      const open = item.classList.contains("is-open");
      $$(".faq__item", list).forEach(x => {
        x.classList.remove("is-open");
        const b = $(".faq__q", x); if (b) b.setAttribute("aria-expanded", "false");
      });
      if (!open) { item.classList.add("is-open"); q.setAttribute("aria-expanded", "true"); }
    });
  }

  /* ---------- the list signup (no backend — it's a prototype) ---------- */
  function initSignup() {
    const form = $("#listForm"), input = $("#listEmail"), note = $("#listNote");
    if (!form) return;
    on(form, "submit", e => {
      e.preventDefault();
      const v = (input && input.value || "").trim();
      const ok = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v);
      if (!ok) {
        if (note) note.textContent = "That address looks off — check it and try again.";
        if (input) { input.focus(); input.style.borderColor = "var(--oxblood)"; setTimeout(() => { input.style.borderColor = ""; }, 1400); }
        return;
      }
      if (note) note.textContent = "You're on the list (demo — nothing was sent). Real drops land Tuesday, 9am PHT.";
      if (input) input.value = "";
      toast("Saved in this browser only — see you Tuesday", "sparkle");
    });
  }

  /* ---------- any link that says "jump to this filter" ---------- */
  function initJumpLinks() {
    on(document, "click", e => {
      const a = e.target.closest("a[data-jump], a[data-type]");
      if (!a) return;
      if (a.dataset.jump) { state.aud = a.dataset.jump; state.savedOnly = false; }
      if (a.dataset.type) { state.type = a.dataset.type; const s = $("#typeSel"); if (s) s.value = state.type; }
      syncChips(); renderGrid();
      const head = $("#masthead"), nav = $("#nav"), burger = $("#burger");
      if (head) head.classList.remove("menu-open");
      if (nav) nav.classList.remove("is-open");
      if (burger) burger.setAttribute("aria-expanded", "false");
    });
  }

  /* ---------- boot ---------- */
  function boot() {
    paintChrome();
    initScroll();
    initHero();
    initDepartments();
    initFilters();
    initWishButton();
    renderGrid();
    initGiftRail();
    initVoices();
    initFaq();
    initSignup();
    initJumpLinks();
    initBag();
    initQuickView();
    initKeys();
    renderBag();
    syncCounts();
    syncChips();
    initReveal();
    initCounters();

    /* a hash like #product-noor opens the quick look on load */
    const h = location.hash;
    if (h && h.indexOf("#product-") === 0) {
      const id = h.replace("#product-", "");
      if (byId(id)) setTimeout(() => openQuick(id), 400);
    }
    if (cartCount()) toast("Welcome back — " + cartCount() + (cartCount() === 1 ? " piece" : " pieces") + " still in your bag", "bag");
  }

  if (document.readyState === "loading") on(document, "DOMContentLoaded", boot);
  else boot();
})();

