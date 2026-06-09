/* ============================================================
   共享引擎:双语切换 / 术语弹窗 / 主题 / 字号 / 进度 / 测验 / 术语表
   所有页面共用同一份逻辑,改一处全站生效。
   依赖:lang.js 中的 LANG_PACK
   ============================================================ */
(function () {
  "use strict";

  /* ---------- localStorage key ---------- */
  const LS = {
    lang: "aws_course_lang",
    theme: "aws_course_theme",
    palette: "aws_course_palette",
    font: "aws_course_font",
    progress: "aws_course_progress", // { l1:{done:true,score:3,total:4}, ... }
    lab: "aws_course_lab",           // { l1:{ "1":true, "6":true }, ... }
  };

  /* ---------- 当前状态 ---------- */
  // 优先用上次保存的语言;没有则默认日语(可在顶栏🌐切换中文)
  let lang = localStorage.getItem(LS.lang);
  if (lang !== "zh" && lang !== "ja") lang = "ja";

  /* ---------- 工具:按 "a.b.c" 路径取值 ---------- */
  function getPath(obj, path) {
    return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
  }
  function t(key) {
    const v = getPath(LANG_PACK[lang], key);
    return v == null ? getPath(LANG_PACK.zh, key) : v; // 缺失时回退中文,避免空白
  }
  window.t = t;
  window.getLang = () => lang;

  /* ============================================================
     1) i18n:把语言包套到页面
     - [data-i18n]      -> textContent(也适用于 SVG <text>)
     - [data-i18n-html] -> innerHTML(可含术语 span)
     - [data-i18n-attr="aria-label:key; placeholder:key2"]
     ============================================================ */
  function applyI18n(root) {
    root = root || document;
    root.querySelectorAll("[data-i18n]").forEach((el) => {
      const val = t(el.getAttribute("data-i18n"));
      if (val != null) el.textContent = val;
    });
    root.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const val = t(el.getAttribute("data-i18n-html"));
      if (val != null) el.innerHTML = val;
    });
    root.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      el.getAttribute("data-i18n-attr").split(";").forEach((pair) => {
        const [attr, key] = pair.split(":").map((s) => s && s.trim());
        if (attr && key) {
          const val = t(key);
          if (val != null) el.setAttribute(attr, val);
        }
      });
    });
    document.documentElement.lang = lang === "ja" ? "ja" : "zh-CN";
    document.title = t("ui.siteTitle");
  }

  function setLang(next) {
    lang = next;
    localStorage.setItem(LS.lang, lang);
    closeTermPop();
    applyI18n();
    renderQuizzes();      // 测验是动态生成的,需重渲染
    renderGlossary();     // 术语表内容随语言变
    updateLangButton();
    document.dispatchEvent(new CustomEvent("langchange", { detail: { lang } }));
  }
  window.setLang = setLang;

  function updateLangButton() {
    const btn = document.getElementById("langToggle");
    if (btn) btn.querySelector(".label-text").textContent = t("ui.langToggle");
  }

  /* ============================================================
     2) 术语点击弹窗(tap to toggle,手机也能用)
     ============================================================ */
  let pop = null;
  function ensurePop() {
    if (pop) return pop;
    pop = document.createElement("div");
    pop.className = "term-pop";
    pop.setAttribute("role", "dialog");
    pop.innerHTML = '<button class="tp-close" aria-label="close">×</button><div class="tp-name"></div><div class="tp-desc"></div>';
    document.body.appendChild(pop);
    pop.querySelector(".tp-close").addEventListener("click", closeTermPop);
    return pop;
  }
  let activeTerm = null;
  function openTermPop(el) {
    const key = el.getAttribute("data-term");
    const term = getPath(LANG_PACK[lang], "terms." + key) || getPath(LANG_PACK.zh, "terms." + key);
    if (!term) return;
    const p = ensurePop();
    p.querySelector(".tp-name").textContent = term.name;
    p.querySelector(".tp-desc").textContent = term.desc;
    p.classList.add("show");
    activeTerm = el;

    // 定位(窄屏由 CSS 固定到底部)
    if (window.innerWidth > 520) {
      const r = el.getBoundingClientRect();
      const pw = Math.min(320, window.innerWidth - 24);
      p.style.maxWidth = pw + "px";
      let left = window.scrollX + r.left;
      left = Math.min(left, window.scrollX + window.innerWidth - pw - 12);
      left = Math.max(left, window.scrollX + 12);
      p.style.left = left + "px";
      p.style.top = window.scrollY + r.bottom + 8 + "px";
    } else {
      p.style.left = ""; p.style.top = ""; p.style.maxWidth = "";
    }
  }
  function closeTermPop() {
    if (pop) pop.classList.remove("show");
    activeTerm = null;
  }
  window.closeTermPop = closeTermPop;

  // 事件委托:正文里任意 .term 都能点
  document.addEventListener("click", (e) => {
    const term = e.target.closest(".term");
    if (term) {
      e.preventDefault();
      if (activeTerm === term) closeTermPop();
      else openTermPop(term);
      return;
    }
    if (pop && !e.target.closest(".term-pop")) closeTermPop();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { closeTermPop(); closeGlossary(); }
    // 术语可用键盘:Enter/Space 触发
    if ((e.key === "Enter" || e.key === " ") && document.activeElement &&
        document.activeElement.classList.contains("term")) {
      e.preventDefault();
      const el = document.activeElement;
      if (activeTerm === el) closeTermPop(); else openTermPop(el);
    }
  });
  // 让所有术语可聚焦 + 无障碍属性
  function decorateTerms() {
    document.querySelectorAll(".term").forEach((el) => {
      if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "0");
      el.setAttribute("role", "button");
      el.setAttribute("aria-label", (el.textContent || "") + " — " + t("ui.term_tap_hint"));
    });
  }
  document.addEventListener("langchange", decorateTerms);

  /* ============================================================
     3) 深色模式 & 字号
     ============================================================ */
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const btn = document.getElementById("themeToggle");
    if (btn) btn.setAttribute("aria-pressed", String(theme === "dark"));
  }
  function applyFont(size) {
    document.documentElement.setAttribute("data-fontsize", size);
    document.documentElement.style.setProperty("--fs-scale", size === "large" ? "1.18" : "1");
    const btn = document.getElementById("fontToggle");
    if (btn) btn.setAttribute("aria-pressed", String(size === "large"));
  }

  /* ---------- 配色风格(可循环切换,默认 ocean) ---------- */
  const PALETTES = [
    { id: "ocean",    name: "海洋蓝", name_ja: "オーシャン" },
    { id: "forest",   name: "森林绿", name_ja: "フォレスト" },
    { id: "graphite", name: "石墨灰", name_ja: "グラファイト" },
    { id: "aws",      name: "AWS橙",  name_ja: "AWSオレンジ" },
  ];
  function applyPalette(id) {
    if (!PALETTES.some((p) => p.id === id)) id = "ocean";
    document.documentElement.setAttribute("data-palette", id);
    const btn = document.getElementById("paletteToggle");
    if (btn) {
      const p = PALETTES.find((x) => x.id === id);
      const lbl = btn.querySelector(".label-text");
      if (lbl) lbl.textContent = (lang === "ja" ? p.name_ja : p.name);
    }
  }

  /* ============================================================
     4) 学习进度 / 成绩(localStorage)
     ============================================================ */
  function getProgress() {
    try { return JSON.parse(localStorage.getItem(LS.progress)) || {}; }
    catch (e) { return {}; }
  }
  function saveProgress(p) { localStorage.setItem(LS.progress, JSON.stringify(p)); }
  window.AWSCourse = window.AWSCourse || {};
  window.AWSCourse.getProgress = getProgress;

  function setDone(lessonId, done) {
    const p = getProgress();
    p[lessonId] = p[lessonId] || {};
    p[lessonId].done = done;
    saveProgress(p);
  }
  function setScore(lessonId, score, total) {
    const p = getProgress();
    p[lessonId] = p[lessonId] || {};
    p[lessonId].score = score;
    p[lessonId].total = total;
    saveProgress(p);
  }

  function initMarkDone() {
    const cb = document.getElementById("markDone");
    if (!cb) return;
    const lessonId = cb.getAttribute("data-lesson");
    cb.checked = !!(getProgress()[lessonId] || {}).done;
    cb.addEventListener("change", () => {
      setDone(lessonId, cb.checked);
      // 仅在「勾选完成」这一用户动作时派发庆祝事件(取消勾选不触发)
      if (cb.checked) {
        document.dispatchEvent(new CustomEvent("aws:lesson-done", { detail: { lessonId } }));
      }
    });
  }

  /* ---------- 动手实验:阶段勾选进度 ---------- */
  function getLab() {
    try { return JSON.parse(localStorage.getItem(LS.lab)) || {}; }
    catch (e) { return {}; }
  }
  function initLabProgress() {
    const boxes = Array.prototype.slice.call(document.querySelectorAll(".lab-check"));
    if (!boxes.length) return;
    const lab = getLab();

    function update() {
      let done = 0;
      boxes.forEach((cb) => {
        const st = cb.closest(".lab-stage");
        if (cb.checked) { done++; if (st) st.classList.add("done"); }
        else if (st) st.classList.remove("done");
      });
      const total = boxes.length;
      const bar = document.getElementById("labBar");
      if (bar) bar.style.width = Math.round((done / total) * 100) + "%";
      const count = document.getElementById("labCount");
      if (count) count.textContent = done + " / " + total;
      return done;
    }

    boxes.forEach((cb) => {
      const lessonId = cb.getAttribute("data-lab");
      const stage = cb.getAttribute("data-stage");
      cb.checked = !!((lab[lessonId] || {})[stage]);
      cb.addEventListener("change", () => {
        const store = getLab();
        store[lessonId] = store[lessonId] || {};
        store[lessonId][stage] = cb.checked;
        localStorage.setItem(LS.lab, JSON.stringify(store));
        const done = update();
        if (cb.checked) {
          document.dispatchEvent(new CustomEvent("aws:lab-stage-done", {
            detail: { lessonId, stage, done, total: boxes.length, allDone: done === boxes.length }
          }));
        }
      });
    });
    update();
    // 语言切换时刷新进度文字
    document.addEventListener("langchange", update);
  }

  /* ============================================================
     5) 随堂测验(从语言包动态生成,支持重渲染)
     ============================================================ */
  function renderQuizzes() {
    document.querySelectorAll("[data-quiz]").forEach((container) => {
      const quizKey = container.getAttribute("data-quiz");   // 如 "l1.quiz"
      const lessonId = container.getAttribute("data-lesson"); // 如 "l1"
      const questions = t(quizKey);
      if (!Array.isArray(questions)) return;

      // 保留已作答状态(语言切换时不丢)
      const prevState = container._quizState || {};
      container.innerHTML = "";
      let answeredCount = Object.keys(prevState).length;

      questions.forEach((q, qi) => {
        const qEl = document.createElement("div");
        qEl.className = "quiz-q";

        const qText = document.createElement("div");
        qText.className = "q-text";
        qText.innerHTML = '<span class="q-num">Q' + (qi + 1) + ".</span>" + escapeHtml(q.q);
        qEl.appendChild(qText);

        const opts = document.createElement("div");
        opts.className = "quiz-options";
        opts.setAttribute("role", "group");

        q.options.forEach((optText, oi) => {
          const b = document.createElement("button");
          b.type = "button";
          b.className = "quiz-opt";
          b.innerHTML = '<span class="opt-key">' + "ABCD"[oi] + "</span><span>" + escapeHtml(optText) + "</span>";
          b.addEventListener("click", () => answer(qi, oi));
          opts.appendChild(b);
        });
        qEl.appendChild(opts);

        const fb = document.createElement("div");
        fb.className = "quiz-feedback";
        qEl.appendChild(fb);

        container.appendChild(qEl);

        // 还原之前的作答
        if (prevState[qi] != null) showAnswer(qi, prevState[qi]);
      });

      function answer(qi, oi) {
        if (prevState[qi] != null) return; // 已答过
        prevState[qi] = oi;
        container._quizState = prevState;
        showAnswer(qi, oi);
        updateScore();
        // 刚好答完最后一题时派发一次完成事件(restore / 语言切换重渲染不会进到这里)
        if (Object.keys(prevState).length === questions.length) {
          let sc = 0;
          Object.keys(prevState).forEach((k) => { if (prevState[k] === questions[k].answer) sc++; });
          document.dispatchEvent(new CustomEvent("aws:quiz-complete", {
            detail: { lessonId: lessonId, score: sc, total: questions.length, perfect: sc === questions.length }
          }));
        }
      }

      function showAnswer(qi, oi) {
        const qEl = container.children[qi];
        const optBtns = qEl.querySelectorAll(".quiz-opt");
        const correct = questions[qi].answer;
        optBtns.forEach((b, i) => {
          b.disabled = true;
          if (i === correct) b.classList.add("correct");
          if (i === oi && oi !== correct) b.classList.add("wrong");
        });
        const fb = qEl.querySelector(".quiz-feedback");
        const isOk = oi === correct;
        fb.className = "quiz-feedback show " + (isOk ? "ok" : "no");
        let html = "<b>" + (isOk ? t("ui.quiz_correct") : t("ui.quiz_wrong")) + "</b> " + escapeHtml(questions[qi].explain);
        if (!isOk && questions[qi].review) {
          html += '<br><a class="review-link" href="#' + questions[qi].review + '">' + t("ui.review_link") + "</a>";
        }
        fb.innerHTML = html;
      }

      function updateScore() {
        const answered = Object.keys(prevState).length;
        let score = 0;
        Object.keys(prevState).forEach((qi) => {
          if (prevState[qi] === questions[qi].answer) score++;
        });
        let bar = container.parentElement.querySelector(".quiz-score-bar");
        if (!bar) {
          bar = document.createElement("div");
          bar.className = "quiz-score-bar";
          container.parentElement.appendChild(bar);
        }
        bar.textContent = t("ui.quiz_score") + ": " + score + " / " + questions.length;
        if (answered === questions.length && lessonId) {
          setScore(lessonId, score, questions.length);
        }
      }

      if (answeredCount > 0) updateScore();
    });
    decorateTerms();
  }

  /* ============================================================
     6) 术语表 modal + 搜索
     ============================================================ */
  function renderGlossary() {
    const list = document.getElementById("glossaryList");
    if (!list) return;
    const search = (document.getElementById("glossarySearch") || {}).value || "";
    const q = search.trim().toLowerCase();
    const terms = LANG_PACK[lang].terms;
    // 同时在中日里搜,方便用任意语言查
    const termsOther = LANG_PACK[lang === "zh" ? "ja" : "zh"].terms;
    list.innerHTML = "";
    let count = 0;
    Object.keys(terms).forEach((key) => {
      const term = terms[key];
      const hay = (term.name + " " + term.desc + " " + key + " " +
                   termsOther[key].name + " " + termsOther[key].desc).toLowerCase();
      if (q && hay.indexOf(q) === -1) return;
      count++;
      const item = document.createElement("div");
      item.className = "glossary-item";
      item.innerHTML = '<div class="g-name">' + escapeHtml(term.name) + "</div>" +
                       '<div class="g-desc">' + escapeHtml(term.desc) + "</div>";
      list.appendChild(item);
    });
    if (count === 0) {
      list.innerHTML = '<div class="glossary-empty">' + t("ui.glossary_empty") + "</div>";
    }
  }
  function openGlossary() {
    const o = document.getElementById("glossaryModal");
    if (!o) return;
    renderGlossary();
    o.classList.add("show");
    const s = document.getElementById("glossarySearch");
    if (s) { s.value = ""; renderGlossary(); setTimeout(() => s.focus(), 50); }
  }
  function closeGlossary() {
    const o = document.getElementById("glossaryModal");
    if (o) o.classList.remove("show");
  }
  window.openGlossary = openGlossary;
  window.closeGlossary = closeGlossary;

  /* ============================================================
     7) 一键复制
     ============================================================ */
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".copybtn");
    if (!btn) return;
    const text = btn.getAttribute("data-copy") ||
      (btn.parentElement.querySelector("code") || {}).textContent || "";
    navigator.clipboard && navigator.clipboard.writeText(text).then(() => {
      const old = btn.textContent;
      btn.textContent = t("ui.copied");
      setTimeout(() => (btn.textContent = old), 1400);
    });
  });

  /* ---------- 小工具 ---------- */
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  /* ============================================================
     左侧大纲(TOC):从课头 + 各 section 自动生成,滚动高亮
     ============================================================ */
  let _tocObserver = null;
  function headingText(el) {
    const spans = el.querySelectorAll(":scope > span");
    for (let i = spans.length - 1; i >= 0; i--) {
      const t = (spans[i].textContent || "").trim();
      if (t) return t;
    }
    return (el.textContent || "").trim();
  }
  function buildToc() {
    const main = document.getElementById("main");
    if (!main) return;
    const items = [];
    const head = main.querySelector(".lesson-head h1");
    if (head) {
      if (!head.id) head.closest(".lesson-head").id = "top";
      items.push({ id: head.closest(".lesson-head").id, text: headingText(head) });
    }
    main.querySelectorAll("section[id]").forEach((sec) => {
      const h = sec.querySelector("h2");
      if (h) items.push({ id: sec.id, text: headingText(h) });
    });
    if (items.length < 2) return;

    let nav = document.getElementById("tocNav");
    if (!nav) {
      nav = document.createElement("nav");
      nav.id = "tocNav";
      nav.className = "toc";
      nav.setAttribute("aria-label", "本课大纲");
      document.body.appendChild(nav);
    }
    const title = lang === "ja" ? "もくじ" : "本课大纲";
    nav.innerHTML = '<div class="toc-title">' + escapeHtml(title) + "</div>" +
      items.map((it) => '<a href="#' + it.id + '" data-toc="' + it.id + '">' + escapeHtml(it.text) + "</a>").join("");

    // 滚动高亮(scroll-spy)
    if (_tocObserver) _tocObserver.disconnect();
    const links = {};
    nav.querySelectorAll("a[data-toc]").forEach((a) => { links[a.getAttribute("data-toc")] = a; });
    _tocObserver = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          Object.values(links).forEach((a) => a.classList.remove("active"));
          const a = links[en.target.id];
          if (a) a.classList.add("active");
        }
      });
    }, { rootMargin: "-30% 0px -65% 0px", threshold: 0 });
    items.forEach((it) => { const el = document.getElementById(it.id); if (el) _tocObserver.observe(el); });
  }

  /* ============================================================
     初始化
     ============================================================ */
  function init() {
    // 主题/字号(尽早,避免闪烁——也在 <head> 内联了一段)
    applyTheme(localStorage.getItem(LS.theme) || "light");
    applyFont(localStorage.getItem(LS.font) || "normal");
    applyPalette(localStorage.getItem(LS.palette) || "ocean");

    applyI18n();
    buildToc();
    decorateTerms();
    updateLangButton();
    renderQuizzes();
    initMarkDone();
    initLabProgress();

    // 顶栏按钮
    const langBtn = document.getElementById("langToggle");
    if (langBtn) langBtn.addEventListener("click", () => setLang(lang === "zh" ? "ja" : "zh"));

    const themeBtn = document.getElementById("themeToggle");
    if (themeBtn) themeBtn.addEventListener("click", () => {
      const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      localStorage.setItem(LS.theme, next); applyTheme(next);
    });

    const fontBtn = document.getElementById("fontToggle");
    if (fontBtn) fontBtn.addEventListener("click", () => {
      const next = document.documentElement.getAttribute("data-fontsize") === "large" ? "normal" : "large";
      localStorage.setItem(LS.font, next); applyFont(next);
    });

    const palBtn = document.getElementById("paletteToggle");
    if (palBtn) palBtn.addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-palette") || "ocean";
      const i = PALETTES.findIndex((p) => p.id === cur);
      const next = PALETTES[(i + 1) % PALETTES.length].id;
      localStorage.setItem(LS.palette, next); applyPalette(next);
    });

    // 课程下拉菜单
    document.querySelectorAll(".navmenu .navmenu-btn").forEach((b) => {
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        b.closest(".navmenu").classList.toggle("open");
      });
    });
    document.addEventListener("click", () => {
      document.querySelectorAll(".navmenu.open").forEach((m) => m.classList.remove("open"));
    });

    // 术语表
    const gOpen = document.getElementById("glossaryOpen");
    if (gOpen) gOpen.addEventListener("click", openGlossary);
    const gSearch = document.getElementById("glossarySearch");
    if (gSearch) gSearch.addEventListener("input", renderGlossary);
    const gClose = document.getElementById("glossaryClose");
    if (gClose) gClose.addEventListener("click", closeGlossary);
    const gModal = document.getElementById("glossaryModal");
    if (gModal) gModal.addEventListener("click", (e) => { if (e.target === gModal) closeGlossary(); });

    // 语言切换时:重建大纲文本 + 刷新配色按钮文字
    document.addEventListener("langchange", () => {
      buildToc();
      applyPalette(document.documentElement.getAttribute("data-palette") || "ocean");
    });

    // 问卷按钮
    document.querySelectorAll("[data-survey-url]").forEach((b) => {
      b.addEventListener("click", () => {
        const url = b.getAttribute("data-survey-url");
        if (url) window.open(url, "_blank", "noopener");
      });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
