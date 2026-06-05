/* ============================================================
   代码块引擎:JSON 语法高亮 + 逐行高亮 + 一键复制(无外部依赖)
   - 代码内容来自 lang.js 的 CODE_SAMPLES(语言无关,中日共用)
   - <div class="codeblock" data-code="policyPublicRead"> 自动渲染
   - <button class="pf-row" data-cb="policyPublicRead" data-hl="6"> 点击高亮第 6 行
   ============================================================ */
(function () {
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // 单行 JSON 语法高亮(先转义,再标记字符串/键/布尔)
  function highlightJson(line) {
    var e = esc(line);
    e = e.replace(/"(\\.|[^"\\])*"(\s*:)?/g, function (m) {
      return /:\s*$/.test(m)
        ? '<span class="t-key">' + m + "</span>"
        : '<span class="t-str">' + m + "</span>";
    });
    e = e.replace(/\b(true|false|null)\b/g, '<span class="t-bool">$1</span>');
    return e === "" ? "&nbsp;" : e;
  }

  // 单行 HTML 语法高亮(标签名 + 属性值字符串)
  function highlightHtml(line) {
    var e = esc(line);
    e = e.replace(/"[^"]*"/g, '<span class="t-str">$&</span>');
    e = e.replace(/(&lt;\/?)([a-zA-Z][\w-]*)/g, '$1<span class="t-tag">$2</span>');
    return e === "" ? "&nbsp;" : e;
  }

  function highlightLine(line, lang) {
    return lang === "html" ? highlightHtml(line) : highlightJson(line);
  }

  function renderBlock(box) {
    var key = box.getAttribute("data-code");
    var lang = box.getAttribute("data-lang") || "json";
    var src = (typeof CODE_SAMPLES !== "undefined" && CODE_SAMPLES[key]) || "";
    var code = box.querySelector("code");
    if (!code) return;
    var lines = src.split("\n");
    code.innerHTML = lines
      .map(function (l, i) {
        return '<span class="cb-line" data-ln="' + (i + 1) + '">' + highlightLine(l, lang) + "</span>";
      })
      .join("");
    // 复制按钮带上原始 JSON
    var copyBtn = box.querySelector(".copybtn");
    if (copyBtn) copyBtn.setAttribute("data-copy", src);
  }

  function inRange(ln, spec) {
    return spec.split(",").some(function (part) {
      var seg = part.trim().split("-");
      var a = parseInt(seg[0], 10);
      var b = seg.length > 1 ? parseInt(seg[1], 10) : a;
      return ln >= a && ln <= b;
    });
  }

  function highlightLines(cbKey, spec) {
    var box = document.querySelector('.codeblock[data-code="' + cbKey + '"]');
    if (!box) return;
    box.querySelectorAll(".cb-line").forEach(function (el) {
      var ln = parseInt(el.getAttribute("data-ln"), 10);
      el.classList.toggle("hl", inRange(ln, spec));
    });
  }

  function init() {
    document.querySelectorAll(".codeblock[data-code]").forEach(renderBlock);

    // 字段行点击 → 高亮对应代码行
    document.querySelectorAll(".pf-row[data-cb][data-hl]").forEach(function (row) {
      row.addEventListener("click", function () {
        var cbKey = row.getAttribute("data-cb");
        var spec = row.getAttribute("data-hl");
        // 同组按钮取消激活
        var group = row.closest(".policy-fields");
        if (group) group.querySelectorAll(".pf-row.active").forEach(function (r) {
          if (r !== row) r.classList.remove("active");
        });
        var on = row.classList.toggle("active");
        highlightLines(cbKey, on ? spec : "0"); // 再点一次取消高亮
      });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
