/* ============================================================
   庆祝动效 —— canvas-confetti + 双语祝贺 toast
   监听 app.js 派发的两个自定义事件:
     "aws:lesson-done"     勾选「我已完成本课」时
     "aws:quiz-complete"   随堂测验答完(detail.perfect 表示满分)
   尊重 prefers-reduced-motion:减少动效时只显示文字、不放彩带。
   canvas-confetti 通过 CDN 引入;若加载失败(如离线),自动降级为仅文字。
   文案全部走语言包(ui.celebrate_*),跟随语言切换。
   ============================================================ */
(function () {
  function prefersReduced() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  function tt(key, fallback) {
    return (typeof window.t === "function" ? window.t(key) : null) || fallback;
  }

  /* —— 短暂的祝贺横幅 —— */
  var toastEl = null, toastTimer = null;
  function showToast(title, sub) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "celebrate-toast";
      toastEl.setAttribute("role", "status");
      toastEl.setAttribute("aria-live", "polite");
      document.body.appendChild(toastEl);
    }
    toastEl.innerHTML = '<div class="ct-title"></div>' + (sub ? '<div class="ct-sub"></div>' : "");
    toastEl.querySelector(".ct-title").textContent = title;
    if (sub) toastEl.querySelector(".ct-sub").textContent = sub;
    // 强制重排后再加 show,确保有过渡
    void toastEl.offsetWidth;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2800);
  }

  /* —— 彩带:两侧迸发(完成本课) —— */
  function confettiSides() {
    if (typeof window.confetti !== "function") return;
    var end = Date.now() + 900;
    (function frame() {
      window.confetti({ particleCount: 4, angle: 60, spread: 60, startVelocity: 55, origin: { x: 0, y: 0.9 } });
      window.confetti({ particleCount: 4, angle: 120, spread: 60, startVelocity: 55, origin: { x: 1, y: 0.9 } });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }

  /* —— 彩带:满分,更明显的三连发 —— */
  function confettiBig() {
    if (typeof window.confetti !== "function") return;
    var defaults = { spread: 360, ticks: 80, gravity: 0.9, decay: 0.92, startVelocity: 32,
                     colors: ["#ED7100", "#7AA116", "#DD344C", "#8C4FFF", "#146eb4"] };
    function shoot() {
      window.confetti(Object.assign({}, defaults, { particleCount: 50, scalar: 1.1, origin: { y: 0.6 } }));
      window.confetti(Object.assign({}, defaults, { particleCount: 25, scalar: 0.8, origin: { y: 0.6 } }));
    }
    shoot();
    setTimeout(shoot, 250);
    setTimeout(shoot, 450);
  }

  document.addEventListener("aws:lesson-done", function () {
    showToast(tt("ui.celebrate_done_title", "🎉 本课完成!"));
    if (!prefersReduced()) confettiSides();
  });

  document.addEventListener("aws:quiz-complete", function (e) {
    if (!e.detail || !e.detail.perfect) return; // 仅满分时庆祝
    showToast(tt("ui.celebrate_perfect_title", "💯 满分通过!"),
              tt("ui.celebrate_perfect_sub", ""));
    if (!prefersReduced()) confettiBig();
  });

  // 动手实验:阶段 6(静态托管上线)与 7 个阶段全部完成时庆祝
  document.addEventListener("aws:lab-stage-done", function (e) {
    if (!e.detail) return;
    if (e.detail.allDone) {
      showToast(tt("ui.celebrate_lab_all_title", "🏆 全部完成!"));
      if (!prefersReduced()) confettiBig();
    } else if (String(e.detail.stage) === "6") {
      showToast(tt("ui.celebrate_lab6_title", "🎉 你的网页上线了!"));
      if (!prefersReduced()) confettiSides();
    }
  });
})();
