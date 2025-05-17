// ----- Flashcard Data Handling -----
let flashcards = JSON.parse(localStorage.getItem('flashcards') || '[]');
let reviewQueue = [];
let currentCard = null;
let stats = {
  total: flashcards.length,
  reviewedToday: 0,
  correct: 0,
  attempts: 0
};

// ----- Utility Functions -----
function saveFlashcards() {
  localStorage.setItem('flashcards', JSON.stringify(flashcards));
}
function updateStats() {
  document.getElementById('total-cards').textContent = flashcards.length;
  document.getElementById('cards-reviewed').textContent = stats.reviewedToday;
  let accuracy = stats.attempts ? Math.round((stats.correct / stats.attempts) * 100) : 0;
  document.getElementById('accuracy').textContent = accuracy + '%';
}

// ----- Flashcard Creation -----
document.getElementById('flashcard-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const question = document.getElementById('question').value.trim();
  const answer = document.getElementById('answer').value.trim();
  if (!question || !answer) return;

  flashcards.push({
    question,
    answer,
    lastReviewed: 0,
    interval: 1, // days until next review
    due: Date.now()
  });
  saveFlashcards();
  this.reset();
  stats.total = flashcards.length;
  updateStats();
  setupReview();
});

// ----- Spaced Repetition Logic -----
function setupReview() {
  // Show only cards due for review
  reviewQueue = flashcards.filter(card => Date.now() >= card.due);
  if (reviewQueue.length === 0) {
    document.getElementById('flashcard').style.display = 'none';
    document.getElementById('review-controls').style.display = 'none';
    document.getElementById('no-cards').style.display = 'block';
    return;
  }
  document.getElementById('no-cards').style.display = 'none';
  showNextCard();
}

function showNextCard() {
  if (reviewQueue.length === 0) {
    setupReview();
    return;
  }
  currentCard = reviewQueue.shift();
  document.getElementById('flashcard').style.display = 'block';
  document.getElementById('review-controls').style.display = 'block';
  document.getElementById('card-front').textContent = currentCard.question;
  document.getElementById('card-back').style.display = 'none';
}

document.getElementById('show-answer').onclick = function() {
  document.getElementById('card-back').textContent = currentCard.answer;
  document.getElementById('card-back').style.display = 'block';
};

function rateCard(difficulty) {
  // Simple SM-2-like logic
  let now = Date.now();
  if (difficulty === 'easy') {
    currentCard.interval *= 2;
    stats.correct++;
  } else if (difficulty === 'medium') {
    currentCard.interval = Math.max(1, Math.floor(currentCard.interval * 1.2));
    stats.correct += 0.5;
  } else { // hard
    currentCard.interval = 1;
  }
  currentCard.lastReviewed = now;
  currentCard.due = now + currentCard.interval * 24 * 60 * 60 * 1000; // next due date
  stats.reviewedToday++;
  stats.attempts++;
  saveFlashcards();
  updateStats();
  setupReview();
}

document.getElementById('easy').onclick = () => rateCard('easy');
document.getElementById('medium').onclick = () => rateCard('medium');
document.getElementById('hard').onclick = () => rateCard('hard');

// ----- Initial Load -----
updateStats();
setupReview();
