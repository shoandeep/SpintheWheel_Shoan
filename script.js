const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const restaurantInput = document.getElementById('restaurantInput');
const restaurants = [];
let currentRotation = 0;
let animationFrameId;
let winnerIndex = null;

// Mock list of restaurants for Suria KLCC
const suriaKLCCRestaurants = ["Foodcourt", "Nandos", "Fishbowl", "ISetan", "Cold Storage"];

// Mock lists of restaurants for each mall
const mallRestaurants = {
    suriaKLCC: ["Foodcourt", "Isetan", "cold storage", "fridays", "nyonya", "nandos"],
    avenueK: ["Dodo", "sushi", "nandos","pan mee","subway","basement","foodcourt","thai"],
    fourSeasons: ["Downstairs","starbucks"],
    wismaCentral: ["Malay","chinese","nasi kandar","ramne",]
};

function getSegmentColor(index, total) {
    const hue = (index / total) * 360;
    return `hsl(${hue}, 70%, 80%)`;
}

function drawWheel(rotation = 0) {
    const totalRestaurants = restaurants.length;
    if (totalRestaurants === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }

    const anglePerSlice = 2 * Math.PI / totalRestaurants;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    restaurants.forEach((restaurant, index) => {
        ctx.beginPath();
        ctx.moveTo(250, 250);
        const startAngle = anglePerSlice * index + rotation;
        const endAngle = anglePerSlice * (index + 1) + rotation;
        ctx.arc(250, 250, 250, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = getSegmentColor(index, totalRestaurants);
        ctx.fill();

        ctx.save();
        ctx.translate(250, 250);
        ctx.rotate(startAngle + anglePerSlice / 2);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#2d3436';
        ctx.font = '16px Arial';
        ctx.fillText(restaurant, 125, 0);
        ctx.restore();
    });

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(250, -20);
    ctx.lineTo(235, 10);
    ctx.lineTo(265, 10);
    ctx.closePath();
    ctx.fill();
}

function addRestaurant() {
    const restaurantName = restaurantInput.value.trim();
    if (restaurantName) {
        restaurants.push(restaurantName);
        drawWheel();
    }
    restaurantInput.value = '';
    restaurantInput.focus();
}

let totalSegments = restaurants.length; // Total number of segments
let currentStartingSegment = Math.ceil(totalSegments / 2); // Initialize to the middle segment


function spinWheel() {
    if (restaurants.length === 0) {
        alert("Please add at least one restaurant before spinning the wheel.");
        return;
    }

    winnerIndex = null;
    let duration = Math.random() * 3000 + 2000;
    let start = null;
    let initialRotation = currentRotation;
    let totalRotations = Math.random() * 10 + 5;
    const totalRestaurants = restaurants.length;

    function step(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const fraction = progress / duration;

        const easeOutFraction = 1 - (1 - fraction) * (1 - fraction);

        currentRotation = initialRotation + easeOutFraction * totalRotations * Math.PI;
        drawWheel(currentRotation);

        if (progress < duration) {
            animationFrameId = requestAnimationFrame(step);
        } else {
            totalSegments = restaurants.length; // Update in case the number of segments has changed
            const segmentAngle = 2 * Math.PI / totalSegments;
            const initialOffset = segmentAngle * (currentStartingSegment - 1 + 0.5);

            const adjustedRotation = (currentRotation + initialOffset) % (2 * Math.PI);
            winnerIndex = Math.floor(adjustedRotation / segmentAngle) % totalSegments;

            // Update the starting segment for the next spin
            currentStartingSegment = (winnerIndex + 1) % totalSegments;

            triggerConfetti();
        }
    }

    requestAnimationFrame(step);
}

// ... existing JavaScript code ...

function triggerConfetti() {
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            zIndex: 0
        });
        
    } else {
        console.error("Confetti library not loaded.");
    }
}

function clearWheel() {
    restaurants.length = 0;
    currentRotation = 0;
    winnerIndex = null;
    drawWheel();
    const mallSelect = document.getElementById('mallSelect');
    mallSelect.value = "";
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

}

function loadSuriaKLCCRestaurants() {
    const checkbox = document.getElementById('suriaKLCCCheckbox');
    if (checkbox.checked) {
        restaurants.length = 0;
        suriaKLCCRestaurants.forEach(restaurant => restaurants.push(restaurant));
        drawWheel();
    } else {
        clearWheel();
    }
}

function loadMallRestaurants() {
    const selectedMall = document.getElementById('mallSelect').value;
    if (selectedMall && mallRestaurants[selectedMall]) {
        restaurants.length = 0;
        mallRestaurants[selectedMall].forEach(restaurant => restaurants.push(restaurant));
        drawWheel();
    } else {
        alert("Please select a mall.");
    }
}

function randomlySelectMall() {
    const mallKeys = Object.keys(mallRestaurants);
    const randomMallKey = mallKeys[Math.floor(Math.random() * mallKeys.length)];
    restaurants.length = 0;
    mallRestaurants[randomMallKey].forEach(restaurant => restaurants.push(restaurant));
    drawWheel();
    const mallSelect = document.getElementById('mallSelect');
    mallSelect.value = randomMallKey;
}

function toggleDarkMode() {
    const body = document.body;
    const darkModeToggle = document.getElementById('darkModeToggle');
    const darkModeIcon = document.getElementById('darkModeIcon');

    body.classList.toggle('dark-mode');
    const isDarkMode = body.classList.contains('dark-mode');

    if (isDarkMode) {
        darkModeIcon.textContent = '🌜';
        darkModeToggle.classList.add('dark-mode');
    } else {
        darkModeIcon.textContent = '🌞';
        darkModeToggle.classList.remove('dark-mode');
    }
}

restaurantInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        addRestaurant();
    }
});

canvas.addEventListener('click', spinWheel);

drawWheel();
