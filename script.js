/**
   * AMALMON K H - PREMIUM DARK EDITORIAL PORTFOLIO SCRIPT
   * Coordinates animations, custom cursors, parallax, reveals, and credentials.
   */

document.addEventListener('DOMContentLoaded', () => {
    // Accessibility check: user motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Check if device is a touch/mobile device
    const isTouchDevice = ('ontouchstart' in window) || 
                          (navigator.maxTouchPoints > 0) || 
                          window.matchMedia("(pointer: coarse)").matches;

    // --- 1. Smooth Scrolling (Lenis) ---
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

    // --- 2. Custom Editorial Cursor ---
    const cursor = document.getElementById('custom-cursor');
    const cursorDot = cursor ? cursor.querySelector('.cursor-dot') : null;
    const cursorRing = cursor ? cursor.querySelector('.cursor-ring') : null;
    const cursorText = cursor ? cursor.querySelector('.cursor-text') : null;

    let mouse = { x: -100, y: -100 };
    let dotPos = { x: -100, y: -100 };
    let ringPos = { x: -100, y: -100 };

    if (cursor && !isTouchDevice) {
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        // Hide default cursor
        document.body.style.cursor = 'none';

        // Cursor tick for interpolation (60fps)
        function tickCursor() {
            // Lerp interpolation
            dotPos.x += (mouse.x - dotPos.x) * 0.3;
            dotPos.y += (mouse.y - dotPos.y) * 0.3;
            ringPos.x += (mouse.x - ringPos.x) * 0.15;
            ringPos.y += (mouse.y - ringPos.y) * 0.15;

            if (cursorDot) {
                cursorDot.style.left = `${dotPos.x}px`;
                cursorDot.style.top = `${dotPos.y}px`;
            }
            if (cursorRing) {
                cursorRing.style.left = `${ringPos.x}px`;
                cursorRing.style.top = `${ringPos.y}px`;
            }

            requestAnimationFrame(tickCursor);
        }
        requestAnimationFrame(tickCursor);

        // Hover listeners for links and buttons (standard link hover)
        const interactives = document.querySelectorAll('a, button, .nav-link, .cert-item, [data-cursor]');
        interactives.forEach(el => {
            el.style.cursor = 'none';
            el.addEventListener('mouseenter', () => {
                const customAction = el.getAttribute('data-cursor');
                if (customAction) {
                    cursor.classList.add('hovering-active');
                    if (cursorText) cursorText.innerText = customAction;
                } else {
                    cursor.classList.add('hovering-link');
                }
            });

            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('hovering-link', 'hovering-active');
                if (cursorText) cursorText.innerText = '';
            });
        });
    } else if (cursor) {
        // Disable on touch devices
        cursor.style.display = 'none';
        document.body.style.cursor = 'auto';
    }

    // --- 3. Hero Name Layer Parallax ---
    if (!prefersReducedMotion && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Separate text layers on scroll down, merging on scroll up
        gsap.to('.back-layer-1', {
            x: 50,
            y: 40,
            ease: "none",
            scrollTrigger: {
                trigger: '.hero-name-container',
                start: 'top 20%',
                end: 'bottom top',
                scrub: true
            }
        });

        gsap.to('.back-layer-2', {
            x: 100,
            y: 80,
            ease: "none",
            scrollTrigger: {
                trigger: '.hero-name-container',
                start: 'top 20%',
                end: 'bottom top',
                scrub: true
            }
        });
    }

    // --- 4. Profile Photo Mouse-Responsive Parallax ---
    const photoContainer = document.querySelector('.profile-photo-container');
    const photoWrapper = document.querySelector('.profile-photo-wrapper');
    const photoImg = document.querySelector('.profile-photo-wrapper img');
    const accentRing = document.querySelector('.profile-photo-accent-ring');

    if (photoContainer && !isTouchDevice && typeof gsap !== 'undefined') {
        photoContainer.addEventListener('mousemove', (e) => {
            const rect = photoContainer.getBoundingClientRect();
            // Get cursor coordinate relative to container center
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(photoWrapper, {
                x: x * 0.12,
                y: y * 0.12,
                duration: 0.4,
                ease: "power2.out"
            });

            gsap.to(photoImg, {
                x: -x * 0.05,
                y: -y * 0.05,
                scale: 1.06,
                duration: 0.4,
                ease: "power2.out"
            });

            if (accentRing) {
                gsap.to(accentRing, {
                    x: x * 0.08,
                    y: y * 0.08,
                    rotate: 15 + (x * 0.05),
                    duration: 0.4,
                    ease: "power2.out"
                });
            }
        });

        photoContainer.addEventListener('mouseleave', () => {
            gsap.to([photoWrapper, photoImg, accentRing], {
                x: 0,
                y: 0,
                scale: 1,
                rotate: 0,
                duration: 0.6,
                ease: "power3.out"
            });
        });
    }

    // --- 5. Project Images Clip-Path Reveals ---
    if (!prefersReducedMotion && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        document.querySelectorAll('.project-card').forEach((card) => {
            const img = card.querySelector('.project-img');
            const info = card.querySelector('.project-info');
            
            if (img) {
                gsap.fromTo(img, 
                    { clipPath: 'inset(0 100% 0 0)', scale: 1.2 },
                    {
                        clipPath: 'inset(0 0 0 0)',
                        scale: 1,
                        duration: 1.6,
                        ease: "power4.inOut",
                        scrollTrigger: {
                            trigger: card,
                            start: 'top 85%',
                            toggleActions: 'play none none none'
                        }
                    }
                );
            }

            if (info) {
                gsap.fromTo(info,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1.0,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: card,
                            start: 'top 80%',
                            toggleActions: 'play none none none'
                        }
                    }
                );
            }
        });
    }

    // --- 6. Certificate Archive Interactive Toggle & Lightbox ---
    const certItems = document.querySelectorAll('.cert-item');
    const previewImg = document.getElementById('cert-preview-img');
    const previewTitle = document.getElementById('cert-preview-title');
    const previewIssuer = document.getElementById('cert-preview-issuer');
    const previewMeta = document.getElementById('cert-preview-meta');
    const previewPdfLink = document.getElementById('cert-preview-pdf-link');

    // Lightbox Elements
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxIframe = document.getElementById('lightbox-iframe');

    certItems.forEach((item) => {
        // Hover Interaction (desktop only)
        item.addEventListener('mouseenter', () => {
            if (window.innerWidth <= 1024) return; // Disregard on mobile/tablet widths
            
            certItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            const imgUrl = item.getAttribute('data-img');
            const title = item.getAttribute('data-title');
            const issuer = item.getAttribute('data-issuer');
            const meta = item.getAttribute('data-meta');
            const pdfUrl = item.getAttribute('data-pdf');

            // Smooth image swap transition
            if (previewImg) {
                previewImg.classList.add('fade-out');
                setTimeout(() => {
                    previewImg.src = imgUrl;
                    previewImg.alt = `${title} Certificate Preview`;
                    previewImg.classList.remove('fade-out');
                }, 150);
            }

            if (previewTitle) previewTitle.innerText = title;
            if (previewIssuer) previewIssuer.innerText = issuer;
            if (previewMeta) previewMeta.innerText = meta;
            if (previewPdfLink) previewPdfLink.href = pdfUrl;
        });

        // Click Interaction: Open Lightbox
        item.addEventListener('click', (e) => {
            // Prevent interference with anchor downloads if they exist
            if (e.target.tagName.toLowerCase() === 'a') return;
            
            const pdfUrl = item.getAttribute('data-pdf');
            if (lightboxIframe && lightboxModal) {
                lightboxIframe.src = pdfUrl;
                lightboxModal.classList.add('active');
                if (lenis) lenis.stop(); // Pause smooth scrolling
            }
        });
    });

    // Close Lightbox Modal
    const closeLightbox = () => {
        if (lightboxModal && lightboxIframe) {
            lightboxModal.classList.remove('active');
            lightboxIframe.src = '';
            if (lenis) lenis.start(); // Resume scrolling
        }
    };

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxModal) {
        lightboxModal.addEventListener('click', (e) => {
            if (e.target === lightboxModal) closeLightbox();
        });
    }

    // --- 7. Minimal Navigation Active Indicator ---
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    const activeIndicator = document.querySelector('.nav-active-indicator');

    function updateNavIndicator() {
        const activeLink = document.querySelector('.nav-link.active');
        if (activeLink && activeIndicator) {
            const linkRect = activeLink.getBoundingClientRect();
            const parentRect = activeLink.parentElement.getBoundingClientRect();
            
            activeIndicator.style.left = `${linkRect.left - parentRect.left}px`;
            activeIndicator.style.width = `${linkRect.width}px`;
        }
    }

    // Scroll Spy Logic
    const onScrollSpy = () => {
        let scrollPos = window.scrollY + window.innerHeight / 3;
        let currentSection = '';

        sections.forEach((section) => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            if (scrollPos >= top && scrollPos < top + height) {
                currentSection = section.getAttribute('id');
            }
        });

        if (currentSection) {
            navLinks.forEach((link) => {
                const href = link.getAttribute('href').replace('#', '');
                if (href === currentSection) {
                    if (!link.classList.contains('active')) {
                        navLinks.forEach(l => l.classList.remove('active'));
                        link.classList.add('active');
                        updateNavIndicator();
                    }
                }
            });
        }
    };

    window.addEventListener('scroll', onScrollSpy);
    window.addEventListener('resize', updateNavIndicator);
    
    // Initial Nav Placement
    setTimeout(updateNavIndicator, 200);

    // Nav smooth scroll triggers (Lenis integrations)
    if (lenis) {
        navLinks.forEach((link) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                lenis.scrollTo(targetId, {
                    offset: -80,
                    duration: 1.2,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                });
            });
        });

        const logoLink = document.querySelector('.logo');
        if (logoLink) {
            logoLink.addEventListener('click', (e) => {
                e.preventDefault();
                lenis.scrollTo('#home', {
                    duration: 1.2,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                });
            });
        }
    }
});
