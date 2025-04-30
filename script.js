const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const birdImage = new Image();
birdImage.src = "https://cdn3.emoji.gg/emojis/3244-trollface.png";

const bird = {
  x: 100,
  y: canvas.height / 2,
  width: 40,
  height: 40,
  velocity: 0,
  smoke: [],
};

const gravity = 0.5;
const jump = -8;
const pipeWidth = 50;
const pipeGap = 250;
let pipes = [];
let gameStarted = false;
let gameOver = false;
let frames = 0;
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;

const restartBtn = document.getElementById("restartBtn");
const gameOverText = document.getElementById("gameOverText");
const gameOverContainer = document.getElementById("gameOverContainer");
const scoreText = document.getElementById("score");
const highScoreText = document.getElementById("highScore");
const topRightText = document.getElementById("topRightText");
const startBtn = document.getElementById("startBtn");
const startScreen = document.getElementById("startScreen");

canvas.addEventListener("click", () => {
  if (!gameStarted) {
    gameStarted = true;
    startScreen.style.display = "none";
    resetGame();
    loop();
  } else if (!gameOver) {
    bird.velocity = jump;
  }
});

restartBtn.addEventListener("click", () => {
  resetGame();
  gameOverContainer.style.display = "none";
  gameStarted = true;
  loop();
});

startBtn.addEventListener("click", () => {
  gameStarted = true;
  startScreen.style.display = "none";
  resetGame();
  loop();
});

function resetGame() {
  bird.y = canvas.height / 2;
  bird.velocity = 0;
  pipes = [];
  bird.smoke = [];
  score = 0;
  gameOver = false;
  frames = 0;
}

function drawBird() {
  ctx.drawImage(birdImage, bird.x, bird.y, bird.width, bird.height);
}

function drawSmoke() {
  bird.smoke.push({ x: bird.x + bird.width / 2, y: bird.y, alpha: 1 });

  bird.smoke.forEach((smoke, index) => {
    ctx.fillStyle = `rgba(0, 255, 0, ${smoke.alpha})`;
    ctx.beginPath();
    ctx.arc(smoke.x, smoke.y, 5, 0, Math.PI * 2);
    ctx.fill();
    smoke.x -= 2;
    smoke.alpha -= 0.05;
    if (smoke.alpha <= 0) bird.smoke.splice(index, 1);
  });
}

function drawPipes() {
  pipes.forEach((pipe) => {
    ctx.fillStyle = "#ff4c4c";
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
    ctx.fillRect(pipe.x, pipe.top + pipeGap, pipeWidth, canvas.height);
  });
}

function updatePipes() {
  if (frames % 90 === 0) {
    let top = Math.random() * (canvas.height / 2) + 50;
    pipes.push({ x: canvas.width, top });
  }

  pipes.forEach((pipe) => pipe.x -= 2);
  pipes = pipes.filter((pipe) => pipe.x + pipeWidth > 0);
}

function checkCollision() {
  if (bird.y + bird.height / 2 > canvas.height || bird.y - bird.height / 2 < 0) {
    return true;
  }

  for (let pipe of pipes) {
    if (
      bird.x < pipe.x + pipeWidth &&
      bird.x + bird.width > pipe.x &&
      (bird.y < pipe.top || bird.y + bird.height > pipe.top + pipeGap)
    ) {
      return true;
    }
  }

  return false;
}

function updateScore() {
  pipes.forEach((pipe) => {
    if (pipe.x + pipeWidth < bird.x && !pipe.passed) {
      score++;
      pipe.passed = true;
    }
  });

  scoreText.textContent = "Score: " + score;

  if (score > highScore) {
    highScore = score;
    highScoreText.textContent = "Highscore: " + highScore;
    localStorage.setItem("highScore", highScore);
  }
}

function loop() {
  if (gameOver) {
    gameOverContainer.style.display = "block";
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBird();
  drawSmoke();
  updatePipes();
  drawPipes();
  updateScore();

  bird.velocity += gravity;
  bird.y += bird.velocity;

  if (checkCollision()) {
    gameOver = true;
  }

  frames++;
  requestAnimationFrame(loop);
}
