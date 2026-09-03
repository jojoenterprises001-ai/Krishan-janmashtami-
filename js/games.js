// --- GAME 1: TIC-TAC-TOE ---
const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('game-status');
const restartBtn = document.getElementById('restart-btn');
const btnVsCpu = document.getElementById('btn-vs-cpu');
const btnVsFriend = document.getElementById('btn-vs-friend');

let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "🦚";
let running = true;
let vsCPU = true;

const winConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

function initializeTicTacToe() {
    cells.forEach(cell => cell.addEventListener('click', cellClicked));
    restartBtn.addEventListener('click', restartGame);
    btnVsCpu.addEventListener('click', () => setMode(true));
    btnVsFriend.addEventListener('click', () => setMode(false));
    running = true;
    updateStatus();
}

function setMode(isCPU) {
    vsCPU = isCPU;
    if (isCPU) {
        btnVsCpu.classList.add('active');
        btnVsFriend.classList.remove('active');
    } else {
        btnVsFriend.classList.add('active');
        btnVsCpu.classList.remove('active');
    }
    restartGame();
}

function cellClicked() {
    const cellIndex = this.getAttribute('data-index');
    if (board[cellIndex] !== "" || !running) return;

    updateCell(this, cellIndex);
    checkWinner();

    if (vsCPU && running && currentPlayer === "🪈") {
        statusText.innerText = "Computer is thinking... 🪈";
        setTimeout(cpuPlay, 600);
    }
}

function updateCell(cell, index) {
    board[index] = currentPlayer;
    cell.innerText = currentPlayer;
    cell.classList.add('taken');
}

function changePlayer() {
    currentPlayer = (currentPlayer === "🦚") ? "🪈" : "🦚";
    updateStatus();
}

function updateStatus() {
    if (currentPlayer === "🦚") {
        statusText.innerText = "Your Turn (🦚)";
    } else {
        statusText.innerText = vsCPU ? "Computer's Turn (🪈)" : "Player 2's Turn (🪈)";
    }
}

function checkWinner() {
    let roundWon = false;
    let winningCells = [];

    for (let i = 0; i < winConditions.length; i++) {
        const condition = winConditions[i];
        const a = board[condition[0]], b = board[condition[1]], c = board[condition[2]];
        if (a === "" || b === "" || c === "") continue;
        if (a === b && b === c) {
            roundWon = true;
            winningCells = condition;
            break;
        }
    }

    if (roundWon) {
        statusText.innerText = `${currentPlayer} Wins! 🎉`;
        running = false;
        winningCells.forEach(index => cells[index].classList.add('winner'));
    } else if (!board.includes("")) {
        statusText.innerText = "It's a Draw! 🤝";
        running = false;
    } else {
        changePlayer();
    }
}

function cpuPlay() {
    if (!running) return;
    let available = [];
    board.forEach((cell, index) => { if (cell === "") available.push(index); });
    if (available.length > 0) {
        const randIndex = available[Math.floor(Math.random() * available.length)];
        const cellToClick = document.querySelector(`.cell[data-index="${randIndex}"]`);
        updateCell(cellToClick, randIndex);
        checkWinner();
    }
}

function restartGame() {
    currentPlayer = "🦚";
    board = ["", "", "", "", "", "", "", "", ""];
    cells.forEach(cell => {
        cell.innerText = "";
        cell.classList.remove('taken', 'winner');
    });
    running = true;
    updateStatus();
}

initializeTicTacToe();


// --- GAME 2: MEMORY CARD MATCH ---
const memoryBoard = document.getElementById('memory-board');
const matchCountText = document.getElementById('match-count');
const memoryRestartBtn = document.getElementById('memory-restart');

const items = ['🧈', '🏺', '🪈', '🐄'];
let cardArray = [...items, ...items]; // 8 cards total
let flippedCards = [];
let matchedPairs = 0;
let lockBoard = false;

function initMemoryGame() {
    memoryBoard.innerHTML = '';
    cardArray.sort(() => 0.5 - Math.random());
    matchedPairs = 0;
    matchCountText.innerText = matchedPairs;
    
    cardArray.forEach((item, index) => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.item = item;
        card.dataset.index = index;
        card.addEventListener('click', flipCard);
        memoryBoard.appendChild(card);
    });
}

function flipCard() {
    if (lockBoard) return;
    if (this === flippedCards[0]) return;

    this.classList.add('flipped');
    this.innerText = this.dataset.item;
    flippedCards.push(this);

    if (flippedCards.length === 2) {
        checkForMatch();
    }
}

function checkForMatch() {
    const isMatch = flippedCards[0].dataset.item === flippedCards[1].dataset.item;
    if (isMatch) {
        disableCards();
    } else {
        unflipCards();
    }
}

function disableCards() {
    flippedCards[0].classList.add('matched');
    flippedCards[1].classList.add('matched');
    flippedCards[0].removeEventListener('click', flipCard);
    flippedCards[1].removeEventListener('click', flipCard);
    
    matchedPairs++;
    matchCountText.innerText = matchedPairs;
    resetTurn();

    if (matchedPairs === 4) {
        setTimeout(() => alert('Congratulations! You matched all items! 🎉'), 300);
    }
}

function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
        flippedCards[0].classList.remove('flipped');
        flippedCards[0].innerText = '';
        flippedCards[1].classList.remove('flipped');
        flippedCards[1].innerText = '';
        resetTurn();
    }, 800);
}

function resetTurn() {
    [flippedCards, lockBoard] = [[], false];
}

memoryRestartBtn.addEventListener('click', initMemoryGame);
initMemoryGame();


// --- GAME 3: MATKI & MAKHAN CHOICE ---
const rpsButtons = document.querySelectorAll('.rps-btn');
const rpsResult = document.getElementById('rps-result');
const playerScoreEl = document.getElementById('player-score');
const cpuScoreEl = document.getElementById('cpu-score');

let pScore = 0;
let cScore = 0;

const choices = ['matki', 'makhan', 'bansuri'];

rpsButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const playerChoice = btn.dataset.choice;
        const cpuChoice = choices[Math.floor(Math.random() * choices.length)];
        
        let resultMsg = `You: ${playerChoice} | Computer: ${cpuChoice}. `;
        
        if (playerChoice === cpuChoice) {
            resultMsg += "It's a Draw! 🤝";
        } else if (
            (playerChoice === 'matki' && cpuChoice === 'bansuri') ||
            (playerChoice === 'makhan' && cpuChoice === 'matki') ||
            (playerChoice === 'bansuri' && cpuChoice === 'makhan')
        ) {
            resultMsg += "You Win! 🎉";
            pScore++;
            playerScoreEl.innerText = pScore;
        } else {
            resultMsg += "Computer Wins! 🤖";
            cScore++;
            cpuScoreEl.innerText = cScore;
        }
        
        rpsResult.innerText = resultMsg;
    });
});
                  
