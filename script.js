/**
 * Amalmon KH - Interactive Portfolio Script
 * 
 * Includes:
 * 1. Double-element cursor (dot + ring) with linear interpolation trailing.
 * 2. Click ripple generator.
 * 3. Interactive background canvas grid with gravitational particle nodes
 *    and spotlight lighting.
 * 4. Magnetic button spring attraction.
 * 5. Card 3D tilts and hover reflections.
 * 6. Responsive fallbacks for touch-enabled devices.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // Accessibility check: user motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Check if device supports touch to gracefully disable mouse cursor effects
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    // --- Smooth Scroll (Lenis) ---
    let lenis;
    if (!prefersReducedMotion && typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
            smoothWheel: true,
            smoothTouch: false,
        });

        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);
    }



    // --- PDF Resume Print Trigger ---
    const navPrintBtn = document.getElementById('btn-nav-print');
    if (navPrintBtn) {
        navPrintBtn.addEventListener('click', () => {
            window.print();
        });
    }

    // Coordinates for global mouse position
    let mouse = { x: -1000, y: -1000 };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = -1000;
        mouse.y = -1000;
    });

    // --- Click Ripple Animation ---
    if (!isTouchDevice && !prefersReducedMotion) {
        window.addEventListener('click', (e) => {
            const ripple = document.createElement('div');
            ripple.className = 'click-ripple';
            ripple.style.left = `${e.clientX}px`;
            ripple.style.top = `${e.clientY}px`;
            document.body.appendChild(ripple);

            ripple.addEventListener('animationend', () => {
                ripple.remove();
            });
        });
    }

    // --- Interactive Canvas Background ---
    const canvas = document.getElementById('bg-canvas');
    if (canvas && !prefersReducedMotion) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationFrameId;

        // Resize Canvas to fill viewport
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        }

        // Particle Node Class
        class Particle {
            constructor() {
                // Initial baseline home position
                this.homeX = Math.random() * canvas.width;
                this.homeY = Math.random() * canvas.height;
                this.x = this.homeX;
                this.y = this.homeY;
                
                // Slow idle speed and direction
                this.vx = (Math.random() - 0.5) * 0.25;
                this.vy = (Math.random() - 0.5) * 0.25;
                this.radius = Math.random() * 2 + 1;
                this.angle = Math.random() * Math.PI * 2;
                this.brightness = 0.4;
            }

            update() {
                // Subtle slow idle drift (moves home position slowly)
                this.angle += 0.003;
                this.homeX += Math.cos(this.angle) * 0.12;
                this.homeY += Math.sin(this.angle) * 0.12;

                // Restrict home position inside canvas borders
                if (this.homeX < 0 || this.homeX > canvas.width) this.homeX = Math.random() * canvas.width;
                if (this.homeY < 0 || this.homeY > canvas.height) this.homeY = Math.random() * canvas.height;

                // Mouse interaction - check attraction distance
                if (mouse.x !== -1000) {
                    const dx = mouse.x - this.homeX;
                    const dy = mouse.y - this.homeY;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const attractionRadius = 180;

                    if (dist < attractionRadius) {
                        // Node gets pulled closer to the cursor
                        const pullForce = (attractionRadius - dist) / attractionRadius;
                        
                        // Target position scales with distance to cursor
                        const targetX = this.homeX + (mouse.x - this.homeX) * 0.18 * pullForce;
                        const targetY = this.homeY + (mouse.y - this.homeY) * 0.18 * pullForce;
                        
                        // Eased interpolation toward target
                        this.x += (targetX - this.x) * 0.12;
                        this.y += (targetY - this.y) * 0.12;
                        
                        // Increase brightness
                        this.brightness = 0.4 + 0.6 * pullForce;
                    } else {
                        // Smoothly ease back to home position
                        this.x += (this.homeX - this.x) * 0.08;
                        this.y += (this.homeY - this.y) * 0.08;
                        this.brightness = 0.4;
                    }
                } else {
                    // Smoothly ease back to home position if mouse leaves screen
                    this.x += (this.homeX - this.x) * 0.08;
                    this.y += (this.homeY - this.y) * 0.08;
                    this.brightness = 0.4;
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(96, 165, 250, ${this.brightness})`;
                ctx.fill();
            }
        }

        // Initialize particles count based on screen width
        function initParticles() {
            particles = [];
            const count = window.innerWidth < 768 ? 20 : 60;
            for (let i = 0; i < count; i++) {
                particles.push(new Particle());
            }
        }

        // Render Canvas
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw Background Blueprint Grid
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.012)';
            ctx.lineWidth = 1;
            const gridSize = 80;
            for (let x = 0; x < canvas.width; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            for (let y = 0; y < canvas.height; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            // Draw Spotlight/Lighting (Hero spotlight)
            if (mouse.x !== -1000) {
                let grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 240);
                grad.addColorStop(0, 'rgba(96, 165, 250, 0.05)');
                grad.addColorStop(0.5, 'rgba(34, 211, 238, 0.015)');
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            // Update & Draw Nodes
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
            }

            // Neural Connections: Draw line to cursor and lines between close nodes
            ctx.lineWidth = 0.8;
            for (let i = 0; i < particles.length; i++) {
                // 1. Connection line to the cursor if within radius
                if (mouse.x !== -1000) {
                    const dxMouse = particles[i].x - mouse.x;
                    const dyMouse = particles[i].y - mouse.y;
                    const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
                    const attractionRadius = 180;

                    if (distMouse < attractionRadius) {
                        const lineOpacity = (1 - (distMouse / attractionRadius)) * 0.16;
                        ctx.strokeStyle = `rgba(96, 165, 250, ${lineOpacity})`;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.stroke();
                    }
                }

                // 2. Connection lines between close nodes
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const connectionDist = 120;

                    if (dist < connectionDist) {
                        const opacity = (1 - (dist / connectionDist)) * 0.08;
                        ctx.strokeStyle = `rgba(34, 211, 238, ${opacity})`;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            animationFrameId = requestAnimationFrame(animate);
        }

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        animate();
    }

    // --- Background Orbs Animation (Parallax & Mouse Follow) ---
    const orb1 = document.getElementById('orb-1');
    const orb2 = document.getElementById('orb-2');
    
    if (orb1 && orb2 && !prefersReducedMotion && typeof gsap !== 'undefined') {
        // Slow random drifting for Orb 1
        gsap.to(orb1, {
            x: 'random(-150, 150)',
            y: 'random(-150, 150)',
            duration: 12,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });

        // Mouse follow lag for Orb 2 to create depth
        window.addEventListener('mousemove', (e) => {
            const xVal = e.clientX - window.innerWidth / 2;
            const yVal = e.clientY - window.innerHeight / 2;
            gsap.to(orb2, {
                x: xVal * 0.4,
                y: yVal * 0.4,
                duration: 2.0,
                ease: "power2.out"
            });
        });
    }

    // --- Custom Cursor Elements & Trails (Desktop/Mouse Only) ---
    const cursorDot = document.getElementById('cursor-dot');
    const cursorRing = document.getElementById('cursor-ring');
    const cursorCanvas = document.getElementById('cursor-canvas');

    const isDesktop = !isTouchDevice && window.innerWidth >= 768;

    if (cursorDot && cursorRing && cursorCanvas && isDesktop && !prefersReducedMotion) {
        const ctx = cursorCanvas.getContext('2d');
        
        let pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        let dotCoords = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        let ringCoords = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        let cursorVisible = false;

        // Trail point settings
        const pointsCount = 20;
        const points = [];
        for (let i = 0; i < pointsCount; i++) {
            points.push({ x: pointer.x, y: pointer.y });
        }

        // Setup High-DPI canvas
        function resizeCanvas() {
            const dpr = window.devicePixelRatio || 1;
            cursorCanvas.width = window.innerWidth * dpr;
            cursorCanvas.height = window.innerHeight * dpr;
            ctx.scale(dpr, dpr);
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        window.addEventListener('mousemove', (e) => {
            const wasHidden = !cursorVisible;
            pointer.x = e.clientX;
            pointer.y = e.clientY;
            cursorVisible = true;
            
            if (wasHidden) {
                // Instantly snap trail points to current position to avoid streaks from edge
                for (let i = 0; i < pointsCount; i++) {
                    points[i].x = pointer.x;
                    points[i].y = pointer.y;
                }
                dotCoords.x = pointer.x;
                dotCoords.y = pointer.y;
                ringCoords.x = pointer.x;
                ringCoords.y = pointer.y;
            }

            cursorDot.style.opacity = '1';
            cursorRing.style.opacity = '1';
            cursorCanvas.style.opacity = '1';
        });

        window.addEventListener('mouseleave', () => {
            cursorVisible = false;
            cursorDot.style.opacity = '0';
            cursorRing.style.opacity = '0';
            cursorCanvas.style.opacity = '0';
        });

        // Loop calculating independent trailing interpolation
        function updateCursorPositions() {
            // Skip execution if screen resized to mobile
            if (window.innerWidth < 768) {
                ctx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
                requestAnimationFrame(updateCursorPositions);
                return;
            }

            // 1. Interpolate DOM Dot
            dotCoords.x += (pointer.x - dotCoords.x) * 0.22;
            dotCoords.y += (pointer.y - dotCoords.y) * 0.22;

            // 2. Interpolate DOM Ring
            ringCoords.x += (pointer.x - ringCoords.x) * 0.12;
            ringCoords.y += (pointer.y - ringCoords.y) * 0.12;

            cursorDot.style.left = `${dotCoords.x}px`;
            cursorDot.style.top = `${dotCoords.y}px`;

            cursorRing.style.left = `${ringCoords.x}px`;
            cursorRing.style.top = `${ringCoords.y}px`;

            // 3. Update canvas trail coordinates (spring/lerp follow)
            if (cursorVisible) {
                points[0].x = pointer.x;
                points[0].y = pointer.y;
            }
            
            for (let i = 1; i < pointsCount; i++) {
                points[i].x += (points[i - 1].x - points[i].x) * 0.28;
                points[i].y += (points[i - 1].y - points[i].y) * 0.28;
            }

            // 4. Render trailing ribbon on canvas
            ctx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
            
            const isHovering = cursorDot.classList.contains('hovering-btn') || 
                               cursorDot.classList.contains('hovering-card') || 
                               cursorDot.classList.contains('hovering-cert');

            ctx.globalCompositeOperation = 'screen';

            // Draw tapered neon segments
            for (let i = 0; i < pointsCount - 1; i++) {
                const p1 = points[i];
                const p2 = points[i + 1];
                const ratio = i / (pointsCount - 1); // 0 at head, 1 at tail
                
                // If points collapsed, don't draw
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) continue;

                // Taper width and fade opacity
                const glowWidth = (isHovering ? 18 : 10) * (1 - ratio);
                const opacity = (1 - ratio) * 0.45;

                // Interpolate color from neon blue (head) to neon purple (tail)
                // Head (Blue): rgb(56, 189, 248) -> Tail (Purple): rgb(168, 85, 247)
                const r = Math.round(56 + (168 - 56) * ratio);
                const g = Math.round(189 + (85 - 189) * ratio);
                const b = Math.round(248 + (247 - 248) * ratio);

                // Draw broad outer glow path
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                
                ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
                ctx.lineWidth = glowWidth;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.stroke();

                // Draw thin inner white core
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);

                const coreWidth = (isHovering ? 5 : 2.5) * (1 - ratio);
                ctx.strokeStyle = `rgba(240, 249, 255, ${opacity * 1.5})`;
                ctx.lineWidth = coreWidth;
                ctx.stroke();
            }

            requestAnimationFrame(updateCursorPositions);
        }
        updateCursorPositions();

        // Bind interactive cursor hover transformations
        
        // 1. Buttons (Primary / Secondary / Navigation / Contact)
        const buttons = document.querySelectorAll('a, button, .contact-btn');
        buttons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                cursorRing.classList.add('hovering-btn');
                cursorDot.classList.add('hovering-btn');
            });
            btn.addEventListener('mouseleave', () => {
                cursorRing.classList.remove('hovering-btn');
                cursorDot.classList.remove('hovering-btn');
            });
        });

        // 2. Project Cards
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                cursorRing.classList.add('hovering-card');
                cursorDot.classList.add('hovering-card');
            });
            card.addEventListener('mouseleave', () => {
                cursorRing.classList.remove('hovering-card');
                cursorDot.classList.remove('hovering-card');
            });
        });

        // 3. Skill Chips
        const tags = document.querySelectorAll('.tag');
        tags.forEach(tag => {
            tag.addEventListener('mouseenter', () => {
                cursorRing.classList.add('hovering-tag');
            });
            tag.addEventListener('mouseleave', () => {
                cursorRing.classList.remove('hovering-tag');
            });
        });

        // 4. Certificates
        const certCards = document.querySelectorAll('.cert-card');
        certCards.forEach(cert => {
            cert.addEventListener('mouseenter', () => {
                cursorRing.classList.add('hovering-cert');
                cursorDot.classList.add('hovering-cert');
            });
            cert.addEventListener('mouseleave', () => {
                cursorRing.classList.remove('hovering-cert');
                cursorDot.classList.remove('hovering-cert');
            });
        });
    }

    // --- Magnetic Hover Pull Action (Buttons only) ---
    const magneticElements = document.querySelectorAll('.btn, .contact-btn, #btn-nav-print');
    if (magneticElements.length > 0 && !isTouchDevice && !prefersReducedMotion && typeof gsap !== 'undefined') {
        magneticElements.forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const relX = e.clientX - rect.left - rect.width / 2;
                const relY = e.clientY - rect.top - rect.height / 2;
                
                gsap.to(el, {
                    x: relX * 0.35,
                    y: relY * 0.35,
                    scale: 1.04,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });

            el.addEventListener('mouseleave', () => {
                gsap.to(el, {
                    x: 0,
                    y: 0,
                    scale: 1,
                    duration: 0.6,
                    ease: "elastic.out(1.1, 0.4)"
                });
            });
        });
    }

    // --- 3D Card Tilt & Spotlight Sweeps (Projects & Certificates) ---
    const tiltCards = document.querySelectorAll('.project-card, .cert-card');
    if (tiltCards.length > 0 && !isTouchDevice && !prefersReducedMotion && typeof gsap !== 'undefined') {
        tiltCards.forEach(card => {
            // Inject card-glow-overlay dynamically if not present
            if (!card.querySelector('.card-glow-overlay')) {
                const glow = document.createElement('div');
                glow.className = 'card-glow-overlay';
                card.appendChild(glow);
            }

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left; // mouse position x in card
                const y = e.clientY - rect.top;  // mouse position y in card
                const w = rect.width;
                const h = rect.height;

                // Rotation calculation relative to card center
                const rotateY = -((x - w/2) / w) * 12;
                const rotateX = ((y - h/2) / h) * 12;

                gsap.to(card, {
                    transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`,
                    duration: 0.3,
                    ease: "power2.out",
                    overwrite: "auto"
                });

                // Render dynamic radial backlighting spotlight
                const glow = card.querySelector('.card-glow-overlay');
                if (glow) {
                    const percentX = (x / w) * 100;
                    const percentY = (y / h) * 100;
                    glow.style.background = `radial-gradient(circle at ${percentX}% ${percentY}%, rgba(96, 165, 250, 0.15) 0%, transparent 60%)`;
                    glow.style.opacity = '1';
                }
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)',
                    duration: 0.6,
                    ease: "power3.out",
                    overwrite: "auto"
                });
                const glow = card.querySelector('.card-glow-overlay');
                if (glow) {
                    glow.style.opacity = '0';
                }
            });
        });
    }

    // --- Skills Stagger delay tag property injection ---
    const tags = document.querySelectorAll('.tag');
    tags.forEach((tag, index) => {
        tag.style.setProperty('--i', index);
    });

    // --- Scroll Navbar Blur & Shadow effect ---
    const navbar = document.getElementById('main-nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 30) {
            navbar.style.boxShadow = '0 15px 40px -10px rgba(0, 0, 0, 0.6)';
            navbar.style.backgroundColor = 'rgba(5, 8, 22, 0.85)';
        } else {
            navbar.style.boxShadow = 'none';
            navbar.style.backgroundColor = 'rgba(5, 8, 22, 0.75)';
        }
    });

    // --- Scroll Progress Indicator ---
    const scrollProgressBar = document.getElementById('scroll-progress-bar');
    if (scrollProgressBar) {
        window.addEventListener('scroll', () => {
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            if (scrollHeight > 0) {
                const scrollFraction = window.scrollY / scrollHeight;
                scrollProgressBar.style.transform = `scaleX(${scrollFraction})`;
            } else {
                scrollProgressBar.style.transform = 'scaleX(0)';
            }
        });
    }

    // --- Scroll Active Navmenu Highlights ---
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    const updateActiveNavLink = () => {
        let scrollPosition = window.scrollY + window.innerHeight / 3;
        let currentSectionId = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        if (currentSectionId) {
            navLinks.forEach(link => {
                const href = link.getAttribute('href').substring(1);
                if (href === currentSectionId) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }
    };

    window.addEventListener('scroll', updateActiveNavLink);
    updateActiveNavLink(); // Execute on initial load

    // --- Smooth Scroll on Nav Link Clicks via Lenis ---
    if (typeof lenis !== 'undefined' && lenis && !prefersReducedMotion) {
        const navMenuLinks = document.querySelectorAll('.nav-link, .nav-logo, .hero-actions a');
        navMenuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href');
                if (targetId && targetId.startsWith('#')) {
                    e.preventDefault();
                    lenis.scrollTo(targetId, {
                        duration: 1.2,
                        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
                    });
                }
            });
        });
    }

    // --- Hero Section Intro Animations ---
    if (!prefersReducedMotion && typeof gsap !== 'undefined') {
        const introTl = gsap.timeline({ defaults: { ease: "power4.out" } });

        // Reset elements that we want to reveal to override default style states
        gsap.set('.reveal-name', { animation: 'none', opacity: 0, y: 40 });
        gsap.set('.hero-profile-img', { opacity: 0, scale: 0.8 });
        gsap.set('.hero-tagline', { opacity: 0, y: 15 });
        gsap.set('.hero-title', { opacity: 0, y: 20 });
        gsap.set('.hero-lead', { opacity: 0, y: 20 });
        gsap.set('.hero-meta .meta-item', { opacity: 0, y: 15 });
        gsap.set('.hero-actions .btn', { opacity: 0, y: 15 });

        introTl.to('.hero-profile-img', 
            { scale: 1, opacity: 1, duration: 1.2 }
        );

        introTl.to('.hero-tagline', 
            { letterSpacing: '0.2em', opacity: 1, y: 0, duration: 0.8 }, 
            "-=0.8"
        );

        introTl.to('.reveal-name', 
            { y: 0, opacity: 1, duration: 1.0, stagger: 0.15 }, 
            "-=0.6"
        );

        introTl.to('.hero-title', 
            { y: 0, opacity: 1, duration: 0.8 }, 
            "-=0.7"
        );

        introTl.to('.hero-lead', 
            { y: 0, opacity: 1, duration: 0.8 }, 
            "-=0.6"
        );

        introTl.to('.hero-meta .meta-item', 
            { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 }, 
            "-=0.5"
        );

        introTl.to('.hero-actions .btn', 
            { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 }, 
            "-=0.4"
        );
    }

    // --- Scroll Content Reveal with GSAP ScrollTrigger ---
    if (!prefersReducedMotion && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        const revealElements = document.querySelectorAll('.scroll-reveal');
        
        revealElements.forEach((section) => {
            // Animate the section itself
            gsap.fromTo(section, 
                { opacity: 0, y: 50 }, 
                {
                    opacity: 1,
                    y: 0,
                    duration: 1.0,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: section,
                        start: "top 88%",
                        toggleActions: "play none none none"
                    }
                }
            );

            // Stagger animates internal elements if they exist
            
            // 1. Skill Chips Category Rows
            const skillCategories = section.querySelectorAll('.skills-category');
            if (skillCategories.length > 0) {
                gsap.fromTo(skillCategories,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        stagger: 0.15,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: section.querySelector('.skills-grid') || section,
                            start: "top 85%"
                        }
                    }
                );
            }

            // 2. Project Cards
            const projectCards = section.querySelectorAll('.project-card');
            if (projectCards.length > 0) {
                gsap.fromTo(projectCards,
                    { opacity: 0, y: 45, scale: 0.96 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 1.0,
                        stagger: 0.2,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: section.querySelector('.projects-grid') || section,
                            start: "top 85%"
                        }
                    }
                );
            }

            // 3. Certification Cards
            const certCards = section.querySelectorAll('.cert-card');
            if (certCards.length > 0) {
                gsap.fromTo(certCards,
                    { opacity: 0, y: 45, scale: 0.96 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 1.0,
                        stagger: 0.15,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: section.querySelector('.certifications-grid') || section,
                            start: "top 85%"
                        }
                    }
                );
            }

            // 4. Timeline Items
            const timelineItems = section.querySelectorAll('.timeline-item');
            if (timelineItems.length > 0) {
                gsap.fromTo(timelineItems,
                    { opacity: 0, x: -30 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.8,
                        stagger: 0.2,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: section,
                            start: "top 80%"
                        }
                    }
                );
            }

            // 5. Section titles with clip-path slide-up reveal
            const title = section.querySelector('.section-title');
            if (title) {
                gsap.fromTo(title,
                    { clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0% 100%)", y: 15 },
                    {
                        clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)",
                        y: 0,
                        duration: 1.0,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: section,
                            start: "top 88%"
                        }
                    }
                );
            }
        });
    } else {
        // Fallback: immediately show elements if motion-free preference or observer is missing
        const revealElements = document.querySelectorAll('.scroll-reveal');
        revealElements.forEach(el => el.classList.add('revealed'));
    }
});
