/* Yummi – interactions & motion */
(() => {
  "use strict";

  /* ------- settings: fill in the real details ------- */
  const CONTACT_EMAIL = "yummiweinreb@gmail.com";   // where the form sends to (mailto fallback)
  const FORM_ENDPOINT = "https://formsubmit.co/ajax/yummiweinreb@gmail.com";   // FormSubmit: sends each message to this inbox

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
  const SCRIPT_IMG = { "Websites": "websites", "About me": "about", "The process": "process", "Selected work": "work" };
  /* hand-lettered neon titles: the picture is revealed along the strokes (pen time map), like writing it by hand */
  scripts.forEach(el => {
    const name = SCRIPT_IMG[el.dataset.script]; if (!name) return;
    const cv = document.createElement("canvas"); cv.className = "script__pen";
    el.append(cv);
    const ld = src => new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; });
    Promise.all([ld(`assets/img/script-${name}.webp`), ld(`assets/img/script-${name}-t.png`)]).then(([img, map]) => {
      if (!img || !map) { cv.replaceWith(Object.assign(new Image(), { src: `assets/img/script-${name}.webp`, alt: "", className: "script__pen" })); return; }
      const W = img.naturalWidth, H = img.naturalHeight;
      cv.width = W; cv.height = H; cv.style.aspectRatio = `${W} / ${H}`;
      const ctx = cv.getContext("2d", { willReadFrequently: true });
      const grab = im => { const c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d", { willReadFrequently: true }); x.drawImage(im, 0, 0, W, H); return x.getImageData(0, 0, W, H); };
      const src = grab(img), tm = grab(map), out = ctx.createImageData(W, H);
      const sd = src.data, td = tm.data, od = out.data;
      for (let k = 0; k < sd.length; k++) od[k] = sd[k];
      const draw = p => {
        const soft = .06;
        for (let i = 0; i < sd.length; i += 4) {
          const a = (p * (1 + soft) - td[i] / 255) / soft;
          od[i + 3] = a <= 0 ? 0 : a >= 1 ? sd[i + 3] : sd[i + 3] * a;
        }
        ctx.putImageData(out, 0, 0);
      };
      draw(0);
      const isHero = el.classList.contains("hero__script");
      let started = false;
      const play = () => {
        if (started) return; started = true;
        const dur = reduce ? 1 : 2300, t0 = performance.now() + 350;
        const tick = now => {
          const k = Math.min(1, Math.max(0, (now - t0) / dur));
          draw(1 - Math.pow(1 - k, 2.2) * (1 - k * .15) * 1);   // eases out like a pen slowing at the end
          if (k < 1) requestAnimationFrame(tick); else draw(1);
        };
        requestAnimationFrame(tick);
      };
      const ready = () => isHero ? document.body.classList.contains("is-ready") : el.classList.contains("is-in");
      const check = () => { if (ready()) play(); };
      new MutationObserver(check).observe(isHero ? document.body : el, { attributes: true, attributeFilter: ["class"] });
      check();
    });
  });
  function layoutScripts() {}
  function scribbleLayout() {}

  /* ------- LET'S TALK: written in with the pen, like the other hand-lettered titles ------- */
  (() => {
    const holder = $(".talk__script"); if (!holder) return;
    const img = $("img", holder), pic = $("picture", holder), srcEl = pic && $("source", pic);
    if (!img || reduce) return;
    const cv = document.createElement("canvas"); cv.className = "script__pen"; holder.append(cv);
    const ld = src => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
    let draw = null, key = "", started = false, prog = 0;
    const copyStyle = () => { const cs = getComputedStyle(img); ["mixBlendMode", "webkitMaskImage", "maskImage", "webkitMaskComposite", "maskComposite"].forEach(k => { try { cv.style[k] = cs[k]; } catch (e) {} }); };
    const build = async () => {
      const src = (srcEl && matchMedia(srcEl.media).matches) ? srcEl.getAttribute("srcset") : img.getAttribute("src");
      if (key === src) return; key = src;
      const base = src.split("/").pop().replace(/\.\w+$/, "");
      const [im, map] = await Promise.all([ld(src), ld(`assets/img/maps/${base}.png`)]);
      if (!im || !map || key !== src) return;
      const W = im.naturalWidth, H = im.naturalHeight; cv.width = W; cv.height = H;
      const grab = i => { const c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d", { willReadFrequently: true }); x.drawImage(i, 0, 0, W, H); return x.getImageData(0, 0, W, H); };
      const s = grab(im), t = grab(map), ctx = cv.getContext("2d"), out = ctx.createImageData(W, H);
      draw = p => {
        for (let i = 0; i < s.data.length; i += 4) {
          const a = Math.max(0, Math.min(1, (p * 1.08 - t.data[i] / 255) / .06));
          out.data[i] = s.data[i] * a; out.data[i + 1] = s.data[i + 1] * a; out.data[i + 2] = s.data[i + 2] * a; out.data[i + 3] = 255;
        }
        ctx.putImageData(out, 0, 0);
      };
      draw(prog); copyStyle(); img.style.visibility = "hidden";
    };
    build(); srcEl && matchMedia(srcEl.media).addEventListener("change", () => { build(); setTimeout(copyStyle, 50); });
    addEventListener("resize", () => requestAnimationFrame(copyStyle), { passive: true });
    const play = () => {
      if (started) return; started = true;
      const dur = 2600, t0 = performance.now() + 300;
      const tick = now => { const k = Math.min(1, Math.max(0, (now - t0) / dur)); prog = 1 - Math.pow(1 - k, 2.2); draw && draw(prog); if (k < 1) requestAnimationFrame(tick); else { prog = 1; draw && draw(1); } };
      requestAnimationFrame(tick);
    };
    const check = () => { if (holder.classList.contains("is-in")) play(); };
    new MutationObserver(check).observe(holder, { attributes: true, attributeFilter: ["class"] }); check();
  })();

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



  /* ------- hero: centre the content block (script word → buttons) vertically in the first screen (desktop) ------- */
  (() => {
    const hero = $(".hero"), sc = hero && $(".hero__script", hero), ct = hero && $(".hero__ctas", hero);
    if (!hero || !sc || !ct) return;
    const fit = () => {
      if (innerWidth < 1024) { hero.style.removeProperty("--hero-shift"); return; }
      hero.style.setProperty("--hero-shift", "0px");
      const y = scrollY, t = sc.getBoundingClientRect().top + y, b = ct.getBoundingClientRect().bottom + y;
      hero.style.setProperty("--hero-shift", Math.round(innerHeight / 2 - (t + b) / 2) + "px");
    };
    fit(); addEventListener("resize", fit); addEventListener("load", fit);
    window.__fitHero = fit;
  })();


  /* ------- talk video: big play button ------- */
  (() => {
    const box = $(".talk__video"), v = box && $("video", box), b = box && $(".talk__play", box);
    if (!v || !b) return;
    b.addEventListener("click", () => v.play());
    v.addEventListener("play", () => box.classList.add("is-playing"));
    v.addEventListener("pause", () => box.classList.remove("is-playing"));
    v.addEventListener("ended", () => box.classList.remove("is-playing"));
  })();


  /* ------- side menu (desktop): vertical step nav on the right, follows the page ------- */
  (() => {
    const isHome = !!$("#top") && !!$("#about");
    const base = isHome ? "" : "index.html";
    const ICONS = {
      home: `<path class="ink" pathLength="1" d="M3.4 12.2c2.8-2.6 5.6-5.4 8.7-8.3 3 2.9 5.8 5.7 8.6 8.2"/><path class="ink" pathLength="1" d="M5.6 11.4c-.2 2.7-.1 5.5.2 8 3.1.3 9.2.4 12.6 0 .3-2.5.3-5.3.1-8"/><path class="ink" pathLength="1" d="M16.2 6.2c.1-1 .1-1.9.1-2.6"/><path class="pop" d="M10.4 19.6c-.2-2.1-.1-3.6.2-4.6 1-.5 2.3-.5 3.1 0 .3 1.1.3 2.6.1 4.6"/>`,
      me: `<path class="ink" pathLength="1" d="M12.1 3.6c4.6-.2 8.3 3.1 8.2 7.8-.1 4.6-3.6 8-8.3 8-4.5 0-8-3.4-7.9-8 .1-4.6 3.4-7.7 8-7.8Z"/><path class="ink" pathLength="1" d="M8.4 14.3c1.9 2.2 5.2 2.3 7.2.1"/><path class="pop" d="M8.7 9.4c.1.8.1 1.3 0 1.9M15.4 9.3c.1.8.1 1.3 0 1.9"/><path class="ink" pathLength="1" d="M19.6 3.2c.2.9.5 1.2 1.4 1.4-.9.2-1.2.5-1.4 1.4-.2-.9-.5-1.2-1.4-1.4.9-.2 1.2-.5 1.4-1.4Z"/>`,
      wand: `<path class="ink" pathLength="1" d="M4.2 19.8c3.4-3.5 7-7.1 10.4-10.6"/><path class="pop" d="M14.2 9.6l1.9 1.9"/><path class="ink" pathLength="1" d="M16.6 3.4c.5 2 1.1 2.6 3.1 3.1-2 .5-2.6 1.1-3.1 3.1-.5-2-1.1-2.6-3.1-3.1 2-.5 2.6-1.1 3.1-3.1Z"/><path class="ink" pathLength="1" d="M18.9 14.1c.2.8.5 1.1 1.3 1.3-.8.2-1.1.5-1.3 1.3-.2-.8-.5-1.1-1.3-1.3.8-.2 1.1-.5 1.3-1.3ZM7.2 4.6c.2.8.5 1.1 1.3 1.3-.8.2-1.1.5-1.3 1.3-.2-.8-.5-1.1-1.3-1.3.8-.2 1.1-.5 1.3-1.3Z"/>`,
      work: `<path class="ink" pathLength="1" d="M12.3 3.8c5 .1 8.7 3.3 8.5 7.4-.2 3.1-2.6 3.8-4.5 3.4-1.9-.4-3 .9-2.5 2.5.6 2-.6 3.2-2.3 3.2C6.4 20.3 3 16.8 3.2 12 3.4 7.6 7.2 3.7 12.3 3.8Z"/><path class="pop" d="M7.6 11.3c.1.8 0 1.3-.2 1.8M10.6 7.7c.1.8 0 1.3-.2 1.8M15.1 8c.1.8 0 1.3-.2 1.8"/>`,
      chat: `<path class="ink" pathLength="1" d="M4.2 11.6C4 7.6 7.4 4.4 12 4.4s8.1 3.1 7.9 7.2c-.2 4-3.6 6.7-8 6.6-1 0-1.9-.1-2.7-.4-1.2 1-2.6 1.8-4.2 2.2.6-1.1 1-2.1 1-3.1-1.2-1.2-1.8-3.2-1.8-5.3Z"/><path class="pop" d="M12 14.3c-2.5-1.6-3.7-2.8-3.4-4.3.3-1.4 2.4-1.7 3.4-.3 1-1.4 3.1-1.1 3.4.3.3 1.5-.9 2.7-3.4 4.3Z"/>`
    };
    const items = [
      { n: "home", t: "בית", h: isHome ? "#top" : "index.html", ids: ["top"] },
      { n: "me", t: "מה זה יאמי?", h: base + "#about", ids: ["about"] },
      { n: "wand", t: "שרביט הקסם שלי", h: base + "#process", ids: ["process"] },
      { n: "work", t: "עבודות עם אופי", h: "work.html", ids: ["work"] },
      { n: "chat", t: "בואו נדבר", h: (isHome ? "" : "index.html") + "#contact", ids: ["contact", "talk"], cta: true }
    ];
    const nav = document.createElement("nav");
    nav.className = "sidenav"; nav.setAttribute("aria-label", "ניווט ראשי");
    nav.innerHTML = '<span class="sidenav__line" aria-hidden="true"><i></i></span><ul>' + items.map((it, i) =>
      `<li style="--i:${i}"><a href="${it.h}" class="${it.cta ? "is-cta" : ""}" data-i="${i}"><span class="sidenav__dot" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none">${ICONS[it.n]}</svg></span><span class="sidenav__label">${it.t}${it.cta ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12H4m6-6-6 6 6 6"/></svg>' : ""}</span></a></li>`).join("") + "</ul>";
    document.body.appendChild(nav);
    const links = $$("a", nav), fill = $(".sidenav__line i", nav);
    const onWorkPage = /work\.html/.test(location.pathname);
    const set = idx => {
      links.forEach((a, k) => { a.classList.toggle("is-active", k === idx); a.classList.toggle("is-done", idx >= 0 && k < idx); });
      const mid = a => a.parentElement.offsetTop + a.parentElement.offsetHeight / 2;
      const pos = idx < 0 ? 0 : mid(links[idx]) - mid(links[0]);
      fill.style.height = pos + "px";
    };
    let cur = -2;
    const spy = () => {
      let idx = -1;
      if (!isHome) idx = onWorkPage ? 3 : -1;
      else {
        const line = innerHeight * .45;
        items.forEach((it, k) => it.ids.forEach(id => { const e = document.getElementById(id); if (e && e.getBoundingClientRect().top <= line) idx = k; }));
        if (idx < 0) idx = 0;
      }
      if (idx !== cur) { cur = idx; set(idx); }
    };
    addEventListener("scroll", spy, { passive: true }); addEventListener("resize", () => { cur = -2; spy(); });
    addEventListener("load", () => { cur = -2; spy(); }); spy();
    /* stays open while moving between steps (small grace delay) */
    let closeT = 0;
    nav.addEventListener("pointerenter", () => { clearTimeout(closeT); nav.classList.add("is-open"); });
    nav.addEventListener("pointerleave", () => { closeT = setTimeout(() => nav.classList.remove("is-open"), 450); });
    nav.addEventListener("focusin", () => nav.classList.add("is-open"));
    nav.addEventListener("focusout", () => nav.classList.remove("is-open"));
    /* hover: a little pull toward the cursor on the hovered step */
    links.forEach(a => {
      a.addEventListener("pointermove", e => { const r = a.getBoundingClientRect(); a.style.setProperty("--my", ((e.clientY - r.top - r.height / 2) * .18).toFixed(1) + "px"); });
      a.addEventListener("pointerleave", () => a.style.setProperty("--my", "0px"));
    });
  })();


  /* ------- about: the three glass panels flip around themselves, each revealing its part of the next picture ------- */
  (() => {
    const box = $(".aflip"); if (!box) return;
    const cards = $$(".aflip__card", box), baseA = $(".aflip__base--a", box), baseB = $(".aflip__base--b", box);
    const imgs = [1, 2, 3].map(i => `assets/img/about-flip-${i}.webp`);
    imgs.forEach(u => { const im = new Image(); im.src = u; });
    /* panel outlines (x, y in the 1100x848 artwork) - the three glass panels sit in the same place in every picture */
    const PANELS = [
      [[95,85],[285,106],[292,112],[207,655],[100,612],[18,550]],
      [[300,60],[318,38],[640,78],[660,110],[612,655],[207,655]],
      [[666,140],[805,115],[835,128],[872,668],[855,672],[612,655]]
    ];
    const clip = (i, k) => "polygon(" + PANELS[k].map(([x, y]) => (x / 11).toFixed(2) + "% " + (y / 8.48).toFixed(2) + "%").join(",") + ")";
    const url = i => `url(${imgs[i % imgs.length]})`;
    const st = cards.map((c, k) => ({ c, k, ang: 0, a: $(".aflip__f--a", c), b: $(".aflip__f--b", c), imgA: 0 }));
    const setFace = (f, i, k) => { f.style.backgroundImage = url(i); f.style.clipPath = f.style.webkitClipPath = clip(i, k); };
    st.forEach(o => { setFace(o.a, 0, o.k); setFace(o.b, 1, o.k); });
    baseA.style.backgroundImage = url(0); baseB.style.backgroundImage = url(1);
    let idx = 0, timer = 0, running = false, first = 0, baseShowsB = false;
    const cycle = () => {
      const next = (idx + 1) % imgs.length;
      /* underlay cross-fades to the next picture while the panels turn */
      const [show, hide] = baseShowsB ? [baseA, baseB] : [baseB, baseA];
      show.style.backgroundImage = url(next); show.style.opacity = 1; hide.style.opacity = 0; baseShowsB = !baseShowsB;
      st.forEach((o, k) => setTimeout(() => {
        const frontShown = Math.round(Math.abs(o.ang) / 180) % 2 === 0;
        setFace(frontShown ? o.b : o.a, next, k);
        o.ang += (k % 2 ? -180 : 180);
        o.c.style.transform = `rotateY(${o.ang}deg)`;
      }, [0, 340, 170][k]));
      idx = next;
    };
    const start = () => { if (running || reduce) return; running = true; first = setTimeout(cycle, 1000); timer = setInterval(cycle, 4200); };
    const stop = () => { running = false; clearTimeout(first); clearInterval(timer); };
    if ("IntersectionObserver" in window) new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? start() : stop()), { threshold: .3 }).observe(box);
    else start();
  })();

  /* ------- desktop: swap the art — the tube curves go next to the video, LET'S TALK goes next to the form ------- */
  (() => {
    const tube = $(".contact__tube"), script = $(".talk__script"), contact = $("#contact"), talk = $("#talk");
    if (!tube || !script || !contact || !talk) return;
    const home = [tube, script].map(el => ({ el, parent: el.parentNode, next: el.nextSibling }));
    const mq = matchMedia("(min-width: 1024px)");
    const place = () => {
      if (mq.matches) { contact.appendChild(script); talk.insertBefore(tube, talk.firstChild); }
      else home.forEach(h => h.parent.insertBefore(h.el, h.next && h.next.parentNode === h.parent ? h.next : null));
    };
    place(); mq.addEventListener("change", place);
  })();

  /* ------- projects deck: tilted pile, the top screen flips to the back every few seconds ------- */
  (() => {
    /* projects deck: the page STOPS at this section and the wheel / touch only drives the screens
       (down = next screen, up = back). After the last screen (or before the first) the page scrolls on. */
    const deck = $(".deck"); if (!deck) return;
    const sec = deck.closest(".work--home"), pin = $(".work__pin", sec);
    const cards = $$(".gcard", deck), n = cards.length, steps = n - 1;
    const PX = 380;                       // wheel pixels per screen
    let pinTop = 0, cur = 0, t = 0, raf = 0, locked = false, lastDy = null, ty = 0;
    const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
    const measure = () => { const vh = innerHeight, ph = pin.offsetHeight; pinTop = ph + 70 <= vh ? (vh - ph) / 2 : Math.min(70, vh - ph); };
    const paint = v => cards.forEach((c, k) => {
      const r = k - v, f = r < 0 ? clamp(-r) : 0, i = Math.max(0, r);
      const o = r <= -1 ? 0 : (1 - clamp(f * 1.35)) * clamp((5 - i) / 1.6) * (1 - i * .1);
      c.style.setProperty("--i", i.toFixed(3)); c.style.setProperty("--f", f.toFixed(3));
      c.style.opacity = Math.max(0, o).toFixed(3); c.style.zIndex = 30 - k; c.style.visibility = o <= .002 ? "hidden" : "";
    });
    const loop = () => { cur += (t - cur) * .1; if (Math.abs(t - cur) < .0008) cur = t; paint(cur); raf = cur !== t ? requestAnimationFrame(loop) : 0; };
    const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
    const dy = () => pin.getBoundingClientRect().top - pinTop;
    const snap = () => { const y = scrollY + dy(); if (lenis) lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y); };
    const lock = () => { if (locked) return; locked = true; snap(); lenis?.stop(); document.documentElement.classList.add("deck-locked"); };
    const unlock = () => { if (!locked) return; locked = false; lenis?.start(); document.documentElement.classList.remove("deck-locked"); lastDy = 0; };
    const drive = d => {                                   // d = pixels (+ = scroll down)
      t = clamp(t + d / PX, 0, steps); kick();
      if ((d > 0 && t >= steps) || (d < 0 && t <= 0)) { cur = t; paint(cur); unlock(); }
    };
    addEventListener("wheel", e => { if (!locked) return; e.preventDefault(); drive(e.deltaMode === 1 ? e.deltaY * 32 : e.deltaY); }, { passive: false });
    addEventListener("touchstart", e => { ty = e.touches[0].clientY; }, { passive: true });
    addEventListener("touchmove", e => { if (!locked) return; e.preventDefault(); const y = e.touches[0].clientY; drive((ty - y) * 1.6); ty = y; }, { passive: false });
    addEventListener("keydown", e => {
      if (!locked) return;
      const k = { ArrowDown: 80, PageDown: 400, " ": 400, ArrowUp: -80, PageUp: -400 }[e.key];
      if (k) { e.preventDefault(); drive(k); }
    });
    const watch = () => {
      if (locked) return;
      const d = dy();
      if (lastDy !== null) {
        if (lastDy > 0 && d <= 0 && t < steps) lock();       // arriving from above
        else if (lastDy < 0 && d >= 0 && t > 0) lock();      // arriving from below
      }
      lastDy = d;
    };
    measure(); paint(0); lastDy = null; watch();
    addEventListener("scroll", watch, { passive: true });
    addEventListener("resize", () => { measure(); });
    addEventListener("load", measure);
    if (window.ResizeObserver) new ResizeObserver(measure).observe(pin);
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
  if (!form) return;
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
      const bodyTxt = `שם: ${data.name}\nטלפון: ${data.phone}\nמייל: ${data.email}\n\n${data.message}`;
      let sent = false;
      try {
        const res = await fetch(FORM_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ ...data, _subject: "פנייה חדשה מהאתר – " + data.name, _template: "table", _captcha: "false" }) });
        const j = await res.json().catch(() => ({}));
        sent = res.ok && j.success !== "false";
      } catch (_) {}
      if (!sent) {
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
