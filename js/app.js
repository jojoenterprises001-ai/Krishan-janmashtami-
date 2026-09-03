import { auth, db } from './firebase.js';
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// 1. ANONYMOUS AUTHENTICATION (To read database securely)
signInAnonymously(auth).catch((error) => {
    console.error("Anonymous auth failed:", error);
});

// 2. STATE VARIABLES
let countdownInterval = null;
let isFlowerRainActive = true;

// 3. DOM ELEMENTS
const body = document.getElementById('public-body');
const announcementBanner = document.getElementById('announcement-banner');
const announcementText = document.getElementById('announcement-text');
const youtubePlayer = document.getElementById('youtube-player');
const statusBadge = document.getElementById('live-status-badge');
const statusText = document.getElementById('status-text');
const countdownSection = document.getElementById('countdown-section');

// 4. UI UPDATE FUNCTION
function updateUI(data) {
    // Theme Update
    if (data.theme) {
        body.className = data.theme;
    }

    // Announcement Update
    if (data.announcementEnabled && data.announcement && data.announcement.trim() !== "") {
        announcementText.innerText = data.announcement;
        announcementBanner.classList.remove('hidden');
    } else {
        announcementBanner.classList.add('hidden');
    }

    // YouTube Video ID Update
    if (data.youtubeVideoId) {
        const targetSrc = `https://www.youtube.com/embed/${data.youtubeVideoId}?autoplay=1&mute=1&rel=0&modestbranding=1`;
        if (youtubePlayer.src !== targetSrc) {
            youtubePlayer.src = targetSrc;
        }
    }

    // Live Status Update
    if (data.liveEnabled) {
        statusBadge.classList.remove('scheduled-state');
        statusBadge.classList.add('live-state');
        statusText.innerText = 'LIVE DARSHAN';
        countdownSection.classList.add('hidden');
        if (countdownInterval) clearInterval(countdownInterval);
    } else {
        statusBadge.classList.remove('live-state');
        statusBadge.classList.add('scheduled-state');
        statusText.innerText = 'Live Darshan Starting Soon';
        
        // Countdown Logic
        if (data.countdownEnabled && data.darshanDate && data.darshanTime) {
            countdownSection.classList.remove('hidden');
            startCountdown(data.darshanDate, data.darshanTime);
        } else {
            countdownSection.classList.add('hidden');
            if (countdownInterval) clearInterval(countdownInterval);
        }
    }

    // Flower Effect Status
    isFlowerRainActive = data.flowerEffectsEnabled !== false; // default true if undefined
}

// 5. COUNTDOWN LOGIC
function startCountdown(dateStr, timeStr) {
    if (countdownInterval) clearInterval(countdownInterval);
    
    // Convert to IST Time
    const targetDate = new Date(`${dateStr}T${timeStr}:00+05:30`).getTime();
    
    const updateTimer = () => {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            clearInterval(countdownInterval);
            document.getElementById('cd-days').innerText = "00";
            document.getElementById('cd-hours').innerText = "00";
            document.getElementById('cd-minutes').innerText = "00";
            document.getElementById('cd-seconds').innerText = "00";
            return;
        }

        document.getElementById('cd-days').innerText = String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, '0');
        document.getElementById('cd-hours').innerText = String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
        document.getElementById('cd-minutes').innerText = String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
        document.getElementById('cd-seconds').innerText = String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0');
    };
    
    updateTimer();
    countdownInterval = setInterval(updateTimer, 1000);
}

// 6. FIRESTORE LISTENER
const siteDocRef = doc(db, "settings/site");
onSnapshot(siteDocRef, (docSnap) => {
    if (docSnap.exists()) {
        updateUI(docSnap.data());
    }
}, (error) => {
    console.error("Error fetching data from Firestore:", error);
});

// 7. CANVAS ANIMATION (Flower Rain & Glowing Particles)
const canvas = document.getElementById('effects-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor() {
        this.reset(true);
    }
    
    reset(initial = false) {
        this.x = Math.random() * canvas.width;
        this.y = initial ? Math.random() * canvas.height : -20;
        this.size = Math.random() * 3 + 2;
        this.speedY = Math.random() * 1 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.3;
        this.angle = Math.random() * Math.PI * 2;
        this.spin = (Math.random() - 0.5) * 0.02;
        
        const rand = Math.random();
        if(rand < 0.4) this.type = 0; // Glow particle
        else if (rand < 0.7) this.type = 1; // Marigold
        else if (rand < 0.9) this.type = 2; // Rose
        else this.type = 3; // White petal
    }

    update() {
        this.y += this.speedY;
        this.x += Math.sin(this.angle) * 0.5 + this.speedX;
        this.angle += this.spin;
        
        if (this.y > canvas.height + 20) {
            if (isFlowerRainActive || this.type === 0) {
                this.reset();
            }
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.globalAlpha = this.opacity;
        
        if (!isFlowerRainActive && this.type !== 0) {
            ctx.restore();
            return;
        }

        if (this.type === 0) {
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fillStyle = '#FFD700';
            ctx.fill();
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#FFD700';
        } else {
            ctx.beginPath();
            ctx.ellipse(0, 0, this.size * 2, this.size, 0, 0, Math.PI * 2);
            if (this.type === 1) ctx.fillStyle = '#f59e0b';
            else if (this.type === 2) ctx.fillStyle = '#ec4899';
            else ctx.fillStyle = '#ffffff';
            ctx.fill();
        }
        
        ctx.restore();
    }
}

for(let i = 0; i < 40; i++) {
    particles.push(new Particle());
}

function animateCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateCanvas);
}
animateCanvas();
  
