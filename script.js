/**
 * AMALMON K H - Portfolio Interactions
 * Native JavaScript logic for modern single page portfolio.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Dynamic Canonical URL Generation
    const canonicalLink = document.getElementById('canonical-link');
    if (canonicalLink) {
        const cleanUrl = window.location.origin + window.location.pathname;
        canonicalLink.setAttribute('href', cleanUrl);
    }

    // PDF Resume Print Triggers
    const navPrintBtn = document.getElementById('btn-nav-print');
    const heroPrintBtn = document.getElementById('btn-hero-print');

    const handlePrint = () => {
        window.print();
    };

    if (navPrintBtn) {
        navPrintBtn.addEventListener('click', handlePrint);
    }

    if (heroPrintBtn) {
        heroPrintBtn.addEventListener('click', handlePrint);
    }

    // Scroll Navbar Effect: Add shadow on scroll
    const navbar = document.getElementById('main-nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            navbar.style.boxShadow = '0 10px 30px -10px rgba(0, 0, 0, 0.5)';
            navbar.style.borderBottomColor = 'transparent';
        } else {
            navbar.style.boxShadow = 'none';
            navbar.style.borderBottomColor = 'var(--border-color)';
        }
    });

    // Scroll Progress Indicator
    const scrollProgressBar = document.getElementById('scroll-progress-bar');
    window.addEventListener('scroll', () => {
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        if (scrollHeight > 0) {
            const scrollFraction = window.scrollY / scrollHeight;
            scrollProgressBar.style.transform = `scaleX(${scrollFraction})`;
        } else {
            scrollProgressBar.style.transform = 'scaleX(0)';
        }
    });

    // Active Navigation Highlight While Scrolling
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
    updateActiveNavLink(); // Run initial check

    // Intersection Observer for Scroll Reveal Animations
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    // Check user preference for motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target); // Reveal only once
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        // Fallback: immediately show elements if IntersectionObserver is not supported or reduced motion is preferred
        revealElements.forEach(el => el.classList.add('revealed'));
    }
});
