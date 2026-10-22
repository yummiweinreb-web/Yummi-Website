/* Yummi – interactions & motion */
(() => {
  "use strict";

  /* ------- settings: fill in the real details ------- */
  const CONTACT_EMAIL = "hello@yummi.co.il";   // where the form sends to (mailto fallback)
  const FORM_ENDPOINT = "";                     // optional: Formspree / Make / Zapier webhook URL

  const root = document.documentElement;
  const body = document.body;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const isDesktop = () => innerWidth >= 1024;

  root.classList.add("js");
  if (window.CSS && CSS.registerProperty && !reduce) root.classList.add("wipe");   // soft-edge reveal for the neon tubes (needs @property)

  /* ------- real viewport width (excludes scrollbar) ------- */
  const setVW = () => root.style.setProperty("--vw", root.clientWidth + "px");
  setVW();
  addEventListener("resize", () => { setVW(); requestAnimationFrame(layoutScripts); }, { passive: true });

  /* ------- script titles: Allison word + hand-drawn flourish ------- */
  const NS = "http://www.w3.org/2000/svg";
  const scripts = $$("[data-script]");
  scripts.forEach(el => {
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("aria-hidden", "true");
    const l = document.createElementNS(NS, "path");
    const r = document.createElementNS(NS, "path");
    const t = document.createElementNS(NS, "text");
    l.setAttribute("class", "script__flourish script__flourish--l");
    r.setAttribute("class", "script__flourish script__flourish--r");
    t.setAttribute("class", "script__text");
    t.setAttribute("text-anchor", "middle");
    t.setAttribute("direction", "ltr");
    t.textContent = el.dataset.script;
    svg.append(l, t, r);
    el.append(svg);
  });

  function layoutScripts() {
    scripts.forEach(el => {
      const svg = $("svg", el), t = $("text", el), l = $(".script__flourish--l", el), r = $(".script__flourish--r", el);
      const H = 60, W = Math.max(120, Math.round((el.clientWidth / Math.max(1, el.clientHeight)) * H));
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      t.setAttribute("x", W / 2);
      t.setAttribute("y", 44);
      t.setAttribute("font-size", el.dataset.fs || 60);
      let bb;
      try { bb = t.getBBox(); } catch (e) { return; }
      if (!bb.width) return;
      const x1 = bb.x + 4, x2 = bb.x + bb.width - 3, yb = 46;
      // left stroke: comes in from the edge with a soft wave and lifts into the first letter
      l.setAttribute("d", `M2 ${yb - 6} C ${x1 * .28} ${yb - 16}, ${x1 * .55} ${yb + 2}, ${x1 * .78} ${yb - 4} S ${x1 - 2} ${yb - 20}, ${x1 + 2} ${yb - 22}`);
      // right stroke: leaves the last letter, runs out and curls up at the end
      const span = W - x2;
      r.setAttribute("d", `M${x2} ${yb - 3} C ${x2 + span * .3} ${yb + 3}, ${x2 + span * .55} ${yb - 14}, ${x2 + span * .8} ${yb - 13} S ${W - 3} ${yb - 4}, ${W - 2} ${yb - 9}`);
      [l, r].forEach(p => { const len = Math.ceil(p.getTotalLength()) + 2; p.style.setProperty("--len", len); });
    });
    scribbleLayout();
  }

  /* ------- project names: biggest size that fits the column (like the mockup) ------- */
  function fitNames() {
    $$(".project__name").forEach(h => {
      h.style.removeProperty("--fit");
      if (!isDesktop()) return;
      const col = h.parentElement.clientWidth;
      const w = h.scrollWidth;
      if (w > col) h.style.setProperty("--fit", (parseFloat(getComputedStyle(h).fontSize) * col / w * .99).toFixed(2) + "px");
    });
  }
  addEventListener("resize", () => requestAnimationFrame(fitNames), { passive: true });

  /* ------- snakes: each neon tube slithers in along its own body ------- */
  // every tube image has a "time map" (assets/img/maps): grey = when the snake's body reaches that pixel.
  // An SVG mask turns the map into a moving front, so only the snake is revealed - everything else stays put.
  const SNAKE_K = 14;
  const loadImg = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  const ease = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const snakeReady = [];
  function makeSnake(img, { dur = 3.4, fit = "none" } = {}) {
    if (!img || reduce || !(window.CSS && CSS.supports("mask-type", "luminance") || true)) return null;
    const pic = img.closest("picture");
    const srcEl = pic && $("source", pic);
    const holder = (pic || img).parentElement;
    const s = { key: "", svg: null, fes: [], p: 0, raf: 0, started: false, ready: null };
    const setP = p => {
      s.p = p;
      const ic = (SNAKE_K * (0.1 + p * 1.02)).toFixed(3);
      s.fes.forEach(f => f.setAttribute("intercept", ic));
    };
    const build = () => {
      const src = (srcEl && matchMedia(srcEl.media).matches) ? srcEl.getAttribute("srcset") : img.getAttribute("src");
      const base = src.split("/").pop().replace(/\.\w+$/, "");
      if (s.key === base) return s.ready;
      s.key = base;
      const map = `assets/img/maps/${base}.png`, plate = `assets/img/maps/${base}-plate.webp`;
      s.ready = Promise.all([loadImg(src), loadImg(map), loadImg(plate).catch(() => null)]).then(([im, , pl]) => {
        if (s.key !== base) return;
        const W = im.naturalWidth, H = im.naturalHeight, id = `sn${Math.random().toString(36).slice(2, 7)}`;
        const svg = document.createElementNS(NS, "svg");
        svg.setAttribute("class", "snake");
        svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
        svg.setAttribute("preserveAspectRatio", fit);
        svg.setAttribute("aria-hidden", "true");
        svg.setAttribute("focusable", "false");
        const fn = ["R", "G", "B"].map(c => `<feFunc${c} type="linear" slope="-${SNAKE_K}" intercept="${SNAKE_K * .1}"/>`).join("");
        svg.innerHTML =
          `<defs><filter id="f${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feComponentTransfer>${fn}</feComponentTransfer></filter>` +
          `<mask id="m${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}" style="mask-type:luminance"><image href="${map}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="none" filter="url(#f${id})"/></mask></defs>` +
          (pl ? `<image href="${plate}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="none"/>` : "") +
          `<image href="${src}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="none" mask="url(#m${id})"/>`;
        s.svg && s.svg.remove();
        s.svg = svg; s.fes = [...svg.querySelectorAll("feComponentTransfer > *")];
        (pic || img).after(svg);
        (pic || img).style.display = "none";
        setP(s.started ? s.p : 0);
      }).catch(() => { s.svg && s.svg.remove(); s.svg = null; (pic || img).style.display = ""; s.failed = true; });
      return s.ready;
    };
    s.play = (delay = 0) => {
      if (s.started) return; s.started = true;
      s.ready.then(() => {
        if (s.failed) return;
        const t0 = performance.now() + delay * 1000;
        const tick = now => {
          const k = Math.min(1, Math.max(0, (now - t0) / (dur * 1000)));
          setP(ease(k));
          if (k < 1) s.raf = requestAnimationFrame(tick);
        };
        s.raf = requestAnimationFrame(tick);
      });
    };
    build();
    const mq = srcEl && matchMedia(srcEl.media);
    mq && mq.addEventListener("change", () => build());
    snakeReady.push(s.ready);
    holder._snake = s; holder.classList.add("snake-on");
    return s;
  }
  const heroSnake = null; /* hero is a static picture again; snakes no longer animate */

  /* ------- script titles: scribbled in, stroke by stroke ------- */
  function scribbleLayout() {
    return; // pen animation replaced by a soft left-to-right wipe (CSS)
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    scripts.forEach(el => {
      const w = el.clientWidth, h = el.clientHeight;
      if (!w || !h || reduce) return;
      const text = el.dataset.script, fs = parseFloat(el.dataset.fs || 60);
      const scale = h / 60, cw = Math.round(w * dpr), ch = Math.round(h * dpr);
      let st = el._scr;
      if (!st) {
        const cv = document.createElement("canvas");
        cv.className = "script__pen";
        el.append(cv);
        st = el._scr = { cv, p: 0, raf: 0, started: false, key: "" };
        const go = () => { if (el.classList.contains("is-in") && !st.started) { st.started = true; penPlay(st); } };
        new MutationObserver(go).observe(el, { attributes: true, attributeFilter: ["class"] });
        go();
      }
      const key = `${cw}x${ch}`;
      if (st.key === key) return;
      st.key = key;
      const cv = st.cv; cv.width = cw; cv.height = ch;
      const ctx = cv.getContext("2d", { willReadFrequently: true });
      ctx.clearRect(0, 0, cw, ch);
      ctx.font = `${fs * scale * dpr}px Allison`;
      ctx.textAlign = "center"; ctx.direction = "ltr";
      ctx.fillStyle = getComputedStyle(el).color;
      ctx.fillText(text, cw / 2, 44 * scale * dpr);
      const img = ctx.getImageData(0, 0, cw, ch), d = img.data;
      // geodesic "pen time" along the strokes, starting at the left end of every connected piece
      const N = cw * ch, T = new Float32Array(N).fill(-1), q = new Int32Array(N);
      const on = i => d[i * 4 + 3] > 40;
      const comps = []; let total = 0;
      for (let x = 0; x < cw; x++) for (let y = 0; y < ch; y++) {
        const s0 = y * cw + x;
        if (!on(s0) || T[s0] >= 0) continue;
        let qh = 0, qt = 0; q[qt++] = s0; T[s0] = 0; let mx = 0; const members = [s0];
        while (qh < qt) {
          const c = q[qh++], cx = c % cw, cy = (c / cw) | 0, dc = T[c];
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
            if (!dx && !dy) continue;
            const nx = cx + dx, ny = cy + dy;
            if (nx < 0 || ny < 0 || nx >= cw || ny >= ch) continue;
            const n = ny * cw + nx;
            if (T[n] >= 0 || !on(n)) continue;
            T[n] = dc + (dx && dy ? 1.4 : 1); if (T[n] > mx) mx = T[n];
            q[qt++] = n; members.push(n);
          }
        }
        comps.push({ members, mx }); total += mx + cw * .01;
      }
      let off = 0;
      const idx = [], tt = [], a0 = [];
      comps.forEach(c => {
        c.members.forEach(i => { idx.push(i); tt.push((off + T[i]) / total); a0.push(d[i * 4 + 3]); });
        off += c.mx + cw * .01;
      });
      st.draw = p => {
        const soft = .045, out = ctx.createImageData(cw, ch), o = out.data;
        const r = d[idx[0] * 4], g = d[idx[0] * 4 + 1], b = d[idx[0] * 4 + 2];
        for (let k = 0; k < idx.length; k++) {
          const a = Math.max(0, Math.min(1, (p * (1 + soft) - tt[k]) / soft));
          if (a <= 0) continue;
          const i = idx[k] * 4; o[i] = r; o[i + 1] = g; o[i + 2] = b; o[i + 3] = a0[k] * a;
        }
        ctx.putImageData(out, 0, 0);
      };
      st.draw(st.started ? st.p : 0);
      el.classList.add("script--pen");
    });
  }
  function penPlay(st) {
    const dur = 1500, t0 = performance.now() + 700;
    const tick = now => {
      const k = Math.min(1, Math.max(0, (now - t0) / dur));
      st.p = k; st.draw && st.draw(k);
      if (k < 1) st.raf = requestAnimationFrame(tick);
    };
    st.raf = requestAnimationFrame(tick);
  }

  /* ------- intro / loader ------- */
  const heroImg = $(".hero__art img");
  const imgReady = new Promise(res => (heroImg && !heroImg.complete) ? (heroImg.onload = heroImg.onerror = res) : res());
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  const minTime = new Promise(res => setTimeout(res, reduce ? 0 : 1100));
  const failSafe = new Promise(res => setTimeout(res, 4000));

  Promise.race([Promise.all([imgReady, fontsReady, minTime, ...snakeReady]), failSafe]).then(() => {
    layoutScripts();
    fitNames();
    body.classList.remove("is-loading");
    $$(".hero__title .w").forEach((w, i) => (w.style.transitionDelay = `${.45 + i * .09}s`));
    setTimeout(() => {
      body.classList.add("is-ready");
      setTimeout(() => $(".hero__script")?.classList.add("is-in"), 350);
      // hero: the page is already there (headline, laptop) - then the snakes slither in
      setTimeout(() => heroSnake?.play(), reduce ? 0 : 1100);
    }, reduce ? 0 : 250);
  });

  /* ------- smooth scrolling (Lenis, with native fallback) ------- */
  let lenis = null;
  const startLenis = () => {
    if (reduce || !window.Lenis) return;
    lenis = new window.Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, wheelMultiplier: .95 });
    const raf = time => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    lenis.on("scroll", onScroll);
  };
  if (document.readyState === "complete") startLenis(); else addEventListener("load", startLenis);

  const scrollToEl = (el) => {
    const off = isDesktop() ? 0 : -64;
    if (lenis) lenis.scrollTo(el, { offset: off, duration: 1.4 });
    else el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  $$('a[href^="#"]').forEach(a => a.addEventListener("click", e => {
    const id = a.getAttribute("href");
    if (id.length < 2) return;
    const target = $(id);
    if (!target) return;
    e.preventDefault();
    closeMenu();
    scrollToEl(id === "#top" ? body : target);
    if (a.hasAttribute("data-focus-form")) setTimeout(() => $("#contact-form input")?.focus({ preventScroll: true }), 1300);
    history.replaceState(null, "", id === "#top" ? location.pathname : id);
  }));

  /* ------- mobile menu ------- */
  const burger = $(".nav__burger"), mmenu = $("#mmenu");
  function closeMenu() {
    if (!body.classList.contains("menu-open")) return;
    body.classList.remove("menu-open");
    burger.setAttribute("aria-expanded", "false");
    mmenu.setAttribute("aria-hidden", "true");
    lenis?.start();
  }
  burger.addEventListener("click", () => {
    const open = !body.classList.contains("menu-open");
    body.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", String(open));
    mmenu.setAttribute("aria-hidden", String(!open));
    open ? lenis?.stop() : lenis?.start();
  });
  addEventListener("keydown", e => e.key === "Escape" && closeMenu());

  /* ------- reveal on scroll ------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add("is-in");
      en.target._snake?.play();
      io.unobserve(en.target);
    });
  }, { rootMargin: "0px 0px -12% 0px", threshold: .08 });
  $$("[data-reveal], .script:not(.hero__script), .u").forEach(el => io.observe(el));
  // small stagger inside a section
  $$("section").forEach(sec => $$(":scope [data-reveal]", sec).forEach((el, i) => {
    if (!el.style.getPropertyValue("--d")) el.style.setProperty("--d", `${Math.min(i, 6) * .08}s`);
  }));


  /* ------- projects deck: tilted pile, the top screen flips to the back every few seconds ------- */
  (() => {
    const deck = $(".deck"); if (!deck) return;
    const cards = $$(".gcard", deck), n = cards.length; if (n < 2) return;
    let order = cards.map((_, i) => i);          // order[0] = top card
    const place = () => order.forEach((ci, slot) => { const c = cards[ci]; c.style.setProperty("--i", slot); c.dataset.far = slot > 4 ? "1" : ""; });
    place();
    if (reduce) return;
    let timer = null, busy = false, visible = false;
    const flip = () => {
      if (busy || !visible || document.hidden) return; busy = true;
      const top = cards[order[0]];
      top.classList.add("is-out");
      const rest = order.slice(1); rest.forEach((ci, k) => { cards[ci].style.setProperty("--i", k); cards[ci].dataset.far = k > 4 ? "1" : ""; });
      setTimeout(() => {
        top.style.zIndex = "0";                    // slip behind the pile
        top.classList.remove("is-out"); top.classList.add("is-back");
        top.style.setProperty("--i", n - 1); top.dataset.far = "1";
        void top.offsetWidth;
        top.classList.remove("is-back");
        order = rest.concat(order[0]);
        setTimeout(() => { top.style.zIndex = ""; place(); busy = false; }, 80);
      }, 950);
    };
    const start = () => { if (!timer) { timer = setInterval(flip, 3000); setTimeout(flip, 650); } };
    const stop = () => { clearInterval(timer); timer = null; };
    new IntersectionObserver(es => es.forEach(e => { visible = e.isIntersecting; visible ? start() : stop(); }), { threshold: .25 }).observe(deck);
    deck.addEventListener("pointerenter", stop); deck.addEventListener("pointerleave", () => visible && start());
  })();

  /* ------- nav: scrolled state, hide on scroll down, active link squiggle ------- */
  const nav = $("#nav");
  const links = $$(".nav__links a");
  const squiggle = $(".nav__squiggle");
  const sections = links.map(a => $(a.getAttribute("href")));
  let lastY = 0, hoverLink = null, activeLink = null;

  function placeSquiggle(a) {
    if (!a) { squiggle.style.setProperty("--so", 0); return; }
    const wrap = a.parentElement.getBoundingClientRect(), r = a.getBoundingClientRect();
    squiggle.style.width = r.width * 1.06 + "px";
    squiggle.style.setProperty("--sx", (r.left - wrap.left - r.width * .03) + "px");
    squiggle.style.setProperty("--sy", (r.bottom - wrap.top - 2) + "px");
    squiggle.style.setProperty("--so", 1);
  }
  links.forEach(a => {
    a.addEventListener("mouseenter", () => { hoverLink = a; placeSquiggle(a); });
    a.addEventListener("mouseleave", () => { hoverLink = null; placeSquiggle(activeLink); });
  });

  /* ------- waves in "work" draw with scroll ------- */
  const waves = $$(".wave");
  waves.forEach(p => { const len = Math.ceil(p.getTotalLength()); p.style.setProperty("--len", len); p.dataset.len = len; });
  const work = $("#work");
  const projMedia = $$(".project__media");

  const progress = $(".progress i");

  function onScroll() {
    const y = lenis ? lenis.scroll : scrollY;
    const vh = innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    progress.style.setProperty("--p", max > 0 ? (y / max).toFixed(4) : 0);

    nav.classList.toggle("is-scrolled", y > 40);
    if (!body.classList.contains("menu-open")) {
      nav.classList.toggle("is-hidden", y > vh * .9 && y > lastY + 2);
      if (y < lastY - 2) nav.classList.remove("is-hidden");
    }
    lastY = y;

    // active section
    let current = null;
    sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top < vh * .45) current = links[i]; });
    if (y < vh * .4) current = null;
    if (current !== activeLink) { activeLink = current; if (!hoverLink) placeSquiggle(activeLink); links.forEach(l => l.classList.toggle("is-active", l === current)); }

    // waves
    if (work) {
      const r = work.getBoundingClientRect();
      const t = Math.min(1, Math.max(0, (vh * .85 - r.top) / (r.height * .9)));
      waves.forEach(p => p.style.strokeDashoffset = (p.dataset.len * (1 - t)).toFixed(1));
    }

    // project screens: tilt back in 3D, then flatten and grow as they reach the middle of the window
    if (!reduce) projMedia.forEach(m => {
      const r = m.getBoundingClientRect();
      const d = Math.max(-1, Math.min(1, ((r.top + r.height / 2) - vh * .52) / (vh * .62)));
      const a = Math.abs(d);
      const e = a * a;
      m.style.setProperty("--st", (d > 0 ? d * 46 : d * 24).toFixed(2) + "deg");
      m.style.setProperty("--sy", (d * 22).toFixed(1) + "deg");
      m.style.setProperty("--ss", (1 - e * .2).toFixed(3));
      m.style.setProperty("--so", Math.max(0, Math.min(1, 1.35 - a * 1.1)).toFixed(3));
      m.style.setProperty("--sz", ((1 - Math.min(1, a * 1.4)) * 0 + e * .16).toFixed(3));
    });

    // hero art drifts on scroll
    if (y < vh * 1.2) { root.style.setProperty("--hs", (y * .18).toFixed(1) + "px"); root.style.setProperty("--hz", (y / vh * .05).toFixed(4)); }
  }
  addEventListener("scroll", () => { if (!lenis) onScroll(); }, { passive: true });
  onScroll();

  /* ------- pointer effects (desktop only) ------- */
  if (finePointer && !reduce) {
    const glow = $(".cursor-glow");
    const art = $(".hero__art");
    let mx = innerWidth / 2, my = innerHeight / 2, gx = mx, gy = my;
    addEventListener("pointermove", e => { mx = e.clientX; my = e.clientY; }, { passive: true });
    (function tick() {
      gx += (mx - gx) * .12; gy += (my - gy) * .12;
      glow.style.setProperty("--mx", gx + "px");
      glow.style.setProperty("--my", gy + "px");
      if (art && scrollY < innerHeight) {
        const dx = (mx / innerWidth - .5), dy = (my / innerHeight - .5);
        art.style.setProperty("--px", (dx * -8).toFixed(2) + "px");
        art.style.setProperty("--py", (dy * -6).toFixed(2) + "px");
      }
      requestAnimationFrame(tick);
    })();

    // magnetic buttons
    $$(".magnetic").forEach(btn => {
      btn.addEventListener("pointermove", e => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * .18, y = (e.clientY - r.top - r.height / 2) * .28;
        btn.style.transform = `translate(${x}px, ${y}px)`;
      });
      btn.addEventListener("pointerleave", () => (btn.style.transform = ""));
    });

    // 3D tilt on the browser frames
    $$(".browser").forEach(b => {
      b.addEventListener("pointermove", e => {
        const r = b.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
        b.style.setProperty("--ry", (px * 9).toFixed(2) + "deg");
        b.style.setProperty("--rx", (py * -7).toFixed(2) + "deg");
      });
      b.addEventListener("pointerleave", () => { b.style.setProperty("--ry", "0deg"); b.style.setProperty("--rx", "0deg"); });
    });
  }

  /* ------- contact form ------- */
  const form = $("#contact-form");
  const msg = $(".form__msg", form);
  const say = (text, err) => { msg.textContent = text; msg.classList.toggle("is-err", !!err); msg.classList.add("is-on"); };
  $$("input, textarea", form).forEach(f => f.addEventListener("input", () => f.closest(".field").classList.remove("is-error")));

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    let ok = true;
    const bad = el => { el.closest(".field").classList.add("is-error"); ok = false; };
    if (!data.name.trim()) bad(form.name);
    if (!/^[0-9+\-\s()]{9,}$/.test(data.phone.trim())) bad(form.phone);
    if (data.email.trim() && !/^\S+@\S+\.\S+$/.test(data.email.trim())) bad(form.email);
    if (!ok) { say("רק עוד רגע… חסר שם או טלפון תקין.", true); return; }

    const btn = $("button", form);
    btn.disabled = true;
    try {
      if (FORM_ENDPOINT) {
        const res = await fetch(FORM_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) });
        if (!res.ok) throw new Error(res.status);
      } else {
        const bodyTxt = `שם: ${data.name}\nטלפון: ${data.phone}\nמייל: ${data.email}\n\n${data.message}`;
        location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("פנייה חדשה מהאתר – " + data.name)}&body=${encodeURIComponent(bodyTxt)}`;
      }
      form.classList.add("is-sent");
      say(`תודה ${data.name.split(" ")[0]}! קיבלתי, ואחזור אליכם ממש בקרוב.`);
      form.reset();
    } catch (err) {
      say("אופס, משהו השתבש. נסו שוב או כתבו לי בוואטסאפ.", true);
    } finally {
      btn.disabled = false;
      setTimeout(() => form.classList.remove("is-sent"), 1200);
    }
  });
})();
