document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.patient-type-card');

    cards.forEach(card => {
        card.addEventListener('click', () => {
            // 1. Remove the active/clicked state from both cards
            cards.forEach(c => c.classList.remove('active'));
            
            // 2. Add the active state with the 4px border to the clicked card
            card.classList.add('active');
        });
    });
});
