document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT & CONFIG ---
    let dbData = { services: [], holidays: [], bookedSlots: {}, clinicCaps: {} };
    let selectedPatientType = null;
    let selectedService = { id: null, name: "", durationHours: 1 };
    
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
        renderServiceStep();
    });

    // --- SHARED COMPONENT: GLOBAL STEP PROGRESS TRACKER ---
    function getProgressBarHTML(currentStep) {
        const steps = [
            { num: 1, label: "Service" },
            { num: 2, label: "Date & Time" },
            { num: 3, label: "Your Details" },
            { num: 4, label: "Confirm" }
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

    // --- FIGMA FIG-1: SELECT SERVICE LAYER ---
    function renderServiceStep() {
        gridContainer.style.display = 'none';
        actionPanel.style.display = 'none';
        contentPlaceholder.style.display = 'block';

        contentPlaceholder.innerHTML = `
            ${getProgressBarHTML(1)}
            <h2 class="flow-section-title">SELECT A SERVICE</h2>
            <div class="services-list-container">
                ${dbData.services.map(s => `
                    <div class="service-selection-row" data-name="${s.name}" data-hours="${s.hours}">
                        <span class="service-name-text">${s.name}</span>
                        <span class="service-duration-text">${s.hours >= 1 ? `~ ${s.hours} Hour(s)` : '~ 30 mins'}</span>
                    </div>
                `).join('')}
            </div>
            <div class="flow-nav-buttons left-aligned">
                <button type="button" class="btn-flow-back" id="backToTypeBtn">Back</button>
                <button type="button" class="btn-flow-next" id="goToStep2" disabled>Next</button>
            </div>
        `;

        const rows = document.querySelectorAll('.service-selection-row');
        const nextBtn = document.getElementById('goToStep2');

        rows.forEach(row => {
            row.addEventListener('click', () => {
                rows.forEach(r => r.classList.remove('selected'));
                row.classList.add('selected');
                
                selectedService.name = row.getAttribute('data-name');
                selectedService.durationHours = parseFloat(row.getAttribute('data-hours'));
                nextBtn.removeAttribute('disabled');
            });
        });

        document.getElementById('backToTypeBtn').addEventListener('click', () => {
            contentPlaceholder.innerHTML = '';
            gridContainer.style.display = 'grid';
            actionPanel.style.display = 'flex';
        });

        nextBtn.addEventListener('click', renderDateTimeStep);
    }

    // --- FIGMA FIG-2 & 3: PICK DATE & TIME LAYER ---
    function renderDateTimeStep() {
        contentPlaceholder.innerHTML = `
            ${getProgressBarHTML(2)}
            <h2 class="flow-section-title">PICK A DATE & TIME</h2>
            <p class="service-summary-subtitle">${selectedService.name} &nbsp;•&nbsp; ~ ${selectedService.durationHours} Hour(s)</p>
            
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
                        <span class="legend-item"><span class="legend-dot available"></span> Available</span>
                        <span class="legend-item"><span class="legend-dot selected"></span> Selected</span>
                        <span class="legend-item"><span class="legend-dot booked"></span> Booked</span>
                        <span class="legend-item"><span class="legend-dot past"></span> Past</span>
                    </div>
                    <div id="timesheetSlotsContainer" class="timesheet-slots-container">
                        <div class="select-date-prompt-message">Please select an open operating date first from the calendar grid matrix.</div>
                    </div>
                </div>
            </div>

            <div class="flow-nav-buttons left-aligned">
                <button type="button" class="btn-flow-back" id="backToStep1">Back</button>
                <button type="button" class="btn-flow-next" id="goToStep3" disabled>Next</button>
            </div>
        `;

        document.getElementById('backToStep1').addEventListener('click', renderServiceStep);
        document.getElementById('prevMonthBtn').addEventListener('click', () => moveMonth(-1));
        document.getElementById('nextMonthBtn').addEventListener('click', () => moveMonth(1));

        buildCalendarMatrix();
    }

    function moveMonth(direction) {
        currentCalMonth += direction;
        if (currentCalMonth < 0) { currentCalMonth = 11; currentCalYear--; }
        else if (currentCalMonth > 11) { currentCalMonth = 0; currentCalYear++; }
        buildCalendarMatrix();
    }

    function buildCalendarMatrix() {
        const daysGrid = document.getElementById('calendarDaysGrid');
        const monthLabel = document.getElementById('calendarMonthYearLabel');
        const prevBtn = document.getElementById('prevMonthBtn');

        daysGrid.innerHTML = "";
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        monthLabel.textContent = `${monthNames[currentCalMonth]} ${currentCalYear}`;

        if (currentCalYear === simulatedNow.getFullYear() && currentCalMonth === simulatedNow.getMonth()) {
            prevBtn.setAttribute('disabled', 'true');
        } else {
            prevBtn.removeAttribute('disabled');
        }

        const firstDayIndex = new Date(currentCalYear, currentCalMonth, 1).getDay();
        const totalMonthDays = new Date(currentCalYear, currentCalMonth + 1, 0).getDate();

        for (let i = 0; i < firstDayIndex; i++) {
            const blankTile = document.createElement('span');
            blankTile.className = "calendar-day-node empty";
            daysGrid.appendChild(blankTile);
        }

        for (let day = 1; day <= totalMonthDays; day++) {
            const dayNode = document.createElement('span');
            dayNode.className = "calendar-day-node";
            dayNode.textContent = day;

            const inspectingDate = new Date(currentCalYear, currentCalMonth, day);
            const dateISOStr = `${currentCalYear}-${String(currentCalMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            const isPastDay = inspectingDate.setHours(0,0,0,0) < new Date(simulatedNow.getTime()).setHours(0,0,0,0);
            const isSunday = inspectingDate.getDay() === 0;
            const isHoliday = dbData.holidays.includes(dateISOStr);

            if (isSunday || isHoliday) {
                dayNode.classList.add('closed');
            } else if (isPastDay) {
                dayNode.classList.add('past');
            } else {
                if (selectedDateStr === dateISOStr) dayNode.classList.add('selected');
                
                dayNode.addEventListener('click', () => {
                    document.querySelectorAll('.calendar-day-node').forEach(n => n.classList.remove('selected'));
                    dayNode.classList.add('selected');
                    selectedDateStr = dateISOStr;
                    selectedTimeSlot = null;
                    document.getElementById('goToStep3').setAttribute('disabled', 'true');
                    generateTimeSlots(inspectingDate, dateISOStr);
                });
            }
            daysGrid.appendChild(dayNode);
        }
    }

    function generateTimeSlots(dateObj, dateISOStr) {
        const slotsContainer = document.getElementById('timesheetSlotsContainer');
        slotsContainer.innerHTML = "";

        const operatingHours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
        const serviceDuration = selectedService.durationHours;
        const dayBookings = dbData.bookedSlots[dateISOStr] || [];
        const closingHourLimit = 17; 

        operatingHours.forEach(hour => {
            const time24 = `${String(hour).padStart(2, '0')}:00`;
            const displayTime = hour === 12 ? "12:00 PM" : hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`;

            const slotDiv = document.createElement('div');
            slotDiv.className = "timesheet-slot-row";
            
            const nameSpan = document.createElement('span');
            nameSpan.className = "slot-time-label";
            nameSpan.textContent = displayTime;
            slotDiv.appendChild(nameSpan);

            const badgeSpan = document.createElement('span');
            badgeSpan.className = "slot-status-badge";
            slotDiv.appendChild(badgeSpan);

            const slotDateTimeObj = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), hour, 0);
            const hoursDifferenceFromNow = (slotDateTimeObj - simulatedNow) / (1000 * 60 * 60);

            let isPast = false;
            let isConflict = false;

            if (slotDateTimeObj < simulatedNow || (hoursDifferenceFromNow >= 0 && hoursDifferenceFromNow < 2)) {
                isPast = true;
            } else {
                for (let step = 0; step < serviceDuration; step++) {
                    const evaluationHour = hour + step;
                    const evaluationTime24 = `${String(evaluationHour).padStart(2, '0')}:00`;

                    if (evaluationHour > closingHourLimit || dayBookings.includes(evaluationTime24)) {
                        isConflict = true;
                        break;
                    }
                }
            }

            if (isPast) {
                slotDiv.classList.add('state-past');
                badgeSpan.textContent = "Past";
            } else if (isConflict || dayBookings.includes(time24)) {
                slotDiv.classList.add('state-booked');
                badgeSpan.textContent = "Unavailable";
            } else {
                slotDiv.classList.add('state-available');
                if (selectedTimeSlot === time24) slotDiv.classList.add('state-selected');

                slotDiv.addEventListener('click', () => {
                    selectedTimeSlot = time24;
                    generateTimeSlots(dateObj, dateISOStr); 
                    document.getElementById('goToStep3').removeAttribute('disabled');
                });
            }
            slotsContainer.appendChild(slotDiv);
        });

        // Attach event listener once next button becomes active
        document.getElementById('goToStep3').addEventListener('click', renderDetailsStep);
    }

    // --- FIGMA FIG-4: YOUR DETAILS ACCOUNT LAYER ---
    function renderDetailsStep() {
        contentPlaceholder.innerHTML = `
            ${getProgressBarHTML(3)}
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
                <button type="button" class="btn-flow-back" id="backToStep2">Back</button>
                <button type="button" class="btn-flow-next" id="goToStep4">Next</button>
            </div>
        `;

        document.getElementById('backToStep2').addEventListener('click', renderDateTimeStep);
        document.getElementById('goToStep4').addEventListener('click', () => {
            const detailForm = document.getElementById('appointmentDetailsForm');
            if (!detailForm.checkValidity()) {
                detailForm.reportValidity();
                return;
            }
            
            // Extract input state variables cleanly
            const formData = new FormData(detailForm);
            selectedService.firstName = formData.get('first_name');
            selectedService.lastName = formData.get('last_name');
            selectedService.email = formData.get('email');
            selectedService.phone = formData.get('phone_number');
            selectedService.notes = formData.get('medical_notes');

            renderConfirmationStep();
        });
    }

    // --- FIGMA FIG-5: CONFIRM SLATE SUMMARY LAYER ---
    function renderConfirmationStep() {
        // Human readable conversion transformations
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const cleanDateLabel = new Date(selectedDateStr).toLocaleDateString(undefined, dateOptions);
        
        const hourInt = parseInt(selectedTimeSlot.split(':')[0]);
        const cleanTimeLabel = hourInt === 12 ? "12:00 PM" : hourInt > 12 ? `${hourInt - 12}:00 PM` : `${hourInt}:00 AM`;

        contentPlaceholder.innerHTML = `
            ${getProgressBarHTML(4)}
            <h2 class="flow-section-title">CONFIRM APPOINTMENT</h2>
            
            <div class="confirmation-review-summary-card">
                <h3 class="summary-card-header-title">Booking Details Overview</h3>
                <div class="summary-details-matrix-grid">
                    <div class="summary-data-cell"><strong>Selected Treatment:</strong> <span>${selectedService.name}</span></div>
                    <div class="summary-data-cell"><strong>Scheduled Date:</strong> <span>${cleanDateLabel}</span></div>
                    <div class="summary-data-cell"><strong>Arrival Window:</strong> <span>${cleanTimeLabel}</span></div>
                    <div class="summary-data-cell"><strong>Patient Name:</strong> <span>${selectedService.firstName} ${selectedService.lastName}</span></div>
                    <div class="summary-data-cell"><strong>Contact Link:</strong> <span>${selectedService.phone} / ${selectedService.email}</span></div>
                    ${selectedService.notes ? `<div class="summary-data-cell full-width"><strong>Medical Notation:</strong> <p>${selectedService.notes}</p></div>` : ''}
                </div>
            </div>

            <div class="flow-nav-buttons left-aligned">
                <button type="button" class="btn-flow-back" id="backToStep3">Back</button>
                <button type="button" class="btn-flow-next final-action-submit" id="submitBookingBtn">Book Appointment</button>
            </div>
        `;

        document.getElementById('backToStep3').addEventListener('click', renderDetailsStep);
        document.getElementById('submitBookingBtn').addEventListener('click', executeFinalDatabaseCommit);
    }

    // --- FIGMA FIG-5 SUCCESS: APPOINTMENT CONFIRMED SCREEN ---
    function renderSuccessStep() {
        contentPlaceholder.innerHTML = `
            ${getProgressBarHTML(5)}
            <div class="success-confirmed-wrapper">
                <div class="success-check-circle">✓</div>
                <h2 class="success-title">Appointment Confirmed!</h2>
                <p class="success-subtitle">
                    We'll send a confirmation to your email. See you at your appointment!<br>
                    Please bring a <span class="success-highlight">valid ID</span> and any previous <span class="success-highlight">dental records</span> if available.
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
            selectedService = { id: null, name: "", durationHours: 1 };
            selectedDateStr = null;
            selectedTimeSlot = null;
            cards.forEach(c => c.classList.remove('active'));
        });
    }

    function executeFinalDatabaseCommit() {
        const payload = {
            patient_type: selectedPatientType,
            service_name: selectedService.name,
            booking_date: selectedDateStr,
            booking_time: selectedTimeSlot,
            duration_hours: selectedService.durationHours,
            first_name: selectedService.firstName,
            last_name: selectedService.lastName,
            email: selectedService.email,
            phone: selectedService.phone,
            notes: selectedService.notes
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
            alert('A network connectivity fault occurred while finalizing your appointment request.');
        });
    }
});