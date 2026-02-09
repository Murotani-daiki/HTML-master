// ============================
// Wordle Game Engine
// ============================

class WordleGame {
    constructor() {
        this.WORD_LENGTH = 5;
        this.MAX_GUESSES = 6;
        this.currentRow = 0;
        this.currentCol = 0;
        this.gameOver = false;
        this.targetWord = '';
        this.guesses = [];
        this.evaluations = [];
        this.hardMode = false;
        this.darkMode = false;
        this.highContrast = false;

        this.init();
    }

    init() {
        this.loadSettings();
        this.selectWord();
        this.createBoard();
        this.bindEvents();
        this.loadStats();
        this.applyTheme();

        // Show help on first visit
        if (!localStorage.getItem('wordle_visited')) {
            setTimeout(() => this.showModal('helpModal'), 500);
            localStorage.setItem('wordle_visited', 'true');
        }
    }

    // ---- Word Selection ----
    selectWord() {
        // Daily mode: same word for everyone each day
        const today = new Date();
        const dateStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
        const savedGame = localStorage.getItem('wordle_daily');
        
        if (savedGame) {
            const parsed = JSON.parse(savedGame);
            if (parsed.date === dateStr && !parsed.forceNew) {
                this.targetWord = parsed.word.toUpperCase();
                this.restoreGame(parsed);
                return;
            }
        }

        // Pick word based on day index
        const epoch = new Date(2024, 0, 1);
        const dayIndex = Math.floor((today - epoch) / (1000 * 60 * 60 * 24));
        const wordIndex = dayIndex % UNIQUE_TARGETS.length;
        this.targetWord = UNIQUE_TARGETS[wordIndex].toUpperCase();
        
        this.saveGameState();
    }

    newGame() {
        // Random word for "New Game"
        const randomIndex = Math.floor(Math.random() * UNIQUE_TARGETS.length);
        this.targetWord = UNIQUE_TARGETS[randomIndex].toUpperCase();
        this.currentRow = 0;
        this.currentCol = 0;
        this.gameOver = false;
        this.guesses = [];
        this.evaluations = [];

        // Clear board
        const board = document.getElementById('board');
        board.innerHTML = '';
        this.createBoard();

        // Reset keyboard
        document.querySelectorAll('#keyboard button').forEach(btn => {
            btn.classList.remove('correct', 'present', 'absent');
            btn.removeAttribute('data-state');
        });

        // Force new game flag
        const today = new Date();
        const dateStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
        localStorage.setItem('wordle_daily', JSON.stringify({
            date: dateStr,
            word: this.targetWord,
            guesses: [],
            evaluations: [],
            gameOver: false,
            forceNew: true
        }));

        this.closeAllModals();
    }

    restoreGame(saved) {
        if (saved.guesses && saved.guesses.length > 0) {
            setTimeout(() => {
                saved.guesses.forEach((guess, rowIndex) => {
                    for (let col = 0; col < guess.length; col++) {
                        const tile = this.getTile(rowIndex, col);
                        tile.textContent = guess[col];
                        tile.classList.add('filled');
                    }
                    // Apply evaluations
                    if (saved.evaluations[rowIndex]) {
                        saved.evaluations[rowIndex].forEach((eval_, col) => {
                            const tile = this.getTile(rowIndex, col);
                            tile.classList.add(eval_, 'revealed');
                            // Update keyboard
                            this.updateKeyboard(guess[col], eval_);
                        });
                    }
                });
                this.currentRow = saved.guesses.length;
                this.guesses = saved.guesses;
                this.evaluations = saved.evaluations || [];

                if (saved.gameOver) {
                    this.gameOver = true;
                    setTimeout(() => {
                        const won = saved.guesses[saved.guesses.length - 1] === this.targetWord;
                        this.showGameOver(won);
                    }, 300);
                }
            }, 100);
        }
    }

    saveGameState() {
        const today = new Date();
        const dateStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
        localStorage.setItem('wordle_daily', JSON.stringify({
            date: dateStr,
            word: this.targetWord,
            guesses: this.guesses,
            evaluations: this.evaluations,
            gameOver: this.gameOver,
            forceNew: false
        }));
    }

    // ---- Board Creation ----
    createBoard() {
        const board = document.getElementById('board');
        for (let row = 0; row < this.MAX_GUESSES; row++) {
            const rowEl = document.createElement('div');
            rowEl.classList.add('row');
            for (let col = 0; col < this.WORD_LENGTH; col++) {
                const tile = document.createElement('div');
                tile.classList.add('tile');
                tile.setAttribute('data-row', row);
                tile.setAttribute('data-col', col);
                rowEl.appendChild(tile);
            }
            board.appendChild(rowEl);
        }
    }

    getTile(row, col) {
        return document.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
    }

    // ---- Input Handling ----
    bindEvents() {
        // Physical keyboard
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            if (document.querySelector('.modal:not(.hidden)') && e.key !== 'Escape') return;
            
            if (e.key === 'Escape') {
                this.closeAllModals();
                return;
            }

            if (e.key === 'Enter') {
                this.submitGuess();
            } else if (e.key === 'Backspace') {
                this.deleteLetter();
            } else if (/^[a-zA-Z]$/.test(e.key)) {
                this.addLetter(e.key.toUpperCase());
            }
        });

        // On-screen keyboard
        document.querySelectorAll('#keyboard button').forEach(btn => {
            btn.addEventListener('click', () => {
                const key = btn.getAttribute('data-key');
                if (key === 'ENTER') {
                    this.submitGuess();
                } else if (key === 'BACKSPACE') {
                    this.deleteLetter();
                } else {
                    this.addLetter(key);
                }
            });
        });

        // Modal buttons
        document.getElementById('helpBtn').addEventListener('click', () => this.showModal('helpModal'));
        document.getElementById('statsBtn').addEventListener('click', () => {
            this.updateStatsDisplay();
            this.showModal('statsModal');
        });
        document.getElementById('settingsBtn').addEventListener('click', () => this.showModal('settingsModal'));

        // Close modals
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => this.closeAllModals());
        });
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', () => this.closeAllModals());
        });

        // Settings toggles
        document.getElementById('darkModeToggle').addEventListener('change', (e) => {
            this.darkMode = e.target.checked;
            this.applyTheme();
            this.saveSettings();
        });
        document.getElementById('highContrastToggle').addEventListener('change', (e) => {
            this.highContrast = e.target.checked;
            this.applyTheme();
            this.saveSettings();
        });
        document.getElementById('hardModeToggle').addEventListener('change', (e) => {
            if (e.target.checked && this.currentRow > 0) {
                this.showToast('ゲーム中はハードモードに変更できません');
                e.target.checked = false;
                return;
            }
            this.hardMode = e.target.checked;
            this.saveSettings();
        });

        // Game over buttons
        document.getElementById('newGameBtn').addEventListener('click', () => this.newGame());
        document.getElementById('shareBtn').addEventListener('click', () => this.shareResult());
    }

    addLetter(letter) {
        if (this.gameOver || this.currentCol >= this.WORD_LENGTH) return;

        const tile = this.getTile(this.currentRow, this.currentCol);
        tile.textContent = letter;
        tile.classList.add('filled');
        tile.classList.add('pop');
        setTimeout(() => tile.classList.remove('pop'), 100);

        this.currentCol++;
    }

    deleteLetter() {
        if (this.gameOver || this.currentCol <= 0) return;

        this.currentCol--;
        const tile = this.getTile(this.currentRow, this.currentCol);
        tile.textContent = '';
        tile.classList.remove('filled');
    }

    // ---- Guess Submission ----
    submitGuess() {
        if (this.gameOver) return;

        if (this.currentCol < this.WORD_LENGTH) {
            this.shakeRow();
            this.showToast('文字が足りません');
            return;
        }

        // Build the guess word
        let guess = '';
        for (let col = 0; col < this.WORD_LENGTH; col++) {
            guess += this.getTile(this.currentRow, col).textContent;
        }

        // Validate word
        if (!ALL_VALID_WORDS.has(guess)) {
            this.shakeRow();
            this.showToast('単語リストにありません');
            return;
        }

        // Hard mode validation
        if (this.hardMode && this.currentRow > 0) {
            const violation = this.checkHardMode(guess);
            if (violation) {
                this.shakeRow();
                this.showToast(violation);
                return;
            }
        }

        // Evaluate guess
        const evaluation = this.evaluate(guess);
        this.guesses.push(guess);
        this.evaluations.push(evaluation);

        // Animate reveal
        this.revealRow(this.currentRow, evaluation, guess);

        const won = guess === this.targetWord;
        const lost = !won && this.currentRow === this.MAX_GUESSES - 1;

        this.currentRow++;
        this.currentCol = 0;

        // After animation
        const animDelay = this.WORD_LENGTH * 300 + 400;
        setTimeout(() => {
            if (won) {
                this.gameOver = true;
                this.bounceRow(this.currentRow - 1);
                const messages = ['天才！', '素晴らしい！', 'お見事！', 'よくやった！', 'ギリギリ！', '際どい！'];
                this.showToast(messages[Math.min(this.currentRow - 1, messages.length - 1)]);
                setTimeout(() => {
                    this.updateStats(true, this.currentRow);
                    this.showGameOver(true);
                }, 1500);
            } else if (lost) {
                this.gameOver = true;
                this.showToast(this.targetWord, 3000);
                setTimeout(() => {
                    this.updateStats(false, 0);
                    this.showGameOver(false);
                }, 2000);
            }
            this.saveGameState();
        }, animDelay);
    }

    evaluate(guess) {
        const result = new Array(this.WORD_LENGTH).fill('absent');
        const targetArr = this.targetWord.split('');
        const guessArr = guess.split('');
        const used = new Array(this.WORD_LENGTH).fill(false);

        // First pass: correct positions
        for (let i = 0; i < this.WORD_LENGTH; i++) {
            if (guessArr[i] === targetArr[i]) {
                result[i] = 'correct';
                used[i] = true;
                guessArr[i] = null;
            }
        }

        // Second pass: wrong position
        for (let i = 0; i < this.WORD_LENGTH; i++) {
            if (guessArr[i] === null) continue;
            for (let j = 0; j < this.WORD_LENGTH; j++) {
                if (!used[j] && guessArr[i] === targetArr[j]) {
                    result[i] = 'present';
                    used[j] = true;
                    break;
                }
            }
        }

        return result;
    }

    checkHardMode(guess) {
        const prevGuess = this.guesses[this.guesses.length - 1];
        const prevEval = this.evaluations[this.evaluations.length - 1];

        for (let i = 0; i < this.WORD_LENGTH; i++) {
            if (prevEval[i] === 'correct') {
                if (guess[i] !== prevGuess[i]) {
                    return `${i + 1}番目は「${prevGuess[i]}」でなければなりません`;
                }
            }
        }

        for (let i = 0; i < this.WORD_LENGTH; i++) {
            if (prevEval[i] === 'present') {
                if (!guess.includes(prevGuess[i])) {
                    return `「${prevGuess[i]}」を含める必要があります`;
                }
            }
        }

        return null;
    }

    // ---- Animations ----
    revealRow(row, evaluation, guess) {
        for (let col = 0; col < this.WORD_LENGTH; col++) {
            const tile = this.getTile(row, col);
            setTimeout(() => {
                tile.classList.add('flip');
                setTimeout(() => {
                    tile.classList.add(evaluation[col], 'revealed');
                    this.updateKeyboard(guess[col], evaluation[col]);
                }, 250);
            }, col * 300);
        }
    }

    shakeRow() {
        const row = document.querySelectorAll('.row')[this.currentRow];
        row.classList.add('shake');
        setTimeout(() => row.classList.remove('shake'), 600);
    }

    bounceRow(row) {
        const tiles = document.querySelectorAll(`.tile[data-row="${row}"]`);
        tiles.forEach((tile, i) => {
            setTimeout(() => {
                tile.classList.add('bounce');
            }, i * 100);
        });
    }

    // ---- Keyboard ----
    updateKeyboard(letter, state) {
        const btn = document.querySelector(`#keyboard button[data-key="${letter}"]`);
        if (!btn) return;

        const currentState = btn.getAttribute('data-state');
        const priority = { 'correct': 3, 'present': 2, 'absent': 1 };

        if (!currentState || priority[state] > (priority[currentState] || 0)) {
            btn.classList.remove('correct', 'present', 'absent');
            btn.classList.add(state);
            btn.setAttribute('data-state', state);
        }
    }

    // ---- Toast ----
    showToast(message, duration = 1500) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.classList.add('toast');
        toast.textContent = message;
        container.prepend(toast);

        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    // ---- Modals ----
    showModal(id) {
        document.getElementById(id).classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
        document.body.style.overflow = '';
    }

    // ---- Game Over ----
    showGameOver(won) {
        const icon = document.getElementById('gameOverIcon');
        const title = document.getElementById('gameOverTitle');
        const msg = document.getElementById('gameOverMessage');
        const answerWord = document.getElementById('answerWord');
        const googleLink = document.getElementById('googleSearchLink');

        if (won) {
            icon.innerHTML = '<i class="fas fa-trophy" style="color: #f5b731; font-size: 3rem;"></i>';
            title.textContent = '🎉 正解！';
            msg.textContent = `${this.currentRow}回目で正解しました！`;
        } else {
            icon.innerHTML = '<i class="fas fa-face-sad-tear" style="color: #888; font-size: 3rem;"></i>';
            title.textContent = '残念…';
            msg.textContent = '次回はきっとうまくいきます！';
        }

        answerWord.textContent = this.targetWord;
        
        // Google search link for the answer word's meaning
        const searchQuery = encodeURIComponent(`${this.targetWord.toLowerCase()} meaning`);
        googleLink.href = `https://www.google.com/search?q=${searchQuery}`;

        this.updateStatsDisplay();
        this.showModal('gameOverModal');
    }

    // ---- Statistics ----
    loadStats() {
        const saved = localStorage.getItem('wordle_stats');
        if (saved) {
            this.stats = JSON.parse(saved);
        } else {
            this.stats = {
                played: 0,
                wins: 0,
                currentStreak: 0,
                maxStreak: 0,
                distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
            };
        }
    }

    updateStats(won, guessCount) {
        this.stats.played++;
        if (won) {
            this.stats.wins++;
            this.stats.currentStreak++;
            this.stats.maxStreak = Math.max(this.stats.maxStreak, this.stats.currentStreak);
            this.stats.distribution[guessCount]++;
        } else {
            this.stats.currentStreak = 0;
        }
        localStorage.setItem('wordle_stats', JSON.stringify(this.stats));
    }

    updateStatsDisplay() {
        document.getElementById('stat-played').textContent = this.stats.played;
        document.getElementById('stat-win-pct').textContent = 
            this.stats.played > 0 ? Math.round((this.stats.wins / this.stats.played) * 100) : 0;
        document.getElementById('stat-streak').textContent = this.stats.currentStreak;
        document.getElementById('stat-max-streak').textContent = this.stats.maxStreak;

        // Distribution
        const distEl = document.getElementById('guess-distribution');
        distEl.innerHTML = '';
        const maxCount = Math.max(...Object.values(this.stats.distribution), 1);

        for (let i = 1; i <= 6; i++) {
            const count = this.stats.distribution[i] || 0;
            const pct = Math.max((count / maxCount) * 100, 8);
            const row = document.createElement('div');
            row.classList.add('dist-row');
            
            const isCurrentGuess = this.gameOver && 
                this.guesses.length === i && 
                this.guesses[this.guesses.length - 1] === this.targetWord;

            row.innerHTML = `
                <span class="dist-label">${i}</span>
                <div class="dist-bar-container">
                    <div class="dist-bar ${isCurrentGuess ? 'highlight' : ''}" style="width: ${pct}%">
                        ${count}
                    </div>
                </div>
            `;
            distEl.appendChild(row);
        }
    }

    // ---- Share ----
    shareResult() {
        const emojiMap = {
            'correct': this.highContrast ? '🟧' : '🟩',
            'present': this.highContrast ? '🟦' : '🟨',
            'absent': '⬛'
        };

        let text = `Wordle ${this.guesses.length > 0 && this.guesses[this.guesses.length - 1] === this.targetWord ? this.guesses.length : 'X'}/6\n\n`;

        this.evaluations.forEach(eval_ => {
            text += eval_.map(e => emojiMap[e]).join('') + '\n';
        });

        if (navigator.clipboard) {
            navigator.clipboard.writeText(text.trim()).then(() => {
                this.showToast('結果をコピーしました！');
            });
        } else {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = text.trim();
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            textarea.remove();
            this.showToast('結果をコピーしました！');
        }
    }

    // ---- Settings ----
    loadSettings() {
        const saved = localStorage.getItem('wordle_settings');
        if (saved) {
            const s = JSON.parse(saved);
            this.darkMode = s.darkMode || false;
            this.highContrast = s.highContrast || false;
            this.hardMode = s.hardMode || false;
        }
        document.getElementById('darkModeToggle').checked = this.darkMode;
        document.getElementById('highContrastToggle').checked = this.highContrast;
        document.getElementById('hardModeToggle').checked = this.hardMode;
    }

    saveSettings() {
        localStorage.setItem('wordle_settings', JSON.stringify({
            darkMode: this.darkMode,
            highContrast: this.highContrast,
            hardMode: this.hardMode
        }));
    }

    applyTheme() {
        document.body.classList.toggle('dark', this.darkMode);
        document.body.classList.toggle('high-contrast', this.highContrast);
    }
}

// Start the game
document.addEventListener('DOMContentLoaded', () => {
    window.game = new WordleGame();
});
