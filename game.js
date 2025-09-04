const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Görseller
const birdImg = new Image();
birdImg.src = "assets/bird.png";

const birdMor = new Image();
birdMor.src = "assets/bird_mor.png";

const birdSari = new Image();
birdSari.src = "assets/bird_sari.png";

const bgDay = new Image();
bgDay.src = "assets/bg_day.png";

const bgNight = new Image();
bgNight.src = "assets/bg_night.png";

const pipeTop = new Image();
pipeTop.src = "assets/pipeTop.png";

const pipeBottom = new Image();
pipeBottom.src = "assets/pipeBottom.png";

const coinImg = new Image();
coinImg.src = "assets/coin.png";

// Oyun değişkenleri
let birdY = 150;
let gravity = 0.5;
let velocity = 0;
let score = 0;
let coinCount = 0;
let gameOver = false;
let coinPlayed = false;

let pipes = [];
let coins = [];

// Ses fonksiyonları
function playCoinSound() {
  const coinAudio = document.getElementById("coinSound");
  coinAudio.currentTime = 0;
  coinAudio.play();
}

function playGameOverSound() {
  const gameOverAudio = document.getElementById("gameOverSound");
  gameOverAudio.currentTime = 0;
  gameOverAudio.play();
}

// Oyunu sıfırla
function resetGame() {
  birdY = 150;
  velocity = 0;
  score = 0;
  coinCount = 0;
  gameOver = false;
  coinPlayed = false;
  pipes = [];
  coins = [];
  draw();
}

// Tuş kontrolü
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "ArrowUp") {
    if (gameOver) {
      resetGame();
    } else {
      velocity = -8;
    }
  }
});

// Boru ve altın oluşturma
function spawnPipe() {
  let gap = 300; // çocuklar için ultra geniş boşluk
  let topHeight = Math.floor(Math.random() * (canvas.height - gap - 100)) + 50;

  pipes.push({
    x: canvas.width,
    topHeight: topHeight,
    bottomY: topHeight + gap,
    width: 60,
    passed: false
  });

  coins.push({
    x: canvas.width + 30,
    y: topHeight + gap / 2 - 25,
    collected: false
  });
}

// Ana çizim fonksiyonu
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let currentBird = birdImg;
  if (coinCount >= 5) {
    currentBird = birdSari;
  } else if (coinCount >= 2) {
    currentBird = birdMor;
  }

  if (score < 10) {
    ctx.drawImage(bgDay, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.drawImage(bgNight, 0, 0, canvas.width, canvas.height);
  }

  for (let i = 0; i < pipes.length; i++) {
    let p = pipes[i];
    ctx.drawImage(pipeTop, p.x, 0, p.width, p.topHeight);
    ctx.drawImage(pipeBottom, p.x, p.bottomY, p.width, canvas.height - p.bottomY);
    p.x -= 2;

    if (
      100 + 50 > p.x &&
      100 < p.x + p.width &&
      (birdY < p.topHeight || birdY + 50 > p.bottomY)
    ) {
      if (!gameOver) {
        gameOver = true;
        setTimeout(() => {
          playGameOverSound();
        }, 100);
      }
    }

    if (!p.passed && p.x + p.width < 100) {
      score++;
      p.passed = true;
    }
  }

  for (let i = 0; i < coins.length; i++) {
    let c = coins[i];
    if (!c.collected) {
      ctx.drawImage(coinImg, c.x, c.y, 50, 50); // ← coin boyutu burada büyütüldü
      c.x -= 2;

      if (
        100 + 50 > c.x &&
        100 < c.x + 50 &&
        birdY + 50 > c.y &&
        birdY < c.y + 50
      ) {
        c.collected = true;
        score += 5;
        coinCount++;
        playCoinSound();
      }
    }
  }

  ctx.drawImage(currentBird, 100, birdY, 50, 50);

  ctx.fillStyle = "#fff";
  ctx.font = "24px Arial";
  ctx.fillText("Skor: " + score, 10, 30);

  velocity += gravity;
  birdY += velocity;

  if (score % 5 === 0 && score !== 0 && !coinPlayed) {
    playCoinSound();
    coinPlayed = true;
  }
  if (score % 5 !== 0) {
    coinPlayed = false;
  }

  if (birdY > canvas.height - 50 || birdY < 0) {
    if (!gameOver) {
      gameOver = true;
      setTimeout(() => {
        playGameOverSound();
      }, 100);
    }
  }

  if (gameOver) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(currentBird, 100, birdY, 50, 50);
    ctx.fillStyle = "#fff";
    ctx.font = "32px Arial";
    ctx.fillText("Oyun Bitti!", canvas.width / 2 - 80, canvas.height / 2 - 40);
    ctx.fillText("Skor: " + score, canvas.width / 2 - 60, canvas.height / 2);
    ctx.font = "20px Arial";
    ctx.fillText("Yeniden başlatmak için SPACE tuşuna bas", canvas.width / 2 - 160, canvas.height / 2 + 40);
    return;
  }

  requestAnimationFrame(draw);
}

// Boru oluşturma
setInterval(() => {
  if (!gameOver) {
    spawnPipe();
  }
}, 1500);

// Başlat
draw();