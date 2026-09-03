import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, onSnapshot, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Your Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDVncgVZCzOPHWPFRbIBYACTcOAUImKqmM",
  authDomain: "parking-108d1.firebaseapp.com",
  projectId: "parking-108d1",
  storageBucket: "parking-108d1.firebasestorage.app",
  messagingSenderId: "237479413570",
  appId: "1:237479413570:web:6806405b54bd3218feeadb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Database Reference
const siteDocRef = doc(db, "settings/site");

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const saveBtn = document.getElementById('save-settings-btn');
const saveStatus = document.getElementById('save-status');

// 1. AUTHENTICATION LOGIC
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    const btn = document.getElementById('login-btn');
    
    try {
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        btn.disabled = true;
        loginError.classList.add('hidden');
        
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        loginError.innerText = "Access Denied. Check credentials.";
        loginError.classList.remove('hidden');
        btn.innerHTML = 'Login to Dashboard';
        btn.disabled = false;
    }
});

logoutBtn.addEventListener('click', () => {
    signOut(auth);
});

onAuthStateChanged(auth, (user) => {
    if (user && !user.isAnonymous) {
        // Admin is logged in
        loginScreen.classList.add('hidden');
        dashboardScreen.classList.remove('hidden');
        loadCurrentSettings();
        generateQR();
    } else {
        // Not logged in or anonymous
        loginScreen.classList.remove('hidden');
        dashboardScreen.classList.add('hidden');
        document.getElementById('login-btn').innerHTML = 'Login to Dashboard';
        document.getElementById('login-btn').disabled = false;
    }
});

// 2. DASHBOARD DATA MANAGEMENT
function populateForm(data) {
    document.getElementById('ctrl-live').checked = data.liveEnabled || false;
    document.getElementById('ctrl-yt-id').value = data.youtubeVideoId || 'Qt8zL525RZQ';
    document.getElementById('ctrl-countdown-en').checked = data.countdownEnabled || false;
    document.getElementById('ctrl-date').value = data.darshanDate || '';
    document.getElementById('ctrl-time').value = data.darshanTime || '';
    document.getElementById('ctrl-theme').value = data.theme || 'theme-royal-krishna';
    document.getElementById('ctrl-announcement-en').checked = data.announcementEnabled || false;
    document.getElementById('ctrl-announcement-text').value = data.announcement || '';
    document.getElementById('ctrl-flowers').checked = data.flowerEffectsEnabled !== false;
}

function loadCurrentSettings() {
    onSnapshot(siteDocRef, (docSnap) => {
        if (docSnap.exists()) {
            populateForm(docSnap.data());
        }
    });
}

saveBtn.addEventListener('click', async () => {
    const originalHtml = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
    saveBtn.disabled = true;
    
    const newSettings = {
        liveEnabled: document.getElementById('ctrl-live').checked,
        youtubeVideoId: document.getElementById('ctrl-yt-id').value.trim() || 'Qt8zL525RZQ',
        countdownEnabled: document.getElementById('ctrl-countdown-en').checked,
        darshanDate: document.getElementById('ctrl-date').value,
        darshanTime: document.getElementById('ctrl-time').value,
        theme: document.getElementById('ctrl-theme').value,
        announcementEnabled: document.getElementById('ctrl-announcement-en').checked,
        announcement: document.getElementById('ctrl-announcement-text').value,
        flowerEffectsEnabled: document.getElementById('ctrl-flowers').checked
    };

    try {
        await setDoc(siteDocRef, newSettings);
        saveStatus.classList.remove('hidden');
        setTimeout(() => saveStatus.classList.add('hidden'), 3000);
    } catch (error) {
        console.error("Save Error:", error);
        alert("Error saving settings. Make sure you are logged in.");
    } finally {
        saveBtn.innerHTML = originalHtml;
        saveBtn.disabled = false;
    }
});

// 3. QR CODE GENERATOR
function generateQR() {
    // Get the root URL (remove /admin/ or /admin/index.html)
    let currentPath = window.location.href;
    let publicUrl = currentPath.substring(0, currentPath.lastIndexOf('/admin/')) + '/';
    
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(publicUrl)}&bgcolor=FFFFFF&color=000000`;
    
    document.getElementById('qr-image').src = qrUrl;
    document.getElementById('qr-download').href = qrUrl;
}
  
