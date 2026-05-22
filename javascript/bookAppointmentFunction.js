document.addEventListener('DOMContentLoaded', () => {
    // --- GLOBAL APP STATE ---
    let dbData = { services: [], holidays: [], bookedSlots: {} };
    let selectedPatientType = null;
    let selectedService = { name: "", durationHours: 1 };
    
    const simulatedNow = new Date(2026, 4, 22, 14, 46); // Static mock base line match
    let currentCalMonth = simulatedNow.getMonth();
    let currentCalYear = simulatedNow.getFullYear();
    let selectedDateStr = null;
    let selectedTimeSlot = null;

    // --- BASE UI ELEMENT POINTERS ---
    const cards = document.querySelectorAll('.patient-type-card');
    const continueBtn = document.querySelector('.patient-continue-btn');
    const gridContainer = document.querySelector('.patient-type-grid');
    const actionPanel = document.querySelector('.patient-flow-actions');
    const contentPlaceholder = document.querySelector('.middle-form-content-placeholder');

    // --- REVISED: Dynamic connection line targeting our new backend file ---
    fetch('backend/get_availability.php')
        .then(res => res.json())
        .then(data => {
            dbData = data;
        })
        .catch(err => console.error("Error connecting to PHP backend database API:", err));

    // Handle Selection Visuals
    cards.forEach(card => {
        card.addEventListener('click', () => {
            cards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            selectedPatientType = card.id === 'newPatientCard' ? 'new' : 'returning';
        });
    });

    continueBtn.addEventListener('click', () => {
        if (!selectedPatientType) {
            alert('Please select a patient type before continuing.');
            return;
        }
        renderServiceStep();
    });

    function renderServiceStep() {
        gridContainer.style.display = 'none';
        actionPanel.style.display = 'none';

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
                ${dbData.services.map(s => `
                    <div class="service-selection-row" data-name="${s.name}" data-hours="${s.hours}">
                        <span class="service-name-text">${s.name}</span>
                        <span class="service-duration-text">${s.duration}</span>
                    </div>
                `).join('')}
            </div>
            <div class="flow-nav-buttons">
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

    function renderDateTimeStep() {
        contentPlaceholder.innerHTML = `
            <div class="step-wizard-bar">
                <div class="step-node"><span class="node-circle checkmark">✓</span> <span class="node-label">Service</span></div>
                <div class="step-line"></div>
                <div class="step-node current"><span class="node-circle">2</span> <span class="node-label">Date & Time</span></div>
                <div class="step-line"></div>
                <div class="step-node"><span class="node-circle">3</span> <span class="node-label">Your Details</span></div>
                <div class="step-line"></div>
                <div class="step-node"><span class="node-circle">4</span> <span class="node-label">Confirm</span></div>
            </div>
            <h2 class="flow-section-title">PICK A DATE & TIME</h2>
            <p class="service-summary-subtitle">${selectedService.name} &nbsp;•&nbsp; ${selectedService.durationHours >= 1 ? `~ ${selectedService.durationHours} Hour(s)` : '~ 30 mins'}</p>
            
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
                        <span class="legend-dot available"></span> Available
                        <span class="legend-dot selected"></span> Selected
                        <span class="legend-dot booked"></span> Booked
                        <span class="legend-dot past"></span> Past
                    </div>
                    <div id="timesheetSlotsContainer" class="timesheet-slots-container">
                        <div class="select-date-prompt-message">Please choose an open date first from the calendar matrix.</div>
                    </div>
                </div>
            </div>

            <div class="flow-nav-buttons">
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
        const nextBtn = document.getElementById('nextMonthBtn');

        daysGrid.innerHTML = "";
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        monthLabel.textContent = `${monthNames[currentCalMonth]} ${currentCalYear}`;

        if (currentCalYear === simulatedNow.getFullYear() && currentCalMonth === simulatedNow.getMonth()) {
            prevBtn.setAttribute('disabled', 'true');
        } else {
            prevBtn.removeAttribute('disabled');
        }

        const maxBookingLimitDate = new Date(simulatedNow.getTime());
        maxBookingLimitDate.setDate(maxBookingLimitDate.getDate() + 60);

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

            if (inspectingDate.getDay() === 0 || dbData.holidays.includes(dateISOStr)) {
                dayNode.classList.add('closed');
                dayNode.title = "Clinic Closed";
            }
            else if (inspectingDate.setHours(0,0,0,0) < new Date(simulatedNow.getTime()).setHours(0,0,0,0) || inspectingDate > maxBookingLimitDate) {
                dayNode.classList.add('past');
            }
            else {
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

        operatingHours.forEach(hour => {
            const time24 = `${String(hour).padStart(2, '0')}:00`;
            const displayTime = hour === 12 ? "12:00 PM" : hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`;

            const slotDiv = document.createElement('div');
            slotDiv.className = "timesheet-slot-row";
            
            const nameSpan = document.createElement('span');
            nameSpan.className = "slot-time-label";
            nameSpan.textContent = displayTime;
            slotDiv.appendChild(nameSpan);

            const statusSpan = document.createElement('span');
            statusSpan.className = "slot-status-badge";
            slotDiv.appendChild(statusSpan);

            const slotDateTimeObj = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), hour, 0);
            const hoursDifferenceFromNow = (slotDateTimeObj - simulatedNow) / (1000 * 60 * 60);

            let isPast = false;
            let isBooked = false;
            let isConflict = false;

            if (slotDateTimeObj < simulatedNow) {
                isPast = true;
            }
            else if (hoursDifferenceFromNow >= 0 && hoursDifferenceFromNow < 2) {
                isPast = true; 
            }
            else if (dayBookings.includes(time24)) {
                isBooked = true;
            }
            else {
                for (let step = 0; step < serviceDuration; step++) {
                    const evaluationHour = hour + step;
                    const evaluationTime24 = `${String(evaluationHour).padStart(2, '0')}:00`;

                    if (evaluationHour >= 18 || dayBookings.includes(evaluationTime24)) {
                        isConflict = true;
                        break;
                    }
                }
            }

            if (isPast) {
                slotDiv.classList.add('state-past');
                statusSpan.textContent = "Past";
            } else if (isBooked) {
                slotDiv.classList.add('state-booked');
                statusSpan.textContent = "Booked";
            } else if (isConflict) {
                slotDiv.classList.add('state-booked');
                statusSpan.textContent = "Unavailable";
            } else {
                slotDiv.classList.add('state-available');
                slotDiv.addEventListener('click', () => {
                    document.querySelectorAll('.timesheet-slot-row').forEach(s => s.classList.remove('state-selected'));
                    slotDiv.classList.add('state-selected');
                    statusSpan.textContent = "Selected";
                    
                    document.querySelectorAll('.timesheet-slot-row.state-available').forEach(s => {
                        if (s !== slotDiv) s.querySelector('.slot-status-badge').textContent = "";
                    });

                    selectedTimeSlot = time24;
                    document.getElementById('goToStep3').removeAttribute('disabled');
                });
            }
            slotsContainer.appendChild(slotDiv);
        });
    }
});