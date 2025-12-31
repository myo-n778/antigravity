/**
 * Quiz Invaders - Retro Game
 */

const CONFIG = {
    LOCAL_CSV: './questions.csv',
    INVADER_SPEED: 0.8,
    SPAWN_INTERVAL: 2000,
    MAX_LIVES: 3
};

class Game {
    constructor() {
        this.questions = [];
        this.activeQuestions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.lives = CONFIG.MAX_LIVES;
        this.invaders = [];
        this.isRunning = false;
        this.animationId = null;
        this.uploadedData = null;
        this.questionLimit = 5;
        this.correctCount = 0;

        // DOM elements
        this.ui = {
            score: document.getElementById('score'),
            lives: document.getElementById('lives'),
            questionText: document.getElementById('question-text'),
            gameWorld: document.getElementById('game-world'),
            startScreen: document.getElementById('start-screen'),
            gameOverScreen: document.getElementById('game-over-screen'),
            finalScore: document.getElementById('final-score'),
            startBtn: document.getElementById('start-btn'),
            restartBtn: document.getElementById('restart-btn'),
            csvUpload: document.getElementById('csv-upload'),
            uploadLabel: document.getElementById('upload-label'),
            limitBtns: document.querySelectorAll('.limit-btn'),
            abortBtn: document.getElementById('abort-btn'),
            feedbackOverlay: document.getElementById('feedback-overlay'),
            rankLetter: document.getElementById('rank-letter')
        };

        this.initEvents();
    }

    initEvents() {
        this.ui.startBtn.addEventListener('click', () => this.startRequested());
        this.ui.restartBtn.addEventListener('click', () => this.resetToStart());
        this.ui.abortBtn.addEventListener('click', () => this.resetToStart());
        this.ui.csvUpload.addEventListener('change', (e) => this.handleFileUpload(e));

        this.ui.limitBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.ui.limitBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.questionLimit = parseInt(btn.dataset.limit);
            });
        });
    }

    handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            this.uploadedData = event.target.result;
            this.ui.uploadLabel.textContent = '✅ FILE LOADED';
            this.ui.uploadLabel.classList.add('loaded');
        };
        reader.readAsText(file);
    }

    async fetchQuestions() {
        if (this.uploadedData) {
            this.parseCSV(this.uploadedData);
            return true;
        }

        try {
            const response = await fetch(CONFIG.LOCAL_CSV + '?t=' + Date.now());
            if (!response.ok) throw new Error('Could not find questions.csv');
            const data = await response.text();
            this.parseCSV(data);
            return true;
        } catch (error) {
            console.warn('Auto-fetch failed.');
            return false;
        }
    }

    parseCSV(data) {
        const parseLine = (line) => {
            const result = [];
            let current = '';
            let inQuotes = false;
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"') inQuotes = !inQuotes;
                else if (char === ',' && !inQuotes) {
                    result.push(current.trim());
                    current = '';
                } else current += char;
            }
            result.push(current.trim());
            return result;
        };

        const lines = data.split('\n').filter(line => line.trim() !== '');
        const rows = lines.map(line => parseLine(line));

        if (rows.length < 2) return;

        this.questions = rows.slice(1).filter(r => r.length >= 2).map(row => ({
            question: row[0],
            correct: row[1],
            answers: row.slice(1).filter(a => a !== '')
        }));
    }

    async startRequested() {
        const success = await this.fetchQuestions();
        if (success) {
            this.boot();
        } else {
            alert('PLEASE SELECT YOUR questions.csv FILE.');
        }
    }

    resetToStart() {
        this.isRunning = false;
        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.ui.startScreen.classList.remove('hidden');
        this.ui.gameOverScreen.classList.add('hidden');
        this.ui.abortBtn.classList.add('hidden');
        this.ui.gameWorld.innerHTML = '<div id="feedback-overlay" class="hidden"></div>';
        this.ui.feedbackOverlay = document.getElementById('feedback-overlay');
    }

    boot() {
        this.score = 0;
        this.lives = CONFIG.MAX_LIVES;
        this.currentQuestionIndex = 0;
        this.correctCount = 0;
        this.invaders = [];
        this.isRunning = true;

        // Selection questions based on limit
        const shuffled = [...this.questions].sort(() => Math.random() - 0.5);
        const limit = this.questionLimit === 0 ? shuffled.length : this.questionLimit;
        this.activeQuestions = shuffled.slice(0, limit);

        this.ui.startScreen.classList.add('hidden');
        this.ui.gameOverScreen.classList.add('hidden');
        this.ui.abortBtn.classList.remove('hidden');
        this.ui.gameWorld.innerHTML = '<div id="feedback-overlay" class="hidden"></div>';
        this.ui.feedbackOverlay = document.getElementById('feedback-overlay');

        this.updateHUD();
        this.nextQuestion();
        this.gameLoop();
    }

    updateHUD() {
        this.ui.score.textContent = this.score.toString().padStart(4, '0');
        this.ui.lives.textContent = '❤️'.repeat(Math.max(0, this.lives));
    }

    renderMath(element) {
        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([element]).catch(err => console.error('MathJax error:', err));
        }
    }

    showFeedback(isCorrect) {
        const overlay = this.ui.feedbackOverlay;
        overlay.textContent = isCorrect ? 'CORRECT!' : 'WRONG!';
        overlay.className = isCorrect ? 'feedback-correct' : 'feedback-wrong';
        overlay.classList.remove('hidden');

        // Brief pause to show feedback
        setTimeout(() => overlay.classList.add('hidden'), 500);
    }

    nextQuestion() {
        if (!this.isRunning) return;

        if (this.currentQuestionIndex >= this.activeQuestions.length) {
            this.gameOver(true);
            return;
        }

        const q = this.activeQuestions[this.currentQuestionIndex];
        this.ui.questionText.textContent = q.question;
        this.renderMath(this.ui.questionText);

        this.invaders.forEach(inv => inv.el.remove());
        this.invaders = [];

        const shuffledAnswers = [...q.answers].sort(() => Math.random() - 0.5);
        shuffledAnswers.forEach((text, index) => {
            this.spawnInvader(text, text === q.correct, index);
        });
    }

    spawnInvader(text, isCorrect, index) {
        const el = document.createElement('div');
        el.className = 'invader';
        el.textContent = text;
        this.renderMath(el);

        const worldWidth = this.ui.gameWorld.clientWidth;
        // Wider spacing for larger boxes
        const x = (index * (worldWidth / 4)) + 10;
        const y = -100 - (Math.random() * 100);

        el.style.left = `${Math.min(x, worldWidth - 200)}px`;
        el.style.top = `${y}px`;

        this.ui.gameWorld.appendChild(el);

        const invader = {
            el, text, isCorrect, y,
            speed: CONFIG.INVADER_SPEED + (Math.random() * 0.4),
            active: true
        };

        const handleInteraction = (e) => {
            if (!invader.active || !this.isRunning) return;
            this.handleHit(invader, e);
        };

        el.addEventListener('mousedown', handleInteraction);
        el.addEventListener('touchstart', handleInteraction, { passive: false });

        this.invaders.push(invader);
    }

    handleHit(invader, e) {
        if (!this.isRunning || !invader.active) return;
        if (e) e.preventDefault();

        invader.active = false;

        if (invader.isCorrect) {
            this.score += 100;
            this.correctCount++;
            this.updateHUD();
            this.showFeedback(true);

            this.invaders.forEach(inv => {
                inv.active = false;
                inv.el.classList.add('correct');
                setTimeout(() => inv.el.remove(), 200);
            });
            this.invaders = [];

            this.currentQuestionIndex++;
            setTimeout(() => { if (this.isRunning) this.nextQuestion(); }, 600);
        } else {
            invader.el.classList.add('wrong');
            this.showFeedback(false);
            this.mistake();
        }
    }

    mistake() {
        this.lives--;
        this.updateHUD();
        document.body.classList.add('shake');
        setTimeout(() => document.body.classList.remove('shake'), 500);

        if (this.lives <= 0) {
            this.gameOver(false);
        }
    }

    gameOver(completed) {
        this.isRunning = false;
        if (this.animationId) cancelAnimationFrame(this.animationId);

        const accuracy = this.activeQuestions.length > 0 ? (this.correctCount / this.activeQuestions.length) : 0;
        let rank = 'D';
        if (accuracy >= 0.95) rank = 'S';
        else if (accuracy >= 0.8) rank = 'A';
        else if (accuracy >= 0.6) rank = 'B';
        else if (accuracy >= 0.4) rank = 'C';

        this.ui.rankLetter.textContent = rank;
        this.ui.finalScore.textContent = this.score;
        this.ui.gameOverScreen.classList.remove('hidden');
        this.ui.abortBtn.classList.add('hidden');
    }

    gameLoop() {
        if (!this.isRunning) return;

        const worldHeight = this.ui.gameWorld.clientHeight;

        for (let i = this.invaders.length - 1; i >= 0; i--) {
            const inv = this.invaders[i];
            if (!inv.active) continue;

            inv.y += inv.speed;
            inv.el.style.top = `${inv.y}px`;

            if (inv.y > worldHeight) {
                if (inv.isCorrect) {
                    inv.active = false;
                    this.showFeedback(false);
                    this.mistake();
                    if (this.isRunning) {
                        this.currentQuestionIndex++;
                        this.nextQuestion();
                        break;
                    }
                } else {
                    inv.active = false;
                    inv.el.remove();
                    this.invaders.splice(i, 1);
                }
            }
        }

        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
}

const game = new Game();
