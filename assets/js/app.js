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
    turnIndex: 0,
    currentQuestion: null,
    totalGameQuestions: 0
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

  function escapeRegex(str) {
    return String(str).replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
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
    // Build an array of [signal, classChar] where classChar is 's' or 'c'
    const simple = (window.SIGNAL_DEMO?.simple || []).map(([s]) => [s, 's']);
    const cont = (window.SIGNAL_DEMO?.cont || []).map(([s]) => [s, 'c']);
    const signals = simple.concat(cont).sort((a, b) => b[0].length - a[0].length);

    let html = esc(String(sentence || ''));
    for (const [sig, cls] of signals) {
      if (!sig) continue;
      const safe = escapeRegex(sig);
      const re = new RegExp(safe, "gi");
      html = html.replace(re, (m) => `<span class="sig ${cls}">${m}</span>`);
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
    backFace.innerHTML = `<span class="tense-tag">${current.tense === "simple" ? "Hiện tại đơn" : "Hiện tại tiếp diễn"}</span><span class="hintline">Dấu hiệu: ${esc(current.signal)}</span><span class="hintline">Cấu trúc: ${esc(current.struct)}</span>`;
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

  // Generic renderer for a single question (practice)
  function renderQuestion(q, container) {
    container.innerHTML = "";
    const qEl = document.createElement("div");
    qEl.className = "question-box";

    const heading = document.createElement("div");
    heading.className = "question-title";
    const sentence = q.sentence || q.question || q.signal || "";
    heading.innerHTML = highlightSignals(sentence);
    qEl.appendChild(heading);

    // helper to create options grid and attach click handler
    function createOptions(opts) {
      const optionsWrap = document.createElement("div");
      optionsWrap.className = "options";
      opts.forEach((option, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "opt-btn";
        button.textContent = option;
        button.dataset.index = String(index);
        button.addEventListener("click", () => {
          // disable all buttons
          optionsWrap.querySelectorAll(".opt-btn").forEach((btn) => btn.disabled = true);
          // mark correct
          if (typeof q.answer === 'number') {
            const rightBtn = optionsWrap.querySelector(`[data-index="${q.answer}"]`);
            if (rightBtn) rightBtn.classList.add("right");
          }
          // mark chosen wrong if needed
          const isCorrect = (typeof q.answer === 'number') ? (index === q.answer) : false;
          if (!isCorrect) button.classList.add("wrong");
          q.userAnswer = index;

          if (isCorrect) { playSfx("correct"); toast("Đúng rồi!"); }
          else { playSfx("wrong"); toast("Sai rồi — xem giải thích dưới đây."); }

          const feedback = document.createElement("div");
          feedback.className = `feedback show ${isCorrect ? "ok" : "no"}`;
          feedback.innerHTML = `<strong>${isCorrect ? "Đúng" : "Sai"}</strong><br>${q.signal ? `Dấu hiệu: <strong>${esc(q.signal)}</strong> → dùng <strong>${q.tense === "simple" ? "Hiện tại đơn" : "Hiện tại tiếp diễn"}</strong>.` : "" }<br><span class="hintline">Công thức: ${q.tense === "simple" ? "S + V / V-s / V-es" : "S + am / is / are + V-ing"}</span>`;
          qEl.appendChild(feedback);
          const nextBtn = document.getElementById("practice-next");
          if (nextBtn) nextBtn.classList.remove("hidden");
        });
        optionsWrap.appendChild(button);
      });
      return optionsWrap;
    }

    // Render by type
    if (q.type === "arrange") {
      // words: clickable chips that append to answer area
      const answerLine = document.createElement("div");
      answerLine.className = "answer-line";
      answerLine.textContent = "(Chọn từ theo thứ tự)";
      const bank = document.createElement("div");
      bank.className = "word-bank";

      const words = (q.words || []).slice();
      const currentAnswer = [];

      function renderWords() {
        bank.innerHTML = "";
        words.forEach((w, i) => {
          const chip = document.createElement("button");
          chip.className = "word-chip";
          chip.type = "button";
          chip.textContent = w;
          chip.addEventListener("click", () => {
            currentAnswer.push(w);
            chip.disabled = true;
            answerLine.textContent = currentAnswer.join(" ");
            if (currentAnswer.length === (q.words || []).length) {
              // check answer
              const given = currentAnswer.join(" ");
              const correct = (q.sentence || q.correct || q.answerText || "").replace(/\s+/g, " ").trim();
              q.userAnswer = given;
              const isCorrect = given.trim() === correct.trim();
              if (isCorrect) { playSfx("correct"); toast("Đúng rồi!"); }
              else { playSfx("wrong"); toast("Sai rồi!"); }
              const feedback = document.createElement("div");
              feedback.className = `feedback show ${isCorrect ? "ok" : "no"}`;
              feedback.innerHTML = `<strong>${isCorrect ? "Đúng" : "Sai"}</strong><br><span class="hintline">Đáp án: ${esc(correct)}</span>`;
              qEl.appendChild(feedback);
              const nextBtn = document.getElementById("practice-next");
              if (nextBtn) nextBtn.classList.remove("hidden");
            }
          });
          bank.appendChild(chip);
        });
      }

      renderWords();
      qEl.appendChild(answerLine);
      qEl.appendChild(bank);
    } else if (q.type === "fix") {
      // show wrong sentence and options of corrections
      const wrong = document.createElement("div");
      wrong.className = "ex-line";
      wrong.innerHTML = esc(q.wrong || q.sentence || "");
      qEl.appendChild(wrong);
      if (q.options && q.options.length) {
        qEl.appendChild(createOptions(q.options));
      }
    } else if (q.type === "picture") {
      // insert scene (SVG) then options
      const sceneWrap = document.createElement("div");
      sceneWrap.className = "scene-box";
      sceneWrap.innerHTML = q.scene || "";
      qEl.appendChild(sceneWrap);
      if (q.options && q.options.length) qEl.appendChild(createOptions(q.options));
    } else if (q.type === "listen") {
      // show listen button and options
      const btn = document.createElement("button");
      btn.className = "speak-btn";
      btn.type = "button";
      btn.textContent = "Nghe câu";
      btn.addEventListener("click", () => {
        playSfx("click");
        speak(q.audioText || q.sentence || "");
      });
      qEl.appendChild(btn);
      if (q.options && q.options.length) qEl.appendChild(createOptions(q.options));
    } else {
      // default: choose / classify / conjugate / hunt
      if (q.options && q.options.length) qEl.appendChild(createOptions(q.options));
    }

    container.appendChild(qEl);
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
      dot.classList.toggle("done", i < scratch.practiceIdx);
      dots.appendChild(dot);
    });

    // render the question generically
    renderQuestion(q, body);
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

    const correctCount = scratch.currentPractice.filter((q, i) => {
      if (typeof q.answer === 'number') return q.userAnswer === q.answer;
      // for arrange/fix types where userAnswer might be string
      if (q.type === 'arrange') return String(q.userAnswer || '').trim() === String(q.sentence || q.correct || '').trim();
      return false;
    }).length;

    score.textContent = `${correctCount}/${scratch.currentPractice.length}`;
    verdict.textContent = correctCount >= 7 ? "Tuyệt vời!" : correctCount >= 5 ? "Khá tốt!" : "Cần ôn lại nhé!";

    review.innerHTML = "";
    scratch.currentPractice.forEach((q, i) => {
      const item = document.createElement("div");
      item.className = "custom-item";
      const right = typeof q.answer === 'number' ? (q.userAnswer === q.answer) : (q.type === 'arrange' ? (String(q.userAnswer || '').trim() === String(q.sentence || q.correct || '').trim()) : false);
      item.innerHTML = `<span>${i + 1}. ${esc(q.sentence || q.signal || '')} — ${right ? "✅" : "❌"}</span>`;
      review.appendChild(item);
    });
  }

  function handlePracticeNext() {
    const current = scratch.currentPractice[scratch.practiceIdx];
    if (!current) return;

    // if user didn't pick anything, mark -1
    if (current.userAnswer === undefined) {
      current.userAnswer = -1;
    }

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
        card.innerHTML = `<div class="team-edit-card"><label>Đội ${i + 1}</label><input type="text" value="Đội ${i + 1}" data-team-index="${i}" /></div>`;
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
        item.innerHTML = `<div class="t-name">${esc(team.name)}</div><div class="t-score">${team.score}</div>`;
        if (index === scratch.turnIndex) item.style.borderColor = "#ef476f";
        board.appendChild(item);
      });
    };

    const startGame = () => {
      scratch.gameTeams = getTeams();
      scratch.gameQuestions = shuffle((window.QUESTION_BANK || []).slice());
      scratch.totalGameQuestions = scratch.gameQuestions.length;
      scratch.turnIndex = 0;
      setup.classList.add("hidden");
      gamePlay.classList.remove("hidden");
      showCurrentQuestion();
    };

    const getTimerForType = (type) => {
      if (type === 'arrange') return 30;
      if (type === 'listen') return 20;
      return 15;
    };

    const showCurrentQuestion = () => {
      if (!scratch.gameQuestions.length) {
        finishGame();
        return;
      }
      scratch.currentQuestion = scratch.gameQuestions.shift();
      const team = scratch.gameTeams[scratch.turnIndex % scratch.gameTeams.length];
      const q = scratch.currentQuestion;
      const questionNumber = scratch.totalGameQuestions - scratch.gameQuestions.length;
      progress.textContent = `Câu ${questionNumber} / ${scratch.totalGameQuestions}`;
      turnBanner.textContent = `Lượt của ${team.name}`;
      gameBadge.textContent = q.tense === "simple" ? "Hiện tại đơn" : "Hiện tại tiếp diễn";

      // render question into gameBody using same renderQuestion logic
      gameBody.innerHTML = "";
      const wrapper = document.createElement('div');
      wrapper.className = 'card';
      const qb = document.createElement('div');
      qb.className = 'question-box';
      qb.innerHTML = `<div class="question-title">${highlightSignals(q.sentence || q.signal || '')}</div>`;
      wrapper.appendChild(qb);

      // For game we render options similarly but need to attach scoring behaviour
      function attachGameOptions(opts) {
        const optionsWrap = document.createElement('div');
        optionsWrap.className = 'options';
        opts.forEach((option, index) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'opt-btn';
          button.textContent = option;
          button.dataset.index = String(index);
          button.addEventListener('click', () => {
            clearInterval(scratch.timerHandle);
            optionsWrap.querySelectorAll('.opt-btn').forEach((b) => b.disabled = true);
            const isCorrect = (typeof q.answer === 'number') ? (index === q.answer) : false;
            const chosenBtn = button;
            if (typeof q.answer === 'number') {
              const rightBtn = optionsWrap.querySelector(`[data-index="${q.answer}"]`);
              if (rightBtn) rightBtn.classList.add('right');
            }
            if (!isCorrect) chosenBtn.classList.add('wrong');

            // scoring
            if (isCorrect) {
              // bonus if answered quickly
              const timeLeft = Number(document.getElementById('timer-num').textContent || 0);
              const base = 10; let bonus = 0;
              const maxBonusWindow = 6; // seconds
              if (timeLeft >= (getTimerForType(q.type) - maxBonusWindow)) bonus = 5;
              team.score += base + bonus;
              playSfx('correct');
              toast(`Đúng! +${base + bonus} điểm`);
            } else {
              playSfx('wrong');
              toast('Sai rồi!');
            }
            document.getElementById('game-next').classList.remove('hidden');
            renderScoreBoard(scratch.gameTeams);
          });
          optionsWrap.appendChild(button);
        });
        qb.appendChild(optionsWrap);
      }

      if (q.type === 'picture') {
        const sceneWrap = document.createElement('div');
        sceneWrap.className = 'scene-box';
        sceneWrap.innerHTML = q.scene || '';
        qb.appendChild(sceneWrap);
        if (q.options && q.options.length) attachGameOptions(q.options);
      } else if (q.type === 'listen') {
        const btn = document.createElement('button');
        btn.className = 'speak-btn'; btn.type = 'button'; btn.textContent = 'Nghe câu';
        btn.addEventListener('click', () => { playSfx('click'); speak(q.audioText || q.sentence || ''); });
        qb.appendChild(btn);
        if (q.options && q.options.length) attachGameOptions(q.options);
      } else if (q.type === 'arrange') {
        // simplified: show words and expect teacher to check (or user clicks order)
        const bank = document.createElement('div'); bank.className = 'word-bank';
        (q.words || []).forEach((w, i) => {
          const chip = document.createElement('button'); chip.type = 'button'; chip.className = 'word-chip'; chip.textContent = w;
          bank.appendChild(chip);
        });
        qb.appendChild(bank);
        // no automatic scoring for arrange in game mode for now
      } else if (q.options && q.options.length) {
        attachGameOptions(q.options);
      }

      gameBody.appendChild(wrapper);

      const duration = getTimerForType(q.type);
      timerFill.style.width = '100%';
      timerNum.textContent = String(duration);
      let remaining = duration;
      clearInterval(scratch.timerHandle);
      scratch.timerHandle = setInterval(() => {
        remaining -= 1;
        timerNum.textContent = String(Math.max(0, remaining));
        timerFill.style.width = `${(remaining / duration) * 100}%`;
        if (remaining <= 0) {
          clearInterval(scratch.timerHandle);
          toast('Hết giờ! Câu được xem là sai.');
          setTimeout(() => {
            if (scratch.gameQuestions.length > 0) {
              scratch.turnIndex = (scratch.turnIndex + 1) % scratch.gameTeams.length;
              renderScoreBoard(scratch.gameTeams);
              showCurrentQuestion();
            } else {
              finishGame();
            }
          }, 700);
        }
      }, 1000);

      renderScoreBoard(scratch.gameTeams);
    };

    const finishGame = () => {
      clearInterval(scratch.timerHandle);
      const winner = scratch.gameTeams.slice().sort((a, b) => b.score - a.score)[0];
      document.getElementById("game-play").classList.add("hidden");
      gameEnd.classList.remove("hidden");
      document.getElementById("winner-name").textContent = winner.name;
      const summary = document.getElementById("game-summary");
      summary.innerHTML = `<thead><tr><th>Đội</th><th>Điểm</th></tr></thead><tbody>${scratch.gameTeams.map((t) => `<tr><td>${esc(t.name)}</td><td>${t.score}</td></tr>`).join("")}</tbody>`;
      playSfx("win");
    };

    document.getElementById("game-next").addEventListener("click", () => {
      document.getElementById("game-next").classList.add("hidden");
      scratch.turnIndex = (scratch.turnIndex + 1) % scratch.gameTeams.length;
      renderScoreBoard(scratch.gameTeams);
      showCurrentQuestion();
    });

    gameStart.addEventListener("click", startGame);
    gameRandom.addEventListener("click", () => {
      scratch.gameQuestions = shuffle((window.QUESTION_BANK || []).slice());
      scratch.totalGameQuestions = scratch.gameQuestions.length;
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
      list.innerHTML = custom.length ? custom.map((item, index) => `<div class="custom-item"><span>${index + 1}. ${esc(item.sentence)}</span><button class="btn ghost" type="button" data-remove-index="${index}">Xóa</button></div>`).join("") : "<p class='sub'>Chưa có câu hỏi tùy chỉnh nào.</p>";
      list.querySelectorAll("[data-remove-index]").forEach((button) => {
        button.addEventListener("click", () => {
          const idx = Number(button.dataset.removeIndex);
          const next = getCustomQuestions();
          next.splice(idx, 1);
          saveCustomQuestions(next);
          renderList();
          toast("Đã xóa câu hỏi");
        });
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
