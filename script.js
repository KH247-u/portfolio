/**
 * AMALMON K H - Cinematic Interactive Portfolio Script
 * Rebuilt from the ground up to support profile photo highlights,
 * magnetic cursors, spotlight layers, and single-page printable resume sheets.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // Accessibility check: user motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Check if device supports touch to gracefully disable desktop cursor effects
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    // --- Smooth Scroll (Lenis) ---
    let lenis;
    if (!prefersReducedMotion && typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 0.9,
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
    const resumeDownloadBtn = document.getElementById('btn-download-resume');
    
    const triggerPrintAction = () => {
        window.print();
    };

    if (navPrintBtn) navPrintBtn.addEventListener('click', triggerPrintAction);
    if (resumeDownloadBtn) resumeDownloadBtn.addEventListener('click', triggerPrintAction);

    // Global mouse coordinates
    let screenMouse = { x: -1000, y: -1000 };
    let isClicking = false;

    window.addEventListener('mousemove', (e) => {
        screenMouse.x = e.clientX;
        screenMouse.y = e.clientY;
    });

    // Spawning Click Ripple Elements
    window.addEventListener('mousedown', (e) => {
        if (isTouchDevice || prefersReducedMotion) return;
        
        const ripple = document.createElement('div');
        ripple.className = 'cursor-ripple';
        ripple.style.left = `${e.clientX}px`;
        ripple.style.top = `${e.clientY}px`;
        document.body.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 400);
    });

    // --- Custom Minimal Cursor (Desktop/Mouse Only) ---
    const cursorDot = document.getElementById('cursor-dot');
    const cursorRing = document.getElementById('cursor-ring');
    const isDesktop = !isTouchDevice && window.innerWidth >= 768;

    let targetRing = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let ringCoords = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let dotCoords = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    if (cursorDot && cursorRing && isDesktop && !prefersReducedMotion) {
        let cursorVisible = false;

        window.addEventListener('mousemove', (e) => {
            const wasHidden = !cursorVisible;
            cursorVisible = true;
            
            if (wasHidden) {
                dotCoords.x = screenMouse.x;
                dotCoords.y = screenMouse.y;
                ringCoords.x = screenMouse.x;
                ringCoords.y = screenMouse.y;
            }

            cursorDot.style.opacity = '1';
            cursorRing.style.opacity = '1';
        });

        window.addEventListener('mouseleave', () => {
            cursorVisible = false;
            cursorDot.style.opacity = '0';
            cursorRing.style.opacity = '0';
        });

        function updateCursorPositions() {
            if (window.innerWidth < 768) {
                requestAnimationFrame(updateCursorPositions);
                return;
            }

            // Lerp tracking
            dotCoords.x += (screenMouse.x - dotCoords.x) * 0.24;
            dotCoords.y += (screenMouse.y - dotCoords.y) * 0.24;
            ringCoords.x += (targetRing.x - ringCoords.x) * 0.14;
            ringCoords.y += (targetRing.y - ringCoords.y) * 0.14;

            cursorDot.style.left = `${dotCoords.x}px`;
            cursorDot.style.top = `${dotCoords.y}px`;
            cursorRing.style.left = `${ringCoords.x}px`;
            cursorRing.style.top = `${ringCoords.y}px`;

            requestAnimationFrame(updateCursorPositions);
        }
        updateCursorPositions();

        // Bind interactive cursor hover scaling
        const hoverElements = document.querySelectorAll('a, button, .skill-node, .cert-item-row');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorRing.classList.add('hovering');
                cursorDot.classList.add('hovering');
            });
            el.addEventListener('mouseleave', () => {
                cursorRing.classList.remove('hovering');
                cursorDot.classList.remove('hovering');
                targetRing.x = screenMouse.x;
                targetRing.y = screenMouse.y;
            });
        });
    }

    // --- Hero Portrait Parallax, Spotlight, and Edge Lighting ---
    const portraitFrame = document.getElementById('hero-portrait-frame');
    const portraitImage = document.getElementById('hero-portrait-image');
    const spotlightLayer = document.getElementById('portrait-spotlight-layer');

    if (portraitFrame && portraitImage && spotlightLayer && isDesktop && !prefersReducedMotion) {
        portraitFrame.addEventListener('mousemove', (e) => {
            const rect = portraitFrame.getBoundingClientRect();
            const px = ((screenMouse.x - rect.left) / rect.width) * 100;
            const py = ((screenMouse.y - rect.top) / rect.height) * 100;
            
            // Spotlight glow coordinates
            spotlightLayer.style.setProperty('--x', `${px}%`);
            spotlightLayer.style.setProperty('--y', `${py}%`);
            spotlightLayer.style.opacity = '1';

            // Parallax displacements relative to center
            const cx = screenMouse.x - (rect.left + rect.width / 2);
            const cy = screenMouse.y - (rect.top + rect.height / 2);

            // Shift container slightly towards mouse, shift image opposite
            gsap.to(portraitFrame, {
                x: cx * 0.04,
                y: cy * 0.04,
                rotateY: cx * 0.015,
                rotateX: -cy * 0.015,
                borderColor: 'rgba(108, 140, 255, 0.4)',
                boxShadow: '0 35px 70px -15px rgba(108, 140, 255, 0.15)',
                duration: 0.4,
                ease: "power2.out",
                overwrite: "auto"
            });

            gsap.to(portraitImage, {
                x: -cx * 0.03,
                y: -cy * 0.03,
                scale: 1.05,
                filter: 'contrast(1.08) brightness(0.96) saturate(1.02) sharp',
                duration: 0.4,
                ease: "power2.out",
                overwrite: "auto"
            });

            // Expand cursor ring when hovering portrait
            if (cursorRing) cursorRing.classList.add('hovering');
        });

        portraitFrame.addEventListener('mouseleave', () => {
            spotlightLayer.style.opacity = '0';
            
            gsap.to(portraitFrame, {
                x: 0,
                y: 0,
                rotateY: 0,
                rotateX: 0,
                borderColor: 'rgba(255, 255, 255, 0.08)',
                boxShadow: '0 30px 60px -20px rgba(0, 0, 0, 0.8)',
                duration: 0.6,
                ease: "power3.out",
                overwrite: "auto"
            });

            gsap.to(portraitImage, {
                x: 0,
                y: 0,
                scale: 1,
                filter: 'contrast(1.04) brightness(0.92) saturate(0.96)',
                duration: 0.6,
                ease: "power3.out",
                overwrite: "auto"
            });

            if (cursorRing) cursorRing.classList.remove('hovering');
        });
    }

    // --- Soft Magnetic Snap for Buttons & Link Coordinates Update ---
    const magneticBtns = document.querySelectorAll('.btn, .btn-nav-print, #btn-download-resume');
    if (magneticBtns.length > 0 && isDesktop && !prefersReducedMotion && typeof gsap !== 'undefined') {
        magneticBtns.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const bx = rect.left + rect.width / 2;
                const by = rect.top + rect.height / 2;
                const dx = screenMouse.x - bx;
                const dy = screenMouse.y - by;

                // Move button slightly
                gsap.to(btn, {
                    x: dx * 0.22,
                    y: dy * 0.22,
                    duration: 0.3,
                    ease: "power2.out",
                    overwrite: "auto"
                });

                // Magnetically draw cursor ring coordinates
                targetRing.x = bx + dx * 0.25;
                targetRing.y = by + dy * 0.25;
            });

            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, {
                    x: 0,
                    y: 0,
                    duration: 0.5,
                    ease: "power3.out",
                    overwrite: "auto"
                });
                targetRing.x = screenMouse.x;
                targetRing.y = screenMouse.y;
            });
        });
    }

    // Fallback cursor ring coordinates update on normal page
    window.addEventListener('mousemove', () => {
        let isHoveringMagnetic = false;
        magneticBtns.forEach(btn => {
            const rect = btn.getBoundingClientRect();
            if (screenMouse.x >= rect.left && screenMouse.x <= rect.right &&
                screenMouse.y >= rect.top && screenMouse.y <= rect.bottom) {
                isHoveringMagnetic = true;
            }
        });
        if (!isHoveringMagnetic) {
            targetRing.x = screenMouse.x;
            targetRing.y = screenMouse.y;
        }
    });

    // --- Connecting Nodes Skills Map ---
    const skillsCanvas = document.getElementById('skills-canvas');
    const skillNodes = document.querySelectorAll('.skill-node');

    if (skillsCanvas && skillNodes.length > 0 && !prefersReducedMotion) {
        const ctx = skillsCanvas.getContext('2d');
        let hoverNode = null;

        function resizeSkillsCanvas() {
            skillsCanvas.width = skillsCanvas.parentElement.clientWidth;
            skillsCanvas.height = skillsCanvas.parentElement.clientHeight;
        }

        function drawConnections() {
            ctx.clearRect(0, 0, skillsCanvas.width, skillsCanvas.height);

            if (hoverNode) {
                const hoverRect = hoverNode.getBoundingClientRect();
                const containerRect = skillsCanvas.parentElement.getBoundingClientRect();
                
                const hx = hoverRect.left - containerRect.left + hoverRect.width / 2;
                const hy = hoverRect.top - containerRect.top + hoverRect.height / 2;

                const currentCategoryBlock = hoverNode.closest('.skills-cat-block');
                const peers = currentCategoryBlock.querySelectorAll('.skill-node');

                ctx.strokeStyle = 'rgba(57, 214, 197, 0.25)';
                ctx.lineWidth = 1;

                peers.forEach(peer => {
                    if (peer !== hoverNode) {
                        const peerRect = peer.getBoundingClientRect();
                        const px = peerRect.left - containerRect.left + peerRect.width / 2;
                        const py = peerRect.top - containerRect.top + peerRect.height / 2;

                        ctx.beginPath();
                        ctx.moveTo(hx, hy);
                        ctx.lineTo(px, py);
                        ctx.stroke();
                    }
                });
            }

            requestAnimationFrame(drawConnections);
        }

        skillNodes.forEach(node => {
            node.addEventListener('mouseenter', () => {
                hoverNode = node;
                node.classList.add('highlighted');

                const currentCategoryBlock = node.closest('.skills-cat-block');
                skillNodes.forEach(otherNode => {
                    if (otherNode.closest('.skills-cat-block') !== currentCategoryBlock) {
                        otherNode.classList.add('dimmed');
                    } else if (otherNode !== node) {
                        otherNode.classList.add('highlighted');
                    }
                });
            });

            node.addEventListener('mouseleave', () => {
                hoverNode = null;
                skillNodes.forEach(n => {
                    n.classList.remove('highlighted', 'dimmed');
                });
            });
        });

        window.addEventListener('resize', resizeSkillsCanvas);
        resizeSkillsCanvas();
        drawConnections();
    }

    // --- Certifications Split-Showcase Gallery Controller ---
    const certificatesData = [
        {
            title: "Data Analytics & Visualisation Internship",
            issuer: "IPSR Solutions Limited",
            tag: "Featured Experience",
            detail1: "Duration: 8 Weeks (240 Hours)",
            detail2: "Credential ID: OYzknoNyUH",
            pdf: "certificates/Data%20Analytics%20and%20Visualisaton%20Internship%20Certificate%20-%208%20Weeks.pdf",
            iconHtml: `<svg class="icon icon-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`
        },
        {
            title: "Cloud Computing Internship",
            issuer: "Alpha Innovation (AWS Platforms)",
            tag: "Featured Experience",
            detail1: "Sept 05, 2025 &ndash; Nov 5, 2025",
            detail2: "Credential ID: DUfSn5Is",
            pdf: "certificates/Cloud%20Computing%20Certificate.pdf",
            iconHtml: `<svg class="icon icon-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg>`
        },
        {
            title: "Database and SQL Certificate",
            issuer: "Infosys Springboard",
            tag: "Database",
            detail1: "Completed: July 4, 2026",
            detail2: "Verified Completion / VC",
            pdf: "certificates/Database%20and%20SQL%20certificate.pdf",
            iconHtml: `<svg class="icon icon-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/></svg>`
        },
        {
            title: "5-Day Web Development Bootcamp",
            issuer: "&mu;Learn IDK / INOVUS LABS IEDC",
            tag: "Web Development",
            detail1: "Date: June 12-17, 2026",
            detail2: "Certificate ID: INO2026WEB526",
            pdf: "certificates/Web%20development%20Bootcamp.pdf",
            iconHtml: `<svg class="icon icon-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`
        },
        {
            title: "OpenShift AI for Future Careers",
            issuer: "Red Hat / IPSR Solutions Limited",
            tag: "Cloud &amp; AI",
            detail1: "Completed: April 23, 2026",
            detail2: "ID: jaEQt6g1Jl",
            pdf: "certificates/OpenShift%20AI%20for%20Future%20Careers%20particiaption%20certificate.pdf",
            iconHtml: `<svg class="icon icon-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.25z"/></svg>`
        },
        {
            title: "Young Innovators Programme (YIP) 8.0",
            issuer: "K-DISC",
            tag: "Innovation",
            detail1: "Recognition Date: Dec 8, 2025",
            detail2: "Idea ID: 1159934",
            pdf: "certificates/YIP_Certificate_AMALMON%20KH_1159934.pdf",
            iconHtml: `<svg class="icon icon-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V3a1 1 0 0 1 1-1h15v20H5a1 1 0 0 1-1-1z"/></svg>`
        }
    ];

    const previewCard = document.getElementById('cert-preview-card');
    const previewTitle = document.getElementById('cert-preview-title');
    const previewIssuer = document.getElementById('cert-preview-issuer');
    const previewTag = document.getElementById('cert-preview-tag');
    const previewMeta1 = document.getElementById('cert-meta-detail-1');
    const previewMeta2 = document.getElementById('cert-meta-detail-2');
    const previewBtn = document.getElementById('cert-preview-btn');
    const previewBadge = document.getElementById('cert-preview-badge');
    const certRows = document.querySelectorAll('.cert-item-row');

    if (previewCard && certRows.length > 0 && typeof gsap !== 'undefined') {
        previewBadge.innerHTML = certificatesData[0].iconHtml;

        certRows.forEach(row => {
            row.addEventListener('click', () => {
                const idx = parseInt(row.getAttribute('data-index'));
                const data = certificatesData[idx];

                certRows.forEach(r => r.classList.remove('active'));
                row.classList.add('active');

                gsap.to(previewCard, {
                    opacity: 0,
                    y: 10,
                    duration: 0.25,
                    ease: "power2.out",
                    onComplete: () => {
                        previewTitle.innerText = data.title;
                        previewIssuer.innerText = data.issuer;
                        previewTag.innerText = data.tag;
                        previewMeta1.innerHTML = data.detail1;
                        previewMeta2.innerHTML = data.detail2;
                        previewBtn.setAttribute('href', data.pdf);
                        previewBadge.innerHTML = data.iconHtml;

                        gsap.to(previewCard, {
                            opacity: 1,
                            y: 0,
                            duration: 0.35,
                            ease: "power2.out"
                        });
                    }
                });
            });
        });
    }

    // --- Project Card subtle 3D Tilt ---
    const projectCards = document.querySelectorAll('.project-case-study');
    if (projectCards.length > 0 && isDesktop && !prefersReducedMotion && typeof gsap !== 'undefined') {
        projectCards.forEach(card => {
            const visual = card.querySelector('.project-visual');
            
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = screenMouse.x - rect.left;
                const y = screenMouse.y - rect.top;
                const w = rect.width;
                const h = rect.height;

                const rotateY = -((x - w/2) / w) * 3.5;
                const rotateX = ((y - h/2) / h) * 3.5;

                if (visual) {
                    gsap.to(visual, {
                        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`,
                        borderColor: 'rgba(108, 140, 255, 0.25)',
                        duration: 0.4,
                        ease: "power2.out",
                        overwrite: "auto"
                    });
                }
            });

            card.addEventListener('mouseleave', () => {
                if (visual) {
                    gsap.to(visual, {
                        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
                        borderColor: 'rgba(255, 255, 255, 0.08)',
                        duration: 0.5,
                        ease: "power3.out",
                        overwrite: "auto"
                    });
                }
            });
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
    updateActiveNavLink();

    const navbar = document.getElementById('main-nav');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 30) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // --- Smooth Scroll via Lenis ---
    if (typeof lenis !== 'undefined' && lenis && !prefersReducedMotion) {
        const navMenuLinks = document.querySelectorAll('.nav-link, .nav-logo, .hero-actions a');
        navMenuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href');
                if (targetId && targetId.startsWith('#')) {
                    e.preventDefault();
                    lenis.scrollTo(targetId, {
                        duration: 0.9,
                        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                    });
                }
            });
        });
    }

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

    // --- Cinematic Page Loader Timeline ---
    if (!prefersReducedMotion && typeof gsap !== 'undefined') {
        const introTl = gsap.timeline({ defaults: { ease: "power4.out" } });

        // Preset style transformations
        gsap.set('#hero-portrait-frame', { opacity: 0, y: 35, scale: 0.95, filter: 'blur(10px)' });
        gsap.set('.hero-tagline', { opacity: 0, y: 15 });
        gsap.set('.hero-name', { opacity: 0, y: 25 });
        gsap.set('.hero-title', { opacity: 0, y: 15 });
        gsap.set('.hero-lead', { opacity: 0, y: 15 });
        gsap.set('.hero-actions .btn', { opacity: 0, y: 15 });

        // Sequence animations
        introTl.to('#hero-portrait-frame', { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 1.4 });
        introTl.to('.hero-tagline', { opacity: 1, y: 0, duration: 0.8 }, "-=1.0");
        introTl.to('.hero-name', { opacity: 1, y: 0, duration: 1.0 }, "-=0.7");
        introTl.to('.hero-title', { opacity: 1, y: 0, duration: 0.8 }, "-=0.7");
        introTl.to('.hero-lead', { opacity: 1, y: 0, duration: 0.8 }, "-=0.6");
        introTl.to('.hero-actions .btn', { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 }, "-=0.5");
    }

    // --- Scroll Content Reveal with GSAP ScrollTrigger ---
    if (!prefersReducedMotion && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        const revealElements = document.querySelectorAll('.scroll-reveal');
        
        revealElements.forEach((section) => {
            gsap.fromTo(section, 
                { opacity: 0, y: 25 }, 
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

            const timelineRows = section.querySelectorAll('.timeline-row');
            if (timelineRows.length > 0) {
                gsap.fromTo(timelineRows,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        stagger: 0.08,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: section,
                            start: "top 80%"
                        }
                    }
                );
            }

            const projectCases = section.querySelectorAll('.project-case-study');
            if (projectCases.length > 0) {
                gsap.fromTo(projectCases,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1.0,
                        stagger: 0.12,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: section,
                            start: "top 85%"
                        }
                    }
                );
            }

            const title = section.querySelector('.section-title');
            if (title) {
                gsap.fromTo(title,
                    { clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0% 100%)", y: 8 },
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
        const revealElements = document.querySelectorAll('.scroll-reveal');
        revealElements.forEach(el => el.classList.add('revealed'));
    }
});
