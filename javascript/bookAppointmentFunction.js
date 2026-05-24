document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT & CONFIG ---
    let dbData = { services: [], holidays: [], bookedSlots: {}, clinicCaps: {} };
    let selectedPatientType = null;
    
    // Combined State Object to manage selections fluidly
    let selectedService = { id: null, name: "", durationHours: 1 };
    
    // Baseline timeline anchors matching system logs
    const simulatedNow = new Date(); 
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
    function refreshAvailability() {
        return fetch('backend/get_availability.php')
            .then(res => res.json())
            .then(data => {
                dbData = data;
            })
            .catch(err => {
                console.warn("Using baseline database fallbacks:", err);
                dbData = {
                    services:[
                        { id: 1, name: "Oral prophylaxis", duration: "~ 1 hour", hours: 1 },
                        { id: 2, name: "Digital dental X-ray", duration: "~ 30 minutes", hours: 1 }, 
                        { id: 3, name: "Dental check-up & consultation", duration: "~ 1 hour", hours: 1 },
                        { id: 4, name: "Laser teeth whitening", duration: "~ 2 hours", hours: 2 },
                        { id: 5, name: "Composite / direct veneers", duration: "~ 2 hours", hours: 2 },
                        { id: 6, name: "Porcelain veneers", duration: "~ 2 hours", hours: 2 },
                        { id: 7, name: "Zirconia veneers", duration: "~ 2 hours", hours: 2 },
                        { id: 8, name: "Dental fillings", duration: "~ 1 hour", hours: 1 },
                        { id: 9, name: "Dental crowns", duration: "~ 2 hours", hours: 2 },
                        { id: 10, name: "Complete dentures", duration: "~ 2 hours", hours: 2 },
                        { id: 11, name: "Removable partial dentures", duration: "~ 2 hours", hours: 2 },
                        { id: 12, name: "Root canal treatment", duration: "~ 3 hours", hours: 3 },
                        { id: 13, name: "Braces", duration: "~ 1 hour", hours: 1 },
                        { id: 14, name: "Invisalign", duration: "~ 1 hour", hours: 1 },
                        { id: 15, name: "Children's dental check-up", duration: "~ 1 hour", hours: 1 },
                        { id: 16, name: "Fluoride treatment", duration: "~ 30 minutes", hours: 1 },
                        { id: 17, name: "Dental sealants", duration: "~ 1 hour", hours: 1 },
                        { id: 18, name: "Tooth extraction", duration: "~ 1 hour", hours: 1 },
                        { id: 19, name: "Oral surgery", duration: "~ 3 hours", hours: 3 },
                        { id: 20, name: "Dental implants", duration: "~ 3 hours", hours: 3 }
                    ],
                    holidays: [],
                    bookedSlots: {},
                    clinicCaps: {}
                };
            });
    }

    // Run it immediately on page load
    refreshAvailability();

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
        
        // Flow Split Routing Functionality
        // Flow Split Routing Functionality
        if (selectedPatientType === 'new') {
            // Set the state fully for the consultation service
            selectedService = { 
                id: 3, 
                name: "Dental check-up & consultation", // Match lowercase 'c' from get_availability database defaults
                durationHours: 1,
                duration_hours: 1
            };
            renderDateTimeStep();
        } else {
            renderServiceStep();
        }
    });

    // --- DYNAMIC PATIENT STEP PROGRESS TRACKER ---
    function getProgressBarHTML(currentStep) {
        let steps = [];
        
        if (selectedPatientType === 'new') {
            steps = [
                { num: 1, label: "Date & Time" },
                { num: 2, label: "Your Details" },
                { num: 3, label: "Confirm" }
            ];
        } else {
            steps = [
                { num: 1, label: "Service" },
                { num: 2, label: "Date & Time" },
                { num: 3, label: "Your Details" },
                { num: 4, label: "Confirm" }
            ];
        }

        return `
            <div class="step-wizard-bar">
                ${steps.map((s, idx) => {
                    let stateClass = "";
                    let innerContent = s.num;
                    
                    if (currentStep === s.num) {
                        stateClass = "current"; 
                    } else if (currentStep > s.num) {
                        stateClass = "completed"; 
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

    // --- FIGMA FIG-1: SELECT SERVICE LAYER (RETURNING PATIENT ONLY) ---
    function renderServiceStep() {
        gridContainer.style.display = 'none';
        actionPanel.style.display = 'none';
        contentPlaceholder.style.display = 'block';

        contentPlaceholder.innerHTML = `
            ${getProgressBarHTML(1)}
            <h2 class="flow-section-title">SELECT A SERVICE</h2>
            <div class="services-list-container">
                ${dbData.services.map(s => `
                    <div class="service-selection-row" data-id="${s.id}" data-name="${s.name}" data-hours="${s.hours}">
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
                
                selectedService.id = parseInt(row.getAttribute('data-id'));
                selectedService.name = row.getAttribute('data-name');
                selectedService.durationHours = parseFloat(row.getAttribute('data-hours'));
                nextBtn.removeAttribute('disabled');
            });
        });

        document.getElementById('backToTypeBtn').addEventListener('click', () => {
            contentPlaceholder.innerHTML = '';
            contentPlaceholder.style.display = 'none';
            gridContainer.style.display = 'grid';
            actionPanel.style.display = 'flex';
            selectedPatientType = null;
            cards.forEach(c => c.classList.remove('active'));
        });

        nextBtn.addEventListener('click', renderDateTimeStep);
    }

    // --- FIGMA FIG-2 & 3: PICK DATE & TIME LAYER ---
    function renderDateTimeStep() {
        // Dynamic identification parameters based on flow route configuration
        if (selectedPatientType === 'new') {
            gridContainer.style.display = 'none';
            actionPanel.style.display = 'none';
            contentPlaceholder.style.display = 'block';
        }

        const currentStepNum = selectedPatientType === 'new' ? 1 : 2;

        contentPlaceholder.innerHTML = `
            ${getProgressBarHTML(currentStepNum)}
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
                        <div class="legend-item"><span class="legend-dot available"></span> Available</div>
                        <div class="legend-item"><span class="legend-dot booked"></span> Booked</div>
                        <div class="legend-item"><span class="legend-dot holiday" style="background-color: #FF7878;"></span> Holiday</div>
                    </div>
                    <div id="timesheetsGrid" class="timesheet-slots-grid"></div>
                </div>
            </div>

            <div class="flow-nav-buttons left-aligned">
                <button type="button" class="btn-flow-back" id="backRouteBtn">Back</button>
                <button type="button" class="btn-flow-next" id="goToDetailsBtn" disabled>Next</button>
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

        // Dynamic targeting conditions mapping to distinct operational states
        document.getElementById('backRouteBtn').addEventListener('click', () => {
            if (selectedPatientType === 'new') {
                contentPlaceholder.innerHTML = '';
                contentPlaceholder.style.display = 'none';
                gridContainer.style.display = 'grid';
                actionPanel.style.display = 'flex';
                selectedPatientType = null;
                cards.forEach(c => c.classList.remove('active'));
            } else {
                renderServiceStep();
            }
        });
        
        document.getElementById('goToDetailsBtn').addEventListener('click', renderDetailsStep);
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
            const todayMidnight = new Date(simulatedNow.getFullYear(), simulatedNow.getMonth(), simulatedNow.getDate());
            const isPast = date < todayMidnight;
            const isHoliday = Array.isArray(dbData.holidays) && dbData.holidays.map(h => String(h).trim()).includes(dateStr);
            const isSunday = date.getDay() === 0;

            let cellClass = 'calendar-day-cell';
            if (isToday) cellClass += ' today';
            if (isPast) cellClass += ' past';
            if (isHoliday) cellClass += ' holiday';
            if (isSunday) cellClass += ' sunday';
            if (selectedDateStr === dateStr) cellClass += ' selected';

            const cellHTML = `<div class="${cellClass}" data-date="${dateStr}">${day}</div>`;
            calGrid.innerHTML += cellHTML;
        }

        document.querySelectorAll('.calendar-day-cell:not(.empty, .past, .holiday, .sunday)').forEach(cell => {
            cell.addEventListener('click', (e) => {
                document.querySelectorAll('.calendar-day-cell').forEach(c => c.classList.remove('selected'));
                e.target.classList.add('selected');
                selectedDateStr = e.target.getAttribute('data-date');
                renderTimeSlots();
                document.getElementById('goToDetailsBtn').setAttribute('disabled', 'disabled');
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
        const serviceDurationHours = selectedService.durationHours || 1;

        // Generate time slots based on day of week
        const selectedDate = new Date(selectedDateStr);
        const dayOfWeek = selectedDate.getDay(); 
        
        let timeSlots = [];
        let closingHour = 17; 
        
        if (dayOfWeek === 0) {
            timeGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #FF7878; font-weight: 600;">Clinic Closed on Sundays</p>';
            return;
        } else if (dayOfWeek === 6) {
            closingHour = 16;
            for (let hour = 9; hour < closingHour; hour++) {
                timeSlots.push(`${String(hour).padStart(2, '0')}:00`);
            }
        } else {
            closingHour = 17;
            for (let hour = 8; hour < closingHour; hour++) {
                timeSlots.push(`${String(hour).padStart(2, '0')}:00`);
            }
        }

        const today = new Date(simulatedNow.getFullYear(), simulatedNow.getMonth(), simulatedNow.getDate());
        const selectedDay = new Date(selectedDateStr);
        const isToday = selectedDay.getTime() === today.getTime();
        const currentHour = simulatedNow.getHours();
        const minimumBookingHoursAhead = 2; 

        timeSlots.forEach(time => {
            const [hour] = time.split(':').map(Number);
            
            const isPast = isToday && hour <= currentHour;
            const hoursTilSlot = isToday ? (hour - currentHour) : 24;
            const isTooSoon = isToday && hoursTilSlot <= minimumBookingHoursAhead;
            const isBooked = bookedTimes.includes(time);
            
            let isDurationBlocked = false;
            for (let i = 0; i < serviceDurationHours; i++) {
                const checkHour = hour + i;
                const checkTime = `${String(checkHour).padStart(2, '0')}:00`;
                if (bookedTimes.includes(checkTime)) {
                    isDurationBlocked = true;
                    break;
                }
            }
            
            const exceedsClosing = (hour + serviceDurationHours) > closingHour;
            
            let slotState = 'available';
            let displayText = time;
            
            if (isPast) {
                slotState = 'past';
                displayText = `${time} Past`;
            } else if (isTooSoon) {
                slotState = 'past';
                displayText = `${time} Too Soon`;
            } else if (isBooked || isDurationBlocked) {
                slotState = 'booked';
                displayText = `${time} Booked`;
            } else if (exceedsClosing) {
                slotState = 'booked';
                displayText = `${time} Closed`;
            }
            
            const slotClass = `time-slot ${slotState}`;
            const slotHTML = `<div class="${slotClass}" data-time="${time}">${displayText}</div>`;
            timeGrid.innerHTML += slotHTML;
        });

        // Attach click handlers ONLY to available slots, blocking booked/past ones
        document.querySelectorAll('.time-slot.available').forEach(slot => {
            slot.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                e.target.classList.add('selected');
                selectedTimeSlot = e.target.getAttribute('data-time');
                document.getElementById('goToDetailsBtn').removeAttribute('disabled');
            });
        });
        
        // Prevent any interaction with booked/past slots
        document.querySelectorAll('.time-slot.booked, .time-slot.past').forEach(slot => {
            slot.style.pointerEvents = 'none';
            slot.style.cursor = 'not-allowed';
            slot.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }, true);
        });
    }

    // --- FIGMA FIG-4: YOUR DETAILS ACCOUNT LAYER ---
    function renderDetailsStep() {
        const currentStepNum = selectedPatientType === 'new' ? 2 : 3;

        contentPlaceholder.innerHTML = `
            ${getProgressBarHTML(currentStepNum)}
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
                <button type="button" class="btn-flow-back" id="backToDateTimeBtn">Back</button>
                <button type="button" class="btn-flow-next" id="goToConfirmBtn">Next</button>
            </div>
        `;

        document.getElementById('backToDateTimeBtn').addEventListener('click', renderDateTimeStep);
        document.getElementById('goToConfirmBtn').addEventListener('click', () => {
            const detailForm = document.getElementById('appointmentDetailsForm');
            if (!detailForm.checkValidity()) {
                detailForm.reportValidity();
                return;
            }
            
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
        const currentStepNum = selectedPatientType === 'new' ? 3 : 4;
        const sectionTitle = selectedPatientType === 'new' ? "CONFIRM CONSULTATION" : "CONFIRM APPOINTMENT";
        const submitBtnText = selectedPatientType === 'new' ? "Book Consultation" : "Book Appointment";

        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const cleanDateLabel = new Date(selectedDateStr).toLocaleDateString(undefined, dateOptions);
        
        const hourInt = parseInt(selectedTimeSlot.split(':')[0]);
        const cleanTimeLabel = hourInt === 12 ? "12:00 PM" : hourInt > 12 ? `${hourInt - 12}:00 PM` : `${hourInt}:00 AM`;

        contentPlaceholder.innerHTML = `
            ${getProgressBarHTML(currentStepNum)}
            <h2 class="flow-section-title">${sectionTitle}</h2>
            
            <div class="confirmation-review-summary-card">
                <h3 class="summary-card-header-title">Booking Details Overview</h3>
                <div class="summary-details-matrix-grid">
                    <div class="summary-data-cell"><strong>${selectedPatientType === 'new' ? 'Service' : 'Selected Treatment'}:</strong> <span>${selectedService.name}</span></div>
                    <div class="summary-data-cell"><strong>Scheduled Date:</strong> <span>${cleanDateLabel}</span></div>
                    <div class="summary-data-cell"><strong>Arrival Window:</strong> <span>${cleanTimeLabel}</span></div>
                    <div class="summary-data-cell"><strong>Patient Name:</strong> <span>${selectedService.firstName} ${selectedService.lastName}</span></div>
                    <div class="summary-data-cell"><strong>Contact Link:</strong> <span>${selectedService.phone} / ${selectedService.email}</span></div>
                    ${selectedService.notes ? `<div class="summary-data-cell full-width"><strong>Medical Notation:</strong> <p>${selectedService.notes}</p></div>` : ''}
                </div>
            </div>

            <div class="flow-nav-buttons left-aligned">
                <button type="button" class="btn-flow-back" id="backToDetailsBtn">Back</button>
                <button type="button" class="btn-flow-next final-action-submit" id="submitBookingBtn">${submitBtnText}</button>
            </div>
        `;

        document.getElementById('backToDetailsBtn').addEventListener('click', renderDetailsStep);
        document.getElementById('submitBookingBtn').addEventListener('click', executeFinalDatabaseCommit);
    }

    // --- SUCCESS STEP: APPOINTMENT CONFIRMED ---
    function renderSuccessStep() {
        const successTitle = selectedPatientType === 'new' ? "Consultation Booked!" : "Appointment Confirmed!";
        const successSubtitle = selectedPatientType === 'new' 
            ? `We'll send a confirmation to your email. Our dentist will perform a thorough examination and discuss your treatment plan with you.<br>Please bring a <span class="success-highlight">valid ID</span> and any relevant <span class="success-highlight">medical history</span> to your appointment.`
            : `We'll send a confirmation to your email. See you at your appointment!<br>Please bring a <span class="success-highlight">valid ID</span> and any previous <span class="success-highlight">dental records</span> if available.`;

        contentPlaceholder.innerHTML = `
            <div class="success-confirmed-wrapper">
                <div class="success-check-circle">✓</div>
                <h2 class="success-title">${successTitle}</h2>
                <p class="success-subtitle">${successSubtitle}</p>
                <button type="button" class="btn-flow-next" id="bookAnotherBtn">Book Another</button>
            </div>
        `;

        document.getElementById('bookAnotherBtn').addEventListener('click', () => {
            contentPlaceholder.innerHTML = '';
            contentPlaceholder.style.display = 'none';
            gridContainer.style.gridTemplateColumns = ''; // reset just in case
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
            service_id: selectedService.id, 
            service_name: selectedService.name,
            booking_date: selectedDateStr,
            booking_time: selectedTimeSlot,
            duration_hours: selectedService.durationHours || selectedService.duration_hours || 1,
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
                // Refresh local cache data from database so slots turn red immediately behind the scenes
                refreshAvailability().then(() => {
                    renderSuccessStep();
                });
            } else {
                alert('Error processing request: ' + response.message);
            }
        })
        .catch(err => {
            console.error('Network write sequence fault:', err);
            const fallbackMessage = selectedPatientType === 'new' ? 'finalizing your consultation request.' : 'finalizing your appointment request.';
            alert('A network connectivity fault occurred while ' + fallbackMessage);
        });
    }
});