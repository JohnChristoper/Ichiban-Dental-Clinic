/*======================= Animation Reveal ============================*/
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
        entry.target.style.transitionDelay = `${i * 0.1}s`;
        entry.target.classList.add('visible');
        }
    });
    }, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/*========================== Before & After Section Slider ========================*/
document.querySelectorAll('.comparison-card').forEach(card => {
    const slider = card.querySelector('.slider-control');
    const afterImg = card.querySelector('.after-img');
    const handle = card.querySelector('.slider-handle');

    slider.addEventListener('input', (e) => {
        const sliderValue = parseInt(e.target.value, 10);
        
        // Move the image clip-path and custom line handle smoothly
        afterImg.style.clipPath = `polygon(0 0, ${sliderValue}% 0, ${sliderValue}% 100%, 0 100%)`;
        handle.style.left = `${sliderValue}%`;
    });
});

/*========================== Meet Experts Section Carousel ========================*/
const carousel = document.getElementById('expertsCarousel');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

const cardStepWidth = 300; // Layout scroll step distance

// Function to calculate button visibilities dynamically
function updateButtonVisibility() {
    const scrollLeft = carousel.scrollLeft;
    const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;

    // 1. Manage Left Button (Show only if user scrolled right and cards are hidden under left block)
    if (scrollLeft <= 5) {
        prevBtn.classList.add('btn-hidden');
    } else {
        prevBtn.classList.remove('btn-hidden');
    }

    // 2. Manage Right Button (Hide if reached the absolute end of the deck)
    if (scrollLeft >= maxScrollLeft - 5) {
        nextBtn.classList.add('btn-hidden');
    } else {
        nextBtn.classList.remove('btn-hidden');
    }
}

// Next Action Click Click
nextBtn.addEventListener('click', () => {
    carousel.scrollBy({ left: cardStepWidth, behavior: 'smooth' });
});

// Previous Action Click Click
prevBtn.addEventListener('click', () => {
    carousel.scrollBy({ left: -cardStepWidth, behavior: 'smooth' });
});

// Listen to scroll modifications (handles both button clicks and manual touch swipe/drags)
carousel.addEventListener('scroll', updateButtonVisibility);

// Initial check on page load
window.addEventListener('load', updateButtonVisibility);

/*================================== Header Menu Toggle ==================================*/
function openFullscreenMenu() {
    const menu = document.getElementById('fullscreenMenu');
    menu.style.display = 'flex';
    setTimeout(() => {
        menu.classList.add('active');
    }, 10);
    document.body.style.overflow = 'hidden'; 
}

function closeFullscreenMenu() {
    const menu = document.getElementById('fullscreenMenu');
    menu.classList.remove('active');
    setTimeout(() => {
        menu.style.display = 'none';
    }, 250);
    document.body.style.overflow = ''; 
}