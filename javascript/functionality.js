/*========================== Active Nav Link Highlight ==========================*/
(function () {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    document.querySelectorAll('.overlay-nav-link').forEach(link => {
        // Remove any hardcoded active class first
        link.classList.remove('active');

        const linkPage = link.getAttribute('href').split('/').pop();

        // Match current page to the link href
        if (
            linkPage === currentPage ||
            (currentPage === '' && linkPage === 'index.html')
        ) {
            link.classList.add('active');
        }
    });
})();

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
    const slider   = card.querySelector('.slider-control');
    const afterImg = card.querySelector('.after-img');
    const handle   = card.querySelector('.slider-handle');
    if (!slider || !afterImg || !handle) return; // skip if elements missing

    slider.addEventListener('input', (e) => {
        const sliderValue = parseInt(e.target.value, 10);
        afterImg.style.clipPath = `polygon(0 0, ${sliderValue}% 0, ${sliderValue}% 100%, 0 100%)`;
        handle.style.left = `${sliderValue}%`;
    });
});

/*========================== Meet Experts Section Carousel ========================*/
const carousel = document.getElementById('expertsCarousel');
const prevBtn  = document.getElementById('prevBtn');
const nextBtn  = document.getElementById('nextBtn');

if (carousel && prevBtn && nextBtn) {
    const cardStepWidth = 300;

    function updateButtonVisibility() {
        const scrollLeft    = carousel.scrollLeft;
        const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;

        if (scrollLeft <= 5) {
            prevBtn.classList.add('btn-hidden');
        } else {
            prevBtn.classList.remove('btn-hidden');
        }

        if (scrollLeft >= maxScrollLeft - 5) {
            nextBtn.classList.add('btn-hidden');
        } else {
            nextBtn.classList.remove('btn-hidden');
        }
    }

    nextBtn.addEventListener('click', () => {
        carousel.scrollBy({ left: cardStepWidth, behavior: 'smooth' });
    });

    prevBtn.addEventListener('click', () => {
        carousel.scrollBy({ left: -cardStepWidth, behavior: 'smooth' });
    });

    carousel.addEventListener('scroll', updateButtonVisibility);
    window.addEventListener('load', updateButtonVisibility);
}

/*================================== Header Menu Toggle ==================================*/
function openFullscreenMenu() {
    const menu = document.getElementById('fullscreenMenu');
    if (!menu) return;
    menu.style.display = 'flex';
    setTimeout(() => menu.classList.add('active'), 10);
    document.body.style.overflow = 'hidden';
}

function closeFullscreenMenu() {
    const menu = document.getElementById('fullscreenMenu');
    if (!menu) return;
    menu.classList.remove('active');
    setTimeout(() => menu.style.display = 'none', 250);
    document.body.style.overflow = '';
}