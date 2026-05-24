<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ichiban Dental Clinic</title>

        <link rel="stylesheet" href="css/main.css">
        <link rel="stylesheet" href="css/bookAppointmentStyle.css">
        <link rel="stylesheet" href="css/authStyle.css">
    </head>
    <body>
        <header>
            <div class="logo-container">
                <img class="blue-logo" src="assets/images/BlueLogo.png" alt="Teeth logo">
                <p class="clinic-name">Ichiban Dental Clinic</p>
            </div>
            <nav>
                <a href="index.html">Home</a>
                <a href="about.html">About</a>
                <a href="services.html">Services</a>
                <a href="contact.html">Contact</a>
                <a class="book-btn" href="bookAppointment.php">Book Appointment</a>
            </nav>
            
            <div class="profile-menu-container">
                <div id="headerProfile" class="profile-avatar guest" onclick="openFullscreenMenu()">
                    <img class="profile" src="assets/images/GuestProfile.svg" alt="Guest Profile">
                </div>
            </div>

            <!-- Hamburger button (mobile only) -->
            <button class="hamburger-btn" onclick="openFullscreenMenu()" aria-label="Open menu">
                <span class="bar"></span>
                <span class="bar"></span>
                <span class="bar"></span>
            </button>
        </header>

        <div class="fullscreen-menu-overlay" id="fullscreenMenu" onclick="closeFullscreenMenu()">
            
            <div class="overlay-panel-card" onclick="event.stopPropagation()">
                
                <div class="overlay-brand-header">
                    <div class="overlay-logo-frame">
                        <img src="assets/images/BlueLogo.png" alt="White Teeth Logo">
                    </div>
                    <div class="overlay-title-block">
                        <h2>Ichiban</h2>
                        <p>Dental Clinic</p>
                    </div>
                    <button class="close-panel-btn" onclick="closeFullscreenMenu()">&times;</button>
                </div>
                
                <div class="overlay-profile-section">
                    <div class="overlay-user-card">
                        <div id="overlayAvatar" class="overlay-avatar-circle guest">
                            <img src="assets/images/GuestProfile.svg" alt="User Profile Picture">
                        </div>
                        <div class="overlay-user-info">
                            <h3>Guest</h3>
                            <p>Not signed in</p>
                        </div>
                    </div>
                </div>
                
                <nav class="overlay-navigation-stack" aria-label="Full screen navigation">
                    <a class="overlay-nav-link active" href="index.html">
                        <svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                        Home
                    </a>
                    <a class="overlay-nav-link" href="about.html">
                        <svg viewBox="0 0 24 24"><path d="M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-11h2V7h-2v2z"/></svg>
                        About
                    </a>
                    <a class="overlay-nav-link" href="services.html">
                        <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
                        Services
                    </a>
                    <a class="overlay-nav-link" href="contact.html">
                        <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                        Contact
                    </a>
                    
                    <a class="overlay-book-cta" href="bookAppointment.php">
                        <svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>
                        Book Appointment
                    </a>

                    <hr class="overlay-menu-divider">

                    <a class="overlay-login-action" href="javascript:void(0)" onclick="openAuthModal('login');">
                        <svg viewBox="0 0 24 24"><path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z"/></svg>
                        Log In
                    </a>
                    <a class="overlay-logout-action" href="javascript:void(0)" onclick="closeFullscreenMenu(); window.doLogout();">
                        <svg viewBox="0 0 24 24"><path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v11H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>
                        Log Out
                    </a>
                </nav>
            </div>
        </div>

        <main class="appointment-page-container">
        
            <section class="appointment-intro-group">
                <h1 class="appointment-main-title ">Get an <span class="title-emphasis">Appointment</span></h1>
                <p class="appointment-subtitle">
                    Discover modern dental care delivered with comfort in mind. At Ichiban Dental, we're here to meet all your oral health needs. Please complete the appointment form below, and a representative will contact you shortly.
                </p>
            </section>

            <div class="appointment-form-card-frame">
                <div class="patient-type-grid">
                    <div class="patient-type-card first-visit-card" id="newPatientCard">
                        <span class="patient-badge first-visit-badge">FIRST VISIT</span>
                        <h3>New Patient</h3>
                        <p>Book a consultation - our dentist will examine you and build your treatment plan.</p>
                    </div>

                    <div class="patient-type-card returning-visit-card" id="returningPatientCard">
                        <span class="patient-badge returning-badge">RETURNING</span>
                        <h3>Returning Patient</h3>
                        <p>Already been consulted? Book your scheduled service directly.</p>
                    </div>
                </div>

                <div class="patient-flow-actions">
                    <button type="button" class="patient-continue-btn">Continue</button>
                </div>

                <div class="middle-form-content-placeholder"></div>
            </div>

            <div class="appointment-contact-container">
                <h2 class="footer-section-heading">CONTACT INFORMATION</h2>
                <div class="footer-info-column-layout">
                    <div class="footer-info-leaf">
                        <div class="footer-icon-square">
                            <svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                        </div>
                        <div class="footer-leaf-text">
                            <label>PHONE</label>
                            <p>+63 995 181 1137</p>
                        </div>
                    </div>

                    <div class="footer-info-leaf">
                        <div class="footer-icon-square">
                            <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                        </div>
                        <div class="footer-leaf-text">
                            <label>EMAIL</label>
                            <p>ichibandentalclinic@gmail.com</p>
                        </div>
                    </div>

                    <div class="footer-info-leaf">
                        <div class="footer-icon-square">
                            <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                        </div>
                        <div class="footer-leaf-text">
                            <label>ADDRESS</label>
                            <p>55 G. Marcelo, Valenzuela, 1444 Metro Manila</p>
                        </div>
                    </div>
                </div>
            </div>

        </main>

        <footer>
            <div class="base-1">
                <div class="foot-logo">
                    <img src="./assets/images/WhiteLogo.png" alt="Ichiban Dental Clinic Logo">
                    <p>Ichiban Dental Clinic</p>
                </div>
                <p class="tagline">Transforming Lives, One Smile at a Time.</p>
            </div>

            <div class="base-2">
                <h3>QUICK LINKS</h3>
                <ul>
                    <li><a href="index.html">Home</a></li>
                    <li><a href="about.html">About</a></li>
                    <li><a href="services.html">Services</a></li>
                    <li><a href="contact.html">Contact</a></li>
                </ul>
            </div>

            <div class="base-3">
                <h3>OUR SERVICES</h3>
                <ul>
                    <li><a href="services.html#preventive">Preventive Care</a></li>
                    <li><a href="services.html#cosmetic">Cosmetic Dentistry</a></li>
                    <li><a href="services.html#restorative">Restorative Dentistry</a></li>
                    <li><a href="services.html#pediatric">Pediatric & Family</a></li>
                    <li><a href="services.html#orthodontics">Orthodontics</a></li>
                    <li><a href="services.html#oral-surgery">Oral Surgery</a></li>
                </ul>
            </div>

            <div class="base-4">
                <h3>CONTACT US</h3>
                <div class="contact-info">
                    <div class="contact-item">
                        <div class="contact-icon">
                            <i class="fas fa-map-marker-alt">
                                <div class="icon-wrapper">
                                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="map-marker-container">
                                        <path class="map-marker-path"
                                            d="M 50 15 
                                            A 25 25 0 0 0 25 40
                                            C 25 55, 50 85, 50 85
                                            C 50 85, 75 55, 75 40
                                            A 25 25 0 0 0 50 15 Z
                                            M 50 30
                                            A 10 10 0 1 1 50 50
                                            A 10 10 0 0 1 50 30 Z"
                                            fill="none" 
                                            stroke-width="5"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                        />
                                    </svg>
                                </div>
                            </i>
                        </div>
                        <div class="contact-text">
                            <span class="label">ADDRESS</span>
                            <p>55 G. Marcelo, Valenzuela, 1444 Metro Manila</p>
                        </div>
                    </div>
                    <div class="contact-item">
                        <div class="contact-icon">
                            <i class="fas fa-phone-alt">
                                <div class="icon-wrapper">
                                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="phone-icon-container">
                                        <path class="phone-icon-path"
                                            d="M 28 25 
                                            C 32 21, 40 24, 43 29
                                            L 46 35
                                            C 49 40, 44 46, 40 49
                                            C 45 57, 52 64, 60 68
                                            C 63 64, 69 60, 74 62
                                            L 81 65
                                            C 86 67, 88 75, 84 80
                                            C 78 88, 65 89, 52 82
                                            C 35 73, 21 57, 15 41
                                            C 10 29, 18 19, 28 25 Z"
                                            fill="none" 
                                            stroke-width="5"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                        />
                                    </svg>
                                </div>
                            </i>
                        </div>
                        <div class="contact-text">
                            <span class="label">PHONE</span>
                            <p>+63 995 181 1137</p>
                        </div>
                    </div>
                    <div class="contact-item">
                        <div class="contact-icon">
                            <i class="fas fa-envelope">
                                <div class="icon-wrapper">
                                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="email-icon-container">
                                        <rect class="email-icon-path" x="18" y="25" width="70" height="55" rx="8" fill="none" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
                                        <path class="email-icon-path" d="
                                            M 20 28 
                                            L 50 53 
                                            L 80 28 
                                            M 20 72 
                                            L 42 50 
                                            M 80 72 
                                            L 58 50" 
                                            fill="none" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>

                                </div>
                            </i>
                        </div>
                        <div class="contact-text">
                            <span class="label">EMAIL</span>
                            <p>ichibandentalclinic@gmail.com</p>
                        </div>
                    </div>
                    <div class="contact-item">
                        <div class="contact-icon">
                            <i class="fas fa-clock">
                                <div class="icon-wrapper">
                                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="clock-icon-container">
                                        <circle class="clock-icon-path" cx="50" cy="50" r="35" fill="none" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
                                        <path class="clock-icon-path" d="M 50 28 L 50 50 L 65 58" fill="none" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </div>
                            </i>
                        </div>
                        <div class="contact-text">
                            <span class="label">CLINIC HOURS</span>
                            <p>Mon-Fri: 8am - 6pm<br>Saturday: 9am - 4pm<br>Sunday: Closed</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="base-5">
                <p>&copy; 2026 www.ichibandental.site</p>
                <p>All rights reserved.</p>
            </div>
        </footer>

        <script src="javascript/functionality.js"></script>
        <script src="javascript/bookAppointmentFunction.js"></script>
        <script src="javascript/auth.js"></script>
    </body>

    
</html>