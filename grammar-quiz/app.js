/* ===== 单句语法填空 · 5分钟挑战 ===== */
(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const BANK = (window.QB || []).filter(q => q && q.q && Array.isArray(q.o) && q.o.length === 4);

  const S = {
    total: 300, per: 15, auto: true,
    pool: [], idx: 0,
    tTotal: 300, tQ: 15,
    lastTs: 0, running: false, paused: false, answered: false,
    right: 0, wrong: 0, log: [],
    tagFilter: null, nextTimer: null,
  };

  const LETTER = ["A", "B", "C", "D"];

  /* ---------- 工具 ---------- */
  function shuffle(a) {
    const arr = a.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  function fmt(sec) {
    sec = Math.max(0, Math.ceil(sec));
    const m = Math.floor(sec / 60), s = sec % 60;
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }
  // 题干渲染：空线 + 提示词高亮
  function renderQ(text) {
    let h = esc(text);
    h = h.replace(/_{3,}/g, '<span class="blank"></span>');
    h = h.replace(/\(([a-zA-Z][a-zA-Z\s\-']*)\)/g, '<span class="hintword">($1)</span>');
    return h;
  }
  function show(id) {
    $$(".screen").forEach(s => s.classList.toggle("active", s.id === id));
  }

  /* ---------- 首页 ---------- */
  function initHome() {
    $("#bankCount").textContent = BANK.length;
    const footKeys = $("#footKeys");
    const soloKeysHTML = footKeys ? footKeys.innerHTML : "";

    const tags = [...new Set(BANK.map(q => q.tag))];
    const picker = $("#tagPicker");
    picker.innerHTML =
      `<button class="tag-opt on" data-tag="__all">全部考点</button>` +
      tags.map(t => `<button class="tag-opt" data-tag="${t}">${t}</button>`).join("");

    picker.addEventListener("click", e => {
      const b = e.target.closest(".tag-opt");
      if (!b) return;
      const t = b.dataset.tag;
      if (t === "__all") {
        S.tagFilter = null;
        $$(".tag-opt", picker).forEach(x => x.classList.toggle("on", x.dataset.tag === "__all"));
      } else {
        $('.tag-opt[data-tag="__all"]', picker).classList.remove("on");
        b.classList.toggle("on");
        const on = $$(".tag-opt.on", picker).filter(x => x.dataset.tag !== "__all").map(x => x.dataset.tag);
        S.tagFilter = on.length ? on : null;
        if (!on.length) $('.tag-opt[data-tag="__all"]', picker).classList.add("on");
      }
    });

    $("#segMode").addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      $$("#segMode button").forEach(x => x.classList.toggle("on", x === b));
      const pk = b.dataset.v === "pk";
      document.body.dataset.mode = pk ? "pk" : "solo";
      $("#btnStart").textContent = pk ? "开始对战" : "开始挑战";
      const autoRow = $("#segAuto").closest(".setup-row");
      if (autoRow) autoRow.style.display = pk ? "none" : "";
      if (footKeys) footKeys.innerHTML = pk
        ? '左边键盘 <kbd>1</kbd><kbd>2</kbd><kbd>3</kbd><kbd>4</kbd> · 右边键盘 <kbd>7</kbd><kbd>8</kbd><kbd>9</kbd><kbd>0</kbd> · <kbd>Esc</kbd> 暂停（也可直接点各自半屏的选项）'
        : soloKeysHTML;
      if (pk) {
        const t3 = $('#segTotal button[data-v="180"]');
        if (t3) { $$("#segTotal button").forEach(x => x.classList.toggle("on", x === t3)); S.total = 180; }
      }
    });

    $("#segTotal").addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      $$("#segTotal button").forEach(x => x.classList.toggle("on", x === b));
      S.total = +b.dataset.v;
    });
    $("#segPer").addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      $$("#segPer button").forEach(x => x.classList.toggle("on", x === b));
      S.per = +b.dataset.v;
      $("#hintPer").textContent = S.per;
    });
    $("#segAuto").addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      $$("#segAuto button").forEach(x => x.classList.toggle("on", x === b));
      S.auto = b.dataset.v === "1";
    });

    $("#btnStart").addEventListener("click", () => {
      if (document.body.dataset.mode === "pk" && window.PK) {
        window.PK.start({ total: S.total, per: S.per, tags: S.tagFilter });
        return;
      }
      startGame(null);
    });
    $("#btnAgain").addEventListener("click", () => startGame(null));
    $("#btnHome").addEventListener("click", () => { show("screen-home"); renderBest(); });
    $("#btnRedoWrong").addEventListener("click", () => {
      const wrong = S.log.filter(x => !x.ok).map(x => x.q);
      if (wrong.length) startGame(wrong);
    });

    renderBest();
  }

  function renderBest() {
    let h = "";
    try {
      const hist = JSON.parse(localStorage.getItem("sgf_hist") || "[]");
      const best = JSON.parse(localStorage.getItem("sgf_best") || "null");
      if (best) h = `历史最佳：<b>${best.rate}%</b>（答对 ${best.right}/${best.n}，${best.date}）`;
      else if (hist.length) h = `已完成 ${hist.length} 局`;
    } catch (e) { }
    $("#bestBox").innerHTML = h;
  }

  /* ---------- 开始一局 ---------- */
  function startGame(preset) {
    let pool = preset && preset.length ? shuffle(preset)
      : shuffle(BANK.filter(q => !S.tagFilter || S.tagFilter.includes(q.tag)));

    if (!pool.length) { alert("当前考点下没有题目，请换一个范围。"); return; }

    S.pool = pool;
    S.idx = 0;
    S.tTotal = S.total;
    S.tQ = S.per;
    S.right = 0;
    S.wrong = 0;
    S.log = [];
    S.answered = false;
    S.paused = false;
    S.running = true;
    S.lastTs = 0;

    $("#pauseMask").classList.remove("show");
    $("#statRight").textContent = "0";
    $("#statWrong").textContent = "0";
    show("screen-quiz");
    renderQuestion();
    requestAnimationFrame(loop);
  }

  function cur() { return S.pool[S.idx]; }

  function renderQuestion() {
    const q = cur();
    if (!q) return finish();
    clearTimeout(S.nextTimer);

    $("#qTag").textContent = q.tag;
    $("#qSrc").textContent = q.src || "";
    $("#qText").innerHTML = renderQ(q.q);
    $("#statIdx").textContent = S.idx + 1;

    const box = $("#options");
    box.innerHTML = q.o.map((t, i) =>
      `<button class="opt" data-i="${i}"><span class="k">${LETTER[i]}</span><span class="t">${esc(t)}</span></button>`
    ).join("");

    $("#feedback").className = "feedback";
    $("#feedback").classList.remove("show");
    S.answered = false;
    S.tQ = S.per;
    updateRing();
    $("#progFill").style.width = (S.idx / Math.min(S.pool.length, 1e9) * 100) + "%";
  }

  /* ---------- 主循环 ---------- */
  function loop(ts) {
    if (!S.running) return;

    if (!S.lastTs) S.lastTs = ts;
    let dt = (ts - S.lastTs) / 1000;
    S.lastTs = ts;
    if (dt > 0.35) dt = 0.35;   // 切后台 / 卡顿时不跳变

    if (!S.paused) {
      S.tTotal -= dt;
      if (!S.answered) {
        S.tQ -= dt;
        updateRing();
        if (S.tQ <= 0) { S.tQ = 0; answer(-1, true); }
      }

      const clock = $("#clock");
      clock.textContent = fmt(S.tTotal);
      clock.classList.toggle("warn", S.tTotal <= 30);

      if (S.tTotal <= 0) { S.tTotal = 0; finish(); return; }
    }
    requestAnimationFrame(loop);
  }

  const CIRC = 2 * Math.PI * 19;
  function updateRing() {
    const bar = $("#ringBar");
    if (!bar) return;
    const p = Math.max(0, Math.min(1, S.tQ / S.per));
    bar.style.strokeDasharray = CIRC;
    bar.style.strokeDashoffset = CIRC * (1 - p);
    $("#ringNum").textContent = Math.ceil(S.tQ);
    $("#ring").classList.toggle("hot", S.tQ <= 5);
  }

  /* ---------- 判定 ---------- */
  function answer(i, timeout) {
    if (S.answered || !S.running || S.paused) return;
    S.answered = true;

    const q = cur();
    const ok = i === q.a;
    const pick = i < 0 ? null : i;

    if (ok) S.right++; else S.wrong++;
    $("#statRight").textContent = S.right;
    $("#statWrong").textContent = S.wrong;

    S.log.push({ q: q, pick: pick, ok: ok, timeout: !!timeout });

    const opts = $$(".opt", $("#options"));
    opts.forEach((b, k) => {
      b.classList.add("locked");
      if (k === q.a) b.classList.add("right");
      else if (k === pick) b.classList.add("wrong");
      else b.classList.add("dim");
    });

    const fb = $("#feedback");
    fb.className = "feedback show " + (ok ? "ok" : "no");
    $("#fbTitle").textContent = ok ? `✓ 正确  ${q.o[q.a]}`
      : timeout ? `⏱ 超时 · 正确答案 ${q.o[q.a]}`
        : `✗ 错选 ${q.o[pick]} · 正确答案 ${q.o[q.a]}`;
    $("#fbBody").innerHTML = `<b>${esc(q.o[q.a])}</b> — ${esc(q.e)}` + (q.src ? `　<span style="color:#93a1b8">［${esc(q.src)}］</span>` : "");

    const go = () => { if (S.answered && S.running) nextQuestion(); };
    $("#fbNext").onclick = go;

    if (ok) {
      S.nextTimer = setTimeout(go, 720);
    } else if (S.auto) {
      S.nextTimer = setTimeout(go, 2600);
    }
    // 非自动模式：等用户点「继续」或按空格
  }

  function nextQuestion() {
    clearTimeout(S.nextTimer);
    S.idx++;
    if (S.idx >= S.pool.length || S.tTotal <= 0) return finish();
    renderQuestion();
  }

  /* ---------- 结算 ---------- */
  function finish() {
    S.running = false;
    clearTimeout(S.nextTimer);
    $("#pauseMask").classList.remove("show");

    const n = S.right + S.wrong;
    const rate = n ? Math.round(S.right / n * 100) : 0;
    const used = Math.max(0, S.total - S.tTotal);
    const avg = n ? (used / n).toFixed(1) : "0";

    $("#rRate").innerHTML = rate + "<span>%</span>";
    $("#rLine").textContent = `答对 ${S.right} 题 / 共 ${n} 题（错 ${S.wrong}）`;
    $("#rMeta").textContent = `用时 ${fmt(used)} · 平均每题 ${avg} 秒 · 完成 ${n} 题`;

    // 考点分布
    const byTag = {};
    S.log.forEach(x => {
      const t = x.q.tag || "其他";
      byTag[t] = byTag[t] || { right: 0, wrong: 0 };
      x.ok ? byTag[t].right++ : byTag[t].wrong++;
    });
    const rows = Object.entries(byTag).map(([t, v]) => ({ t, ...v, n: v.right + v.wrong, rate: v.right / (v.right + v.wrong) }))
      .sort((a, b) => b.rate - a.rate);
    $("#rTags").innerHTML = rows.length ? rows.map(r => {
      const pct = Math.round(r.rate * 100);
      const color = pct >= 80 ? "#12a150" : pct >= 60 ? "#f59e0b" : "#e03b3b";
      return `<div class="tb"><span>${r.t}</span>
        <span class="bar"><i style="width:${pct}%;background:${color}"></i></span>
        <b>${r.right}/${r.n}</b></div>`;
    }).join("") : '<div class="empty">暂无数据</div>';

    // 错题
    const miss = S.log.filter(x => !x.ok);
    $("#rMiss").innerHTML = miss.length ? miss.map(x => `
      <div class="miss">
        <div class="mq">${renderQ(x.q.q)}</div>
        <div class="ma">你选：<s>${x.pick === null ? "超时未答" : esc(x.q.o[x.pick])}</s>　正确：<b>${esc(x.q.o[x.q.a])}</b></div>
        <div class="me">${esc(x.q.e)}${x.q.src ? `<span style="white-space:nowrap">　［${esc(x.q.src)}］</span>` : ""}</div>
      </div>`).join("") : '<div class="empty">全对，没有错题 👍</div>';

    // 记录
    try {
      const date = new Date().toLocaleDateString("zh-CN");
      const hist = JSON.parse(localStorage.getItem("sgf_hist") || "[]");
      hist.push({ date, right: S.right, n, rate });
      while (hist.length > 50) hist.shift();
      localStorage.setItem("sgf_hist", JSON.stringify(hist));
      const best = JSON.parse(localStorage.getItem("sgf_best") || "null");
      if (!best || rate > best.rate) localStorage.setItem("sgf_best", JSON.stringify({ rate, right: S.right, n, date }));
    } catch (e) { }

    $("#btnRedoWrong").style.display = miss.length ? "" : "none";
    show("screen-result");
    window.scrollTo(0, 0);
  }

  /* ---------- 交互 ---------- */
  $("#options").addEventListener("click", e => {
    const b = e.target.closest(".opt");
    if (!b || S.answered) return;
    answer(+b.dataset.i, false);
  });

  function togglePause(force) {
    if (!S.running) return;
    const want = typeof force === "boolean" ? force : !S.paused;
    if (want === S.paused) return;
    S.paused = want;
    S.lastTs = 0;                       // 恢复时重置时间基准，不补算暂停时长
    $("#pauseMask").classList.toggle("show", S.paused);
    $("#btnPause").textContent = S.paused ? "继续" : "暂停";
    if (!S.paused) requestAnimationFrame(loop);
  }
  $("#btnPause").addEventListener("click", () => togglePause());
  $("#btnResume").addEventListener("click", () => togglePause(false));
  $("#btnQuit").addEventListener("click", () => {
    if (S.right + S.wrong === 0 || confirm("结束本局并查看结果？")) finish();
  });
  $("#fbNext").addEventListener("click", () => {
    if (S.answered && S.running) nextQuestion();
  });

  document.addEventListener("keydown", e => {
    if (!S.running) return;
    const k = e.key.toLowerCase();
    if (k === "escape") { e.preventDefault(); togglePause(); return; }
    if (S.paused) return;

    if (!S.answered) {
      let i = -1;
      if (k >= "1" && k <= "4") i = +k - 1;
      else if (k === "a") i = 0; else if (k === "b") i = 1; else if (k === "c") i = 2; else if (k === "d") i = 3;
      if (i >= 0) { e.preventDefault(); answer(i, false); }
    } else if (k === " " || k === "enter") {
      e.preventDefault();
      nextQuestion();
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && S.running && !S.paused) togglePause(true);
  });

  /* ---------- 启动（支持 ?go=1 直接开局、?t=秒 自定义时长，方便投屏/演示） ---------- */
  const qs = new URLSearchParams(location.search);
  if (qs.has("per")) S.per = Math.max(3, +qs.get("per") || 15);
  if (qs.has("t")) S.total = Math.max(5, +qs.get("t") || 300);

  if (!BANK.length) {
    document.body.innerHTML = '<div style="padding:60px;text-align:center;font:16px system-ui">题库未加载成功，请确认 data 目录下的 q1.js ~ q7.js 存在。</div>';
  } else {
    initHome();
    if (qs.has("go")) setTimeout(() => startGame(null), 30);
  }
})();
