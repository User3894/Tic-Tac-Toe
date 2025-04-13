'use strict';

// --- DOM Elements ---
const playerSetupDiv = document.getElementById('player-setup');
const gameAreaDiv = document.getElementById('game-area');
const playerXInput = document.getElementById('playerX');
const playerOInput = document.getElementById('playerO');
const startGameBtn = document.getElementById('start-game-btn');

const boardDiv = document.getElementById('board');
const cells = document.querySelectorAll('.cell'); // Get initial cells
const statusDiv = document.getElementById('status');
const restartBtn = document.getElementById('restart-btn');
const newGameBtn = document.getElementById('new-game-btn');

const scoreXDiv = document.getElementById('scoreX');
const scoreODiv = document.getElementById('scoreO');
const scoreXValueSpan = scoreXDiv.querySelector('.score-value');
const scoreOValueSpan = scoreODiv.querySelector('.score-value');
const playerXNameSpan = scoreXDiv.querySelector('.player-name');
const playerONameSpan = scoreODiv.querySelector('.player-name');

const turnIndicatorDiv = document.getElementById('turn-indicator');
const currentPlayerNameSpan = document.getElementById('current-player-name');
const currentPlayerSymbolSpan = document.getElementById('current-player-symbol');

const winningLineDiv = document.getElementById('winning-line');
const confettiCanvas = document.getElementById('confetti-canvas'); // For confetti effect

// --- Game State Variables ---
let currentPlayer = 'X';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameActive = false;
let playerXName = 'لاعب X';
let playerOName = 'لاعب O';
let playerXScore = 0;
let playerOScore = 0;

const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

// --- Confetti Instance (if library is loaded) ---
const confettiInstance = confetti.create(confettiCanvas, {
    resize: true,
    useWorker: true
});

// --- Functions ---

/** Resets the game board visually and logically for a new round */
function resetBoard() {
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    currentPlayer = 'X'; // X always starts? Or alternate? Let's stick with X starts.

    cells.forEach(cell => {
        cell.innerHTML = ''; // Clear previous symbol
        cell.classList.remove('X', 'O', 'win', 'disabled'); // Remove classes
    });

    statusDiv.textContent = '';
    statusDiv.classList.remove('show', 'win', 'draw');
    winningLineDiv.style.display = 'none'; // Hide winning line
    winningLineDiv.className = 'winning-line'; // Reset classes if any were added

    updateTurnIndicator();
}

/** Updates the display showing whose turn it is */
function updateTurnIndicator() {
    if (!gameActive) {
        turnIndicatorDiv.style.opacity = '0'; // Hide indicator when game is over
        scoreXDiv.classList.remove('active-turn');
        scoreODiv.classList.remove('active-turn');
        return;
    }

    turnIndicatorDiv.style.opacity = '1';
    const currentPlayerName = currentPlayer === 'X' ? playerXName : playerOName;
    currentPlayerNameSpan.textContent = currentPlayerName;
    currentPlayerSymbolSpan.textContent = currentPlayer;
    currentPlayerSymbolSpan.className = `symbol ${currentPlayer}`; // Add class for color/animation

    // Highlight active player's score
    if (currentPlayer === 'X') {
        scoreXDiv.classList.add('active-turn');
        scoreODiv.classList.remove('active-turn');
    } else {
        scoreODiv.classList.add('active-turn');
        scoreXDiv.classList.remove('active-turn');
    }
}

/** Displays a status message (win, draw, etc.) */
function showStatusMessage(message, type = '') {
    statusDiv.textContent = message;
    statusDiv.className = 'status-message show'; // Base classes + show
    if (type) {
        statusDiv.classList.add(type); // Add 'win' or 'draw' class
    }
    // Ensure the turn indicator is hidden when a message appears
     if (type === 'win' || type === 'draw') {
        turnIndicatorDiv.style.opacity = '0';
     }
}

/** Handles the logic when a cell is clicked */
function handleCellClick(event) {
    const clickedCell = event.target;
    const cellIndex = parseInt(clickedCell.getAttribute('data-index'));

    // Check if cell is already played or game is inactive
    if (gameBoard[cellIndex] !== '' || !gameActive) {
        return;
    }

    // Update game state
    gameBoard[cellIndex] = currentPlayer;
    clickedCell.innerHTML = `<span class="symbol">${currentPlayer}</span>`; // Add symbol with animation wrapper
    clickedCell.classList.add(currentPlayer, 'disabled'); // Add class for styling and disable hover


    // Check for win or draw
    if (checkWin()) {
        endGame(false); // false = not a draw
    } else if (isDraw()) {
        endGame(true); // true = is a draw
    } else {
        // Switch player
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateTurnIndicator();
    }
}

/** Checks if the current player has won */
function checkWin() {
    for (let i = 0; i < winningCombinations.length; i++) {
        const [a, b, c] = winningCombinations[i];
        if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
            // Found a winner
            highlightWinningCells(winningCombinations[i]);
            drawWinningLine(winningCombinations[i]); // Draw the line
            return true; // Indicate a win occurred
        }
    }
    return false; // No win yet
}

/** Checks if the game is a draw */
function isDraw() {
    return gameBoard.every(cell => cell !== ''); // All cells filled
}

/** Highlights the winning cells (optional, but nice) */
function highlightWinningCells(combination) {
    combination.forEach(index => {
        cells[index].classList.add('win'); // Add a class for potential styling
    });
}

/** Draws the line over the winning combination */
function drawWinningLine(combination) {
    const [a, b, c] = combination;
    const cellA = cells[a];
    const cellB = cells[c]; // Use start and end cells for line calculation

    // Get center coordinates relative to the board
    const boardRect = boardDiv.getBoundingClientRect();
    const cellARect = cellA.getBoundingClientRect();
    const cellBRect = cellB.getBoundingClientRect();

    const startX = cellARect.left + cellARect.width / 2 - boardRect.left;
    const startY = cellARect.top + cellARect.height / 2 - boardRect.top;
    const endX = cellBRect.left + cellBRect.width / 2 - boardRect.left;
    const endY = cellBRect.top + cellBRect.height / 2 - boardRect.top;

    const deltaX = endX - startX;
    const deltaY = endY - startY;

    const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

    winningLineDiv.style.width = `${length}px`;
    winningLineDiv.style.left = `${startX}px`;
    winningLineDiv.style.top = `${startY}px`;
    winningLineDiv.style.transform = `rotate(${angle}deg)`;
    winningLineDiv.style.transformOrigin = 'top left'; // Rotate from the start point
    winningLineDiv.style.display = 'block'; // Make it visible

    // Add class based on orientation for potential different animations/styles
    if (Math.abs(deltaX) > Math.abs(deltaY) && deltaY === 0) winningLineDiv.classList.add('horizontal');
    else if (Math.abs(deltaY) > Math.abs(deltaX) && deltaX === 0) winningLineDiv.classList.add('vertical');
    else winningLineDiv.classList.add('diagonal');
}


/** Ends the current game round */
function endGame(draw) {
    gameActive = false;
    // Disable all cells visually
    cells.forEach(cell => cell.classList.add('disabled'));

    if (draw) {
        showStatusMessage("انتهت بالتعادل!", 'draw');
    } else {
        // Winner found (it's the player whose turn it *was*)
        const winnerName = currentPlayer === 'X' ? playerXName : playerOName;
        showStatusMessage(`🎉 ${winnerName} (${currentPlayer}) هو الفائز! 🎉`, 'win');
        updateScore();
        triggerConfetti(); // Fire confetti!
    }
     updateTurnIndicator(); // Hides the indicator
}

/** Updates the score */
function updateScore() {
    if (currentPlayer === 'X') {
        playerXScore++;
        scoreXValueSpan.textContent = playerXScore;
    } else {
        playerOScore++;
        scoreOValueSpan.textContent = playerOScore;
    }
}

/** Triggers the confetti animation */
function triggerConfetti() {
    // Customize confetti options here!
    confettiInstance({
        particleCount: 150, // More particles
        spread: 100,       // Wider spread
        origin: { y: 0.6 }, // Start slightly lower
        colors: ['#0ea5e9', '#ec4899', '#f59e0b', '#ffffff', '#e5e7eb'] // Theme colors
    });
}

/** Starts the game after getting player names */
function startGame() {
    playerXName = playerXInput.value.trim() || 'لاعب X';
    playerOName = playerOInput.value.trim() || 'لاعب O';

    // Update scoreboard names
    playerXNameSpan.textContent = playerXName;
    playerONameSpan.textContent = playerOName;

    // Reset scores for a completely new game session
    playerXScore = 0;
    playerOScore = 0;
    scoreXValueSpan.textContent = playerXScore;
    scoreOValueSpan.textContent = playerOScore;


    // Switch screens
    playerSetupDiv.classList.remove('active');
    gameAreaDiv.classList.add('active');

    resetBoard(); // Setup the first round
}

/** Resets everything to go back to the player setup screen */
function startNewGameSession() {
    gameAreaDiv.classList.remove('active');
    playerSetupDiv.classList.add('active');
    // Optionally clear input fields or keep previous names
    // playerXInput.value = '';
    // playerOInput.value = '';
}

// --- Event Listeners ---
startGameBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', resetBoard); // Restart current round
newGameBtn.addEventListener('click', startNewGameSession); // Go back to name entry

// Add click listeners to cells dynamically if needed, or use existing ones
cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

// --- Initial Setup ---
// Show player setup screen first
playerSetupDiv.classList.add('active');
gameAreaDiv.classList.remove('active');
