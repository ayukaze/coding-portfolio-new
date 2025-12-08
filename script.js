// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initMobileMenu();
    initSmoothScrolling();
    initScrollAnimations();
    initFormValidation();
    initParticleAnimation();
    initCodeRain();
    initScrollEffects();
    initTypingEffect();
});

// Mobile Menu Toggle
function initMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            mobileMenuToggle.textContent = navMenu.classList.contains('active') ? '✕' : '☰';
        });

        // Close menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                mobileMenuToggle.textContent = '☰';
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            const navContainer = document.querySelector('.nav-container');
            if (!navContainer.contains(event.target)) {
                navMenu.classList.remove('active');
                mobileMenuToggle.textContent = '☰';
            }
        });
    }
}

// Smooth Scrolling Navigation
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed nav
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });

                // Update active nav link
                updateActiveNavLink(targetId);
            }
        });
    });
}

// Update Active Navigation Link
function updateActiveNavLink(targetId) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === targetId) {
            link.classList.add('active');
        }
    });
}

// Scroll-based Navigation Highlighting
function initScrollEffects() {
    const sections = document.querySelectorAll('section');
    const navContainer = document.querySelector('.nav-container');

    window.addEventListener('scroll', function() {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        if (current) {
            updateActiveNavLink(`#${current}`);
        }

        // Add scrolled class to navigation
        if (window.scrollY > 50) {
            navContainer.classList.add('scrolled');
        } else {
            navContainer.classList.remove('scrolled');
        }
    });
}

// Intersection Observer for Scroll Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                entry.target.classList.remove('animate-out');
            } else {
                entry.target.classList.add('animate-out');
                entry.target.classList.remove('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.project-card, .skill-item, .stat-card, .contact-item');
    animatedElements.forEach(el => {
        el.classList.add('animate-out');
        observer.observe(el);
    });
}

// Form Validation and Submission
function initFormValidation() {
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Reset previous messages
            hideFormMessage();

            // Get form values
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();

            // Validate form
            const errors = validateForm(name, email, message);

            if (errors.length > 0) {
                showFormMessage(errors.join(', '), 'error');
                return;
            }

            // Show loading state
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.classList.add('loading');
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;

            // Send form to server endpoint that will email you (see server.js)
            fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, message })
            })
            .then(async (res) => {
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(text || 'Network response was not ok');
                }
                return res.json();
            })
            .then(data => {
                // Reset form
                contactForm.reset();

                // Show success message
                showFormMessage('Message sent successfully! I\'ll get back to you soon.', 'success');

                // Hide success message after 5 seconds
                setTimeout(() => {
                    hideFormMessage();
                }, 5000);
            })
            .catch(err => {
                console.error('Contact form error:', err);
                showFormMessage('Failed to send message. Please try again later.', 'error');
            })
            .finally(() => {
                // Remove loading state
                submitButton.classList.remove('loading');
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            });
        });

        // Add input validation feedback
        const inputs = contactForm.querySelectorAll('.form-input');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateSingleInput(this);
            });

            input.addEventListener('input', function() {
                if (this.classList.contains('error')) {
                    validateSingleInput(this);
                }
            });
        });
    }
}

// Validate Individual Input
function validateSingleInput(input) {
    const value = input.value.trim();
    const inputType = input.type;
    const inputId = input.id;

    input.classList.remove('error');

    if (value === '') {
        input.classList.add('error');
        return false;
    }

    if (inputType === 'email' && !isValidEmail(value)) {
        input.classList.add('error');
        return false;
    }

    if (inputId === 'message' && value.length < 10) {
        input.classList.add('error');
        return false;
    }

    return true;
}

// Validate Form
function validateForm(name, email, message) {
    const errors = [];

    if (name === '') {
        errors.push('Name is required');
        document.getElementById('name').classList.add('error');
    }

    if (email === '') {
        errors.push('Email is required');
        document.getElementById('email').classList.add('error');
    } else if (!isValidEmail(email)) {
        errors.push('Please enter a valid email');
        document.getElementById('email').classList.add('error');
    }

    if (message === '') {
        errors.push('Message is required');
        document.getElementById('message').classList.add('error');
    } else if (message.length < 10) {
        errors.push('Message must be at least 10 characters');
        document.getElementById('message').classList.add('error');
    }

    return errors;
}

// Email Validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show Form Message
function showFormMessage(message, type) {
    const formMessage = document.getElementById('formMessage');
    if (formMessage) {
        formMessage.textContent = message;
        formMessage.className = `form-message ${type}`;
        formMessage.style.display = 'block';

        // Add animation
        formMessage.style.animation = 'slideInUp 0.3s ease';
    }
}

// Hide Form Message
function hideFormMessage() {
    const formMessage = document.getElementById('formMessage');
    if (formMessage) {
        formMessage.style.display = 'none';
        formMessage.className = 'form-message';
    }
}

// Particle Animation System
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.particleCount = window.innerWidth < 768 ? 20 : 50; // Reduced on mobile
        this.container = document.getElementById('particles');
        this.init();
    }

    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';

        // Random properties
        const size = Math.random() * 3 + 1;
        const duration = Math.random() * 8 + 4; // 4-12 seconds
        const delay = Math.random() * 5;
        const startX = Math.random() * 100;
        const colors = ['#00e5ff', '#ff00ff', '#00ff00'];
        const color = colors[Math.floor(Math.random() * colors.length)];

        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${startX}%`;
        particle.style.background = color;
        particle.style.boxShadow = `0 0 ${size * 3}px ${color}`;
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `${delay}s`;

        return particle;
    }

    init() {
        if (!this.container) return;

        for (let i = 0; i < this.particleCount; i++) {
            const particle = this.createParticle();
            this.container.appendChild(particle);
            this.particles.push(particle);
        }
    }

    updateParticleCount() {
        const newCount = window.innerWidth < 768 ? 20 : 50;
        if (newCount !== this.particleCount && this.container) {
            // Clear existing particles
            this.container.innerHTML = '';
            this.particles = [];
            this.particleCount = newCount;
            this.init();
        }
    }
}

// Initialize Particle Animation
function initParticleAnimation() {
    const particleSystem = new ParticleSystem();

    // Update particles on resize
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            particleSystem.updateParticleCount();
        }, 250);
    });
}

// Code Rain Animation
function initCodeRain() {
    const codeRain = document.getElementById('codeRain');
    if (!codeRain) return;

    const codeSnippets = [
        'function create()',
        'const neon = true',
        'if (cyberpunk)',
        'return glitch',
        'async function',
        'await matrix',
        'import neon',
        'export default',
        'const portfolio',
        'class Developer',
        'extends Artist',
        'implements Creative'
    ];

    function createCodeLine() {
        const line = document.createElement('div');
        line.className = 'code-line';
        line.textContent = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
        line.style.left = `${Math.random() * 100}%`;
        line.style.animationDelay = `${Math.random() * 3}s`;
        line.style.animationDuration = `${Math.random() * 2 + 2}s`;

        return line;
    }

    // Create initial code lines
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const line = createCodeLine();
            codeRain.appendChild(line);

            // Remove line after animation
            setTimeout(() => {
                if (line.parentNode) {
                    line.parentNode.removeChild(line);
                }
            }, 4000);
        }, i * 300);
    }

    // Continue creating new lines
    setInterval(() => {
        const line = createCodeLine();
        codeRain.appendChild(line);

        setTimeout(() => {
            if (line.parentNode) {
                line.parentNode.removeChild(line);
            }
        }, 4000);
    }, 800);
}

// Typing Effect for Hero Subtitle
function initTypingEffect() {
    const subtitle = document.querySelector('.hero-subtitle');
    if (!subtitle) return;

    const text = subtitle.textContent;
    subtitle.textContent = '';
    subtitle.style.borderRight = '2px solid var(--neon-cyan)';

    let index = 0;
    function typeChar() {
        if (index < text.length) {
            subtitle.textContent += text.charAt(index);
            index++;
            setTimeout(typeChar, 50);
        } else {
            // Remove cursor after typing is complete
            setTimeout(() => {
                subtitle.style.borderRight = 'none';
            }, 1000);
        }
    }

    // Start typing after page load
    setTimeout(typeChar, 1000);
}

// Smooth Scroll to Section Function (for buttons)
function scrollToSection(sectionId) {
    const targetSection = document.querySelector(sectionId);
    if (targetSection) {
        const offsetTop = targetSection.offsetTop - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// Project Card Interactions
function initProjectCards() {
    const projectCards = document.querySelectorAll('.project-card');

    projectCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Don't trigger if clicking on links
            if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') {
                return;
            }

            // Toggle expanded view or show details
            this.classList.toggle('expanded');
        });

        const viewButtons = card.querySelectorAll('.view-project');
        viewButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                // Handle project detail view
                console.log('View project details');
            });
        });
    });
}

// Initialize project cards after DOM load
document.addEventListener('DOMContentLoaded', function() {
    initProjectCards();
});

// Keyboard Navigation Support
document.addEventListener('keydown', function(e) {
    // ESC key to close mobile menu
    if (e.key === 'Escape') {
        const navMenu = document.querySelector('.nav-menu');
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            if (mobileMenuToggle) {
                mobileMenuToggle.textContent = '☰';
            }
        }
    }

    // Tab key navigation improvements
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
    }
});

// Remove keyboard navigation class when using mouse
document.addEventListener('mousedown', function() {
    document.body.classList.remove('keyboard-navigation');
});

// Performance optimization - Throttle scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Apply throttling to scroll-intensive functions
window.addEventListener('scroll', throttle(function() {
    // Scroll-based operations that need throttling
}, 100));

// Error handling for JavaScript errors
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
    // You could add user-friendly error handling here
});

// Service Worker Registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // You can add service worker registration here
        // navigator.serviceWorker.register('/sw.js');
    });
}

// Analytics or tracking (placeholder)
function trackEvent(eventName, properties = {}) {
    // Add your analytics tracking here
    console.log('Event:', eventName, properties);
}

// Track page view
trackEvent('page_view', {
    page: window.location.pathname,
    title: document.title
});

// Track form submissions
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function() {
            trackEvent('form_submit', {
                form: 'contact'
            });
        });
    }
});

// Track project clicks
document.addEventListener('DOMContentLoaded', function() {
    const projectLinks = document.querySelectorAll('.project-link, .view-project');
    projectLinks.forEach(link => {
        link.addEventListener('click', function() {
            trackEvent('project_click', {
                project: this.closest('.project-card')?.querySelector('.project-title')?.textContent
            });
        });
    });
});