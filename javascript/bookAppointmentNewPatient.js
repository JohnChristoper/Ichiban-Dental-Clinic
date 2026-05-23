document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT & CONFIG ---
    let dbData = { services: [], holidays: [], bookedSlots: {}, clinicCaps: {} };
    let selectedPatientType = null;
    let consultationService = { 
        id: null, 
        name: "Dental Check-up & Consultation", 
        durationHours: 1 
    };
    
    // Baseline timeline anchors matching system logs
    const simulatedNow = new Date(2026, 4, 22, 11, 0); 
    let currentCalMonth = simulatedNow.getMonth();
    let currentCalYear = simulatedNow.getFullYear();
    let selectedDateStr = null;
    let selectedTimeSlot = null;

    // --- DOM TARGET ELEMENT LINKS ---
    const cards = document.querySelectorAll('.patient-type-card');
    const continueBtn = document.querySelector('.patient-continue-btn');
    const gridContainer = document.querySelector('.patient-type-grid');
    const actionPanel = document.querySelector('.patient-flow-actions');
    const contentPlaceholder = document.querySelector('.middle-form-content-placeholder');

    // Fetch live system rules from backend service endpoints
    fetch('get_availability.php')
        .then(res => res.json())
        .then(data => {
            dbData = data;
        })
        .catch(err => {
            console.warn("Using baseline database fallbacks:", err);
            dbData = {
                services: [
                    { id: 1, name: "Oral prophylaxis", duration: "~ 1 hour", hours: 1 },
                    { id: 2, name: "Digital dental X-ray", duration: "~ 30 minutes", hours: 1 },
                    { id: 3, name: "Dental check-up & consultation", duration: "~ 1 hour", hours: 1 },
                    { id: 4, name: "Laser teeth whitening", duration: "~ 2 hours", hours: 2 },
                    { id: 5, name: "Composite / direct veneers", duration: "~ 2 hours", hours: 2 },
                    { id: 6, name: "Porcelain veneers", duration: "~ 2 hours", hours: 2 }
                ],
                holidays: [],
                bookedSlots: {},
                clinicCaps: {}
            };
        });

    // Capture initial entry point selection toggles
    cards.forEach(card => {
        card.addEventListener('click', () => {
            cards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            selectedPatientType = card.classList.contains('first-visit-card') ? 'new' : 'returning';
        });
    });

    continueBtn.addEventListener('click', () => {
        if (!selectedPatientType) {
            alert('Please select a patient category to continue.');
            return;
        }
        
        // Only handle new patient flow here
        if (selectedPatientType === 'new') {
            renderDateTimeStep();
        } else {
            // Returning patient - load the main returning patient script
            alert('Returning patient flow loaded');
            // This should be handled by the main bookAppointmentFunction.js
        }
    });

    // --- NEW PATIENT STEP PROGRESS TRACKER (3 STEPS) ---
    function getProgressBarHTML(currentStep) {
        const steps = [
            { num: 1, label: "Date & Time" },
            { num: 2, label: "Your Details" },
            { num: 3, label: "Confirm" }
        ];

        return `
            <div class="step-wizard-bar">
                ${steps.map((s, idx) => {
                    let stateClass = "";
                    let innerContent = s.num;
                    
                    if (currentStep === s.num) {
                        stateClass = "current"; // Highlighted green/teal node
                    } else if (currentStep > s.num) {
                        stateClass = "completed"; // Checkmark replacement node
                        innerContent = "✓";
                    }

                    const appendLine = idx < steps.length - 1 
                        ? `<div class="step-line ${currentStep > s.num ? 'active' : ''}"></div>` 
                        : '';

                    return `
                        <div class="step-node ${stateClass}">
                            <span class="node-circle">${innerContent}</span>
                            <span class="node-label">${s.label}</span>
                        </div>
                        ${appendLine}
                    `;
                }).join('')}
            </div>
        `;
    }

    // --- STEP 1: PICK DATE & TIME LAYER (NEW PATIENT) ---
    function renderDateTimeStep() {
        gridContainer.style.display = 'none';
        actionPanel.style.display = 'none';
        contentPlaceholder.style.display = 'block';

        contentPlaceholder.innerHTML = `
            ${getProgressBarHTML(1)}
            <h2 class="flow-section-title">PICK A DATE & TIME</h2>
            <p class="service-summary-subtitle">Dental Check-up & Consultation &nbsp;•&nbsp; ~ 1 Hour</p>
            
            <div class="datetime-grid-layout">
                <div class="calendar-card-wrapper">
                    <div class="calendar-month-nav">
                        <button type="button" id="prevMonthBtn" class="cal-nav-arrow">&lt;</button>
                        <span id="calendarMonthYearLabel" class="cal-month-label"></span>
                        <button type="button" id="nextMonthBtn" class="cal-nav-arrow">&gt;</button>
                    </div>
                    <div class="calendar-weekdays-row">
                        <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                    </div>
                    <div id="calendarDaysGrid" class="calendar-days-grid"></div>
                </div>

                <div class="timesheet-card-wrapper">
                    <div class="timesheet-legend-bar">
                        <div class="legend-item"><span class="legend-dot available"></span> Available</div>
                        <div class="legend-item"><span class="legend-dot booked"></span> Booked</div>
                        <div class="legend-item"><span class="legend-dot holiday"></span> Holiday</div>
                    </div>
                    <div id="timesheetsGrid" class="timesheet-slots-grid"></div>
                </div>
            </div>

            <div class="flow-nav-buttons left-aligned">
                <button type="button" class="btn-flow-back" id="backToTypeBtn">Back</button>
                <button type="button" class="btn-flow-next" id="goToStep2" disabled>Next</button>
            </div>
        `;

        renderCalendarGrid();
        renderTimeSlots();

        document.getElementById('prevMonthBtn').addEventListener('click', () => {
            currentCalMonth--;
            if (currentCalMonth < 0) {
                currentCalMonth = 11;
                currentCalYear--;
            }
            renderCalendarGrid();
            renderTimeSlots();
        });

        document.getElementById('nextMonthBtn').addEventListener('click', () => {
            currentCalMonth++;
            if (currentCalMonth > 11) {
                currentCalMonth = 0;
                currentCalYear++;
            }
            renderCalendarGrid();
            renderTimeSlots();
        });

        document.getElementById('backToTypeBtn').addEventListener('click', () => {
            contentPlaceholder.innerHTML = '';
            contentPlaceholder.style.display = 'none';
            gridContainer.style.display = 'grid';
            actionPanel.style.display = 'flex';
            selectedPatientType = null;
            cards.forEach(c => c.classList.remove('active'));
        });

        document.getElementById('goToStep2').addEventListener('click', renderDetailsStep);
    }

    function renderCalendarGrid() {
        const calGrid = document.getElementById('calendarDaysGrid');
        const monthLabel = document.getElementById('calendarMonthYearLabel');
        
        const monthNames = ["January", "February", "March", "April", "May", "June",
                           "July", "August", "September", "October", "November", "December"];
        monthLabel.textContent = `${monthNames[currentCalMonth]} ${currentCalYear}`;

        const firstDay = new Date(currentCalYear, currentCalMonth, 1).getDay();
        const daysInMonth = new Date(currentCalYear, currentCalMonth + 1, 0).getDate();
        
        calGrid.innerHTML = '';

        for (let i = 0; i < firstDay; i++) {
            calGrid.innerHTML += '<div class="calendar-day-cell empty"></div>';
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${currentCalYear}-${String(currentCalMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const date = new Date(currentCalYear, currentCalMonth, day);
            const isToday = date.toDateString() === simulatedNow.toDateString();
            const isPast = date < simulatedNow;
            const isHoliday = dbData.holidays.includes(dateStr);

            let cellClass = 'calendar-day-cell';
            if (isToday) cellClass += ' today';
            if (isPast) cellClass += ' past';
            if (isHoliday) cellClass += ' holiday';
            if (selectedDateStr === dateStr) cellClass += ' selected';

            const cellHTML = `<div class="${cellClass}" data-date="${dateStr}">${day}</div>`;
            calGrid.innerHTML += cellHTML;
        }

        document.querySelectorAll('.calendar-day-cell:not(.empty, .past, .holiday)').forEach(cell => {
            cell.addEventListener('click', (e) => {
                document.querySelectorAll('.calendar-day-cell').forEach(c => c.classList.remove('selected'));
                e.target.classList.add('selected');
                selectedDateStr = e.target.getAttribute('data-date');
                renderTimeSlots();
                document.getElementById('goToStep2').setAttribute('disabled', 'disabled');
                selectedTimeSlot = null;
            });
        });
    }

    function renderTimeSlots() {
        const timeGrid = document.getElementById('timesheetsGrid');
        timeGrid.innerHTML = '';

        if (!selectedDateStr) {
            timeGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">Select a date to see available times</p>';
            return;
        }

        const bookedTimes = dbData.bookedSlots[selectedDateStr] || [];
        const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

        timeSlots.forEach(time => {
            const isBooked = bookedTimes.includes(time);
            const slotClass = isBooked ? 'time-slot booked' : 'time-slot available';
            
            const slotHTML = `<div class="${slotClass}" data-time="${time}">${time}</div>`;
            timeGrid.innerHTML += slotHTML;
        });

        document.querySelectorAll('.time-slot.available').forEach(slot => {
            slot.addEventListener('click', (e) => {
                document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                e.target.classList.add('selected');
                selectedTimeSlot = e.target.getAttribute('data-time');
                document.getElementById('goToStep2').removeAttribute('disabled');
            });
        });
    }

    // --- STEP 2: YOUR DETAILS ACCOUNT LAYER (NEW PATIENT) ---
    function renderDetailsStep() {
        contentPlaceholder.innerHTML = `
            ${getProgressBarHTML(2)}
            <h2 class="flow-section-title">YOUR DETAILS</h2>
            
            <form id="appointmentDetailsForm" class="details-form-layout-grid">
                <div class="form-input-row-group double-column">
                    <div class="field-item">
                        <label class="form-input-label">First Name</label>
                        <input type="text" name="first_name" class="form-text-input" placeholder="Enter your first name" required>
                    </div>
                    <div class="field-item">
                        <label class="form-input-label">Last Name</label>
                        <input type="text" name="last_name" class="form-text-input" placeholder="Enter your last name" required>
                    </div>
                </div>

                <div class="form-input-row-group double-column">
                    <div class="field-item">
                        <label class="form-input-label">Email Address</label>
                        <input type="email" name="email" class="form-text-input" placeholder="name@example.com" required>
                    </div>
                    <div class="field-item">
                        <label class="form-input-label">Phone Number</label>
                        <input type="tel" name="phone_number" class="form-text-input" placeholder="09XXXXXXXXX" required>
                    </div>
                </div>

                <div class="form-input-row-group">
                    <div class="field-item">
                        <label class="form-input-label">Additional Medical Notes / Comments (Optional)</label>
                        <textarea name="medical_notes" class="form-textarea-input" placeholder="Write any specific preferences or condition histories here..."></textarea>
                    </div>
                </div>
            </form>

            <div class="flow-nav-buttons left-aligned">
                <button type="button" class="btn-flow-back" id="backToStep1">Back</button>
                <button type="button" class="btn-flow-next" id="goToStep3">Next</button>
            </div>
        `;

        document.getElementById('backToStep1').addEventListener('click', renderDateTimeStep);
        document.getElementById('goToStep3').addEventListener('click', () => {
            const detailForm = document.getElementById('appointmentDetailsForm');
            if (!detailForm.checkValidity()) {
                detailForm.reportValidity();
                return;
            }
            
            // Extract input state variables cleanly
            const formData = new FormData(detailForm);
            consultationService.firstName = formData.get('first_name');
            consultationService.lastName = formData.get('last_name');
            consultationService.email = formData.get('email');
            consultationService.phone = formData.get('phone_number');
            consultationService.notes = formData.get('medical_notes');

            renderConfirmationStep();
        });
    }

    // --- STEP 3: CONFIRM CONSULTATION BOOKING (NEW PATIENT) ---
    function renderConfirmationStep() {
        // Human readable conversion transformations
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const cleanDateLabel = new Date(selectedDateStr).toLocaleDateString(undefined, dateOptions);
        
        const hourInt = parseInt(selectedTimeSlot.split(':')[0]);
        const cleanTimeLabel = hourInt === 12 ? "12:00 PM" : hourInt > 12 ? `${hourInt - 12}:00 PM` : `${hourInt}:00 AM`;

        contentPlaceholder.innerHTML = `
            ${getProgressBarHTML(3)}
            <h2 class="flow-section-title">CONFIRM CONSULTATION</h2>
            
            <div class="confirmation-review-summary-card">
                <h3 class="summary-card-header-title">Booking Details Overview</h3>
                <div class="summary-details-matrix-grid">
                    <div class="summary-data-cell"><strong>Service:</strong> <span>Dental Check-up & Consultation</span></div>
                    <div class="summary-data-cell"><strong>Scheduled Date:</strong> <span>${cleanDateLabel}</span></div>
                    <div class="summary-data-cell"><strong>Arrival Window:</strong> <span>${cleanTimeLabel}</span></div>
                    <div class="summary-data-cell"><strong>Patient Name:</strong> <span>${consultationService.firstName} ${consultationService.lastName}</span></div>
                    <div class="summary-data-cell"><strong>Contact Link:</strong> <span>${consultationService.phone} / ${consultationService.email}</span></div>
                    ${consultationService.notes ? `<div class="summary-data-cell full-width"><strong>Medical Notation:</strong> <p>${consultationService.notes}</p></div>` : ''}
                </div>
            </div>

            <div class="flow-nav-buttons left-aligned">
                <button type="button" class="btn-flow-back" id="backToStep2">Back</button>
                <button type="button" class="btn-flow-next final-action-submit" id="submitConsultationBtn">Book Consultation</button>
            </div>
        `;

        document.getElementById('backToStep2').addEventListener('click', renderDetailsStep);
        document.getElementById('submitConsultationBtn').addEventListener('click', executeFinalDatabaseCommit);
    }

    // --- SUCCESS STEP: CONSULTATION BOOKED (NEW PATIENT) ---
    function renderSuccessStep() {
        contentPlaceholder.innerHTML = `
            <div class="success-confirmed-wrapper">
                <div class="success-check-circle">✓</div>
                <h2 class="success-title">Consultation Booked!</h2>
                <p class="success-subtitle">
                    We'll send a confirmation to your email. Our dentist will perform a thorough examination and discuss your treatment plan with you.<br>
                    Please bring a <span class="success-highlight">valid ID</span> and any relevant <span class="success-highlight">medical history</span> to your appointment.
                </p>
                <button type="button" class="btn-flow-next" id="bookAnotherBtn">Book Another</button>
            </div>
        `;

        document.getElementById('bookAnotherBtn').addEventListener('click', () => {
            contentPlaceholder.innerHTML = '';
            contentPlaceholder.style.display = 'none';
            gridContainer.style.display = 'grid';
            actionPanel.style.display = 'flex';
            selectedPatientType = null;
            selectedDateStr = null;
            selectedTimeSlot = null;
            consultationService = { 
                id: null, 
                name: "Dental Check-up & Consultation", 
                durationHours: 1 
            };
            cards.forEach(c => c.classList.remove('active'));
        });
    }

    function executeFinalDatabaseCommit() {
        const payload = {
            patient_type: selectedPatientType,
            service_name: consultationService.name,
            booking_date: selectedDateStr,
            booking_time: selectedTimeSlot,
            duration_hours: consultationService.durationHours,
            first_name: consultationService.firstName,
            last_name: consultationService.lastName,
            email: consultationService.email,
            phone: consultationService.phone,
            notes: consultationService.notes
        };

        fetch('backend/save_appointment.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(response => {
            if (response.success) {
                renderSuccessStep();
            } else {
                alert('Error processing request: ' + response.message);
            }
        })
        .catch(err => {
            console.error('Network write sequence fault:', err);
            alert('A network connectivity fault occurred while finalizing your consultation request.');
        });
    }
});