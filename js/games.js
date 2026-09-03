const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('game-status');
const restartBtn = document.getElementById('restart-btn');
const btnVsCpu = document.getElementById('btn-vs-cpu');
const btnVsFriend = document.getElementById('btn-vs-friend');

// Game Variables
let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "🦚"; // Player 1 is Peacock Feather, Computer/Player 2 is Flute 🪈
let running = false;
let vsCPU = true; // Default mode is vs Computer

// Winning Combinations
const winConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

// Initialize Game
initializeGame();

function initializeGame() {
    cells.forEach(cell => cell.addEventListener('click', cellClicked));
    restartBtn.addEventListener('click', restartGame);
    
    // Mode Selection
    btnVsCpu.addEventListener('click', () => setMode(true));
    btnVsFriend.addEventListener('click', () => setMode(false));
    
    running = true;
    updateStatus();
}

// Set Game Mode (VS CPU or VS Friend)
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

// When a cell is clicked
function cellClicked() {
    const cellIndex = this.getAttribute('data-index');

    // Ignore if cell is not empty or game is stopped
    if (board[cellIndex] !== "" || !running) {
        return;
    }

    // Player move
    updateCell(this, cellIndex);
    checkWinner();

    // If playing against CPU and game is still running, trigger CPU turn
    if (vsCPU && running && currentPlayer === "🪈") {
        statusText.innerText = "Computer is thinking... 🪈";
        // 0.6 second delay to make it feel like the computer is thinking
        setTimeout(cpuPlay, 600); 
    }
}

// Update cell data and UI
function updateCell(cell, index) {
    board[index] = currentPlayer;
    cell.innerText = currentPlayer;
    cell.classList.add('taken');
}

// Switch turns
function changePlayer() {
    currentPlayer = (currentPlayer === "🦚") ? "🪈" : "🦚";
    updateStatus();
}

// Update the status text above the board
function updateStatus() {
    if (currentPlayer === "🦚") {
        statusText.innerText = "Your Turn (🦚)";
    } else {
        statusText.innerText = vsCPU ? "Computer's Turn (🪈)" : "Player 2's Turn (🪈)";
    }
}

// Check for win or draw
function checkWinner() {
    let roundWon = false;
    let winningCells = [];

    for (let i = 0; i < winConditions.length; i++) {
        const condition = winConditions[i];
        const cellA = board[condition[0]];
        const cellB = board[condition[1]];
        const cellC = board[condition[2]];

        if (cellA === "" || cellB === "" || cellC === "") {
            continue;
        }
        if (cellA === cellB && cellB === cellC) {
            roundWon = true;
            winningCells = condition;
            break;
        }
    }

    if (roundWon) {
        statusText.innerText = `${currentPlayer} Wins! 🎉`;
        running = false;
        // Highlight winning cells in green
        winningCells.forEach(index => {
            cells[index].classList.add('winner');
        });
    } else if (!board.includes("")) {
        statusText.innerText = "It's a Draw! 🤝";
        running = false;
    } else {
        changePlayer();
    }
}

// Computer AI Logic (Picks a random empty cell)
function cpuPlay() {
    if (!running) return;

    let availableCells = [];
    board.forEach((cell, index) => {
        if (cell === "") availableCells.push(index);
    });

    if (availableCells.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableCells.length);
        const chosenIndex = availableCells[randomIndex];
        
        const cellToClick = document.querySelector(`.cell[data-index="${chosenIndex}"]`);
        updateCell(cellToClick, chosenIndex);
        checkWinner();
    }
}

// Restart the game completely
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
      
