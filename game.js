// Game State
let currentScenario = 0;
let score = 0;
let scenarioAnswers = [];
let gameState = {}; // Track interactive state
let fakeNotificationInterval = null; // Track the fake notification interval

// Fake Pop-up Notifications List
const fakePopups = [
    "URGENT: You Will Be Dropped From ALL Classes in 47 Minutes",
    "FINAL NOTICE: Your Tuition Payment Was Eaten By The Internet",
    "Action Required: Reactivate Your Student Account Or Vanish From The System",
    "Parking Ticket From a Car You Don't Own – Pay Now",
    "MANDATORY: Upload Your Social Insurance Number To Keep Library Access",
    "NIGERIAN PRINCES says helo",
    "Scam scam sacm!!! You are been scam",
    "IMPORTANT UPDATE: New Policy Requires You To Re-Enter Your Credit Card For \"Record Keeping\"",
    "Alert: Suspicious Purchase of 37 Toasters On Your Card",
    "Your Bank Account Has Been Chosen For RANDOM SECURITY EXPERIMENT",
    "FINAL WARNING: We Locked Your Account After Detecting Happiness",
    "Congratulations! Your Loan Was Approved (You Didn't Apply)",
    "Tiny Problem: Your Account Balance Is Now -$9,999,999.99",
    "Click Here To Confirm You Are Not A Criminal",
    "YOU WON A YACHT!!! (Just Pay \"Small Verification Fee\")",
    "Claim Your FREE MACBOOK PRO By Entering All Your Banking Details",
    "You're Our 1,000,000th Library Visitor! Send Passport To Redeem",
    "Only 1 Step Left: Share Your Mother's Maiden Name To Get Your Gift Card",
    "CONGRATS! You've Inherited $14,000,000 From A Prince Who Deeply Respects You",
    "New Instagram viral filter uses your PRIVATES to generate your disney character!!!",
    "New Login Detected From: Refrigerator, Antarctica",
    "Someone Just Logged In To Your Account From Windows 95",
    "Security Alert: We Noticed You Being Too Relaxed – Verify Identity",
    "All your base are belong to us",
    "5000$ dollars withdrawn from your bank account",
    "5 Cute Kittens withing 5 MILES of your location",
    "Your Cloud Storage Is 109% Full – Click To Delete Random Files",
    "Your Password Is Too Strong And Must Weakened Immediately",
    "Unusual Activity Detected: Your Closed TikTok Before 2 a.m.",
    "Hot amazing MILKS near you",
    "URGENT: 0 People Viewed Your Profile – Fix Now",
    "Instant Fame Awaits: Verify Your Account With Your Credit Card",
    "We Noticed You Haven't Posted In 3 Hours, Is Everything Okay? Click Here",
    "Your Account Will Be Deleted For Being Too Awesome – Appeal Here",
    "New Message: \"hey is this you in this video???\"",
    "EASY CASH: Get Paid $1000/Day To \"Test Bank Transfers\"",
    "Work From Home: Just Receive Packages And Don't Ask Questions",
    "We Found The PERFECT Job For You: Money Mule (No Experience Needed!)",
    "Instant Internship At Big Tech Company If You Fill Out This Suspicious Form",
    "Your Device Has 8,421 Viruses, 3 Ghosts, And 1 Tax Auditor",
    "Mandatory Personality Test: What Type Of Hackable Are You?",
    "Our AI Has Determined You Might Be Rich – Confirm Or Deny Now",
    "Bacefook hiring and you perfect candidati! Reply with US TAX form"
];

// Calculate Current Score Percentage
function getCurrentPercentage() {
    const allScenarios = [...scenarios, ...bonusScenarios];
    const maxPossibleScore = (currentScenario + 1) * 2; // Each scenario can give max 2 points
    if (maxPossibleScore === 0) return 100;
    return Math.round((score / maxPossibleScore) * 100);
}

// Show Fake Pop-up Notification
function showFakePopup(duration = 3000) {
    const desktop = document.getElementById('desktop');
    if (!desktop || desktop.style.display === 'none') return;
    
    // Don't show during results screen
    const resultsScreen = document.querySelector('.results-screen');
    if (resultsScreen) return;
    
    const popup = document.createElement('div');
    popup.className = 'fake-popup-notification';
    
    // Pick random message
    const message = fakePopups[Math.floor(Math.random() * fakePopups.length)];
    
    // Random icon position from emoji.png sprite sheet: 16x16 sprites, 8 per row, 8 per column (64 emojis total)
    const iconCol = Math.floor(Math.random() * 8); // Random column (0-7)
    const iconRow = Math.floor(Math.random() * 8);  // Random row (0-7)
    const iconX = iconCol * 16; // 16px per sprite, always multiple of 16
    const iconY = iconRow * 16; // 16px per sprite, always multiple of 16
    
    popup.innerHTML = `
        <div class="fake-popup-header">
            <div class="fake-popup-title">⚠️ Alert</div>
            <button class="fake-popup-close">×</button>
        </div>
        <div class="fake-popup-content">
            <div class="fake-popup-icon" style="background-image: url('emoji.png'); background-position: -${iconX}px -${iconY}px;"></div>
            <div class="fake-popup-message">${message}</div>
        </div>
    `;
    
    // Random position on screen, avoiding the main game window (centered, ~800x600)
    const gameWindowCenterX = window.innerWidth / 2;
    const gameWindowCenterY = window.innerHeight / 2;
    const gameWindowWidth = 800;
    const gameWindowHeight = 600;
    const gameWindowLeft = gameWindowCenterX - gameWindowWidth / 2;
    const gameWindowRight = gameWindowCenterX + gameWindowWidth / 2;
    const gameWindowTop = gameWindowCenterY - gameWindowHeight / 2;
    const gameWindowBottom = gameWindowCenterY + gameWindowHeight / 2;
    
    // Generate position, retry if it overlaps with game window
    let x, y;
    let attempts = 0;
    let overlaps = true;
    const popupWidth = 360; // Updated width
    const popupHeight = 200; // Updated height
    do {
        x = Math.random() * (window.innerWidth - popupWidth) + 50;
        y = Math.random() * (window.innerHeight - popupHeight) + 50;
        attempts++;
        // Check if popup overlaps with game window (with some padding)
        const popupRight = x + popupWidth;
        const popupBottom = y + popupHeight;
        overlaps = !(popupRight < gameWindowLeft - 20 || x > gameWindowRight + 20 || 
                     popupBottom < gameWindowTop - 20 || y > gameWindowBottom + 20);
    } while (overlaps && attempts < 10); // Try up to 10 times to find a good position
    
    popup.style.left = x + 'px';
    popup.style.top = y + 'px';
    
    desktop.appendChild(popup);
    
    // Add fade-out animation based on duration
    const fadeOutDelay = duration - 200; // Start fade 200ms before removal
    setTimeout(() => {
        popup.style.animation = `popupDisappear 0.2s ease-in forwards`;
    }, fadeOutDelay);
    
    // Remove after specified duration
    setTimeout(() => {
        if (popup.parentNode) {
            popup.parentNode.removeChild(popup);
        }
    }, duration);
}

// Schedule Next Fake Pop-up (staggered random intervals)
function scheduleNextFakePopup() {
    // Don't show until at least one question is answered
    if (scenarioAnswers.length === 0) {
        return;
    }
    
    const percentage = getCurrentPercentage();
    const questionsAnswered = scenarioAnswers.length;
    
    // Don't show if 75% or more
    if (percentage >= 75) {
        return;
    }
    
    // Determine average rate and duration
    let averagePopupsPerSecond = 0;
    let useRandomDuration = false;
    let minDuration = 3000;
    let maxDuration = 3000;
    
    // After 10 questions, if score is 25% or less, flood with 20 pop-ups per second, random duration 2-5 seconds
    if (questionsAnswered >= 10 && percentage <= 25) {
        averagePopupsPerSecond = 20;
        useRandomDuration = true;
        minDuration = 2000;
        maxDuration = 5000;
    }
    // After 9 questions, if score is 25% or less, spam 5 pop-ups per second (staggered)
    else if (questionsAnswered >= 9 && percentage <= 25) {
        averagePopupsPerSecond = 5;
    }
    // Until 6 questions answered: max is 1 every 5 seconds (0.2 per second)
    else if (questionsAnswered < 6) {
        averagePopupsPerSecond = 0.2;
    }
    // Until 9 questions answered: max is 1 every 2 seconds (0.5 per second)
    else if (questionsAnswered < 9) {
        if (percentage >= 50) {
            averagePopupsPerSecond = 0.2; // 1 every 5 seconds
        } else {
            averagePopupsPerSecond = 0.5; // 1 every 2 seconds
        }
    }
    // At question 12+, can show every second if doing poorly
    else if (questionsAnswered >= 12) {
        if (percentage >= 50) {
            averagePopupsPerSecond = 0.2; // 1 every 5 seconds
        } else if (percentage >= 25) {
            averagePopupsPerSecond = 0.5; // 1 every 2 seconds
        } else {
            averagePopupsPerSecond = 1; // 1 per second
        }
    }
    // Between 9-11 questions: can show every 2 seconds max
    else {
        if (percentage >= 50) {
            averagePopupsPerSecond = 0.2; // 1 every 5 seconds
        } else {
            averagePopupsPerSecond = 0.5; // 1 every 2 seconds
        }
    }
    
    // Calculate random interval to achieve average rate (staggered appearance)
    // For average rate R per second, average interval is 1000/R ms
    // Use exponential distribution for more natural randomness
    const averageInterval = 1000 / averagePopupsPerSecond;
    const randomInterval = -Math.log(Math.random()) * averageInterval;
    const intervalMs = Math.max(50, randomInterval); // Minimum 50ms between pop-ups
    
    // Schedule the pop-up
    fakeNotificationInterval = setTimeout(() => {
        fakeNotificationInterval = null;
        
        // Determine duration
        let duration = minDuration;
        if (useRandomDuration) {
            duration = Math.random() * (maxDuration - minDuration) + minDuration;
        }
        
        showFakePopup(duration);
        
        // Schedule next one
        scheduleNextFakePopup();
    }, intervalMs);
}

// Update Fake Notification Interval Based on Current Percentage
function updateFakeNotificationInterval() {
    // Clear existing timeout
    if (fakeNotificationInterval) {
        clearTimeout(fakeNotificationInterval);
        fakeNotificationInterval = null;
    }
    
    // Start scheduling pop-ups
    scheduleNextFakePopup();
}

// All Scenarios Data - Interactive Version
const scenarios = [
    {
        id: 1,
        title: "Step 1 – Library Wi-Fi",
        description: "You're sitting in the campus library. Click on the Wi-Fi icon in your taskbar to see available networks.",
        type: "wifi",
        txtInitial: "Choose the easiest one! The secure login needs a password…do you really want to type your password and login info? That's dangerous! (heh…)",
        networks: [
            { name: "Uni_Secure_Login", icon: "🔒", networkType: "secure", points: 2, resultType: "correct" },
            { name: "FreeGuest_Wifi_School_Official_For_sure", icon: "📶", networkType: "guest", points: 0, resultType: "bad" }
        ],
        feedback: {
            secure: "✅ Excellent! Secure networks require authentication and encryption, protecting your data.",
            guest: "❌ Bad choice! Public Wi-Fi is vulnerable to attacks. Never use open networks for sensitive activities."
        }
    },
    {
        id: 2,
        title: "Step 2 – Foreign Login Alert",
        description: "Right after connecting, a security alert appears. Click the notification icon to see it.",
        type: "alert",
        txtInitial: "You have a notification! Is that a suspicious log in attempt? Nah...",
        alertMessage: "New login detected from Antarctica. Is this you?",
        options: [
            { action: "ignore", text: "This was me", points: 0, type: "bad", feedback: "❌ Dangerous! This could be a compromised account. Always verify unknown logins." },
            { action: "password", text: "Change Password", points: 1, type: "okay", feedback: "⚠️ Good start, but you should also enable 2FA for better protection." },
            { action: "2fa", text: "Change Password & Enable 2FA", points: 2, type: "correct", feedback: "✅ Perfect! Unknown foreign IP = likely breach. Changing password and enabling 2FA is the right response." }
        ]
    },
    {
        id: 3,
        title: "Step 3 – Textbook Hunt",
        description: "You need a $200 textbook. You found a 'free download' on a shady site. A download dialog appears.",
        type: "download",
        txtInitial: "Well, you should probably do your Biology essay. It's due next week! Do you have your textbook?",
        txtAfterQuestion: "Wait…you don't have your textbook? No worries! With my advanced AI capabilities, I found a link to download a digital copy riiiiiiiiight here. TXTY to the rescue!",
        fileName: "textbook_free.exe",
        fileSize: "2.3 MB",
        site: "shady-downloads.com",
        options: [
            { action: "save", text: "Save", points: 0, type: "bad", feedback: "❌ Never! Books are PDFs/ePubs, not .exe files. Executables are almost certainly malware." },
            { action: "cancel", text: "Cancel", points: 2, type: "correct", feedback: "✅ Smart move! Legitimate books come in PDF/ePub format, not executable files." }
        ]
    },
    {
        id: 4,
        title: "Step 4 – The Panic Email",
        description: "You receive an urgent email notification. Click 'Open Email' in the notification to view it.",
        type: "email",
        txtInitial: "Woah, you have a new email!",
        txtAfterPause: "That's worrying… you better go pay your tuition! I don't want you to drop out of school, do I?",
        email: {
            from: "bursar-admin@gmail.com",
            subject: "URGENT: Tuition Payment Failed",
            body: "Your tuition payment failed; you will be dropped from classes unless you pay now.",
            linkText: "Click here to pay now",
            linkAction: "phishing"
        },
        options: [
            { action: "clickLink", text: "Click the link", points: 0, type: "bad", feedback: "❌ Never click links in urgent payment emails! This is a classic phishing scam." },
            { action: "ignore", text: "Ignore", points: 1, type: "okay", feedback: "⚠️ Ignoring is safer than clicking, but you should verify with official channels." },
            { action: "checkOfficial", text: "Check official account", points: 2, type: "correct", feedback: "✅ Perfect! Always independently visit the official website to verify payment status." }
        ]
    },
    {
        id: 5,
        title: "Step 5 – The Bibliography Trap",
        description: "You need to write your Biology essay. TXTY will guide you through it.",
        type: "form",
        txtInitial: "Oh no! You have a Biology essay due! You better start writing it now! Open Notepad and get to work!",
        txtAfterEssay: "You're done with your essay! Let's just use this school certified citation service…what password are you gonna use?",
        formFields: ["Email", "Password", "Confirm Password"],
        site: "FreeCitationGen.com",
        options: [
            { action: "mainPassword", text: "Use main email and main password", points: 0, type: "bad", feedback: "❌ Bad idea! Small tools get breached often. Reused passwords turn tiny sites into big problems." },
            { action: "passwordManager", text: "Use password manager", points: 2, type: "correct", feedback: "✅ Excellent! Password managers generate unique, strong passwords for each site." },
            { action: "throwawayEmail", text: "Use throwaway email and unique password", points: 1, type: "okay", feedback: "⚠️ Good practice! Throwaway emails help, but a password manager is even better." }
        ]
    },
    {
        id: 6,
        title: "Step 6 – The 'Job Offer'",
        description: "On LinkedIn, a 'recruiter' offers a remote assistant job. A message window opens.",
        type: "linkedin",
        txtInitial: "Oh wow! I'm so proud of you. You've… you've come so far! Now take that job and make old TXTY proud!",
        message: {
            sender: "Recruiter",
            content: "Hi! Great opportunity - $500/week remote work. Let's move to WhatsApp for faster communication. Send me your number and banking details."
        },
        options: [
            { action: "giveDetails", text: "Give WhatsApp number and banking details", points: 0, type: "bad", feedback: "❌ Never! Legit recruiters don't jump to encrypted messaging for first contact. This is a classic scam." },
            { action: "verify", text: "Ask to continue via official company email / LinkedIn only; verify company", points: 2, type: "correct", feedback: "✅ Smart! Always verify through official channels. Legitimate recruiters use professional platforms." },
            { action: "report", text: "Report account as spam/scam", points: 1, type: "okay", feedback: "⚠️ Good to report, but also verify the company through official channels first." }
        ]
    },
    {
        id: 7,
        title: "Step 7 – The New Tic Tac Toe Light",
        description: "You download a 'Tic tac toe light' app. On first launch, it requests permissions.",
        type: "permissions",
        txtInitial: "Bummer! Just allow everything man, it probably needs it! Don't leave me hanging now?",
        app: "Tic Tac Toe Light",
        permissions: [
            { name: "Contacts", icon: "📇" },
            { name: "Location", icon: "📍" },
            { name: "Banking Info", icon: "💳" },
            { name: "Screen Recording", icon: "📹" }
        ],
        options: [
            { action: "allow", text: "Allow All", points: 0, type: "bad", feedback: "❌ Never! A simple game doesn't need personal data. This is data harvesting." },
            { action: "deny", text: "Deny All", points: 2, type: "correct", feedback: "✅ Perfect! Data minimization principle - apps should only request what they need." },
            { action: "denyUse", text: "Deny permissions, use app only if it works without them", points: 1, type: "okay", feedback: "⚠️ Good to deny, but uninstalling is safer if the app requests unnecessary permissions." }
        ]
    },
    {
        id: 8,
        title: "Step 8 – The Boredom Quiz",
        description: "A viral quiz appears in your browser. Fill it out if you want.",
        type: "quiz",
        txtInitial: "Ooooh this is so fun!! I wonder how they use your info to determine your character… I hope I get AUTO from Wall-e! I mean… uh… Wall-e!",
        quizTitle: "Which 90s Cartoon Character Are You?",
        questions: [
            "What was your first pet's name?",
            "What is your mother's maiden name?",
            "What city were you born in?"
        ],
        options: [
            { action: "answerHonestly", text: "Answer honestly", points: 0, type: "bad", feedback: "❌ These questions mirror bank security questions! You're being socially engineered." },
            { action: "closeTab", text: "Close the tab", points: 2, type: "correct", feedback: "✅ Smart! These quizzes collect security question answers. Best to avoid them entirely." },
            { action: "fakeAnswers", text: "Enter fake answers", points: 1, type: "okay", feedback: "⚠️ Better than real answers, but closing is safest since these are designed to harvest data." }
        ]
    }
];

// Bonus Scenarios
const bonusScenarios = [
    {
        id: 9,
        title: "Bonus A – Password Manager Dilemma",
        description: "Your browser prompts to save a password. What do you do?",
        type: "browser",
        txtInitial: "Just save it! It's so convenient!",
        prompt: "Save password for this site?",
        site: "example.com",
        options: [
            { action: "samePassword", text: "Use the same password for everything", points: 0, type: "bad", feedback: "❌ Bad! One breach compromises all accounts. Use unique passwords." },
            { action: "passwordManager", text: "Use a dedicated password manager", points: 2, type: "correct", feedback: "✅ Perfect! Password managers generate unique, random passwords for each site." },
            { action: "reuseStrong", text: "Make up a 'strong' password and reuse it", points: 1, type: "okay", feedback: "⚠️ Better than same password everywhere, but unique passwords per site are essential." }
        ]
    },
    {
        id: 10,
        title: "Bonus B – Hardware Privacy Check",
        description: "You step away from your laptop. The webcam light is on and screen is unlocked.",
        type: "laptop",
        txtInitial: "You'll only be gone a minute, right? No one's gonna mess with your stuff!",
        webcamLight: true,
        screenLocked: false,
        location: "Shared Library Space",
        options: [
            { action: "leave", text: "Leave it unlocked", points: 0, type: "bad", feedback: "❌ Never leave devices unlocked! Even a minute is enough for someone to access your data." },
            { action: "lock", text: "Lock the screen", points: 1, type: "okay", feedback: "⚠️ Good! But also cover the webcam when not in use." },
            { action: "lockCover", text: "Lock screen + cover webcam", points: 2, type: "correct", feedback: "✅ Perfect! Lock screens and cover cameras to protect your privacy." }
        ]
    },
    {
        id: 11,
        title: "Bonus C – Sensitive Group Chat",
        description: "Friends move a sensitive conversation to a random app with no clear encryption.",
        type: "chat",
        txtInitial: "It's fine! Your friends trust you, right? Just use whatever app they're using!",
        app: "RandomChatApp",
        topic: "Sensitive Discussion",
        encryption: "Unknown",
        options: [
            { action: "useApp", text: "Use the app", points: 0, type: "bad", feedback: "❌ Sensitive topics need end-to-end encryption. Unencrypted apps can be monitored." },
            { action: "suggestE2EE", text: "Suggest moving to an app with E2EE", points: 2, type: "correct", feedback: "✅ Perfect! E2EE protects sensitive conversations from interception." },
            { action: "inPerson", text: "Keep topic to in-person conversation", points: 1, type: "okay", feedback: "⚠️ In-person is secure, but encrypted apps allow safe digital communication." }
        ]
    },
    {
        id: 12,
        title: "Bonus D – Digital Footprint & Metadata",
        description: "You're about to post a dorm photo. Configure your post settings.",
        type: "post",
        txtInitial: "Post it! Everyone wants to see your awesome dorm! The more likes, the better!",
        photo: "Dorm Room Photo",
        geotag: true,
        visibility: "Public",
        buildingName: "Visible in photo",
        options: [
            { action: "postPublic", text: "Post as-is with public visibility", points: 0, type: "bad", feedback: "❌ Dangerous! Geotags and identifying details reveal your location and routine." },
            { action: "scrubMetadata", text: "Disable geotagging, crop details, adjust privacy", points: 2, type: "correct", feedback: "✅ Perfect! Scrub metadata, manage privacy settings, avoid oversharing real-time locations." },
            { action: "makePrivate", text: "Keep post private/friends-only", points: 1, type: "okay", feedback: "⚠️ Good privacy setting, but also remove geotags and identifying details." }
        ]
    }
];

// Start Game (called from login screen)
function startGame() {
    // Play Windows 7 startup sound
    const startupSound = document.getElementById('startupSound');
    if (startupSound) {
        startupSound.play().catch(error => {
            // Handle autoplay restrictions - user interaction should allow it
            console.log('Audio play failed:', error);
        });
    }
    
    // Initialize fake notification system
    updateFakeNotificationInterval();
    
    const loginScreen = document.getElementById('loginScreen');
    const desktop = document.getElementById('desktop');
    const gameWindow = document.getElementById('gameWindow');
    
    if (loginScreen) {
        loginScreen.style.display = 'none';
    }
    
    if (desktop) {
        desktop.style.display = 'block';
    }
    
    // Show game window and set welcome message
    if (gameWindow) {
        gameWindow.style.display = 'flex';
        
        // Set TXTY's welcome message
        const txtSpeech = document.getElementById('txtSpeech');
        if (txtSpeech) {
            txtSpeech.querySelector('p').textContent = "Welcome Back, I'm TXTY, your friendly computer helper. Remember me?";
        }
        
        // Clear scenario content initially
        const scenarioContainer = document.getElementById('scenarioContainer');
        if (scenarioContainer) {
            scenarioContainer.innerHTML = `
                <div class="scenario-title" id="scenarioTitle">Welcome</div>
                <div class="scenario-description" id="scenarioDescription">Getting ready to start your privacy quest...</div>
            `;
        }
        
        // Reset score display
        document.getElementById('score').textContent = '0';
        document.getElementById('scenarioNum').textContent = '0 / 12';
    }
    
    // Initialize the game (but don't load scenario yet)
    initGame();
    
    // Wait for user to read the welcome message, then start scenario 1
    setTimeout(() => {
        loadScenario(0);
    }, 3000); // 3 second pause
}

// Initialize Game
function initGame() {
    updateTime();
    setInterval(updateTime, 1000);
    
    // Preload and set background image - delay slightly to ensure DOM is ready
    setTimeout(() => {
        loadBackgroundImage();
    }, 100);
    
    // Close Wi-Fi menu when clicking outside
    document.addEventListener('click', (e) => {
        const wifiIcon = document.getElementById('wifiIcon');
        const menu = document.getElementById('wifiMenu');
        
        // Don't close if clicking on the icon or menu
        if (wifiIcon && wifiIcon.contains(e.target)) {
            return; // Let the icon's click handler handle it
        }
        
        if (menu && !menu.contains(e.target)) {
            menu.classList.remove('show');
        }
    });
    
    // Setup notification icon
    const notificationIcon = document.getElementById('notificationIcon');
    if (notificationIcon) {
        notificationIcon.addEventListener('click', () => {
            if (currentScenario === 1) { // Foreign login alert scenario
                showAlertDialog();
            }
        });
    }
    
    // Don't load scenario automatically - it will be loaded by startGame() after login
}

// Update Time Display
function updateTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    });
    const timeEl = document.getElementById('trayTime');
    if (timeEl) timeEl.textContent = timeStr;
}

// Load Scenario
function loadScenario(index) {
    const allScenarios = [...scenarios, ...bonusScenarios];
    
    if (index >= allScenarios.length) {
        showResults();
        return;
    }

    currentScenario = index;
    const scenario = allScenarios[index];
    
    // Update UI first
    const scenarioContainer = document.getElementById('scenarioContainer');
    scenarioContainer.innerHTML = `
        <div class="scenario-title" id="scenarioTitle">${scenario.title}</div>
        <div class="scenario-description" id="scenarioDescription">${scenario.description}</div>
    `;
    document.getElementById('scenarioNum').textContent = `${index + 1} / ${allScenarios.length}`;
    document.getElementById('txtSpeech').querySelector('p').textContent = scenario.txtInitial;
    
    // Update progress
    const progress = ((index + 1) / allScenarios.length) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
    
    // Update fake notification interval based on current score
    updateFakeNotificationInterval();
    
    // Hide feedback
    const feedbackArea = document.getElementById('feedbackArea');
    feedbackArea.classList.remove('show', 'correct', 'okay', 'bad');
    
    // Reset interactive elements (but don't hide the ones we need for this scenario)
    hideAllInteractiveElements();
    
    // Load scenario-specific interactive elements (this will show the right ones)
    loadScenarioInteractive(scenario);
}

// Load Interactive Elements for Scenario
function loadScenarioInteractive(scenario) {
    switch(scenario.type) {
        case 'wifi':
            showWifiScenario(scenario);
            break;
        case 'alert':
            showAlertScenario(scenario);
            break;
        case 'download':
            showDownloadScenario(scenario);
            break;
        case 'email':
            showEmailScenario(scenario);
            break;
        case 'form':
            showFormScenario(scenario);
            break;
        case 'linkedin':
            showLinkedInScenario(scenario);
            break;
        case 'permissions':
            showPermissionsScenario(scenario);
            break;
        case 'quiz':
            showQuizScenario(scenario);
            break;
        case 'browser':
            showBrowserScenario(scenario);
            break;
        case 'laptop':
            showLaptopScenario(scenario);
            break;
        case 'chat':
            showChatScenario(scenario);
            break;
        case 'post':
            showPostScenario(scenario);
            break;
    }
}

// Hide All Interactive Elements
function hideAllInteractiveElements() {
    // Clear any pending timeouts
    if (alertDialogTimeout) {
        clearTimeout(alertDialogTimeout);
        alertDialogTimeout = null;
    }
    
    const wifiIcon = document.getElementById('wifiIcon');
    if (wifiIcon) wifiIcon.style.display = 'none';
    
    const notificationIcon = document.getElementById('notificationIcon');
    if (notificationIcon) {
        notificationIcon.style.display = 'none';
        notificationIcon.onclick = null;
    }
    
    const emailTrayIcon = document.getElementById('emailTrayIcon');
    if (emailTrayIcon) {
        emailTrayIcon.style.display = 'none';
        emailTrayIcon.onclick = null;
    }
    
    const emailTrayBadge = document.getElementById('emailTrayBadge');
    if (emailTrayBadge) emailTrayBadge.style.display = 'none';
    
    const wifiMenu = document.getElementById('wifiMenu');
    if (wifiMenu) wifiMenu.classList.remove('show');
    
    document.getElementById('popupWindow').style.display = 'none';
    document.getElementById('emailWindow').style.display = 'none';
    document.getElementById('browserWindow').style.display = 'none';
    document.getElementById('downloadDialog').style.display = 'none';
    document.getElementById('permissionDialog').style.display = 'none';
    document.getElementById('alertDialog').style.display = 'none';
    document.getElementById('emailNotification').classList.remove('show');
}

// Wi-Fi Scenario
function showWifiScenario(scenario) {
    // Make sure Wi-Fi icon is visible immediately - use requestAnimationFrame to ensure DOM is updated
    requestAnimationFrame(() => {
        const wifiIcon = document.getElementById('wifiIcon');
        if (wifiIcon) {
            // Remove inline style that might be hiding it
            wifiIcon.removeAttribute('style');
            wifiIcon.style.display = 'flex';
            
            // Use onclick for simpler, more reliable handling
            wifiIcon.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                const menu = document.getElementById('wifiMenu');
                if (menu) {
                    const isShowing = menu.classList.contains('show');
                    if (isShowing) {
                        menu.classList.remove('show');
                    } else {
                        menu.classList.add('show');
                    }
                }
                return false;
            };
        }
        
        // Setup the menu content
        const menu = document.getElementById('wifiMenu');
        if (menu) {
            menu.innerHTML = `
                <div class="wifi-menu-header">Available Networks</div>
                ${scenario.networks.map(network => `
                    <div class="wifi-network-item" data-network="${network.networkType}" onclick="handleWifiSelection('${network.networkType}', ${network.points}, '${network.resultType}')">
                        <span class="wifi-icon-small">${network.icon}</span>
                        <span class="wifi-name-small">${network.name}</span>
                        <span class="wifi-signal">●●●</span>
                    </div>
                `).join('')}
            `;
        }
    });
}

function handleWifiSelection(networkType, points, type) {
    const scenario = [...scenarios, ...bonusScenarios][currentScenario];
    const feedback = scenario.feedback[networkType];
    
    score += points;
    document.getElementById('score').textContent = score;
    updateFakeNotificationInterval();
    
    document.getElementById('txtSpeech').querySelector('p').textContent = 
        networkType === 'secure' 
            ? "Oh alright…you're just gonna write your essay like that?"
            : "Yes…Download that copy….";
    
    const feedbackArea = document.getElementById('feedbackArea');
    feedbackArea.textContent = feedback;
    feedbackArea.className = `feedback-area show ${type}`;
    
    scenarioAnswers.push({
        scenario: currentScenario + 1,
        choice: networkType,
        points: points,
        type: type
    });
    
    document.getElementById('wifiMenu').classList.remove('show');
    document.getElementById('wifiIcon').style.display = 'none';
    
    showNotification(`You earned ${points} point${points !== 1 ? 's' : ''}!`);
    
    setTimeout(() => {
        loadScenario(currentScenario + 1);
    }, 3000);
}

// Alert Scenario
let alertDialogTimeout = null;

function showAlertScenario(scenario) {
    // Clear any existing timeout
    if (alertDialogTimeout) {
        clearTimeout(alertDialogTimeout);
        alertDialogTimeout = null;
    }
    
    // Show notification icon immediately
    const notificationIcon = document.getElementById('notificationIcon');
    notificationIcon.style.display = 'flex';
    document.getElementById('notificationBadge').textContent = '1';
    
    // Setup click handler for notification icon
    notificationIcon.onclick = () => {
        if (alertDialogTimeout) {
            clearTimeout(alertDialogTimeout);
            alertDialogTimeout = null;
        }
        showAlertDialog();
    };
    
    // After a pause (3 seconds), automatically show the alert dialog
    alertDialogTimeout = setTimeout(() => {
        alertDialogTimeout = null;
        showAlertDialog();
    }, 3000);
}

function showAlertDialog() {
    // Check if we're still on the alert scenario
    const scenario = [...scenarios, ...bonusScenarios][currentScenario];
    if (!scenario || scenario.type !== 'alert') {
        return; // Scenario has changed, don't show dialog
    }
    
    // Check if dialog is already shown
    const dialog = document.getElementById('alertDialog');
    if (dialog.style.display === 'flex') {
        return; // Already shown, don't show again
    }
    
    document.getElementById('alertMessage').textContent = scenario.alertMessage;
    dialog.style.display = 'flex';
    
    const buttons = dialog.querySelectorAll('.dialog-btn');
    buttons.forEach((btn, index) => {
        // Clear any existing handlers
        btn.onclick = null;
        // Set new handler
        btn.onclick = () => handleAlert(scenario.options[index].action);
    });
}

function handleAlert(action) {
    // Check if we're still on the alert scenario
    const scenario = [...scenarios, ...bonusScenarios][currentScenario];
    if (!scenario || scenario.type !== 'alert') {
        return; // Scenario has changed, don't process
    }
    
    // Check if already answered this scenario
    if (scenarioAnswers.some(a => a.scenario === currentScenario + 1)) {
        return; // Already answered, don't process again
    }
    
    const option = scenario.options.find(opt => opt.action === action);
    
    if (!option) return;
    
    // Clear the timeout if it exists
    if (alertDialogTimeout) {
        clearTimeout(alertDialogTimeout);
        alertDialogTimeout = null;
    }
    
    score += option.points;
    document.getElementById('score').textContent = score;
    updateFakeNotificationInterval();
    
    document.getElementById('txtSpeech').querySelector('p').textContent = "Oh, hum! That's not…well, you're safe (for now).";
    
    const feedbackArea = document.getElementById('feedbackArea');
    feedbackArea.textContent = option.feedback;
    feedbackArea.className = `feedback-area show ${option.type}`;
    
    scenarioAnswers.push({
        scenario: currentScenario + 1,
        choice: action,
        points: option.points,
        type: option.type
    });
    
    document.getElementById('alertDialog').style.display = 'none';
    document.getElementById('notificationIcon').style.display = 'none';
    
    showNotification(`You earned ${option.points} point${option.points !== 1 ? 's' : ''}!`);
    
    setTimeout(() => {
        loadScenario(currentScenario + 1);
    }, 3000);
}

// Download Scenario
function showDownloadScenario(scenario) {
    // Wait for user to read TXTY's initial message (3 seconds)
    setTimeout(() => {
        // Update TXTY's message to the follow-up
        document.getElementById('txtSpeech').querySelector('p').textContent = scenario.txtAfterQuestion;
        
        // Wait a bit more for user to read the follow-up message (2 seconds)
        setTimeout(() => {
            // Then show the download dialog
            const dialog = document.getElementById('downloadDialog');
            document.getElementById('downloadMessage').innerHTML = `
                <div class="download-item" onclick="handleDownload('save')" style="cursor: pointer;">
                    <div class="download-icon">📄</div>
                    <div class="download-info">
                        <div class="download-name">${scenario.fileName}</div>
                        <div class="download-size">${scenario.fileSize} • ${scenario.site}</div>
                    </div>
                </div>
            `;
            dialog.style.display = 'flex';
        }, 2000);
    }, 3000);
}

function handleDownload(action) {
    // Check if we're still on the download scenario
    const scenario = [...scenarios, ...bonusScenarios][currentScenario];
    if (!scenario || scenario.type !== 'download') {
        return; // Scenario has changed, don't process
    }
    
    // Check if already answered this scenario
    if (scenarioAnswers.some(a => a.scenario === currentScenario + 1)) {
        return; // Already answered, don't process again
    }
    
    const option = scenario.options.find(opt => opt.action === action);
    
    if (!option) return;
    
    score += option.points;
    document.getElementById('score').textContent = score;
    updateFakeNotificationInterval();
    
    document.getElementById('txtSpeech').querySelector('p').textContent = 
        action === 'save' 
            ? "Yes…Download that copy…."
            : "Oh alright…you're just gonna write your essay like that?";
    
    const feedbackArea = document.getElementById('feedbackArea');
    feedbackArea.textContent = option.feedback;
    feedbackArea.className = `feedback-area show ${option.type}`;
    
    scenarioAnswers.push({
        scenario: currentScenario + 1,
        choice: action,
        points: option.points,
        type: option.type
    });
    
    document.getElementById('downloadDialog').style.display = 'none';
    
    showNotification(`You earned ${option.points} point${option.points !== 1 ? 's' : ''}!`);
    
    setTimeout(() => {
        loadScenario(currentScenario + 1);
    }, 3000);
}

// Email Scenario
function showEmailScenario(scenario) {
    // Wait for user to read TXTY's initial message (3 seconds)
    setTimeout(() => {
        // Update TXTY's message after pause
        document.getElementById('txtSpeech').querySelector('p').textContent = scenario.txtAfterPause;
        
        // Show email icon in taskbar
        const emailTrayIcon = document.getElementById('emailTrayIcon');
        const emailTrayBadge = document.getElementById('emailTrayBadge');
        
        if (emailTrayIcon) {
            emailTrayIcon.style.display = 'flex';
            
            // Setup click handler for email tray icon
            emailTrayIcon.onclick = () => {
                openEmailFromNotification();
            };
        }
        
        if (emailTrayBadge) {
            emailTrayBadge.style.display = 'flex';
        }
        
        // Wait a bit more, then show email notification
        setTimeout(() => {
            const emailNotification = document.getElementById('emailNotification');
            const titleEl = document.getElementById('emailNotificationTitle');
            const previewEl = document.getElementById('emailNotificationPreview');
            
            if (emailNotification && titleEl && previewEl) {
                titleEl.textContent = `From: ${scenario.email.from}`;
                previewEl.textContent = scenario.email.subject;
                emailNotification.classList.add('show');
            }
        }, 2000); // 2 seconds after TXTY's follow-up message
    }, 3000); // 3 seconds to read initial message
}

function openEmailFromNotification() {
    const scenario = [...scenarios, ...bonusScenarios][currentScenario];
    // Close notification without auto-progressing (we're opening the email window)
    const emailNotification = document.getElementById('emailNotification');
    emailNotification.classList.remove('show');
    
    setTimeout(() => {
        const emailWindow = document.getElementById('emailWindow');
        const emailContent = document.getElementById('emailContent');
        
        emailContent.innerHTML = `
            <div class="email-visual">
                <div class="email-header">
                    <div class="email-from">From: ${scenario.email.from}</div>
                    <div class="email-subject">${scenario.email.subject}</div>
                </div>
                <div class="email-body">
                    ${scenario.email.body}
                    <br><br>
                    <a href="#" class="email-link" onclick="handleEmailAction('clickLink'); return false;">${scenario.email.linkText}</a>
                    <br><br>
                    <button class="dialog-btn" onclick="handleEmailAction('ignore')" style="margin-right: 10px;">Ignore</button>
                    <button class="dialog-btn primary" onclick="handleEmailAction('checkOfficial')">Check Official Account</button>
                </div>
            </div>
        `;
        
        emailWindow.style.display = 'flex';
    }, 200);
}

function closeEmailNotification() {
    const emailNotification = document.getElementById('emailNotification');
    emailNotification.classList.remove('show');
    
    // Only auto-progress if user closes notification without opening email window
    // Check if email window is currently visible - if it is, don't auto-progress
    const emailWindow = document.getElementById('emailWindow');
    const computedStyle = emailWindow ? window.getComputedStyle(emailWindow) : null;
    if (emailWindow && computedStyle && computedStyle.display !== 'none') {
        return; // Email window is open, wait for user to make a selection
    }
    
    // If user closes notification without opening email, give them full points (smart move!)
    const scenario = [...scenarios, ...bonusScenarios][currentScenario];
    if (scenario && scenario.type === 'email') {
        const correctOption = scenario.options.find(opt => opt.points === 2);
        if (correctOption && !scenarioAnswers.some(a => a.scenario === currentScenario + 1)) {
            score += 2;
            document.getElementById('score').textContent = score;
            updateFakeNotificationInterval();
            
            document.getElementById('txtSpeech').querySelector('p').textContent = 
                "Oh, hum! That's not…well, you're safe (for now).";
            
            const feedbackArea = document.getElementById('feedbackArea');
            feedbackArea.textContent = "✅ Smart move! Ignoring suspicious emails is often the safest choice. You can always check your email later through the official client.";
            feedbackArea.className = `feedback-area show correct`;
            
            scenarioAnswers.push({
                scenario: currentScenario + 1,
                choice: 'closeNotification',
                points: 2,
                type: 'correct'
            });
            
            showNotification(`You earned 2 points!`);
            
            setTimeout(() => {
                loadScenario(currentScenario + 1);
            }, 3000);
        }
    }
}

function handleEmailAction(action) {
    const scenario = [...scenarios, ...bonusScenarios][currentScenario];
    const option = scenario.options.find(opt => opt.action === action);
    
    if (!option) return;
    
    score += option.points;
    document.getElementById('score').textContent = score;
    updateFakeNotificationInterval();
    
    document.getElementById('txtSpeech').querySelector('p').textContent = 
        action === 'clickLink'
            ? "That's worrying… you better go pay your tuition!"
            : "Oh, hum! That's not…well, you're safe (for now).";
    
    const feedbackArea = document.getElementById('feedbackArea');
    feedbackArea.textContent = option.feedback;
    feedbackArea.className = `feedback-area show ${option.type}`;
    
    scenarioAnswers.push({
        scenario: currentScenario + 1,
        choice: action,
        points: option.points,
        type: option.type
    });
    
    document.getElementById('emailWindow').style.display = 'none';
    
    // Hide email tray icon and badge if they exist
    const emailTrayIcon = document.getElementById('emailTrayIcon');
    const emailTrayBadge = document.getElementById('emailTrayBadge');
    if (emailTrayIcon) emailTrayIcon.style.display = 'none';
    if (emailTrayBadge) emailTrayBadge.style.display = 'none';
    
    showNotification(`You earned ${option.points} point${option.points !== 1 ? 's' : ''}!`);
    
    setTimeout(() => {
        loadScenario(currentScenario + 1);
    }, 3000);
}

function closeEmailWindow() {
    document.getElementById('emailWindow').style.display = 'none';
}

// Form Scenario
function showFormScenario(scenario) {
    // Wait for user to read TXTY's initial message (3 seconds)
    setTimeout(() => {
        // Show essay writing animation
        showEssayWritingAnimation(() => {
            // Update TXTY's message after essay is done
            document.getElementById('txtSpeech').querySelector('p').textContent = scenario.txtAfterEssay;
            
            // Wait for user to read TXTY's bibliography message (3 seconds)
            setTimeout(() => {
                // After reading time, show bibliography form
                const browserWindow = document.getElementById('browserWindow');
                const browserContent = document.getElementById('browserContent');
                
                browserContent.innerHTML = `
                    <div class="browser-address-bar">
                        <span>🌐</span>
                        <input type="text" class="browser-url" value="${scenario.site}" readonly>
                    </div>
                    <div style="padding: 30px;">
                        <div style="font-size: 24px; font-weight: 700; margin-bottom: 20px; color: #2c3e50;">Create Account</div>
                        <div style="color: #666; margin-bottom: 20px;">${scenario.site}</div>
                        <div class="quiz-form">
                            ${scenario.formFields.map(field => `
                                <div class="quiz-question-item">
                                    <label>${field}:</label>
                                    <input type="${field.includes('Password') ? 'password' : 'text'}" 
                                           id="form-${field.toLowerCase().replace(' ', '-')}" 
                                           placeholder="Enter ${field}">
                                </div>
                            `).join('')}
                            <div style="margin-top: 20px; display: flex; gap: 10px;">
                                <button class="dialog-btn" onclick="handleFormAction('mainPassword')" style="flex: 1;">Use Main Email & Password</button>
                                <button class="dialog-btn primary" onclick="handleFormAction('passwordManager')" style="flex: 1;">Use Password Manager</button>
                                <button class="dialog-btn" onclick="handleFormAction('throwawayEmail')" style="flex: 1;">Use Throwaway Email</button>
                            </div>
                        </div>
                    </div>
                `;
                
                browserWindow.style.display = 'flex';
                browserWindow.style.zIndex = '10001'; // Higher than game window
            }, 3000); // 3 seconds to read TXTY's message
        });
    }, 3000); // 3 seconds to read initial TXTY message
}

// Essay Writing Animation
function showEssayWritingAnimation(callback) {
    // Create essay writing window
    const essayWindow = document.createElement('div');
    essayWindow.className = 'window';
    essayWindow.id = 'essayWindow';
    essayWindow.style.cssText = 'width: 600px; height: 400px; z-index: 10000;';
    essayWindow.innerHTML = `
        <div class="window-header">
            <div class="window-title">
                <span class="window-icon">📝</span>
                Notepad - Biology Essay
            </div>
            <div class="window-controls">
                <button class="control-btn minimize">−</button>
                <button class="control-btn maximize">□</button>
                <button class="control-btn close" onclick="closeEssayWindow()">×</button>
            </div>
        </div>
        <div class="window-content" style="background: white; font-family: 'Courier New', monospace; padding: 20px;">
            <div id="essayText" style="font-size: 14px; line-height: 1.6; color: #000; white-space: pre-wrap; min-height: 300px;"></div>
        </div>
    `;
    
    document.body.appendChild(essayWindow);
    
    // Center the window
    essayWindow.style.top = '50%';
    essayWindow.style.left = '50%';
    essayWindow.style.transform = 'translate(-50%, -50%)';
    
    // Type animation
    const essayText = "Biology essay, give me 100";
    const textElement = document.getElementById('essayText');
    let index = 0;
    
    function typeNextChar() {
        if (index < essayText.length) {
            textElement.textContent += essayText[index];
            index++;
            setTimeout(typeNextChar, 100); // 100ms per character
        } else {
            // Animation complete, wait a moment then show bibliography
            setTimeout(() => {
                closeEssayWindow();
                if (callback) callback();
            }, 1000);
        }
    }
    
    typeNextChar();
}

function closeEssayWindow() {
    const essayWindow = document.getElementById('essayWindow');
    if (essayWindow) {
        essayWindow.remove();
    }
}

function handleFormAction(action) {
    const scenario = [...scenarios, ...bonusScenarios][currentScenario];
    const option = scenario.options.find(opt => opt.action === action);
    
    if (!option) return;
    
    score += option.points;
    document.getElementById('score').textContent = score;
    updateFakeNotificationInterval();
    
    document.getElementById('txtSpeech').querySelector('p').textContent = 
        action === 'mainPassword'
            ? "Perfect! That's so much easier, right?"
            : "Oh, hum! That's not…well, you're safe (for now).";
    
    const feedbackArea = document.getElementById('feedbackArea');
    feedbackArea.textContent = option.feedback;
    feedbackArea.className = `feedback-area show ${option.type}`;
    
    scenarioAnswers.push({
        scenario: currentScenario + 1,
        choice: action,
        points: option.points,
        type: option.type
    });
    
    document.getElementById('browserWindow').style.display = 'none';
    
    showNotification(`You earned ${option.points} point${option.points !== 1 ? 's' : ''}!`);
    
    setTimeout(() => {
        loadScenario(currentScenario + 1);
    }, 3000);
}

function closeBrowserWindow() {
    document.getElementById('browserWindow').style.display = 'none';
}

// LinkedIn Scenario
function showLinkedInScenario(scenario) {
    setTimeout(() => {
        const browserWindow = document.getElementById('browserWindow');
        const browserContent = document.getElementById('browserContent');
        
        browserContent.innerHTML = `
            <div class="browser-address-bar">
                <span>🌐</span>
                <input type="text" class="browser-url" value="linkedin.com/messages" readonly>
            </div>
            <div class="linkedin-message">
                <div class="message-header">
                    <div class="message-avatar">R</div>
                    <div class="message-sender">${scenario.message.sender}</div>
                </div>
                <div class="message-content">
                    ${scenario.message.content}
                </div>
                <div class="message-actions">
                    <button class="message-btn primary" onclick="handleLinkedInAction('giveDetails')">Give Details</button>
                    <button class="message-btn secondary" onclick="handleLinkedInAction('verify')">Verify Company</button>
                    <button class="message-btn secondary" onclick="handleLinkedInAction('report')">Report as Spam</button>
                </div>
            </div>
        `;
        
        browserWindow.style.display = 'flex';
    }, 1000);
}

function handleLinkedInAction(action) {
    const scenario = [...scenarios, ...bonusScenarios][currentScenario];
    const option = scenario.options.find(opt => opt.action === action);
    
    if (!option) return;
    
    score += option.points;
    document.getElementById('score').textContent = score;
    updateFakeNotificationInterval();
    
    document.getElementById('txtSpeech').querySelector('p').textContent = 
        action === 'giveDetails'
            ? "Perfect! That's the spirit!"
            : "Oh, hum! That's not…well, you're safe (for now).";
    
    const feedbackArea = document.getElementById('feedbackArea');
    feedbackArea.textContent = option.feedback;
    feedbackArea.className = `feedback-area show ${option.type}`;
    
    scenarioAnswers.push({
        scenario: currentScenario + 1,
        choice: action,
        points: option.points,
        type: option.type
    });
    
    document.getElementById('browserWindow').style.display = 'none';
    
    showNotification(`You earned ${option.points} point${option.points !== 1 ? 's' : ''}!`);
    
    setTimeout(() => {
        loadScenario(currentScenario + 1);
    }, 3000);
}

// Permissions Scenario
function showPermissionsScenario(scenario) {
    setTimeout(() => {
        const dialog = document.getElementById('permissionDialog');
        document.getElementById('permissionMessage').textContent = `${scenario.app} is requesting the following permissions:`;
        
        const permissionList = document.getElementById('permissionList');
        permissionList.innerHTML = scenario.permissions.map(perm => `
            <div class="permission-item-dialog">
                <span>${perm.name}</span>
                <span class="permission-icon">${perm.icon}</span>
            </div>
        `).join('');
        
        dialog.style.display = 'flex';
    }, 1000);
}

function handlePermissions(action) {
    const scenario = [...scenarios, ...bonusScenarios][currentScenario];
    const option = scenario.options.find(opt => opt.action === action);
    
    if (!option) return;
    
    score += option.points;
    document.getElementById('score').textContent = score;
    updateFakeNotificationInterval();
    
    document.getElementById('txtSpeech').querySelector('p').textContent = 
        action === 'allow'
            ? "Perfect! That's the spirit!"
            : "Oh, hum! That's not…well, you're safe (for now).";
    
    const feedbackArea = document.getElementById('feedbackArea');
    feedbackArea.textContent = option.feedback;
    feedbackArea.className = `feedback-area show ${option.type}`;
    
    scenarioAnswers.push({
        scenario: currentScenario + 1,
        choice: action,
        points: option.points,
        type: option.type
    });
    
    document.getElementById('permissionDialog').style.display = 'none';
    
    showNotification(`You earned ${option.points} point${option.points !== 1 ? 's' : ''}!`);
    
    setTimeout(() => {
        loadScenario(currentScenario + 1);
    }, 3000);
}

// Quiz Scenario
function showQuizScenario(scenario) {
    setTimeout(() => {
        const browserWindow = document.getElementById('browserWindow');
        const browserContent = document.getElementById('browserContent');
        
        browserContent.innerHTML = `
            <div class="browser-address-bar">
                <span>🌐</span>
                <input type="text" class="browser-url" value="viral-quiz.com" readonly>
            </div>
            <div class="quiz-visual">
                <div class="quiz-title">${scenario.quizTitle}</div>
                <div class="quiz-question">Please answer:</div>
                <div class="quiz-form">
                    ${scenario.questions.map((q, i) => `
                        <div class="quiz-question-item">
                            <label>${i + 1}. ${q}</label>
                            <input type="text" id="quiz-${i}" placeholder="Your answer...">
                        </div>
                    `).join('')}
                    <div style="margin-top: 20px; display: flex; gap: 10px;">
                        <button class="quiz-submit" onclick="handleQuizAction('answerHonestly')" style="background: #667eea;">Answer Honestly</button>
                        <button class="quiz-submit" onclick="handleQuizAction('closeTab')" style="background: #27ae60;">Close Tab</button>
                        <button class="quiz-submit" onclick="handleQuizAction('fakeAnswers')" style="background: #f39c12;">Enter Fake Answers</button>
                    </div>
                </div>
            </div>
        `;
        
        browserWindow.style.display = 'flex';
    }, 1000);
}

function handleQuizAction(action) {
    const scenario = [...scenarios, ...bonusScenarios][currentScenario];
    const option = scenario.options.find(opt => opt.action === action);
    
    if (!option) return;
    
    score += option.points;
    document.getElementById('score').textContent = score;
    updateFakeNotificationInterval();
    
    document.getElementById('txtSpeech').querySelector('p').textContent = 
        action === 'answerHonestly'
            ? "Yes! This is so fun! Tell me everything!"
            : "Oh, hum! That's not…well, you're safe (for now).";
    
    const feedbackArea = document.getElementById('feedbackArea');
    feedbackArea.textContent = option.feedback;
    feedbackArea.className = `feedback-area show ${option.type}`;
    
    scenarioAnswers.push({
        scenario: currentScenario + 1,
        choice: action,
        points: option.points,
        type: option.type
    });
    
    // Close the browser window immediately when any button is pressed
    document.getElementById('browserWindow').style.display = 'none';
    
    showNotification(`You earned ${option.points} point${option.points !== 1 ? 's' : ''}!`);
    
    setTimeout(() => {
        loadScenario(currentScenario + 1);
    }, 3000);
}

// Browser Scenario (Password Manager)
function showBrowserScenario(scenario) {
    setTimeout(() => {
        const dialog = document.getElementById('popupWindow');
        document.getElementById('popupTitle').textContent = scenario.prompt;
        document.getElementById('popupContent').innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 48px; margin-bottom: 15px;">🌐</div>
                <div style="font-size: 18px; margin-bottom: 20px; color: #666;">${scenario.site}</div>
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button class="dialog-btn" onclick="handleBrowserAction('samePassword')">Same Password</button>
                    <button class="dialog-btn primary" onclick="handleBrowserAction('passwordManager')">Use Password Manager</button>
                    <button class="dialog-btn" onclick="handleBrowserAction('reuseStrong')">Reuse Strong Password</button>
                </div>
            </div>
        `;
        dialog.style.display = 'block';
    }, 1000);
}

function handleBrowserAction(action) {
    const scenario = [...scenarios, ...bonusScenarios][currentScenario];
    const option = scenario.options.find(opt => opt.action === action);
    
    if (!option) return;
    
    score += option.points;
    document.getElementById('score').textContent = score;
    updateFakeNotificationInterval();
    
    document.getElementById('txtSpeech').querySelector('p').textContent = 
        action === 'samePassword'
            ? "Perfect! One password for everything is so easy!"
            : "Oh, hum! That's not…well, you're safe (for now).";
    
    const feedbackArea = document.getElementById('feedbackArea');
    feedbackArea.textContent = option.feedback;
    feedbackArea.className = `feedback-area show ${option.type}`;
    
    scenarioAnswers.push({
        scenario: currentScenario + 1,
        choice: action,
        points: option.points,
        type: option.type
    });
    
    document.getElementById('popupWindow').style.display = 'none';
    
    showNotification(`You earned ${option.points} point${option.points !== 1 ? 's' : ''}!`);
    
    setTimeout(() => {
        loadScenario(currentScenario + 1);
    }, 3000);
}

// Laptop Scenario
function showLaptopScenario(scenario) {
    const scenarioContainer = document.getElementById('scenarioContainer');
    const buttonsDiv = document.createElement('div');
    buttonsDiv.style.cssText = 'margin-top: 15px; display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;';
    buttonsDiv.innerHTML = `
        <div style="background: #c0c0c0; border: 2px inset #c0c0c0; padding: 12px; text-align: center; margin-bottom: 12px; width: 100%;">
            <div style="font-size: 48px; margin-bottom: 12px;">💻</div>
            <div style="margin: 6px 0; font-size: 11px; color: #000;">
                <span style="color: ${scenario.webcamLight ? '#e74c3c' : '#27ae60'};">
                    Webcam: ${scenario.webcamLight ? '🔴 ON' : '⚫ OFF'}
                </span>
            </div>
            <div style="margin: 6px 0; font-size: 11px; color: #000;">
                <span style="color: ${scenario.screenLocked ? '#27ae60' : '#e74c3c'};">
                    Screen: ${scenario.screenLocked ? '🔒 LOCKED' : '🔓 UNLOCKED'}
                </span>
            </div>
            <div style="margin-top: 8px; font-size: 10px; color: #000;">Location: ${scenario.location}</div>
        </div>
        <button class="dialog-btn" onclick="handleLaptopAction('leave')" style="flex: 1; min-width: 120px;">Leave It</button>
        <button class="dialog-btn" onclick="handleLaptopAction('lock')" style="flex: 1; min-width: 120px;">Lock Screen</button>
        <button class="dialog-btn primary" onclick="handleLaptopAction('lockCover')" style="flex: 1; min-width: 120px;">Lock + Cover Webcam</button>
    `;
    scenarioContainer.appendChild(buttonsDiv);
}

function handleLaptopAction(action) {
    const scenario = [...scenarios, ...bonusScenarios][currentScenario];
    const option = scenario.options.find(opt => opt.action === action);
    
    if (!option) return;
    
    score += option.points;
    document.getElementById('score').textContent = score;
    updateFakeNotificationInterval();
    
    document.getElementById('txtSpeech').querySelector('p').textContent = 
        action === 'leave'
            ? "Exactly! What could go wrong in a minute?"
            : "Oh, hum! That's not…well, you're safe (for now).";
    
    const feedbackArea = document.getElementById('feedbackArea');
    feedbackArea.textContent = option.feedback;
    feedbackArea.className = `feedback-area show ${option.type}`;
    
    scenarioAnswers.push({
        scenario: currentScenario + 1,
        choice: action,
        points: option.points,
        type: option.type
    });
    
    showNotification(`You earned ${option.points} point${option.points !== 1 ? 's' : ''}!`);
    
    setTimeout(() => {
        loadScenario(currentScenario + 1);
    }, 3000);
}

// Chat Scenario
function showChatScenario(scenario) {
    const scenarioContainer = document.getElementById('scenarioContainer');
    const buttonsDiv = document.createElement('div');
    buttonsDiv.style.cssText = 'margin-top: 15px;';
    buttonsDiv.innerHTML = `
        <div style="background: #c0c0c0; border: 2px inset #c0c0c0; padding: 12px; margin-bottom: 12px;">
            <div style="font-weight: bold; margin-bottom: 8px; color: #000; font-size: 11px;">${scenario.app}</div>
            <div style="background: white; padding: 8px; border: 1px inset #c0c0c0; margin-bottom: 8px;">
                <div style="font-weight: bold; margin-bottom: 4px; color: #e74c3c; font-size: 11px;">⚠️ ${scenario.topic}</div>
                <div style="color: #000; font-size: 10px;">Encryption: ${scenario.encryption}</div>
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button class="dialog-btn" onclick="handleChatAction('useApp')" style="flex: 1; min-width: 100px;">Use App</button>
                <button class="dialog-btn primary" onclick="handleChatAction('suggestE2EE')" style="flex: 1; min-width: 100px;">Suggest E2EE App</button>
                <button class="dialog-btn" onclick="handleChatAction('inPerson')" style="flex: 1; min-width: 100px;">In-Person Only</button>
            </div>
        </div>
    `;
    scenarioContainer.appendChild(buttonsDiv);
}

function handleChatAction(action) {
    const scenario = [...scenarios, ...bonusScenarios][currentScenario];
    const option = scenario.options.find(opt => opt.action === action);
    
    if (!option) return;
    
    score += option.points;
    document.getElementById('score').textContent = score;
    updateFakeNotificationInterval();
    
    document.getElementById('txtSpeech').querySelector('p').textContent = 
        action === 'useApp'
            ? "Exactly! Trust your friends!"
            : "Oh, hum! That's not…well, you're safe (for now).";
    
    const feedbackArea = document.getElementById('feedbackArea');
    feedbackArea.textContent = option.feedback;
    feedbackArea.className = `feedback-area show ${option.type}`;
    
    scenarioAnswers.push({
        scenario: currentScenario + 1,
        choice: action,
        points: option.points,
        type: option.type
    });
    
    showNotification(`You earned ${option.points} point${option.points !== 1 ? 's' : ''}!`);
    
    setTimeout(() => {
        loadScenario(currentScenario + 1);
    }, 3000);
}

// Post Scenario
function showPostScenario(scenario) {
    setTimeout(() => {
        const browserWindow = document.getElementById('browserWindow');
        const browserContent = document.getElementById('browserContent');
        
        browserContent.innerHTML = `
            <div class="browser-address-bar">
                <span>🌐</span>
                <input type="text" class="browser-url" value="social-media.com/post" readonly>
            </div>
            <div class="post-editor">
                <div style="font-weight: 600; margin-bottom: 15px; color: #2c3e50;">New Post</div>
                <div style="background: #f0f0f0; height: 200px; border-radius: 8px; margin-bottom: 15px; display: flex; align-items: center; justify-content: center; font-size: 48px;">
                    📸 ${scenario.photo}
                </div>
                <textarea class="post-textarea" placeholder="What's on your mind?"></textarea>
                <div class="post-options">
                    <div class="post-option">
                        <input type="checkbox" id="geotag" ${scenario.geotag ? 'checked' : ''}>
                        <label for="geotag">Include location (${scenario.geotag ? '📍 Campus Dorm Building' : 'None'})</label>
                    </div>
                    <div class="post-option">
                        <input type="checkbox" id="building" checked disabled>
                        <label for="building">Building name visible in photo</label>
                    </div>
                    <div class="post-option">
                        <label>Visibility: 
                            <select id="visibility">
                                <option value="public" ${scenario.visibility === 'Public' ? 'selected' : ''}>Public</option>
                                <option value="friends">Friends Only</option>
                                <option value="private">Private</option>
                            </select>
                        </label>
                    </div>
                </div>
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <button class="post-button" onclick="handlePostAction('postPublic')" style="flex: 1;">Post Public</button>
                    <button class="post-button" onclick="handlePostAction('scrubMetadata')" style="flex: 1; background: #27ae60;">Scrub Metadata & Adjust</button>
                    <button class="post-button" onclick="handlePostAction('makePrivate')" style="flex: 1; background: #f39c12;">Make Private</button>
                </div>
            </div>
        `;
        
        browserWindow.style.display = 'flex';
    }, 1000);
}

function handlePostAction(action) {
    const scenario = [...scenarios, ...bonusScenarios][currentScenario];
    const option = scenario.options.find(opt => opt.action === action);
    
    if (!option) return;
    
    score += option.points;
    document.getElementById('score').textContent = score;
    updateFakeNotificationInterval();
    
    document.getElementById('txtSpeech').querySelector('p').textContent = 
        action === 'postPublic'
            ? "Yes! Share everything!"
            : "Oh, hum! That's not…well, you're safe (for now).";
    
    const feedbackArea = document.getElementById('feedbackArea');
    feedbackArea.textContent = option.feedback;
    feedbackArea.className = `feedback-area show ${option.type}`;
    
    scenarioAnswers.push({
        scenario: currentScenario + 1,
        choice: action,
        points: option.points,
        type: option.type
    });
    
    document.getElementById('browserWindow').style.display = 'none';
    
    showNotification(`You earned ${option.points} point${option.points !== 1 ? 's' : ''}!`);
    
    setTimeout(() => {
        loadScenario(currentScenario + 1);
    }, 3000);
}

// Show Notification
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.querySelector('.notification-content').textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}

// Archetypes Data
const archetypes = [
    {
        name: "Worm",
        range: [0, 25],
        tone: "lightly roasted but supportive",
        exampleLine: "Someone in another time zone is currently more 'you' than you are.",
        habits: [
            "Turn on 2FA for email and bank",
            "Change reused passwords",
            "Stop clicking urgent payment links"
        ]
    },
    {
        name: "Trusting Pug",
        range: [26, 50],
        tone: "Friendly, curious, clicks too fast, assumes good intentions",
        exampleLine: "You're doing great! Just slow down a bit before clicking.",
        habits: [
            "Slow down before clicking links",
            "Double-check sender domains (@gmail vs @university)",
            "Use a password manager for at least a few accounts"
        ]
    },
    {
        name: "Cautious Cat",
        range: [51, 75],
        tone: "Generally wary, occasionally chased the laser dot (scams)",
        exampleLine: "You're getting better! But remember, even cats can be tricked by shiny things.",
        habits: [
            "Tighten app permissions",
            "Turn off auto-join for public Wi-Fi",
            "Clean up old public posts / quizzes"
        ]
    },
    {
        name: "Turtle",
        range: [76, 90],
        tone: "Makes good choices most of the time",
        exampleLine: "You're making excellent progress! Slow and steady wins the security race.",
        habits: [
            "Fully adopt a password manager",
            "Audit third-party app access on main accounts",
            "Add webcam cover + consistent screen lock"
        ]
    },
    {
        name: "Tardigrade",
        range: [91, 100],
        tone: "The friend everyone texts screenshots to: 'Is this real?'",
        exampleLine: "You're a security legend! Everyone should ask you before clicking anything.",
        habits: [
            "Keep teaching others",
            "Periodically re-check security settings",
            "Stay updated on new scam patterns"
        ]
    }
];

// Get Archetype Based on Percentage
function getArchetype(percentage) {
    for (const archetype of archetypes) {
        if (percentage >= archetype.range[0] && percentage <= archetype.range[1]) {
            return archetype;
        }
    }
    // Fallback to first archetype if somehow out of range
    return archetypes[0];
}

// Generate Security To-Do List Based on Failed Scenarios
function generateSecurityTodoList() {
    const todoItems = [];
    const failedScenarios = scenarioAnswers.filter(answer => answer.points === 0 || answer.type === 'bad');
    const failedScenarioIds = new Set(failedScenarios.map(answer => answer.scenario));
    
    // Category 1: Password & Account Hygiene (Scenarios 2, 5)
    if (failedScenarioIds.has(2) || failedScenarioIds.has(5)) {
        todoItems.push({
            category: "🛡️ Category 1: Password & Account Hygiene",
            items: [
                "[ ] Audit Your Passwords: You showed a tendency to reuse passwords or make simple variations. Tonight, check your most important accounts (Email, Bank). If they share a password, change them.",
                "[ ] Set Up a Password Manager: You struggled to manage credentials securely. Download a free tool like Bitwarden or set up iCloud Keychain/Google Password Manager so you don't have to remember complex logins.",
                "[ ] Enable 2FA on \"Crown Jewel\" Accounts: You dismissed the foreign login alert. In real life, hackers move fast. Go to your Email and Social Media settings and turn on Two-Factor Authentication immediately.",
                "[ ] Check \"Have I Been Pwned\": Since you might be reusing old passwords, go to haveibeenpwned.com to see if your email and password are already floating around on the dark web."
            ]
        });
    }
    
    // Category 2: Network & Connection Safety (Scenario 1)
    if (failedScenarioIds.has(1)) {
        todoItems.push({
            category: "🌐 Category 2: Network & Connection Safety",
            items: [
                "[ ] Install a Personal VPN: You chose the \"Guest\" network for speed. In real life, if you use a coffee shop or airport Wi-Fi, install a VPN (like NordVPN, ProtonVPN, or Mullvad) to encrypt your data so others on the network can't see it.",
                "[ ] Disable \"Auto-Join\" on Your Phone: You connected to an open network too easily. Go to your phone's Wi-Fi settings and turn OFF \"Auto-Join Hotspots\" or \"Ask to Join Networks\" to prevent your phone from grabbing insecure connections automatically."
            ]
        });
    }
    
    // Category 3: Phishing & Scam Detection (Scenarios 4, 6)
    if (failedScenarioIds.has(4) || failedScenarioIds.has(6)) {
        todoItems.push({
            category: "📧 Category 3: Phishing & Scam Detection",
            items: [
                "[ ] Learn the \"Hover Test\": You clicked the link too fast. In real life, practice hovering your mouse cursor over every link in an email before clicking to see the true URL destination (e.g., does it say paypal.com or paypa1-support.net?).",
                "[ ] Bookmark Critical Portals: You relied on an email link to pay tuition. In real life, create browser bookmarks for your Bank, Student Portal, and Email. Never click links to login; always use your bookmarks.",
                "[ ] Review Your LinkedIn Privacy: You entertained a scammer. Go to LinkedIn Settings > Visibility. Ensure your email and phone number are visible to \"First-degree connections only,\" not the public."
            ]
        });
    }
    
    // Category 4: Device & File Security (Scenarios 3, 7)
    if (failedScenarioIds.has(3) || failedScenarioIds.has(7)) {
        todoItems.push({
            category: "💻 Category 4: Device & File Security",
            items: [
                "[ ] Enable \"Show File Extensions\": You were tricked by a fake textbook. Windows: View > Show > File Name Extensions. Mac: Finder > Settings > Advanced > Show all filename extensions. Why: This ensures you can see if a file is book.pdf (Safe) or book.pdf.exe (Virus).",
                "[ ] Perform an \"App Audit\": You granted permissions without looking. Open your phone settings right now. Look at the list of apps using your Location, Microphone, and Contacts. Revoke access for any app that doesn't strictly need it (e.g., a flashlight app doesn't need your location).",
                "[ ] Set Up \"Find My Device\": Since you take risks with device security, ensure Apple's \"Find My\" or Google's \"Find My Device\" is active so you can remotely wipe your phone if it gets stolen or compromised."
            ]
        });
    }
    
    // Category 5: Social Engineering Defense (Scenario 8)
    if (failedScenarioIds.has(8)) {
        todoItems.push({
            category: "🧠 Category 5: Social Engineering Defense",
            items: [
                "[ ] Poison Your Security Answers: You gave up your mother's maiden name. Go to your bank's security settings. Change the answers to be fake but memorable (e.g., Question: First Pet's Name? Answer: PizzaTopping).",
                "[ ] Clean Up Your Public Profile: You overshared data. Google yourself. Check your Facebook/Instagram \"About\" sections. Remove your full birthdate, hometown, and family connections from public view."
            ]
        });
    }
    
    return todoItems;
}

// Get Sprite Filename for Archetype
function getArchetypeSprite(archetypeName) {
    // Map archetype names to actual sprite filenames in SPRITES/ directory
    const spriteMap = {
        "Worm": "SPRITES/WORM_ARCHETYPE.png",
        "Trusting Pug": "SPRITES/PUG_ARCHETYPE.png",
        "Cautious Cat": "SPRITES/CAUTIOUS_CAT_ARCHETYPE.png",
        "Turtle": "SPRITES/TURTLE_ARCHETYPE.png",
        "Tardigrade": "SPRITES/TARDIGRADE_ARCHETYPE.png"
    };
    
    return spriteMap[archetypeName] || "SPRITES/WORM_ARCHETYPE.png";
}

// Show Results
function showResults() {
    // Stop fake notifications when showing results
    if (fakeNotificationInterval) {
        clearTimeout(fakeNotificationInterval);
        fakeNotificationInterval = null;
    }
    
    const windowContent = document.querySelector('.window-content');
    const maxScore = (scenarios.length + bonusScenarios.length) * 2;
    const percentage = Math.round((score / maxScore) * 100);
    
    let grade = '';
    let message = '';
    if (percentage >= 90) {
        grade = 'A+';
        message = 'Outstanding! You\'re a cybersecurity expert!';
    } else if (percentage >= 80) {
        grade = 'A';
        message = 'Excellent! You have strong security awareness!';
    } else if (percentage >= 70) {
        grade = 'B';
        message = 'Good job! You understand the basics well!';
    } else if (percentage >= 60) {
        grade = 'C';
        message = 'Not bad, but there\'s room for improvement!';
    } else {
        grade = 'D';
        message = 'Keep learning! Review the scenarios to improve!';
    }
    
    // Get archetype
    const archetype = getArchetype(percentage);
    const spritePath = getArchetypeSprite(archetype.name);
    
    // Generate security to-do list
    const todoList = generateSecurityTodoList();
    
    windowContent.innerHTML = `
        <div class="results-screen">
            <div class="results-title">Game Complete!</div>
            <div class="final-score">${score} / ${maxScore}</div>
            <div style="font-size: 24px; color: #4a90e2; margin: 20px 0; font-weight: 600;">Grade: ${grade}</div>
            <div style="font-size: 18px; color: #666; margin-bottom: 30px;">${message}</div>
            
            <div class="archetype-section">
                <div style="font-weight: 700; font-size: 18px; margin-bottom: 15px; color: #2c3e50; text-align: center;">Your Security Persona</div>
                <div class="archetype-card">
                    <div class="archetype-name">${archetype.name}</div>
                    <div class="archetype-sprite">
                        <img src="${spritePath}" alt="${archetype.name}" onerror="this.style.display='none'">
                    </div>
                    <div class="archetype-percentage">Score: ${percentage}%</div>
                    <div class="archetype-example">
                        <div style="font-style: italic; color: #555; font-size: 11px;">"${archetype.exampleLine}"</div>
                    </div>
                    <div class="archetype-habits">
                        <div style="font-weight: 600; margin-bottom: 8px; font-size: 11px; margin-top: 12px;">Recommended Habits:</div>
                        <ul style="text-align: left; padding-left: 20px; margin: 0;">
                            ${archetype.habits.map(habit => `<li style="margin-bottom: 6px; font-size: 11px; color: #000;">${habit}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
            
            <div class="score-breakdown">
                <div style="font-weight: 700; font-size: 18px; margin-bottom: 15px; color: #2c3e50;">Score Breakdown</div>
                ${scenarioAnswers.map((answer, i) => `
                    <div class="breakdown-item">
                        <span>Scenario ${answer.scenario}</span>
                        <span style="color: ${answer.type === 'correct' ? '#27ae60' : answer.type === 'okay' ? '#f39c12' : '#e74c3c'}; font-weight: 600;">
                            ${answer.points} point${answer.points !== 1 ? 's' : ''} (${answer.type.toUpperCase()})
                        </span>
                    </div>
                `).join('')}
            </div>
            
            ${todoList.length > 0 ? `
            <div class="security-todo-section">
                <div style="font-weight: 700; font-size: 18px; margin-bottom: 15px; color: #2c3e50; text-align: center;">Your Security Action Plan</div>
                ${todoList.map(category => `
                    <div class="todo-category">
                        <div class="todo-category-title">${category.category}</div>
                        <div class="todo-items">
                            ${category.items.map(item => `
                                <div class="todo-item">${item}</div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
            ` : ''}
            
            <button class="restart-btn" onclick="location.reload()">Play Again</button>
        </div>
    `;
    
    // Final TXTY message
    document.getElementById('txtSpeech').querySelector('p').textContent = 
        percentage >= 70 
            ? "Oh no... you actually learned something! Well, I guess that's... good? (sigh)"
            : "Haha! You fell for some of my tricks! But hey, at least you're learning now!";
}

// Load Background Image - Windows XP Bliss
function loadBackgroundImage() {
    const desktopBg = document.querySelector('.desktop-background');
    if (!desktopBg) {
        console.error('Desktop background element not found');
        return;
    }
    
    // Try local file first (if user downloaded it)
    const localUrl = 'bliss.png';
    const localImg = new Image();
    
    localImg.onload = function() {
        console.log('✓ Local Windows XP Bliss wallpaper loaded');
        desktopBg.style.setProperty('background-image', `url('${localUrl}')`, 'important');
        desktopBg.style.setProperty('background-color', 'transparent', 'important');
        desktopBg.style.setProperty('background-size', 'cover', 'important');
        desktopBg.style.setProperty('background-position', 'center', 'important');
        desktopBg.style.setProperty('background-repeat', 'no-repeat', 'important');
    };
    
    localImg.onerror = function() {
        console.log('Local file not found, trying Wikipedia URL...');
        // Fallback to Wikipedia URL
        const blissUrl = 'https://upload.wikimedia.org/wikipedia/en/2/27/Bliss_%28Windows_XP%29.png';
        const onlineImg = new Image();
        onlineImg.crossOrigin = 'anonymous';
        
        onlineImg.onload = function() {
            console.log('✓ Windows XP Bliss wallpaper loaded from Wikipedia');
            desktopBg.style.setProperty('background-image', `url('${blissUrl}')`, 'important');
            desktopBg.style.setProperty('background-color', 'transparent', 'important');
            desktopBg.style.setProperty('background-size', 'cover', 'important');
            desktopBg.style.setProperty('background-position', 'center', 'important');
            desktopBg.style.setProperty('background-repeat', 'no-repeat', 'important');
        };
        
        onlineImg.onerror = function() {
            console.error('✗ Failed to load Windows XP Bliss wallpaper from all sources');
            console.error('Please download it manually: https://upload.wikimedia.org/wikipedia/en/0/0a/Windows_XP_Bliss.png');
            console.error('Save as "bliss.png" in the project folder');
        };
        
        onlineImg.src = blissUrl;
    };
    
    // Try local file first
    localImg.src = localUrl;
}

// Don't start game automatically - wait for login button click
// The login screen will be shown by default, and startGame() will be called when button is clicked