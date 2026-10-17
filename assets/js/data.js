window.QUESTION_BANK = [
  { type: "hunt", tense: "simple", signal: "every day", sentence: "She reads books every day.", options: ["every day", "reads", "books", "She"], answer: 0 },
  { type: "hunt", tense: "cont", signal: "now", sentence: "They are playing football now.", options: ["playing", "football", "now", "They"], answer: 2 },
  { type: "hunt", tense: "simple", signal: "always", sentence: "He always gets up early.", options: ["gets up", "He", "early", "always"], answer: 3 },
  { type: "hunt", tense: "cont", signal: "Look!", sentence: "Look! The baby is crying.", options: ["Look!", "baby", "crying", "The"], answer: 0 },

  { type: "classify", tense: "simple", signal: "every morning", sentence: "He brushes his teeth every morning.", options: ["Thói quen (Hiện tại đơn)", "Đang diễn ra (Hiện tại tiếp diễn)"], answer: 0 },
  { type: "classify", tense: "cont", signal: "now", sentence: "She is drawing a cat now.", options: ["Thói quen (Hiện tại đơn)", "Đang diễn ra (Hiện tại tiếp diễn)"], answer: 1 },

  { type: "choose", tense: "cont", signal: "now", sentence: "She ___ a book now.", options: ["is reading", "reads", "read", "reading"], answer: 0 },
  { type: "choose", tense: "simple", signal: "every Sunday", sentence: "He ___ football every Sunday.", options: ["is playing", "plays", "play", "playing"], answer: 1 },
  { type: "choose", tense: "simple", signal: "usually", sentence: "My father ___ to work by car.", options: ["go", "goes", "is going", "going"], answer: 1 },
  { type: "choose", tense: "cont", signal: "at the moment", sentence: "We ___ dinner at the moment.", options: ["have", "are having", "is having", "having"], answer: 1 },

  { type: "conjugate", tense: "simple", signal: "every day", sentence: "She (read) ___ books every day.", verb: "read", options: ["read", "reads", "is reading", "reading"], answer: 1 },
  { type: "conjugate", tense: "cont", signal: "now", sentence: "He (play) ___ football now.", verb: "play", options: ["plays", "play", "is playing", "playing"], answer: 2 },
  { type: "conjugate", tense: "simple", signal: "never", sentence: "He (eat) ___ vegetables.", verb: "eat", options: ["eats", "eat", "is eating", "eating"], answer: 0 },

  { type: "arrange", tense: "cont", signal: "now", words: ["She", "is", "dancing", "now."], sentence: "She is dancing now." },
  { type: "arrange", tense: "simple", signal: "every Sunday", words: ["He", "plays", "football", "every Sunday."], sentence: "He plays football every Sunday." },
  { type: "arrange", tense: "simple", signal: "usually", words: ["They", "go", "to", "school", "by", "bus."], sentence: "They go to school by bus." },
  { type: "arrange", tense: "cont", signal: "right now", words: ["The", "dog", "is", "running", "right", "now."], sentence: "The dog is running right now." },

  { type: "fix", tense: "simple", signal: "every day", wrong: "She play football every day.", correct: "She plays football every day.", options: ["She plays football every day.", "She play football every day.", "She playing football every day.", "She is play football every day."] },
  { type: "fix", tense: "cont", signal: "now", wrong: "They playing now.", correct: "They are playing now.", options: ["They are playing now.", "They playing now.", "They plays now.", "They play now."] },

  { type: "picture", tense: "cont", signal: "now", sentence: "(Hình) The boy is swimming.", scene: "<svg width='300' height='120' viewBox='0 0 300 120' xmlns='http://www.w3.org/2000/svg'><rect width='300' height='120' fill='#d0f0fd'/><g fill='#2b8cbe'><circle cx='70' cy='70' r='18'/><rect x='80' y='80' width='100' height='10' fill='#2b8cbe'/></g><text x='150' y='30' font-size='14' text-anchor='middle' fill='#034f84'>Swimming</text></svg>", options: ["The boy is swimming.", "The boy swims.", "The boy is swim.", "The boy swimming."], answer: 0 },

  { type: "listen", tense: "cont", signal: "now", sentence: "(Nghe) She is reading a book now.", audioText: "She is reading a book now.", options: ["She is reading a book now.", "She reads a book every day.", "She read a book now.", "She reading a book now."], answer: 0 },
  { type: "listen", tense: "simple", signal: "every morning", sentence: "(Nghe) He brushes his teeth every morning.", audioText: "He brushes his teeth every morning.", options: ["He brushes his teeth every morning.", "He brush his teeth every morning.", "He is brushing his teeth every morning.", "He brushes his teeth now."], answer: 0 },

  { type: "choose", tense: "simple", signal: "usually", sentence: "My sister ___ to school by bike.", options: ["go", "goes", "is going", "going"], answer: 1 },
  { type: "choose", tense: "cont", signal: "at the moment", sentence: "I ___ my homework at the moment.", options: ["do", "does", "am doing", "doing"], answer: 2 },
  { type: "choose", tense: "simple", signal: "often", sentence: "They ___ pizza on Fridays.", options: ["eat", "eats", "are eating", "eating"], answer: 0 },
  { type: "choose", tense: "cont", signal: "right now", sentence: "She ___ TV right now.", options: ["watch", "watches", "is watching", "watching"], answer: 2 },

  { type: "conjugate", tense: "simple", signal: "every week", sentence: "Tom (go) ___ to piano class every week.", verb: "go", options: ["go", "goes", "is going", "gone"], answer: 1 },
  { type: "conjugate", tense: "cont", signal: "now", sentence: "Mum (cook) ___ dinner now.", verb: "cook", options: ["cooks", "cook", "is cooking", "cooking"], answer: 2 },
  { type: "conjugate", tense: "simple", signal: "never", sentence: "She (watch) ___ horror movies.", verb: "watch", options: ["watches", "watch", "is watching", "watching"], answer: 0 },

  { type: "arrange", tense: "simple", signal: "every day", words: ["I", "go", "to", "school", "every", "day."], sentence: "I go to school every day." },
  { type: "arrange", tense: "cont", signal: "now", words: ["They", "are", "having", "lunch", "now."], sentence: "They are having lunch now." },

  { type: "fix", tense: "simple", signal: "every day", wrong: "He go to school every day.", correct: "He goes to school every day.", options: ["He goes to school every day.", "He go to school every day.", "He going to school every day.", "He is go to school every day."] },
  { type: "fix", tense: "cont", signal: "now", wrong: "She is read a book now.", correct: "She is reading a book now.", options: ["She is reading a book now.", "She reads a book now.", "She reading a book now.", "She is read book now."] },

  { type: "picture", tense: "simple", signal: "every morning", sentence: "(Hình) He brushes his teeth.", scene: "<svg width='300' height='120' viewBox='0 0 300 120' xmlns='http://www.w3.org/2000/svg'><rect width='300' height='120' fill='#fff6d6'/><text x='150' y='60' font-size='16' text-anchor='middle' fill='#9c5a00'>Brushing teeth</text></svg>", options: ["He brushes his teeth.", "He is brushing his teeth.", "He brush his teeth.", "He brushing his teeth."], answer: 0 },

  { type: "listen", tense: "simple", signal: "every Sunday", sentence: "(Nghe) We visit Grandma on Sundays.", audioText: "We visit Grandma on Sundays.", options: ["We visit Grandma on Sundays.", "We are visiting Grandma on Sundays.", "We visits Grandma on Sundays.", "We visited Grandma on Sundays."], answer: 0 },

  { type: "classify", tense: "simple", signal: "always", sentence: "He always helps his mother.", options: ["Hiện tại đơn", "Hiện tại tiếp diễn"], answer: 0 },
  { type: "classify", tense: "cont", signal: "Listen!", sentence: "Listen! Someone is playing the piano.", options: ["Hiện tại đơn", "Hiện tại tiếp diễn"], answer: 1 },

  { type: "hunt", tense: "simple", signal: "often", sentence: "I often visit my uncle.", options: ["I", "visit", "often", "uncle"], answer: 2 },
  { type: "hunt", tense: "cont", signal: "at the moment", sentence: "The students are studying at the moment.", options: ["students", "are studying", "at the moment", "The"], answer: 2 }
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
