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

    // --- 3. Dynamic Section Dividers & Link Arrow Wrapping ---
    const sectionsWithBorders = document.querySelectorAll('.about-section, .timeline-section, .projects-section, .certifications-section, .resume-section, .contact-section');
    sectionsWithBorders.forEach(section => {
        const divider = document.createElement('div');
        divider.className = 'section-divider';
        section.insertBefore(divider, section.firstChild);
    });

    document.querySelectorAll('.project-link, .contact-value').forEach(link => {
        const text = link.innerHTML;
        if (text.includes('↗') || text.includes('&nearrow;')) {
            link.innerHTML = text.replace(/(↗|&nearrow;)/g, '<span class="link-arrow">$1</span>');
        } else if (text.includes('→') || text.includes('&rarr;')) {
            link.innerHTML = text.replace(/(→|&rarr;)/g, '<span class="link-arrow">$1</span>');
        }
    });

    // --- 4. Page Load Stagger Animation ---
    if (!prefersReducedMotion && typeof gsap !== 'undefined') {
        const loadTimeline = gsap.timeline({
            defaults: { ease: "power3.out" }
        });

        loadTimeline.to('.hero-identity', {
            opacity: 1,
            y: 0,
            duration: 0.6,
            startAt: { y: 15, opacity: 0 }
        })
        .to('.main-layer', {
            opacity: 1,
            y: 0,
            clipPath: 'inset(0 0 0% 0)',
            duration: 0.7,
            startAt: { y: 25, opacity: 0, clipPath: 'inset(0 0 100% 0)' }
        }, '-=0.45')
        .to(['.back-layer-1', '.back-layer-2'], {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.1,
            startAt: { y: 25, opacity: 0 }
        }, '-=0.5')
        .to('.profile-photo-container', {
            opacity: 1,
            scale: 1,
            duration: 0.7,
            startAt: { scale: 0.95, opacity: 0 }
        }, '-=0.55')
        .to('.hero-statement', {
            opacity: 1,
            y: 0,
            duration: 0.6,
            startAt: { y: 15, opacity: 0 }
        }, '-=0.45')
        .to('.scroll-indicator', {
            opacity: 0.6,
            y: 0,
            duration: 0.5,
            startAt: { y: -15, opacity: 0 }
        }, '-=0.35');
    }

    // --- 5. Hero Name Layer Parallax & Mouse Interactivity ---
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

        // Hero cursor-responsive parallax
        const heroSection = document.getElementById('home');
        if (heroSection && !isTouchDevice) {
            heroSection.addEventListener('mousemove', (e) => {
                const rect = heroSection.getBoundingClientRect();
                const xNorm = (e.clientX - rect.left) / rect.width - 0.5;
                const yNorm = (e.clientY - rect.top) / rect.height - 0.5;

                gsap.to('.hero-name-container', {
                    x: xNorm * 16,
                    y: yNorm * 12,
                    duration: 0.8,
                    ease: "power2.out"
                });
                gsap.to('.back-layer-2', {
                    letterSpacing: `${-0.04 + Math.abs(xNorm) * 0.005}em`,
                    duration: 0.8,
                    ease: "power2.out"
                });
                gsap.to('.back-layer-1', {
                    letterSpacing: `${-0.04 + Math.abs(xNorm) * 0.003}em`,
                    duration: 0.8,
                    ease: "power2.out"
                });
                gsap.to('.profile-photo-wrapper', {
                    x: -xNorm * 10,
                    y: -yNorm * 10,
                    scale: 1.015,
                    duration: 0.8,
                    ease: "power2.out"
                });
                gsap.to('.profile-photo-wrapper img', {
                    x: xNorm * 5,
                    y: yNorm * 5,
                    duration: 0.8,
                    ease: "power2.out"
                });
                const ring = document.querySelector('.profile-photo-accent-ring');
                if (ring) {
                    gsap.to(ring, {
                        x: -xNorm * 7,
                        y: -yNorm * 7,
                        rotate: 15 - (xNorm * 5),
                        duration: 0.8,
                        ease: "power2.out"
                    });
                }
                gsap.to('.main-layer', {
                    x: xNorm * 4,
                    y: yNorm * 4,
                    duration: 0.8,
                    ease: "power2.out"
                });
                gsap.to('.hero-identity', {
                    x: xNorm * 3,
                    y: yNorm * 3,
                    duration: 0.8,
                    ease: "power2.out"
                });
                gsap.to('.hero-statement', {
                    x: xNorm * 5,
                    y: yNorm * 5,
                    duration: 0.8,
                    ease: "power2.out"
                });
            });

            heroSection.addEventListener('mouseleave', () => {
                gsap.to(['.hero-name-container', '.back-layer-1', '.back-layer-2', '.profile-photo-wrapper', '.profile-photo-wrapper img', '.profile-photo-accent-ring', '.main-layer', '.hero-identity', '.hero-statement'], {
                    x: 0,
                    y: 0,
                    scale: 1,
                    rotate: 0,
                    letterSpacing: '-0.04em',
                    duration: 1.0,
                    ease: "power3.out"
                });
            });
        }
    }

    // --- 6. Profile Photo Mouse-Responsive Parallax ---
    const photoContainer = document.querySelector('.profile-photo-container');
    const photoWrapper = document.querySelector('.profile-photo-wrapper');
    const photoImg = document.querySelector('.profile-photo-wrapper img');
    const accentRing = document.querySelector('.profile-photo-accent-ring');

    if (photoContainer && !isTouchDevice && !prefersReducedMotion && typeof gsap !== 'undefined') {
        photoContainer.addEventListener('mousemove', (e) => {
            const rect = photoContainer.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(photoWrapper, {
                x: x * 0.08,
                y: y * 0.08,
                scale: 1.03,
                duration: 0.4,
                ease: "power2.out"
            });

            gsap.to(photoImg, {
                x: -x * 0.04,
                y: -y * 0.04,
                scale: 1.03,
                duration: 0.4,
                ease: "power2.out"
            });

            if (accentRing) {
                gsap.to(accentRing, {
                    x: x * 0.05,
                    y: y * 0.05,
                    rotate: 15 + (x * 0.03),
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

    // --- 7. Project & Section Reveals, Scroll Parallax ---
    if (!prefersReducedMotion && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        // Section Entry Reveals
        sectionsWithBorders.forEach(section => {
            const divider = section.querySelector('.section-divider');
            const num = section.querySelector('.section-num');
            const title = section.querySelector('.editorial-title, .editorial-subtitle');
            
            const sectionTimeline = gsap.timeline({
                scrollTrigger: {
                    trigger: section,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            });

            if (divider) {
                sectionTimeline.to(divider, {
                    scaleX: 1,
                    duration: 1.2,
                    ease: "power3.inOut"
                });
            }

            if (num) {
                sectionTimeline.fromTo(num, 
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
                    "-=0.8"
                );
            }

            if (title) {
                sectionTimeline.fromTo(title,
                    { opacity: 0, y: 25 },
                    { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
                    "-=0.6"
                );
            }

            if (section.id === 'about') {
                const desc = section.querySelector('.about-desc');
                if (desc) {
                    sectionTimeline.fromTo(desc,
                        { opacity: 0, y: 20 },
                        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
                        "-=0.5"
                    );
                }
            } else if (section.id === 'education-experience') {
                const items = section.querySelectorAll('.timeline-item');
                if (items.length > 0) {
                    sectionTimeline.fromTo(items,
                        { opacity: 0, y: 30 },
                        { opacity: 1, y: 0, stagger: 0.15, duration: 0.8, ease: "power3.out" },
                        "-=0.5"
                    );
                }
            } else if (section.id === 'certifications') {
                const certs = section.querySelectorAll('.cert-item');
                const preview = section.querySelector('.cert-preview-pane');
                if (certs.length > 0) {
                    sectionTimeline.fromTo(certs,
                        { opacity: 0, x: -20 },
                        { opacity: 1, x: 0, stagger: 0.1, duration: 0.8, ease: "power3.out" },
                        "-=0.6"
                    );
                }
                if (preview) {
                    sectionTimeline.fromTo(preview,
                        { opacity: 0, scale: 0.96 },
                        { opacity: 1, scale: 1, duration: 0.8, ease: "power3.out" },
                        "-=0.6"
                    );
                }
            } else if (section.id === 'resume') {
                const box = section.querySelector('.resume-content-box');
                if (box) {
                    sectionTimeline.fromTo(box,
                        { opacity: 0, y: 30 },
                        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
                        "-=0.5"
                    );
                }
            } else if (section.id === 'contact') {
                const cards = section.querySelectorAll('.contact-card');
                if (cards.length > 0) {
                    sectionTimeline.fromTo(cards,
                        { opacity: 0, y: 20 },
                        { opacity: 1, y: 0, stagger: 0.15, duration: 0.8, ease: "power3.out" },
                        "-=0.5"
                    );
                }
            }
        });

        // Project Cards Reveals
        document.querySelectorAll('.project-card').forEach((card) => {
            const img = card.querySelector('.project-img');
            const title = card.querySelector('.project-title');
            const details = card.querySelector('.project-details');
            
            const cardTimeline = gsap.timeline({
                scrollTrigger: {
                    trigger: card,
                    start: 'top 82%',
                    toggleActions: 'play none none none'
                }
            });

            if (img) {
                cardTimeline.fromTo(img, 
                    { clipPath: 'inset(0 100% 0 0)', scale: 0.95 },
                    {
                        clipPath: 'inset(0 0 0 0)',
                        scale: 1.0,
                        duration: 1.2,
                        ease: "power4.inOut"
                    }
                );
            }

            if (title) {
                cardTimeline.fromTo(title,
                    { opacity: 0, x: -20 },
                    { opacity: 1, x: 0, duration: 0.6, ease: "power3.out" },
                    "-=0.8"
                );
            }

            if (details) {
                const children = details.children;
                cardTimeline.fromTo(children,
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: "power3.out" },
                    "-=0.6"
                );
            }
        });

        // Scroll Parallax Elements
        // Hero profile photo Y parallax
        const heroPhoto = document.querySelector('.profile-photo-container');
        if (heroPhoto) {
            gsap.fromTo(heroPhoto, 
                { y: -20 },
                {
                    y: 20,
                    ease: "none",
                    scrollTrigger: {
                        trigger: '#home',
                        start: 'top top',
                        end: 'bottom top',
                        scrub: true
                    }
                }
            );
        }

        // Section headings Y parallax
        document.querySelectorAll('.editorial-title, .editorial-subtitle').forEach(heading => {
            gsap.fromTo(heading, 
                { y: 15 },
                {
                    y: -15,
                    ease: "none",
                    scrollTrigger: {
                        trigger: heading,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: true
                    }
                }
            );
        });

        // Project images Y parallax inside overflow-hidden wrappers
        document.querySelectorAll('.project-card').forEach(card => {
            const img = card.querySelector('.project-img');
            if (img) {
                gsap.fromTo(img,
                    { yPercent: -6 },
                    {
                        yPercent: 6,
                        ease: "none",
                        scrollTrigger: {
                            trigger: card,
                            start: 'top bottom',
                            end: 'bottom top',
                            scrub: true
                        }
                    }
                );
            }
        });
    }

    // --- 8. Certificate Archive Interactive Toggle & Lightbox ---
    const certItems = document.querySelectorAll('.cert-item');
    const previewImg = document.getElementById('cert-preview-img');
    const previewTitle = document.getElementById('cert-preview-title');
    const previewIssuer = document.getElementById('cert-preview-issuer');
    const previewMeta = document.getElementById('cert-preview-meta');
    const previewPdfLink = document.getElementById('cert-preview-pdf-link');

    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxIframe = document.getElementById('lightbox-iframe');

    certItems.forEach((item) => {
        // Hover Interaction (desktop only)
        item.addEventListener('mouseenter', () => {
            if (window.innerWidth <= 1024) return;
            
            certItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            const imgUrl = item.getAttribute('data-img');
            const title = item.getAttribute('data-title');
            const issuer = item.getAttribute('data-issuer');
            const meta = item.getAttribute('data-meta');
            const pdfUrl = item.getAttribute('data-pdf');

            // Smooth preview card swap transition
            if (previewImg && typeof gsap !== 'undefined') {
                gsap.to('.preview-card-outer', {
                    opacity: 0.3,
                    scale: 0.97,
                    y: 8,
                    duration: 0.2,
                    onComplete: () => {
                        previewImg.src = imgUrl;
                        previewImg.alt = `${title} Certificate Preview`;
                        if (previewTitle) previewTitle.innerText = title;
                        if (previewIssuer) previewIssuer.innerText = issuer;
                        if (previewMeta) previewMeta.innerText = meta;
                        if (previewPdfLink) previewPdfLink.href = pdfUrl;
                        
                        gsap.to('.preview-card-outer', {
                            opacity: 1,
                            scale: 1,
                            y: 0,
                            duration: 0.45,
                            ease: "power3.out"
                        });
                    }
                });
            } else {
                if (previewImg) {
                    previewImg.src = imgUrl;
                    previewImg.alt = `${title} Certificate Preview`;
                }
                if (previewTitle) previewTitle.innerText = title;
                if (previewIssuer) previewIssuer.innerText = issuer;
                if (previewMeta) previewMeta.innerText = meta;
                if (previewPdfLink) previewPdfLink.href = pdfUrl;
            }
        });

        // Click Interaction: Open Lightbox
        item.addEventListener('click', (e) => {
            if (e.target.tagName.toLowerCase() === 'a') return;
            
            const pdfUrl = item.getAttribute('data-pdf');
            if (lightboxIframe && lightboxModal) {
                lightboxIframe.src = pdfUrl;
                lightboxModal.classList.add('active');
                if (lenis) lenis.stop();
            }
        });
    });

    const closeLightbox = () => {
        if (lightboxModal && lightboxIframe) {
            lightboxModal.classList.remove('active');
            lightboxIframe.src = '';
            if (lenis) lenis.start();
        }
    };

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxModal) {
        lightboxModal.addEventListener('click', (e) => {
            if (e.target === lightboxModal) closeLightbox();
        });
    }

    // --- 9. Navigation Active Indicator ---
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    const activeIndicator = document.querySelector('.nav-active-indicator');

    function updateNavIndicator() {
        const activeLink = document.querySelector('.nav-link.active');
        if (activeLink && activeIndicator && typeof gsap !== 'undefined') {
            const linkRect = activeLink.getBoundingClientRect();
            const parentRect = activeLink.parentElement.getBoundingClientRect();
            
            gsap.to(activeIndicator, {
                left: linkRect.left - parentRect.left,
                width: linkRect.width,
                duration: 0.4,
                ease: "power3.out"
            });
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
    
    setTimeout(updateNavIndicator, 200);

    // Navigation scrolled state listener
    const header = document.querySelector('.main-header');
    if (header) {
        const toggleHeaderScrolled = () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        };
        window.addEventListener('scroll', toggleHeaderScrolled, { passive: true });
        toggleHeaderScrolled();
    }

    // Nav smooth scroll triggers
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

    // --- 10. Magnetic Buttons ---
    const magneticBtn = document.querySelector('.resume-download-btn');
    if (magneticBtn && !isTouchDevice && !prefersReducedMotion && typeof gsap !== 'undefined') {
        magneticBtn.addEventListener('mousemove', (e) => {
            const rect = magneticBtn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(magneticBtn, {
                x: x * 0.22,
                y: y * 0.22,
                scale: 1.015,
                duration: 0.3,
                ease: "power2.out"
            });

            const arrow = magneticBtn.querySelector('.btn-arrow');
            if (arrow) {
                gsap.to(arrow, {
                    x: x * 0.08,
                    y: y * 0.08,
                    duration: 0.3,
                    ease: "power2.out"
                });
            }
        });

        magneticBtn.addEventListener('mouseleave', () => {
            gsap.to(magneticBtn, {
                x: 0,
                y: 0,
                scale: 1,
                duration: 0.5,
                ease: "power3.out"
            });
            const arrow = magneticBtn.querySelector('.btn-arrow');
            if (arrow) {
                gsap.to(arrow, {
                    x: 0,
                    y: 0,
                    duration: 0.5,
                    ease: "power3.out"
                });
            }
        });
    }
});
