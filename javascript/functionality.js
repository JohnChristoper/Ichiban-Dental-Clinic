
document.querySelectorAll('.comparison-card').forEach(card => {
    const slider = card.querySelector('.slider-control');
    const afterImg = card.querySelector('.after-img');
    const handle = card.querySelector('.slider-handle');
    
    // Grab the text status badges
    const beforeTag = card.querySelector('.before-tag');
    const afterTag = card.querySelector('.after-tag');

    slider.addEventListener('input', (e) => {
        const sliderValue = parseInt(e.target.value, 10);
        
        // 1. Move the image clip-path and custom line handle
        afterImg.style.clipPath = `polygon(0 0, ${sliderValue}% 0, ${sliderValue}% 100%, 0 100%)`;
        handle.style.left = `${sliderValue}%`;
        
        // 2. Dragged all the way to the LEFT (0%) -> Hide AFTER tag, show BEFORE tag
        if (sliderValue <= 0) {
            afterTag.classList.add('label-hidden');
            beforeTag.classList.remove('label-hidden');
        } 
        // 3. Dragged all the way to the RIGHT (100%) -> Hide BEFORE tag, show AFTER tag
        else if (sliderValue >= 100) {
            beforeTag.classList.add('label-hidden');
            afterTag.classList.remove('label-hidden');
        } 
        // 4. Anywhere in between -> Keep both visible
        else {
            beforeTag.classList.remove('label-hidden');
            afterTag.classList.remove('label-hidden');
        }
    });
});
