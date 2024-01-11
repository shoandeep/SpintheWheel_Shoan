const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const restaurantInput = document.getElementById('restaurantInput');
const restaurants = [];
let currentRotation = 0;
let animationFrameId;
let winnerIndex = null;
let animationId = null;
let totalSegments = 0; 
let isCleared = false; // Flag to indicate if the clear action has been initiated


function resizeCanvas() {
    const size = Math.min(window.innerWidth, window.innerHeight, 500);
    canvas.width = size;
    canvas.height = size;
    ctx.clearRect(0, 0, canvas.width, canvas.height);  // Clear the canvas before redrawing
    drawWheel(currentRotation);  // Redraw the wheel with the current rotation
}

// Call the function initially to set the canvas size
resizeCanvas();

// Add an event listener to resize the canvas when the window size changes
window.addEventListener('resize', resizeCanvas);

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
    totalSegments = restaurants.length;
    const totalRestaurants = restaurants.length;
    if (totalRestaurants === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }

    const anglePerSlice = 2 * Math.PI / totalRestaurants;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    restaurants.forEach((restaurant, index) => {
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, canvas.height / 2);
        const startAngle = anglePerSlice * index + rotation;
        const endAngle = anglePerSlice * (index + 1) + rotation;
        ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = getSegmentColor(index, totalRestaurants);
        ctx.fill();

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(startAngle + anglePerSlice / 2);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#2d3436';
        ctx.font = '16px Arial';
        ctx.fillText(restaurant, canvas.width / 4, 0);
        ctx.restore();
    });

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, -20);
    ctx.lineTo(canvas.width / 2 - 15, 10);
    ctx.lineTo(canvas.width / 2 + 15, 10);
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
    totalSegments = restaurants.length;
}


let currentStartingSegment = Math.ceil(totalSegments / 2); // Initialize to the middle segment


function spinWheel() {
    isCleared = false; // Reset the flag at the beginning of spinning

    if (restaurants.length === 0) {
        alert("Please add at least one restaurant before spinning the wheel.");
        return;
    }

    winnerIndex = null;
    let duration = Math.random() * 3000 + 2000;
    let start = null;
    let initialRotation = currentRotation;
    let totalRotations = Math.random() * 10 + 5;
    const totalSegments = restaurants.length; // Define totalSegments here

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
            cancelAnimationFrame(animationFrameId); // Stop the animation

            if (!isCleared) { // Check if the clear action has been initiated
                const segmentAngle = 2 * Math.PI / totalSegments;
                const adjustedRotation = (currentRotation % (2 * Math.PI)) + segmentAngle / 2;
                winnerIndex = Math.floor(adjustedRotation / segmentAngle) % totalSegments;

                triggerConfetti();
            }
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
            origin: { y: 0.6 }
        });
    } else {
        console.error("Confetti library not loaded.");
    }
}


function clearWheel() {
    isCleared = true; // Set the flag to true when clear is clicked

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    restaurants.length = 0;
    currentRotation = 0;
    winnerIndex = null;
    drawWheel();
    const mallSelect = document.getElementById('mallSelect');
    mallSelect.value = "";
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

document.addEventListener('DOMContentLoaded', function() {
    const mallSelect = document.getElementById('mallSelect');

    mallSelect.addEventListener('change', function() {
        if (this.value) {
            loadMallRestaurants(this.value);
        } else {
            clearWheel();
        }
    });
});

function loadMallRestaurants(selectedMall) {
    if (mallRestaurants[selectedMall]) {
        restaurants.length = 0;
        mallRestaurants[selectedMall].forEach(restaurant => restaurants.push(restaurant));
        drawWheel();
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
    const appContainer = document.querySelector('.app-container');
    const buttons = document.querySelectorAll('button');
    const selects = document.querySelectorAll('select');

    // Toggle the dark-mode class on the body
    body.classList.toggle('dark-mode');

    // Optionally, toggle the dark-mode class on other elements
    appContainer.classList.toggle('dark-mode');
    buttons.forEach(btn => btn.classList.toggle('dark-mode'));
    selects.forEach(select => select.classList.toggle('dark-mode'));

    // Update the dark mode icon
    const darkModeIcon = document.getElementById('darkModeIcon');
    if (body.classList.contains('dark-mode')) {
        darkModeIcon.textContent = '🌜'; // Moon icon for dark mode
    } else {
        darkModeIcon.textContent = '🌞'; // Sun icon for light mode
    }
}


restaurantInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        addRestaurant();
    }
});

canvas.addEventListener('click', spinWheel);

drawWheel();
