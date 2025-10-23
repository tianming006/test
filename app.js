const wordBank = [
  { word: "abandon", definition: "to give up completely", example: "The sailors had to abandon the sinking ship." },
  { word: "benevolent", definition: "well meaning and kindly", example: "She was known for her benevolent nature." },
  { word: "coherent", definition: "logical and consistent", example: "The professor delivered a coherent lecture." },
  { word: "diligent", definition: "showing care in one's work", example: "He is a diligent student who studies every day." },
  { word: "eloquent", definition: "fluent or persuasive in speaking", example: "Her speech was both eloquent and moving." },
  { word: "foster", definition: "to encourage or promote", example: "Group projects foster collaboration among classmates." },
  { word: "gratify", definition: "to give pleasure or satisfaction", example: "Positive feedback will gratify the team." },
  { word: "hypothesis", definition: "a proposed explanation", example: "The scientist tested her hypothesis in the lab." },
  { word: "innovate", definition: "to introduce something new", example: "Startups try to innovate rapidly." },
  { word: "jubilant", definition: "feeling great joy", example: "The fans were jubilant after the victory." },
  { word: "keen", definition: "having a sharp edge or intellect", example: "She has a keen eye for detail." },
  { word: "lucid", definition: "expressed clearly", example: "His instructions were concise and lucid." }
];

const elements = {
  flashcardWord: document.getElementById("flashcard-word"),
  flashcardDetail: document.getElementById("flashcard-detail"),
  flashcard: document.getElementById("flashcard"),
  toggleDetail: document.getElementById("toggle-detail"),
  prevWord: document.getElementById("prev-word"),
  nextWord: document.getElementById("next-word"),
  markKnown: document.getElementById("mark-known"),
  markReview: document.getElementById("mark-review"),
  totalWords: document.getElementById("total-words"),
  knownWords: document.getElementById("known-words"),
  reviewWords: document.getElementById("review-words"),
  masteryBar: document.getElementById("mastery-bar"),
  reviewBar: document.getElementById("review-bar"),
  quizQuestion: document.getElementById("quiz-question"),
  quizOptions: document.getElementById("quiz-options"),
  quizFeedback: document.getElementById("quiz-feedback"),
  nextQuestion: document.getElementById("next-question"),
  quizCount: document.getElementById("quiz-count"),
  quizCorrect: document.getElementById("quiz-correct"),
  quizAccuracy: document.getElementById("quiz-accuracy"),
  quizHistory: document.getElementById("quiz-history")
};

let currentIndex = 0;
let detailVisible = false;
const state = loadState();
state.known = new Set(state.known ?? []);
state.review = new Set(state.review ?? []);

const quizState = {
  total: state.quizTotal ?? 0,
  correct: state.quizCorrect ?? 0,
  history: state.quizHistory ?? []
};

updateFlashcard();
updateProgress();
renderQuizHistory();
prepareQuizQuestion();

registerFlashcardEvents();
registerQuizEvents();

function registerFlashcardEvents() {
  elements.toggleDetail.addEventListener("click", toggleDetailVisibility);
  elements.flashcard.addEventListener("click", toggleDetailVisibility);
  elements.flashcard.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleDetailVisibility();
    }
  });

  elements.prevWord.addEventListener("click", () => navigateWord(-1));
  elements.nextWord.addEventListener("click", () => navigateWord(1));
  elements.markKnown.addEventListener("click", () => markWord("known"));
  elements.markReview.addEventListener("click", () => markWord("review"));
}

function registerQuizEvents() {
  elements.nextQuestion.addEventListener("click", () => {
    elements.nextQuestion.disabled = true;
    prepareQuizQuestion();
  });
}

function loadState() {
  try {
    const saved = localStorage.getItem("wordStudyState");
    if (!saved) return { known: [], review: [] };
    const parsed = JSON.parse(saved);
    return {
      known: parsed.known ?? [],
      review: parsed.review ?? [],
      quizTotal: parsed.quizTotal ?? 0,
      quizCorrect: parsed.quizCorrect ?? 0,
      quizHistory: parsed.quizHistory ?? []
    };
  } catch (error) {
    console.warn("无法从本地存储恢复进度", error);
    return { known: [], review: [] };
  }
}

function saveState() {
  const payload = {
    known: Array.from(state.known ?? []),
    review: Array.from(state.review ?? []),
    quizTotal: quizState.total,
    quizCorrect: quizState.correct,
    quizHistory: quizState.history
  };
  localStorage.setItem("wordStudyState", JSON.stringify(payload));
}

function updateFlashcard() {
  const currentWord = wordBank[currentIndex];
  elements.flashcardWord.textContent = currentWord.word;
  elements.flashcardDetail.innerHTML = `释义：${currentWord.definition}<br><span class="flashcard__example">例句：${currentWord.example}</span>`;
  detailVisible = false;
  elements.flashcardDetail.classList.remove("flashcard__detail--visible");
  elements.toggleDetail.textContent = "显示释义";
}

function toggleDetailVisibility() {
  detailVisible = !detailVisible;
  elements.flashcardDetail.classList.toggle("flashcard__detail--visible", detailVisible);
  elements.toggleDetail.textContent = detailVisible ? "隐藏释义" : "显示释义";
}

function navigateWord(step) {
  currentIndex = (currentIndex + step + wordBank.length) % wordBank.length;
  updateFlashcard();
}

function markWord(type) {
  if (!state.known) state.known = new Set();
  if (!state.review) state.review = new Set();

  if (type === "known") {
    state.known.add(currentIndex);
    state.review.delete(currentIndex);
  } else {
    state.review.add(currentIndex);
    state.known.delete(currentIndex);
  }

  updateProgress();
  saveState();
  navigateWord(1);
}

function updateProgress() {
  const knownSet = state.known instanceof Set ? state.known : new Set(state.known ?? []);
  const reviewSet = state.review instanceof Set ? state.review : new Set(state.review ?? []);

  state.known = knownSet;
  state.review = reviewSet;

  const total = wordBank.length;
  const known = knownSet.size;
  const review = reviewSet.size;

  elements.totalWords.textContent = total;
  elements.knownWords.textContent = known;
  elements.reviewWords.textContent = review;

  const masteryPercent = total === 0 ? 0 : Math.round((known / total) * 100);
  const reviewPercent = total === 0 ? 0 : Math.round((review / total) * 100);

  elements.masteryBar.style.width = `${masteryPercent}%`;
  elements.reviewBar.style.width = `${reviewPercent}%`;
}

function prepareQuizQuestion() {
  elements.nextQuestion.disabled = true;
  const questionIndex = Math.floor(Math.random() * wordBank.length);
  const correctWord = wordBank[questionIndex];
  const distractors = generateDistractors(questionIndex);
  const options = shuffle([correctWord, ...distractors]);

  elements.quizQuestion.textContent = `释义：${correctWord.definition}`;
  elements.quizOptions.innerHTML = "";
  elements.quizFeedback.textContent = "请选择答案";

  options.forEach((option) => {
    const button = document.createElement("button");
    button.className = "quiz-option";
    button.textContent = option.word;
    button.addEventListener("click", () => handleQuizAnswer(button, option.word === correctWord.word, correctWord.word));
    elements.quizOptions.appendChild(button);
  });
}

function generateDistractors(correctIndex) {
  const pool = wordBank.filter((_, index) => index !== correctIndex);
  const shuffled = shuffle(pool).slice(0, 3);
  return shuffled;
}

function handleQuizAnswer(button, isCorrect, correctWord) {
  if (elements.nextQuestion.disabled === false) return;

  Array.from(elements.quizOptions.children).forEach((child) => {
    child.disabled = true;
  });

  elements.nextQuestion.disabled = false;
  quizState.total += 1;

  if (isCorrect) {
    button.classList.add("correct");
    elements.quizFeedback.textContent = "做得好！回答正确。";
    quizState.correct += 1;
  } else {
    button.classList.add("incorrect");
    const correctButton = Array.from(elements.quizOptions.children).find((child) => child.textContent === correctWord);
    if (correctButton) correctButton.classList.add("correct");
    elements.quizFeedback.textContent = `正确答案是：${correctWord}`;
  }

  updateQuizSummary();
  appendQuizHistory(isCorrect);
  saveState();
}

function updateQuizSummary() {
  elements.quizCount.textContent = quizState.total;
  elements.quizCorrect.textContent = quizState.correct;
  const accuracy = quizState.total === 0 ? 0 : Math.round((quizState.correct / quizState.total) * 100);
  elements.quizAccuracy.textContent = `${accuracy}%`;
}

function appendQuizHistory(isCorrect) {
  const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  quizState.history.unshift({
    time: timestamp,
    correct: isCorrect
  });
  quizState.history = quizState.history.slice(0, 10);
  renderQuizHistory();
}

function renderQuizHistory() {
  elements.quizHistory.innerHTML = "";
  quizState.history.forEach((item, index) => {
    const li = document.createElement("li");
    const questionNumber = quizState.total - index;
    li.innerHTML = `<span>第${questionNumber > 0 ? questionNumber : 1}题</span><span>${item.correct ? "✅ 正确" : "❌ 错误"} · ${item.time}</span>`;
    elements.quizHistory.appendChild(li);
  });
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

updateQuizSummary();

window.addEventListener("beforeunload", saveState);
