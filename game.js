const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 400;
canvas.height = 400;

// Game constants
const GRID_SIZE = 20;
const SNAKE_SIZE = canvas.width / GRID_SIZE;
const INITIAL_SNAKE_LENGTH = 4;
const GAME_SPEED = 100;

// Game variables
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoop;
let gameRunning = false;

// DOM elements
const scoreElement = document.querySelector('.score');
const highScoreElement = document.querySelector('.high-score');
const gameOverElement = document.querySelector('.game-over');
const finalScoreElement = document.querySelector('.final-score');
const restartButton = document.querySelector('.restart-btn');

// Initialize game
function initGame() {
    // Create initial snake
    snake = [];
    for (let i = INITIAL_SNAKE_LENGTH - 1; i >= 0; i--) {
        snake.push({ x: i, y: 0 });
    }
    
    // Reset game state
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    scoreElement.textContent = `Score: ${score}`;
    highScoreElement.textContent = `High Score: ${highScore}`;
    gameOverElement.style.display = 'none';
    
    // Place initial food
    spawnFood();
    
    // Start game loop
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(gameUpdate, GAME_SPEED);
    gameRunning = true;
}

// Spawn food at random position
function spawnFood() {
    let foodPosition;
    do {
        foodPosition = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };
    } while (snake.some(segment => segment.x === foodPosition.x && segment.y === foodPosition.y));
    
    food = foodPosition;
}

// Update game state
function gameUpdate() {
    // Update direction
    direction = nextDirection;
    
    // Calculate new head position
    const head = { ...snake[0] };
    switch (direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }
    
    // Check collision with walls
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        gameOver();
        return;
    }
    
    // Check collision with self
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }
    
    // Add new head
    snake.unshift(head);
    
    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = `Score: ${score}`;
        spawnFood();
    } else {
        snake.pop();
    }
    
    // Draw game
    draw();
}

// Draw game state
function draw() {
    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw snake
    snake.forEach((segment, index) => {
        const gradient = ctx.createLinearGradient(
            segment.x * SNAKE_SIZE,
            segment.y * SNAKE_SIZE,
            (segment.x + 1) * SNAKE_SIZE,
            (segment.y + 1) * SNAKE_SIZE
        );
        gradient.addColorStop(0, '#4ecca3');
        gradient.addColorStop(1, '#45b08c');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(
            segment.x * SNAKE_SIZE,
            segment.y * SNAKE_SIZE,
            SNAKE_SIZE - 1,
            SNAKE_SIZE - 1
        );
        
        // Draw snake eyes on head
        if (index === 0) {
            ctx.fillStyle = '#000';
            const eyeSize = SNAKE_SIZE / 6;
            const eyeOffset = SNAKE_SIZE / 4;
            
            // Position eyes based on direction
            let eyeX1, eyeX2, eyeY1, eyeY2;
            switch (direction) {
                case 'right':
                    eyeX1 = eyeX2 = segment.x * SNAKE_SIZE + SNAKE_SIZE * 0.7;
                    eyeY1 = segment.y * SNAKE_SIZE + eyeOffset;
                    eyeY2 = segment.y * SNAKE_SIZE + SNAKE_SIZE - eyeOffset - eyeSize;
                    break;
                case 'left':
                    eyeX1 = eyeX2 = segment.x * SNAKE_SIZE + SNAKE_SIZE * 0.3;
                    eyeY1 = segment.y * SNAKE_SIZE + eyeOffset;
                    eyeY2 = segment.y * SNAKE_SIZE + SNAKE_SIZE - eyeOffset - eyeSize;
                    break;
                case 'up':
                    eyeY1 = eyeY2 = segment.y * SNAKE_SIZE + SNAKE_SIZE * 0.3;
                    eyeX1 = segment.x * SNAKE_SIZE + eyeOffset;
                    eyeX2 = segment.x * SNAKE_SIZE + SNAKE_SIZE - eyeOffset - eyeSize;
                    break;
                case 'down':
                    eyeY1 = eyeY2 = segment.y * SNAKE_SIZE + SNAKE_SIZE * 0.7;
                    eyeX1 = segment.x * SNAKE_SIZE + eyeOffset;
                    eyeX2 = segment.x * SNAKE_SIZE + SNAKE_SIZE - eyeOffset - eyeSize;
                    break;
            }
            
            ctx.fillRect(eyeX1, eyeY1, eyeSize, eyeSize);
            ctx.fillRect(eyeX2, eyeY2, eyeSize, eyeSize);
        }
    });
    
    // Draw food
    ctx.fillStyle = '#e94560';
    ctx.beginPath();
    ctx.arc(
        food.x * SNAKE_SIZE + SNAKE_SIZE / 2,
        food.y * SNAKE_SIZE + SNAKE_SIZE / 2,
        SNAKE_SIZE / 2 - 1,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// Game over handling
function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        highScoreElement.textContent = `High Score: ${highScore}`;
    }
    
    finalScoreElement.textContent = score;
    gameOverElement.style.display = 'block';
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (direction !== 'down') nextDirection = 'up';
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (direction !== 'up') nextDirection = 'down';
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (direction !== 'right') nextDirection = 'left';
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (direction !== 'left') nextDirection = 'right';
            break;
    }
});

restartButton.addEventListener('click', initGame);

// Start the game
initGame();