/* ===== 双人 PK · 左右分屏同步对战 ===== */
(function () {
  "use strict";

  const BANK = (window.QB || []).filter(q => q && q.q && Array.isArray(q.o) && q.o.length === 4);
  if (!BANK.length) return;

  const $ = s => document.querySelector(s);
  const LETTER = ["A", "B", "C", "D"];

  const P = {
    running: false, paused: false, over: false,
    total: 180, per: 15, tTotal: 180, lastTs: 0,
    tags: null, L: null, R: null, lastOpts: null,
  };

  const shuffle = a => {
    const arr = a.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };
  const fmt = sec => {
    sec = Math.max(0, Math.ceil(sec));
    return String(Math.floor(sec / 60)).padStart(2, "0") + ":" + String(sec % 60).padStart(2, "0");
  };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const renderQ = t => esc(t)
    .replace(/_{3,}/g, '<span class="blank"></span>')
    .replace(/\(([a-zA-Z][a-zA-Z\s\-']*)\)/g, '<span class="hintword">($1)</span>');

  const mkSide = name => ({
    name, pool: [], idx: 0, score: 0, miss: 0, timeouts: 0,
    streak: 0, bestStreak: 0, q: null, tQ: 0, answered: true,
  });

  // 按考点均分题库，保证左右两边同考点题量一致
  function split(pool) {
    const byTag = {};
    pool.forEach(q => { (byTag[q.tag] = byTag[q.tag] || []).push(q); });
    const L = [], R = [];
    Object.values(byTag).forEach(arr => {
      shuffle(arr).forEach((q, i) => (i % 2 === 0 ? L : R).push(q));
    });
    return [shuffle(L), shuffle(R)];
  }

  const el = key => ({
    q: key === "L" ? $("#pkQL") : $("#pkQR"),
    opts: key === "L" ? $("#pkOptsL") : $("#pkOptsR"),
    msg: key === "L" ? $("#pkMsgL") : $("#pkMsgR"),
    score: key === "L" ? $("#pkScoreL") : $("#pkScoreR"),
    bar: key === "L" ? $("#pkBarL") : $("#pkBarR"),
  });

  function start(opts) {
    const pool = BANK.filter(q => !opts.tags || opts.tags.includes(q.tag));
    if (pool.length < 8) { alert("当前考点题目太少，不适合 PK，请扩大考点范围。"); return; }

    P.total = opts.total || 180;
    P.per = opts.per || 15;
    P.tTotal = P.total;
    P.tags = opts.tags || null;
    P.lastOpts = opts;
    P.paused = false;
    P.over = false;
    P.running = false;
    P.lastTs = 0;

    const [lp, rp] = split(pool);
    P.L = mkSide(($("#pkNameL").value || "").trim() || "左同学");
    P.R = mkSide(($("#pkNameR").value || "").trim() || "右同学");
    P.L.pool = lp; P.R.pool = rp;

    $("#pkScoreL").textContent = "0";
    $("#pkScoreR").textContent = "0";
    $("#pkMsgL").textContent = "";
    $("#pkMsgR").textContent = "";
    $("#pkClock").textContent = fmt(P.total);
    $("#pkClock").classList.remove("warn");
    $("#pkResult").classList.remove("show");
    $("#pkPause").textContent = "暂停";
    document.querySelectorAll(".pk-side").forEach(s => s.classList.remove("paused"));

    document.querySelectorAll(".screen").forEach(s => s.classList.toggle("active", s.id === "screen-pk"));

    // 先取好第一题并显示，倒计时期间锁住不计时
    nextQ("L");
    nextQ("R");
    P.L.answered = true;
    P.R.answered = true;

    countdown(() => {
      P.running = true;
      P.lastTs = 0;
      P.L.tQ = P.per; P.L.answered = false;
      P.R.tQ = P.per; P.R.answered = false;
      requestAnimationFrame(loop);
    });
  }

  let cdTimer = null;
  function countdown(done) {
    const box = $("#pkReady"), num = $("#pkReadyNum");
    let n = 3;
    num.textContent = n;
    box.classList.add("show");
    clearInterval(cdTimer);
    cdTimer = setInterval(() => {
      n--;
      if (n > 0) {
        num.textContent = n;
        num.style.animation = "none";
        void num.offsetWidth;
        num.style.animation = "";
      } else {
        clearInterval(cdTimer);
        box.classList.remove("show");
        done();
      }
    }, 800);
  }

  function renderSide(key) {
    const s = key === "L" ? P.L : P.R;
    const e = el(key);
    const q = s.q;
    if (!q) return;
    e.q.innerHTML = renderQ(q.q);
    e.opts.innerHTML = q.o.map((t, i) =>
      `<button class="pk-opt" data-i="${i}"><span class="k">${LETTER[i]}</span><span class="t">${esc(t)}</span></button>`
    ).join("");
    e.msg.textContent = "";
    e.msg.className = "pk-msg";
    e.bar.style.width = "100%";
    e.bar.classList.remove("low");
  }

  function nextQ(key) {
    const s = key === "L" ? P.L : P.R;
    if (s.idx >= s.pool.length) { s.pool = shuffle(s.pool); s.idx = 0; }
    s.q = s.pool[s.idx++];
    s.answered = false;
    s.tQ = P.per;
    renderSide(key);
  }

  function judge(key, i, timeout) {
    const s = key === "L" ? P.L : P.R;
    if (!P.running || P.paused || P.over || s.answered || !s.q) return;
    s.answered = true;

    const ok = i === s.q.a;
    if (ok) {
      s.score++;
      s.streak++;
      if (s.streak > s.bestStreak) s.bestStreak = s.streak;
    } else {
      s.miss++;
      s.streak = 0;
      if (timeout) s.timeouts++;
    }

    const e = el(key);
    Array.from(e.opts.children).forEach((b, k) => {
      b.classList.add("locked");
      if (k === s.q.a) b.classList.add("right");
      else if (k === i) b.classList.add("wrong");
      else b.classList.add("dim");
    });

    e.score.textContent = s.score;
    e.score.classList.remove("pop");
    void e.score.offsetWidth;
    e.score.classList.add("pop");

    e.msg.className = "pk-msg " + (ok ? "ok" : "no");
    e.msg.innerHTML = ok
      ? `✓ 正确${s.streak >= 2 ? ` · 连对 ${s.streak}` : ""}`
      : `${timeout ? "⏱ 超时" : "✗ 错"} · 答案 <b>${esc(s.q.o[s.q.a])}</b>`;

    const go = () => {
      if (P.over || !P.running) return;
      if (P.paused) { setTimeout(go, 300); return; }
      nextQ(key);
    };
    setTimeout(go, ok ? 520 : 1450);
  }

  function loop(ts) {
    if (!P.running) return;
    if (!P.lastTs) P.lastTs = ts;
    let dt = (ts - P.lastTs) / 1000;
    P.lastTs = ts;
    if (dt > 0.35) dt = 0.35;

    if (!P.paused) {
      P.tTotal -= dt;
      ["L", "R"].forEach(key => {
        const s = key === "L" ? P.L : P.R;
        if (!s.answered && s.q) {
          s.tQ -= dt;
          const e = el(key);
          const pct = Math.max(0, s.tQ / P.per);
          e.bar.style.width = (pct * 100).toFixed(1) + "%";
          e.bar.classList.toggle("low", pct < 0.34);
          if (s.tQ <= 0) { s.tQ = 0; judge(key, -1, true); }
        }
      });

      $("#pkClock").textContent = fmt(P.tTotal);
      $("#pkClock").classList.toggle("warn", P.tTotal <= 15);
      if (P.tTotal <= 0) { P.tTotal = 0; finish(); return; }
    }
    requestAnimationFrame(loop);
  }

  function finish() {
    P.running = false;
    P.over = true;
    const L = P.L, R = P.R;

    $("#pkrNameL").textContent = L.name;
    $("#pkrNameR").textContent = R.name;
    $("#pkrScoreL").textContent = L.score;
    $("#pkrScoreR").textContent = R.score;
    const meta = s => `答错 ${s.miss}${s.timeouts ? `（含超时 ${s.timeouts}）` : ""} · 最高连对 ${s.bestStreak}`;
    $("#pkrMetaL").textContent = meta(L);
    $("#pkrMetaR").textContent = meta(R);

    const title = $("#pkrTitle");
    if (L.score > R.score) { title.textContent = `${L.name} 胜！`; title.dataset.win = "L"; }
    else if (R.score > L.score) { title.textContent = `${R.name} 胜！`; title.dataset.win = "R"; }
    else { title.textContent = "平局！再来一局分胜负"; title.dataset.win = ""; }

    $("#pkResult").classList.add("show");
  }

  function togglePause(force) {
    if (!P.running) return;
    const want = typeof force === "boolean" ? force : !P.paused;
    if (want === P.paused) return;
    P.paused = want;
    P.lastTs = 0;
    document.querySelectorAll(".pk-side").forEach(s => s.classList.toggle("paused", P.paused));
    $("#pkPause").textContent = P.paused ? "继续" : "暂停";
    if (!P.paused) requestAnimationFrame(loop);
  }

  /* ---------- 交互 ---------- */
  $("#pkOptsL").addEventListener("click", e => {
    const b = e.target.closest(".pk-opt");
    if (b) judge("L", +b.dataset.i, false);
  });
  $("#pkOptsR").addEventListener("click", e => {
    const b = e.target.closest(".pk-opt");
    if (b) judge("R", +b.dataset.i, false);
  });

  $("#pkPause").addEventListener("click", () => togglePause());
  $("#pkEnd").addEventListener("click", () => {
    if (P.L.score + P.L.miss + P.R.score + P.R.miss === 0 || confirm("结束本局并看结果？")) finish();
  });
  $("#pkBack").addEventListener("click", () => {
    P.running = false; P.over = true;
    $("#pkResult").classList.remove("show");
    document.querySelectorAll(".screen").forEach(s => s.classList.toggle("active", s.id === "screen-home"));
  });
  $("#pkAgain").addEventListener("click", () => { if (P.lastOpts) start(P.lastOpts); });
  $("#pkHome").addEventListener("click", () => {
    $("#pkResult").classList.remove("show");
    document.querySelectorAll(".screen").forEach(s => s.classList.toggle("active", s.id === "screen-home"));
  });

  document.addEventListener("keydown", e => {
    if (!P.running) return;
    if (e.target && /input|textarea/i.test(e.target.tagName)) return;
    const k = e.key;
    if (k === "Escape") { e.preventDefault(); togglePause(); return; }
    if (P.paused) return;
    const map = { "1": 0, "2": 1, "3": 2, "4": 3, "7": 0, "8": 1, "9": 2, "0": 3 };
    if (k in map) {
      e.preventDefault();
      judge(k >= "7" || k === "0" ? "R" : "L", map[k], false);
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && P.running && !P.paused) togglePause(true);
  });

  window.PK = { start, isRunning: () => P.running };
})();
