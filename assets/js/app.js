(function () {
  const STORAGE_KEY = "quynhanh-custom-questions";
  const scratch = {
    soundOn: true,
    flashIdx: 0,
    practiceIdx: 0,
    questionBank: (window.QUESTION_BANK || []).slice(),
    audioCtx: null,
    teamCount: 3,
    currentSelection: [],
    currentPractice: [],
    timerHandle: null,
    timerSeconds: 15,
    gameTeams: [],
    gameQuestions: [],
    gameIndex: 0,
    totalGameQuestions: 0,
    turnIndex: 0,
    currentQuestion: null
  };

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function toast(msg) {
    const t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast.timeoutId);
    toast.timeoutId = setTimeout(() => t.classList.remove("show"), 2200);
  }

  function esc(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function speak(text) {
    if (!("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      u.rate = 0.88;
      window.speechSynthesis.speak(u);
    } catch (e) {
      // no-op
    }
  }

  function tone(freq, duration, volume = 0.06) {
    if (!scratch.soundOn) return;
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return;
    if (!scratch.audioCtx) scratch.audioCtx = new AudioCtor();
    const ctx = scratch.audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    gain.gain.value = 0.001;
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.start(now);
    osc.stop(now + duration + 0.04);
  }

  function playSfx(kind) {
    if (kind === "click") tone(620, 0.08, 0.05);
    if (kind === "correct") { tone(523, 0.18, 0.08); setTimeout(() => tone(659, 0.18, 0.08), 80); }
    if (kind === "wrong") { tone(220, 0.22, 0.06); setTimeout(() => tone(180, 0.22, 0.06), 120); }
    if (kind === "win") { tone(783, 0.18, 0.08); setTimeout(() => tone(988, 0.18, 0.08), 100); }
  }

  function getCustomQuestions() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function saveCustomQuestions(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function highlightSignals(sentence) {
    const output = esc(sentence || "");
    const signals = [...(window.SIGNAL_DEMO?.simple || []), ...(window.SIGNAL_DEMO?.cont || [])]
      .sort((a, b) => b[0].length - a[0].length);

    let html = output;
    for (const [sig, cls] of signals) {
      const reg = new RegExp(esc(sig).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
      html = html.replace(reg, (match) => `<span class="sig ${cls === "simple" ? "s" : "c"}">${match}</span>`);
    }
    return html;
  }

  function renderSignalChips() {
    const simpleBox = document.getElementById("chips-simple");
    const contBox = document.getElementById("chips-cont");
    if (!simpleBox || !contBox) return;

    simpleBox.innerHTML = "";
    contBox.innerHTML = "";

    for (const [sig, ex] of (window.SIGNAL_DEMO?.simple || [])) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sig-chip s";
      btn.textContent = sig;
      btn.addEventListener("click", () => {
        playSfx("click");
        document.querySelectorAll(".sig-chip").forEach((el) => el.classList.remove("picked"));
        btn.classList.add("picked");
        const demo = document.getElementById("sig-demo");
        demo.innerHTML = `<span>${highlightSignals(ex)}</span><button class="btn ghost" type="button" data-speak="${esc(ex)}">Nghe câu</button>`;
        demo.classList.add("show");
      });
      simpleBox.appendChild(btn);
    }

    for (const [sig, ex] of (window.SIGNAL_DEMO?.cont || [])) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sig-chip c";
      btn.textContent = sig;
      btn.addEventListener("click", () => {
        playSfx("click");
        document.querySelectorAll(".sig-chip").forEach((el) => el.classList.remove("picked"));
        btn.classList.add("picked");
        const demo = document.getElementById("sig-demo");
        demo.innerHTML = `<span>${highlightSignals(ex)}</span><button class="btn ghost" type="button" data-speak="${esc(ex)}">Nghe câu</button>`;
        demo.classList.add("show");
      });
      contBox.appendChild(btn);
    }
  }

  function renderFlashcards() {
    const cards = window.FLASHCARDS || [];
    if (!cards.length) return;
    const frontText = document.getElementById("flash-front-text");
    const backFace = document.getElementById("flash-back-face");
    const count = document.getElementById("flash-count");
    const flash = document.getElementById("flash");
    const current = cards[scratch.flashIdx];

    frontText.innerHTML = highlightSignals(current.s);
    backFace.innerHTML = `<span class="tense-tag">${current.tense === "simple" ? "Hiện tại đơn" : "Hiện tại tiếp diễn"}</span><span class="hintline">Dấu hiệu: ${current.signal}</span><span class="hintline">Cấu trúc: ${current.struct}</span>`;
    count.textContent = `Thẻ ${scratch.flashIdx + 1} / ${cards.length}`;
    if (flash) flash.classList.remove("flipped");
  }

  function applyTabs() {
    const tabs = document.querySelectorAll(".tab-btn");
    const pages = document.querySelectorAll(".page");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        playSfx("click");
        const id = tab.dataset.tab;
        tabs.forEach((t) => t.classList.toggle("active", t === tab));
        pages.forEach((page) => page.classList.toggle("show", page.id === `page-${id}`));
      });
    });

    document.querySelectorAll("[data-goto]").forEach((el) => {
      el.addEventListener("click", () => {
        const target = el.dataset.goto;
        const tab = document.querySelector(`.tab-btn[data-tab="${target}"]`);
        if (tab) tab.click();
      });
    });
  }

  function buildPracticeQuestions() {
    const bank = (window.QUESTION_BANK || []).slice();
    const merged = shuffle(bank.concat(getCustomQuestions()));
    scratch.currentPractice = merged.slice(0, Math.min(10, merged.length));
    scratch.practiceIdx = 0;
    return scratch.currentPractice;
  }

  function renderPractice() {
    const play = document.getElementById("practice-play");
    const start = document.getElementById("practice-start");
    const result = document.getElementById("practice-result");
    const body = document.getElementById("practice-body");
    const dots = document.getElementById("practice-dots");
    const badge = document.getElementById("practice-badge");
    const count = document.getElementById("practice-count");

    if (!scratch.currentPractice.length) {
      scratch.currentPractice = buildPracticeQuestions();
    }

    const q = scratch.currentPractice[scratch.practiceIdx];
    if (!q) return;

    play.classList.remove("hidden");
    start.classList.add("hidden");
    result.classList.add("hidden");

    badge.textContent = q.tense === "simple" ? "Hiện tại đơn" : "Hiện tại tiếp diễn";
    count.textContent = `${scratch.practiceIdx + 1} / ${scratch.currentPractice.length}`;
    dots.innerHTML = "";
    scratch.currentPractice.forEach((_, i) => {
      const dot = document.createElement("span");
      dot.classList.toggle("done", i <= scratch.practiceIdx);
      dots.appendChild(dot);
    });

    const qEl = document.createElement("div");
    qEl.className = "question-box";

    const heading = document.createElement("div");
    heading.className = "question-title";
    const sentence = q.sentence || q.question || q.signal;
    heading.innerHTML = highlightSignals(sentence);
    qEl.appendChild(heading);

    const optionsWrap = document.createElement("div");
    optionsWrap.className = "options";

    q.options.forEach((option, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "opt-btn";
      button.textContent = option;
      button.dataset.index = String(index);
      button.addEventListener("click", () => {
        const isCorrect = index === q.answer;
        q.userAnswer = index;
        document.querySelectorAll(".opt-btn").forEach((btn) => {
          const btnIndex = Number(btn.dataset.index);
          btn.disabled = true;
          btn.classList.toggle("right", btnIndex === q.answer);
          btn.classList.toggle("wrong", btnIndex === index && !isCorrect);
        });

        if (isCorrect) {
          playSfx("correct");
          toast("Đúng rồi!");
        } else {
          playSfx("wrong");
          toast("Sai rồi — xem giải thích dưới đây.");
        }

        const feedback = document.createElement("div");
        feedback.className = `feedback show ${isCorrect ? "ok" : "no"}`;
        feedback.innerHTML = `<strong>${isCorrect ? "Đúng" : "Sai"}</strong><br>${q.signal ? `Dấu hiệu: <strong>${esc(q.signal)}</strong> → dùng <strong>${q.tense === "simple" ? "Hiện tại đơn" : "Hiện tại tiếp diễn"}</strong>.` : "Hãy xem lại cấu trúc câu và dấu hiệu."}`;
        qEl.appendChild(feedback);
        document.getElementById("practice-next").classList.remove("hidden");
      });
      optionsWrap.appendChild(button);
    });

    qEl.appendChild(optionsWrap);
    body.innerHTML = "";
    body.appendChild(qEl);
    document.getElementById("practice-next").classList.add("hidden");
  }

  function finishPractice() {
    const result = document.getElementById("practice-result");
    const play = document.getElementById("practice-play");
    const body = document.getElementById("practice-body");
    const score = document.getElementById("practice-score");
    const verdict = document.getElementById("practice-verdict");
    const review = document.getElementById("practice-review");

    play.classList.add("hidden");
    result.classList.remove("hidden");
    body.innerHTML = "";

    const correctCount = scratch.currentPractice.filter((q) => Number(q.userAnswer) === Number(q.answer)).length;
    score.textContent = `${correctCount}/${scratch.currentPractice.length}`;
    verdict.textContent = correctCount >= 7 ? "Tuyệt vời!" : correctCount >= 5 ? "Khá tốt!" : "Cần ôn lại nhé!";

    review.innerHTML = "";
    scratch.currentPractice.forEach((q, i) => {
      const item = document.createElement("div");
      item.className = "custom-item";
      item.innerHTML = `<span>${i + 1}. ${esc(q.sentence || q.signal)} — ${Number(q.userAnswer) === Number(q.answer) ? "✅" : "❌"}</span>`;
      review.appendChild(item);
    });
  }

  function handlePracticeNext() {
    const current = scratch.currentPractice[scratch.practiceIdx];
    if (!current) return;

    const chosen = document.querySelector(".opt-btn.wrong") || document.querySelector(".opt-btn.right") || null;
    current.userAnswer = Number(chosen?.dataset.index ?? current.userAnswer ?? -1);

    scratch.practiceIdx += 1;
    if (scratch.practiceIdx >= scratch.currentPractice.length) {
      finishPractice();
      return;
    }
    renderPractice();
  }

  function initPractice() {
    const startBtn = document.getElementById("practice-begin");
    const shuffleBtn = document.getElementById("practice-shuffle");
    const nextBtn = document.getElementById("practice-next");
    const againBtn = document.getElementById("practice-again");

    startBtn.addEventListener("click", () => {
      scratch.currentPractice = buildPracticeQuestions();
      scratch.practiceIdx = 0;
      renderPractice();
    });

    shuffleBtn.addEventListener("click", () => {
      scratch.currentPractice = buildPracticeQuestions();
      scratch.practiceIdx = 0;
      renderPractice();
    });

    nextBtn.addEventListener("click", handlePracticeNext);
    againBtn.addEventListener("click", () => {
      scratch.currentPractice = buildPracticeQuestions();
      scratch.practiceIdx = 0;
      renderPractice();
    });
  }

  function initGame() {
    const teamCountRow = document.getElementById("team-count-row");
    const teamEdit = document.getElementById("team-edit");
    const gameStart = document.getElementById("game-start");
    const gameRandom = document.getElementById("game-random-note");
    const board = document.getElementById("scoreboard");
    const gameBody = document.getElementById("game-body");
    const gameBadge = document.getElementById("game-badge");
    const progress = document.getElementById("game-progress");
    const turnBanner = document.getElementById("turn-banner");
    const timerFill = document.getElementById("timer-fill");
    const timerNum = document.getElementById("timer-num");
    const gameEnd = document.getElementById("game-end");
    const gamePlay = document.getElementById("game-play");
    const setup = document.getElementById("game-setup");

    const buildTeamInputs = () => {
      teamEdit.innerHTML = "";
      for (let i = 0; i < scratch.teamCount; i++) {
        const card = document.createElement("div");
        card.className = "team-edit-card";
        const label = document.createElement("label");
        label.textContent = `Đội ${i + 1}`;
        const input = document.createElement("input");
        input.type = "text";
        input.value = `Đội ${i + 1}`;
        input.dataset.teamIndex = String(i);
        card.appendChild(label);
        card.appendChild(input);
        teamEdit.appendChild(card);
      }
    };

    teamCountRow.querySelectorAll(".count-btn").forEach((button) => {
      button.addEventListener("click", () => {
        scratch.teamCount = Number(button.dataset.count);
        teamCountRow.querySelectorAll(".count-btn").forEach((btn) => btn.classList.toggle("active", btn === button));
        buildTeamInputs();
      });
    });

    buildTeamInputs();

    const getTeams = () => {
      const names = [...teamEdit.querySelectorAll("input")].map((input) => input.value.trim() || `Đội ${input.dataset.teamIndex + 1}`);
      return names.map((name, index) => ({ name, score: 0, index }));
    };

    const renderScoreBoard = (teams) => {
      board.innerHTML = "";
      teams.forEach((team, index) => {
        const item = document.createElement("div");
        item.className = "score-card";
        const nameEl = document.createElement("div");
        nameEl.className = "t-name";
        nameEl.textContent = team.name;
        const scoreEl = document.createElement("div");
        scoreEl.className = "t-score";
        scoreEl.textContent = String(team.score);
        item.appendChild(nameEl);
        item.appendChild(scoreEl);
        if (index === scratch.turnIndex) item.style.borderColor = "#ef476f";
        board.appendChild(item);
      });
    };

    const startGame = () => {
      scratch.gameTeams = getTeams();
      if (!scratch.gameTeams.length) {
        toast("Vui lòng nhập tên ít nhất 1 đội");
        return;
      }
      const bank = shuffle((window.QUESTION_BANK || []).slice().concat(getCustomQuestions()));
      const total = Math.min(scratch.teamCount * 3, bank.length || 0);
      scratch.totalGameQuestions = total;
      scratch.gameQuestions = bank.slice(0, total);
      scratch.gameIndex = 0;
      scratch.turnIndex = 0;
      setup.classList.add("hidden");
      gamePlay.classList.remove("hidden");
      renderScoreBoard(scratch.gameTeams);
      showCurrentQuestion();
    };

    const showCurrentQuestion = () => {
      if (!scratch.gameQuestions || scratch.gameIndex >= scratch.gameQuestions.length) {
        finishGame();
        return;
      }

      const q = scratch.gameQuestions[scratch.gameIndex];
      const team = scratch.gameTeams[scratch.turnIndex % scratch.gameTeams.length];
      progress.textContent = `Câu ${scratch.gameIndex + 1} / ${scratch.totalGameQuestions}`;
      turnBanner.textContent = `Lượt của ${team.name}`;
      gameBadge.textContent = q.tense === "simple" ? "Hiện tại đơn" : "Hiện tại tiếp diễn";

      const qWrap = document.createElement("div");
      qWrap.className = "question-box";
      const title = document.createElement("div");
      title.className = "question-title";
      title.innerHTML = highlightSignals(q.sentence || q.signal || "");
      qWrap.appendChild(title);

      const optionsWrap = document.createElement("div");
      optionsWrap.className = "options";
      if (Array.isArray(q.options) && q.options.length) {
        q.options.forEach((option, index) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "opt-btn";
          btn.textContent = option;
          btn.dataset.qindex = String(index);
          optionsWrap.appendChild(btn);
        });
      } else {
        const note = document.createElement("div");
        note.className = "feedback show no";
        note.textContent = "Câu hỏi này không có tùy chọn trả lời.";
        qWrap.appendChild(note);
      }
      qWrap.appendChild(optionsWrap);
      gameBody.innerHTML = "";
      gameBody.appendChild(qWrap);

      timerFill.style.width = "100%";
      timerNum.textContent = String(scratch.timerSeconds);
      let remaining = scratch.timerSeconds;
      clearInterval(scratch.timerHandle);
      scratch.timerHandle = setInterval(() => {
        remaining -= 1;
        timerNum.textContent = String(Math.max(0, remaining));
        timerFill.style.width = `${(remaining / scratch.timerSeconds) * 100}%`;
        if (remaining <= 0) {
          clearInterval(scratch.timerHandle);
          toast("Hết giờ! Câu được xem là sai.");
          scratch.turnIndex = (scratch.turnIndex + 1) % scratch.gameTeams.length;
          scratch.gameIndex += 1;
          setTimeout(() => {
            if (scratch.gameIndex < scratch.totalGameQuestions) {
              renderScoreBoard(scratch.gameTeams);
              showCurrentQuestion();
            } else {
              finishGame();
            }
          }, 700);
        }
      }, 1000);

      renderScoreBoard(scratch.gameTeams);
      gameBody.querySelectorAll(".opt-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          clearInterval(scratch.timerHandle);
          const picked = Number(btn.dataset.qindex);
          const isCorrect = picked === q.answer;
          gameBody.querySelectorAll(".opt-btn").forEach((b) => {
            const bi = Number(b.dataset.qindex);
            b.disabled = true;
            b.classList.toggle("right", bi === q.answer);
            if (bi === picked && !isCorrect) b.classList.add("wrong");
          });

          if (isCorrect) {
            const teamObj = scratch.gameTeams[scratch.turnIndex % scratch.gameTeams.length];
            teamObj.score += 10;
            playSfx("correct");
            toast("Đúng! +10 điểm");
          } else {
            playSfx("wrong");
            toast("Sai rồi!");
          }
          document.getElementById("game-next").classList.remove("hidden");
        });
      });
    };

    const finishGame = () => {
      clearInterval(scratch.timerHandle);
      if (!scratch.gameTeams.length) return;
      const winner = scratch.gameTeams.slice().sort((a, b) => b.score - a.score)[0];
      document.getElementById("game-play").classList.add("hidden");
      gameEnd.classList.remove("hidden");
      document.getElementById("winner-name").textContent = winner.name;
      const summary = document.getElementById("game-summary");
      const rows = scratch.gameTeams.map((t) => `<tr><td>${esc(t.name)}</td><td>${t.score}</td></tr>`).join("");
      summary.innerHTML = `<thead><tr><th>Đội</th><th>Điểm</th></tr></thead><tbody>${rows}</tbody>`;
      playSfx("win");
    };

    document.getElementById("game-next").addEventListener("click", () => {
      document.getElementById("game-next").classList.add("hidden");
      scratch.turnIndex = (scratch.turnIndex + 1) % scratch.gameTeams.length;
      scratch.gameIndex += 1;
      renderScoreBoard(scratch.gameTeams);
      if (scratch.gameIndex < scratch.totalGameQuestions) {
        showCurrentQuestion();
      } else {
        finishGame();
      }
    });

    gameStart.addEventListener("click", startGame);
    gameRandom.addEventListener("click", () => {
      const bank = shuffle((window.QUESTION_BANK || []).slice().concat(getCustomQuestions()));
      scratch.gameQuestions = bank.slice(0, Math.min(scratch.teamCount * 3, bank.length || 0));
      scratch.totalGameQuestions = scratch.gameQuestions.length;
      scratch.gameIndex = 0;
      toast("Đã xáo câu mới");
    });

    document.getElementById("game-replay").addEventListener("click", () => {
      gameEnd.classList.add("hidden");
      setup.classList.remove("hidden");
      gamePlay.classList.add("hidden");
    });

    document.getElementById("game-back-setup").addEventListener("click", () => {
      gameEnd.classList.add("hidden");
      setup.classList.remove("hidden");
      gamePlay.classList.add("hidden");
    });
  }

  function initAddForm() {
    const form = document.getElementById("add-form");
    const list = document.getElementById("custom-list");
    const renderList = () => {
      const custom = getCustomQuestions();
      list.innerHTML = "";
      if (!custom.length) {
        const empty = document.createElement("div");
        empty.className = "custom-item";
        empty.innerHTML = "<span>Chưa có câu hỏi tùy chỉnh nào.</span>";
        list.appendChild(empty);
        return;
      }

      custom.forEach((item, index) => {
        const row = document.createElement("div");
        row.className = "custom-item";
        const label = document.createElement("span");
        label.textContent = `${index + 1}. ${item.sentence}`;
        const remove = document.createElement("button");
        remove.className = "btn ghost";
        remove.type = "button";
        remove.dataset.removeIndex = String(index);
        remove.textContent = "Xóa";
        remove.addEventListener("click", () => {
          const idx = Number(remove.dataset.removeIndex);
          const next = getCustomQuestions();
          next.splice(idx, 1);
          saveCustomQuestions(next);
          renderList();
          toast("Đã xóa câu hỏi");
        });
        row.appendChild(label);
        row.appendChild(remove);
        list.appendChild(row);
      });
    };

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const condition = document.getElementById("f-sentence").value.trim();
      if (!condition) {
        toast("Vui lòng nhập câu hỏi");
        return;
      }
      const next = getCustomQuestions();
      next.push({
        type: document.getElementById("f-type").value,
        tense: document.getElementById("f-tense").value,
        signal: document.getElementById("f-signal").value.trim(),
        sentence: condition,
        options: [
          document.getElementById("f-opt0").value.trim(),
          document.getElementById("f-opt1").value.trim(),
          document.getElementById("f-opt2").value.trim(),
          document.getElementById("f-opt3").value.trim()
        ].filter(Boolean),
        answer: Number(document.getElementById("f-correct").value)
      });
      saveCustomQuestions(next);
      renderList();
      form.reset();
      toast("Đã lưu câu hỏi");
    });

    document.getElementById("add-demo").addEventListener("click", () => {
      document.getElementById("f-type").value = "choose";
      document.getElementById("f-signal").value = "every day";
      document.getElementById("f-sentence").value = "She ___ books every day.";
      document.getElementById("f-opt0").value = "reads";
      document.getElementById("f-opt1").value = "read";
      document.getElementById("f-opt2").value = "is reading";
      document.getElementById("f-opt3").value = "reading";
      document.getElementById("f-correct").value = "0";
      document.getElementById("f-tense").value = "simple";
    });

    renderList();
  }

  function initSoundToggle() {
    const btn = document.getElementById("sound-toggle");
    if (!btn) return;
    const render = () => {
      btn.textContent = scratch.soundOn ? "🔊" : "🔇";
      btn.setAttribute("aria-pressed", String(scratch.soundOn));
    };
    render();
    btn.addEventListener("click", () => {
      scratch.soundOn = !scratch.soundOn;
      render();
      playSfx("click");
    });
  }

  function initSpeech() {
    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-speak]");
      if (!button) return;
      const text = button.getAttribute("data-speak");
      speak(text);
    });
  }

  function initFlashNavigation() {
    const flash = document.getElementById("flash");
    const prev = document.getElementById("flash-prev");
    const next = document.getElementById("flash-next");

    if (!flash || !prev || !next) return;
    flash.addEventListener("click", () => {
      flash.classList.toggle("flipped");
    });
    prev.addEventListener("click", () => {
      const cards = window.FLASHCARDS || [];
      scratch.flashIdx = (scratch.flashIdx - 1 + cards.length) % cards.length;
      renderFlashcards();
    });
    next.addEventListener("click", () => {
      const cards = window.FLASHCARDS || [];
      scratch.flashIdx = (scratch.flashIdx + 1) % cards.length;
      renderFlashcards();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderSignalChips();
    renderFlashcards();
    applyTabs();
    initPractice();
    initGame();
    initAddForm();
    initSoundToggle();
    initSpeech();
    initFlashNavigation();
    window.toast = toast;
    window.playSfx = playSfx;
    window.speak = speak;
  });

  window.quynhanhApp = {
    buildPracticeQuestions,
    renderPractice,
    toast,
    speak,
    playSfx,
    highlightSignals,
    getCustomQuestions,
    saveCustomQuestions,
    esc
  };
})();
