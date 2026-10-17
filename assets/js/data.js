window.QUESTION_BANK = [
  { type: "hunt", tense: "simple", signal: "every day", sentence: "She reads books every day.", options: ["every day", "reads", "books", "She"], answer: 0 },
  { type: "hunt", tense: "cont", signal: "now", sentence: "They are playing football now.", options: ["playing", "football", "now", "They"], answer: 2 },
  { type: "hunt", tense: "simple", signal: "always", sentence: "He always gets up early.", options: ["gets up", "He", "early", "always"], answer: 3 },
  { type: "hunt", tense: "cont", signal: "Look!", sentence: "Look! The baby is crying.", options: ["Look!", "baby", "crying", "The"], answer: 0 },

  { type: "classify", tense: "simple", signal: "every morning", sentence: "He brushes his teeth every morning.", options: ["Thói quen (Hiện tại đơn)", "Đang diễn ra (Hiện tại tiếp diễn)"], answer: 0 },
  { type: "classify", tense: "cont", signal: "now", sentence: "She is drawing a cat now.", options: ["Thói quen (Hiện tại đơn)", "Đang diễn ra (Hiện tại tiếp diễn)"], answer: 1 },

  { type: "choose", tense: "cont", signal: "now", sentence: "She ___ a book now.", options: ["is reading", "reads", "read", "reading"], answer: 0 },
  { type: "choose", tense: "simple", signal: "every Sunday", sentence: "He ___ football every Sunday.", options: ["is playing", "plays", "play", "playing"], answer: 1 },

  { type: "conjugate", tense: "simple", signal: "every day", sentence: "She (read) ___ books every day.", verb: "read", options: ["read", "reads", "is reading", "reading"], answer: 1 },
  { type: "conjugate", tense: "cont", signal: "now", sentence: "He (play) ___ football now.", verb: "play", options: ["plays", "play", "is playing", "playing"], answer: 2 },

  { type: "arrange", tense: "cont", signal: "now", words: ["She", "is", "dancing", "now."], sentence: "She is dancing now." },
  { type: "arrange", tense: "simple", signal: "every Sunday", words: ["He", "plays", "football", "every Sunday."], sentence: "He plays football every Sunday." },

  { type: "fix", tense: "simple", signal: "every day", wrong: "She play football every day.", correct: "She plays football every day.", options: ["She plays football every day.", "She play football every day.", "She is play football every day."] },

  { type: "picture", tense: "cont", signal: "now", sentence: "(Hình) The boy is swimming.", scene: "<svg width='300' height='200' viewBox='0 0 300 200' xmlns='http://www.w3.org/2000/svg'><rect width='300' height='200' fill='#bae6fd'/><path d='M0 140 Q50 120 100 140 T300 140 V200 H0 Z' fill='#38bdf8'/><circle cx='180' cy='60' r='20' fill='#fcd7b0'/><path d='M160 80 q20 28 40 0' stroke='#000' stroke-width='3' fill='none'/></svg>", options: ["He is swimming.", "He swims.", "He swim.", "He is swim."], answer: 0 },

  { type: "listen", tense: "cont", signal: "now", sentence: "(Nghe) She is reading a book now.", audioText: "She is reading a book now.", options: ["She is reading a book now.", "She reads a book now.", "She read a book now."] , answer: 0 }
];

window.SIGNAL_DEMO = {
  simple: [
    ["always", "She always smiles at her teacher."],
    ["usually", "He usually walks to school."],
    ["often", "We often play football in the park."],
    ["every day", "I brush my teeth every day."],
    ["on Sundays", "We visit Grandma on Sundays."]
  ],
  cont: [
    ["now", "She is doing her homework now."],
    ["right now", "They are playing chess right now."],
    ["Look!", "Look! The baby is walking."],
    ["Listen!", "Listen! Someone is singing."],
    ["at the moment", "Mum is cooking at the moment."]
  ]
};

window.FLASHCARDS = [
  { s: "She plays the piano every day.", tense: "simple", signal: "every day", struct: "She + plays (V-s)" },
  { s: "Look! The dog is running fast.", tense: "cont", signal: "Look!", struct: "The dog + is + running" },
  { s: "They go to school by bus every morning.", tense: "simple", signal: "every morning", struct: "They + go (V nguyên thể)" },
  { s: "I am reading a funny story now.", tense: "cont", signal: "now", struct: "I + am + reading" },
  { s: "He never eats vegetables.", tense: "simple", signal: "never", struct: "He + eats (V-s)" }
];
