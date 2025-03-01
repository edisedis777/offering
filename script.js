// DOM Elements
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const jossPaper = document.getElementById("joss-paper");
const burnBtn = document.getElementById("burn-btn");
const resetBtn = document.getElementById("reset-btn");
const paperSelect = document.getElementById("paper-select");
const customMessage = document.getElementById("custom-message");
const writeMessageBtn = document.getElementById("write-message");
const paperMessage = document.getElementById("paper-message");
const lightIncenseBtn = document.getElementById("light-incense");
const incenseSticks = document.querySelectorAll(".incense-stick");
const spiritMessage = document.getElementById("spirit-message");
const burningSound = document.getElementById("burning-sound");
const templeAmbience = document.getElementById("temple-ambience");

// Set canvas size (responsive)
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Audio initialization
templeAmbience.volume = 0.3;
document.body.addEventListener(
  "click",
  () => {
    templeAmbience
      .play()
      .catch((e) => console.log("Audio play prevented: ", e));
  },
  { once: true }
);

// Paper type selection
paperSelect.addEventListener("change", () => {
  const paperType = paperSelect.value;
  jossPaper.className = "";
  jossPaper.classList.add(`${paperType}-paper`);
});

// Write message on paper
writeMessageBtn.addEventListener("click", function () {
  const message = customMessage.value.trim();
  if (message) {
    paperMessage.textContent = message;
    paperMessage.classList.add("visible");

    // Calligraphy animation
    const characters = message.split("");
    paperMessage.textContent = "";
    paperMessage.classList.remove("visible");

    characters.forEach((char, index) => {
      setTimeout(() => {
        paperMessage.textContent += char;
        if (index === characters.length - 1) {
          setTimeout(() => {
            paperMessage.classList.add("visible");
          }, 100);
        }
      }, index * 200);
    });
  }
});

// Light incense sticks
lightIncenseBtn.addEventListener("click", function () {
  incenseSticks.forEach((stick) => {
    stick.classList.add("lit");
  });

  // Create some initial smoke particles
  for (let i = 0; i < 10; i++) {
    createIncenseSmoke();
  }
});

// Create incense smoke particles
function createIncenseSmoke() {
  incenseSticks.forEach((stick) => {
    if (stick.classList.contains("lit")) {
      const rect = stick.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top;
      particles.push(new SmokeParticle(x, y));
    }
  });

  if (document.querySelector(".incense-stick.lit")) {
    setTimeout(createIncenseSmoke, 500);
  }
}

// Particle classes
class Particle {
  constructor(x, y, type = "fire") {
    this.x = x;
    this.y = y;
    this.type = type;
    this.size = Math.random() * 12 + 4;
    this.life = Math.random() * 120 + 60;
    this.maxLife = this.life;
    this.speedX = Math.random() * 1.5 - 0.75;
    this.speedY = Math.random() * -0.8 - 0.2;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = Math.random() * 0.03 - 0.015;
    this.hue = Math.random() * 30 + 20;
    this.opacity = Math.random() * 0.6 + 0.2;

    // Realistic fire colors with gold/red for joss paper
    if (type === "fire") {
      this.color =
        Math.random() > 0.7
          ? `hsl(${this.hue}, 80%, ${Math.random() * 50 + 30}%)`
          : `rgba(255, 215, 0, ${this.opacity})`;
    }
    // Gray smoke
    else if (type === "smoke") {
      this.color = `rgba(200, 200, 200, ${this.opacity})`;
    }
    // Golden ash
    else if (type === "ash") {
      this.color = `rgba(255, 215, 0, ${this.opacity})`;
      this.speedY = Math.random() * 0.5 + 0.2; // Falling down
    }
    // Incense smoke
    else if (type === "incense") {
      this.color = `rgba(255, 255, 255, ${this.opacity * 0.7})`;
      this.size = Math.random() * 5 + 2;
      this.speedY = -Math.random() * 0.5 - 0.1; // Slower rising
      this.speedX = Math.random() * 0.2 - 0.1; // Slight drift
    }
  }

  update() {
    // Apply wind effect
    this.speedX += Math.random() * 0.05 - 0.025;

    // Update position with rotation
    this.x += this.speedX;
    this.y += this.speedY;
    this.rotation += this.rotationSpeed;

    // Physics updates
    if (this.type === "fire") {
      this.size *= 0.98;
      this.speedY *= 0.99; // Slowing down vertically
    } else if (this.type === "smoke") {
      this.size *= 1.01; // Smoke expands
      this.opacity *= 0.98; // Smoke fades
    } else if (this.type === "ash") {
      this.size *= 0.97;
      this.speedY *= 1.01; // Accelerating down
    } else if (this.type === "incense") {
      this.size *= 1.005; // Slow expansion
      this.opacity *= 0.99; // Slow fade
    }

    this.life--;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    // Set color with life-based opacity
    if (this.type === "fire") {
      ctx.fillStyle = this.color.includes("rgba")
        ? this.color.replace(
            /[\d.]+\)$/,
            `${(this.life / this.maxLife) * this.opacity})`
          )
        : this.color;
    } else {
      ctx.fillStyle = this.color.replace(
        /[\d.]+\)$/,
        `${(this.life / this.maxLife) * this.opacity})`
      );
    }

    // Draw shape based on type
    if (this.type === "fire") {
      // Flame shape - teardrop
      ctx.beginPath();
      ctx.moveTo(0, -this.size);
      ctx.bezierCurveTo(
        this.size * 0.5,
        -this.size * 0.5,
        this.size * 0.8,
        this.size * 0.5,
        0,
        this.size
      );
      ctx.bezierCurveTo(
        -this.size * 0.8,
        this.size * 0.5,
        -this.size * 0.5,
        -this.size * 0.5,
        0,
        -this.size
      );
      ctx.closePath();
      ctx.fill();
    } else if (this.type === "smoke" || this.type === "incense") {
      // Smoke - cloudy circle
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size * 0.7, this.size, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === "ash") {
      // Ash - irregular small polygons
      ctx.beginPath();
      const sides = Math.floor(Math.random() * 3) + 3; // 3-5 sides
      const angle = (Math.PI * 2) / sides;
      for (let i = 0; i < sides; i++) {
        const x = Math.cos(i * angle) * this.size * 0.5;
        const y = Math.sin(i * angle) * this.size * 0.5;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }
}

// Special smoke particle class for incense
class SmokeParticle extends Particle {
  constructor(x, y) {
    super(x, y, "incense");
    this.life = Math.random() * 200 + 100; // Longer life
    this.maxLife = this.life;
  }
}

// Spirit particle for the transition effect
class SpiritParticle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 8 + 2;
    this.speedX = Math.random() * 2 - 1;
    this.speedY = -Math.random() * 2 - 1; // Always rising
    this.color = `rgba(255, 215, 0, ${Math.random() * 0.3 + 0.1})`;
    this.life = Math.random() * 150 + 50;
    this.maxLife = this.life;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.speedY *= 0.99; // Slow down ascension
    this.life--;
  }

  draw() {
    const opacity = (this.life / this.maxLife) * 0.4;
    ctx.fillStyle = this.color.replace(/[\d.]+\)$/, `${opacity})`);
    ctx.beginPath();
    // Star or diamond shape
    const halfSize = this.size / 2;
    ctx.moveTo(this.x, this.y - this.size);
    ctx.lineTo(this.x + halfSize, this.y);
    ctx.lineTo(this.x, this.y + this.size);
    ctx.lineTo(this.x - halfSize, this.y);
    ctx.closePath();
    ctx.fill();
  }
}

let particles = [];
let spiritParticles = [];
let burning = false;
let spiritTransition = false;

// Burn animation with delay and trembling
function burnPaper() {
  if (burning) return;
  burning = true;

  // Play sound
  burningSound.currentTime = 0;
  burningSound.play().catch((e) => console.log("Audio play prevented: ", e));

  // Tremble effect before burning
  jossPaper.style.transition = "transform 0.3s ease-out";
  const tremble = [5, -5, 3, -3, 0]; // Tremble positions

  let trembleIndex = 0;
  const trembleInterval = setInterval(() => {
    jossPaper.style.transform = `translateX(${tremble[trembleIndex]}px)`;
    trembleIndex++;

    if (trembleIndex >= tremble.length) {
      clearInterval(trembleInterval);
      startBurn();
    }
  }, 150);
}

// Start the actual burn
function startBurn() {
  // Get paper position for particle generation
  const rect = jossPaper.getBoundingClientRect();
  const paperCenterX = rect.left + rect.width / 2;
  const paperCenterY = rect.top + rect.height / 2;

  // Set paper to burning state
  jossPaper.style.transition = "opacity 3s ease-out, transform 3s ease-out";
  jossPaper.style.opacity = "0";
  jossPaper.style.transform = "scale(0.95) translateY(5px)";

  // Generate edge-burning particles first (fire starts at edges)
  for (let i = 0; i < 40; i++) {
    // Create particles at the edges
    const angle = Math.random() * Math.PI * 2;
    const distance = ((Math.random() * 0.3 + 0.7) * rect.width) / 2; // 70-100% to edge
    const x = paperCenterX + Math.cos(angle) * distance;
    const y = paperCenterY + Math.sin(angle) * distance;

    particles.push(new Particle(x, y, "fire"));
  }

  // Create some initial smoke
  for (let i = 0; i < 15; i++) {
    const x = paperCenterX + (Math.random() - 0.5) * rect.width * 0.8;
    const y = paperCenterY + (Math.random() - 0.5) * rect.height * 0.8;
    particles.push(new Particle(x, y, "smoke"));
  }

  // Continue to generate particles until fully burned
  let particleCount = 0;
  const burnInterval = setInterval(() => {
    particleCount++;

    // Generate fire particles
    for (let i = 0; i < 5; i++) {
      const x = paperCenterX + (Math.random() - 0.5) * rect.width * 0.9;
      const y = paperCenterY + (Math.random() - 0.5) * rect.height * 0.9;
      particles.push(new Particle(x, y, "fire"));
    }

    // Generate smoke particles
    for (let i = 0; i < 3; i++) {
      const x = paperCenterX + (Math.random() - 0.5) * rect.width * 0.9;
      const y = paperCenterY + (Math.random() - 0.5) * rect.height * 0.9;
      particles.push(new Particle(x, y, "smoke"));
    }

    // Generate ash particles
    if (particleCount > 10) {
      for (let i = 0; i < 2; i++) {
        const x = paperCenterX + (Math.random() - 0.5) * rect.width;
        const y = paperCenterY + (Math.random() - 0.5) * rect.height;
        particles.push(new Particle(x, y, "ash"));
      }
    }

    // Stop generating particles eventually
    if (particleCount > 35) {
      clearInterval(burnInterval);

      // After burning complete, trigger spirit transition
      setTimeout(() => {
        spiritTransition = true;

        // Show spirit message with delay
        setTimeout(() => {
          if (paperMessage.textContent.trim()) {
            showSpiritMessage();
          }
        }, 2000);

        // Generate spirit particles for a few seconds
        const spiritInterval = setInterval(() => {
          for (let i = 0; i < 3; i++) {
            spiritParticles.push(
              new SpiritParticle(
                paperCenterX + (Math.random() - 0.5) * rect.width * 0.5,
                paperCenterY
              )
            );
          }
        }, 200);

        // Stop generating spirit particles eventually
        setTimeout(() => {
          clearInterval(spiritInterval);
          // Allow reset after animation completes
          setTimeout(() => {
            burning = false;
          }, 3000);
        }, 5000);
      }, 3000);
    }
  }, 300);
}

// Show spirit message when offering is accepted
function showSpiritMessage() {
  // Generate a response based on the message on the paper
  const paperText = paperMessage.textContent.trim().toLowerCase();
  let response = "Your offering has been received.";

  // Keywords for different responses
  if (paperText.includes("health") || paperText.includes("heal")) {
    response = "Blessings of health and vitality granted.";
  } else if (
    paperText.includes("wealth") ||
    paperText.includes("fortune") ||
    paperText.includes("money")
  ) {
    response = "Fortune and prosperity will come your way.";
  } else if (paperText.includes("love") || paperText.includes("romance")) {
    response = "May love blossom in your heart and life.";
  } else if (paperText.includes("ancestor") || paperText.includes("family")) {
    response = "Your ancestors watch over you with pride.";
  } else if (paperText.includes("protection") || paperText.includes("safe")) {
    response = "Protective energies now surround you.";
  }

  // Animation for spirit message
  spiritMessage.textContent = response;
  spiritMessage.style.opacity = "0";
  spiritMessage.style.display = "block";

  // Fade in gradually
  let opacity = 0;
  const fadeIn = setInterval(() => {
    opacity += 0.05;
    spiritMessage.style.opacity = opacity;

    if (opacity >= 1) {
      clearInterval(fadeIn);

      // Fade out after a while
      setTimeout(() => {
        let fadeOpacity = 1;
        const fadeOut = setInterval(() => {
          fadeOpacity -= 0.05;
          spiritMessage.style.opacity = fadeOpacity;

          if (fadeOpacity <= 0) {
            clearInterval(fadeOut);
            spiritMessage.style.display = "none";
          }
        }, 100);
      }, 5000);
    }
  }, 100);
}

// Reset the entire scene
function resetScene() {
  if (burning) return; // Don't reset during active burning

  // Reset paper
  jossPaper.style.opacity = "1";
  jossPaper.style.transform = "scale(1) translateY(0)";

  // Clear message
  paperMessage.textContent = "";
  paperMessage.classList.remove("visible");
  customMessage.value = "";

  // Reset incense
  incenseSticks.forEach((stick) => {
    stick.classList.remove("lit");
  });

  // Clear particles
  particles = [];
  spiritParticles = [];
  spiritTransition = false;

  // Hide spirit message
  spiritMessage.style.display = "none";
}

// Animation loop
function animate() {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update and draw fire/smoke/ash particles
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].draw();

    // Remove dead particles
    if (particles[i].life <= 0) {
      particles.splice(i, 1);
    }
  }

  // Update and draw spirit particles during transition
  if (spiritTransition) {
    for (let i = spiritParticles.length - 1; i >= 0; i--) {
      spiritParticles[i].update();
      spiritParticles[i].draw();

      // Remove dead particles
      if (spiritParticles[i].life <= 0) {
        spiritParticles.splice(i, 1);
      }
    }
  }

  // Continue animation
  requestAnimationFrame(animate);
}

// Start animation loop
animate();

// Event listeners
burnBtn.addEventListener("click", burnPaper);
resetBtn.addEventListener("click", resetScene);

// Initial paper type setup
paperSelect.dispatchEvent(new Event("change"));
