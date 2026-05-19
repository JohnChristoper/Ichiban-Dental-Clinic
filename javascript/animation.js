const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
        entry.target.style.transitionDelay = `${i * 0.1}s`;
        entry.target.classList.add('visible');
        }
    });
    }, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));