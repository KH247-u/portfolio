/**
 * AMALMON K H - Interactive Portfolio Script
 * Dynamic Canvas background, custom glow cursor trail, 3D card tilt physics, 
 * scroll reveals, scroll progress indicators, and active link tracking.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // Check user preference for motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- Dynamic Canonical URL Generation ---
    const canonicalLink = document.getElementById('canonical-link');
    if (canonicalLink) {
        const cleanUrl = window.location.origin + window.location.pathname;
        canonicalLink.setAttribute('href', cleanUrl);
    }

    // --- Navigation PDF Export / Print Triggers ---
    const navPrintBtn = document.getElementById('btn-nav-print');
    if (navPrintBtn) {
        navPrintBtn.addEventListener('click', () => {
            window.print();
        });
    }

    // --- Interactive Canvas Background ---
    const canvas = document.getElementById('bg-canvas');
    if (canvas && !prefersReducedMotion) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationFrameId;
        
        // Mouse coordinates for canvas interaction
        let canvasMouse = { x: -1000, y: -1000 };
        window.addEventListener('mousemove', (e) => {
            canvasMouse.x = e.clientX;
            canvasMouse.y = e.clientY;
        });
        window.addEventListener('mouseleave', () => {
            canvasMouse.x = -1000;
            canvasMouse.y = -1000;
        });

        // Resize Canvas to fit screen
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        }

        // Particle Class
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.radius = Math.random() * 2 + 1;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off boundaries
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

                // Mouse interaction - push particles away slightly
                if (canvasMouse.x !== -1000) {
                    const dx = this.x - canvasMouse.x;
                    const dy = this.y - canvasMouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const forceRadius = 150;
                    
                    if (dist < forceRadius) {
                        const force = (forceRadius - dist) / forceRadius;
                        const directionX = dx / dist;
                        const directionY = dy / dist;
                        this.x += directionX * force * 1.5;
                        this.y += directionY * force * 1.5;
                    }
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(96, 165, 250, 0.45)';
                ctx.fill();
            }
        }

        // Initialize particles count based on screen size
        function initParticles() {
            particles = [];
            const count = window.innerWidth < 768 ? 25 : 65;
            for (let i = 0; i < count; i++) {
                particles.push(new Particle());
            }
        }

        // Animation Loop
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw background grid lines (Linear/Blueprint effect)
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
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

            // Update & Draw Particles
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
            }

            // Connect close particles with neural lines
            ctx.lineWidth = 0.8;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const connectionDist = 130;

                    if (dist < connectionDist) {
                        const opacity = (1 - (dist / connectionDist)) * 0.12;
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

    // --- Custom Cursor Glow Trail (Desktop Only) ---
    const cursorGlow = document.getElementById('cursor-glow');
    if (cursorGlow && !prefersReducedMotion && window.innerWidth > 768) {
        let pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        let current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        
        window.addEventListener('mousemove', (e) => {
            pointer.x = e.clientX;
            pointer.y = e.clientY;
            cursorGlow.style.opacity = '1';
        });

        window.addEventListener('mouseleave', () => {
            cursorGlow.style.opacity = '0';
        });

        // Smooth Linear Interpolation (lerp) loop for cursor trail
        function updateCursor() {
            current.x += (pointer.x - current.x) * 0.08;
            current.y += (pointer.y - current.y) * 0.08;
            
            cursorGlow.style.left = `${current.x}px`;
            cursorGlow.style.top = `${current.y}px`;
            
            requestAnimationFrame(updateCursor);
        }
        updateCursor();

        // Custom Magnetic Scale Action for Links, Buttons, and Cards
        const hoverables = document.querySelectorAll('a, button, .tag, .project-card, .cert-card');
        hoverables.forEach(item => {
            item.addEventListener('mouseenter', () => {
                cursorGlow.style.width = '480px';
                cursorGlow.style.height = '480px';
                cursorGlow.style.background = 'radial-gradient(circle, rgba(96, 165, 250, 0.11) 0%, rgba(34, 211, 238, 0.04) 45%, transparent 70%)';
            });
            item.addEventListener('mouseleave', () => {
                cursorGlow.style.width = '350px';
                cursorGlow.style.height = '350px';
                cursorGlow.style.background = 'radial-gradient(circle, rgba(96, 165, 250, 0.08) 0%, rgba(34, 211, 238, 0.03) 45%, transparent 70%)';
            });
        });
    }

    // --- 3D Tilt Interaction for Project and Certificate Cards ---
    const tiltCards = document.querySelectorAll('.project-card, .cert-card');
    if (tiltCards.length > 0 && !prefersReducedMotion && window.innerWidth > 768) {
        tiltCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left; // mouse x within element
                const y = e.clientY - rect.top;  // mouse y within element
                
                const w = rect.width;
                const h = rect.height;
                
                // Calculate rotation values based on offset from center
                const rotateY = -((x - w/2) / w) * 12; 
                const rotateX = ((y - h/2) / h) * 12;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
                
                // Reflection sweep tracking if glow exists
                const glow = card.querySelector('.cert-glow-overlay');
                if (glow) {
                    const percentX = (x / w) * 100;
                    glow.style.background = `radial-gradient(circle at ${percentX}% ${y}px, rgba(255,255,255,0.06) 0%, transparent 60%)`;
                    glow.style.opacity = '1';
                }
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
                const glow = card.querySelector('.cert-glow-overlay');
                if (glow) {
                    glow.style.background = 'none';
                    glow.style.opacity = '0';
                }
            });
        });
    }

    // --- Dynamic Skill delay tags index inject ---
    const skillChips = document.querySelectorAll('.tag');
    skillChips.forEach((chip, index) => {
        chip.style.setProperty('--i', index);
    });

    // --- Scroll Navbar blur and shadow controls ---
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

    // --- Active Navigation Link Tracking while Scrolling ---
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
    updateActiveNavLink(); // Run check on load

    // --- Intersection Observer for Content Reveal animations ---
    const revealElements = document.querySelectorAll('.scroll-reveal');
    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target); // Trigger only once
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -60px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        // Fallback: instantly reveal sections if reduced motion is preferred or observer is not supported
        revealElements.forEach(el => el.classList.add('revealed'));
    }
});
