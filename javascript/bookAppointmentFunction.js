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

document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.patient-type-card');
    const continueBtn = document.querySelector('.patient-continue-btn');
    const gridContainer = document.querySelector('.patient-type-grid');
    const actionPanel = document.querySelector('.patient-flow-actions');
    const contentPlaceholder = document.querySelector('.middle-form-content-placeholder');

    let selectedPatientType = null;

    // 1. Handle Selection State
    cards.forEach(card => {
        card.addEventListener('click', () => {
            cards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            selectedPatientType = card.id === 'newPatientCard' ? 'new' : 'returning';
        });
    });

    // 2. Handle Navigation into Service Flow
    continueBtn.addEventListener('click', () => {
        if (!selectedPatientType) {
            alert('Please select a patient type before continuing.');
            return;
        }

        // Hide the initial step panels cleanly
        gridContainer.style.display = 'none';
        actionPanel.style.display = 'none';

        // Array matching your full menu manifest
        const services = [
            { name: "Oral prophylaxis", duration: "~ 1 hour" },
            { name: "Digital dental X-ray", duration: "~ 30 minutes" },
            { name: "Dental check-up & consultation", duration: "~ 1 hour" },
            { name: "Laser teeth whitening", duration: "~ 2 hours" },
            { name: "Composite / direct veneers", duration: "~ 2 hours" },
            { name: "Porcelain veneers", duration: "~ 2 hours" },
            { name: "Zirconia veneers", duration: "~ 2 hours" },
            { name: "Dental fillings", duration: "~ 1 hour" },
            { name: "Dental crowns", duration: "~ 2 hours" },
            { name: "Complete dentures", duration: "~ 2 hours" },
            { name: "Removable partial dentures", duration: "~ 2 hours" },
            { name: "Root canal treatment", duration: "~ 3 hours" },
            { name: "Braces", duration: "~ 1 hour" },
            { name: "Invisalign", duration: "~ 1 hour" },
            { name: "Children's dental check-up", duration: "~ 1 hour" },
            { name: "Fluoride treatment", duration: "~ 30 minutes" },
            { name: "Dental sealants", duration: "~ 1 hour" },
            { name: "Tooth extraction", duration: "~ 1 hour" },
            { name: "Oral surgery", duration: "~ 3 hours" },
            { name: "Dental implants", duration: "~ 3 hours" }
        ];

        // Inject Step Wizard and Services Layout
        contentPlaceholder.innerHTML = `
            <div class="step-wizard-bar">
                <div class="step-node current"><span class="node-circle">1</span> <span class="node-label">Service</span></div>
                <div class="step-line"></div>
                <div class="step-node"><span class="node-circle">2</span> <span class="node-label">Date & Time</span></div>
                <div class="step-line"></div>
                <div class="step-node"><span class="node-circle">3</span> <span class="node-label">Your Details</span></div>
                <div class="step-line"></div>
                <div class="step-node"><span class="node-circle">4</span> <span class="node-label">Confirm</span></div>
            </div>

            <h2 class="flow-section-title">SELECT A SERVICE</h2>

            <div class="services-list-container">
                ${services.map(service => `
                    <div class="service-selection-row">
                        <span class="service-name-text">${service.name}</span>
                        <span class="service-duration-text">${service.duration}</span>
                    </div>
                `).join('')}
            </div>

            <div class="flow-nav-buttons">
                <button type="button" class="btn-flow-back" id="backToTypeBtn">Back</button>
                <button type="button" class="btn-flow-next">Next</button>
            </div>
        `;

        // Add internal click listeners to the newly injected services
        const serviceRows = document.querySelectorAll('.service-selection-row');
        serviceRows.forEach(row => {
            row.addEventListener('click', () => {
                serviceRows.forEach(r => r.classList.remove('selected'));
                row.classList.add('selected');
            });
        });

        // Wire up the Back button to return to initial choice view
        document.getElementById('backToTypeBtn').addEventListener('click', () => {
            contentPlaceholder.innerHTML = ''; // Wipe out dynamic layout
            gridContainer.style.display = 'grid'; // Restore original view
            actionPanel.style.display = 'flex';
        });
    });
});
