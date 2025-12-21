// ===========================
// NAVIGATION SCROLL EFFECT
// ===========================
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
});

// ===========================
// MOBILE MENU TOGGLE
// ===========================
const mobileToggle = document.getElementById('mobileToggle');
const navLinks = document.getElementById('navLinks');

if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileToggle.classList.toggle('active');
    });
}

// ===========================
// SMOOTH SCROLL FOR NAVIGATION
// ===========================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));

        if (target) {
            const offsetTop = target.offsetTop - 80;

            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });

            // Update active nav link
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });

            if (this.classList.contains('nav-link')) {
                this.classList.add('active');
            }

            // Close mobile menu if open
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                mobileToggle.classList.remove('active');
            }
        }
    });
});

// ===========================
// PRICING PLAN TOGGLE
// ===========================
const toggleButtons = document.querySelectorAll('.toggle-btn');
const textPlans = document.querySelectorAll('.text-plan');
const allPlans = document.querySelectorAll('.all-plan');

toggleButtons.forEach(button => {
    button.addEventListener('click', () => {
        const planType = button.dataset.plan;

        // Update active button
        toggleButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Show/hide plans with smooth fade animation
        if (planType === 'text') {
            // Fade out all plans first
            allPlans.forEach(plan => {
                plan.style.opacity = '0';
                plan.style.transform = 'translateY(20px)';
            });

            // Wait for fade out animation, then hide and show
            setTimeout(() => {
                allPlans.forEach(plan => {
                    plan.style.display = 'none';
                });

                textPlans.forEach(plan => {
                    plan.style.display = 'block';
                    // Force reflow
                    plan.offsetHeight;
                    plan.style.opacity = '1';
                    plan.style.transform = 'translateY(0)';
                });
            }, 300);
        } else {
            // Fade out text plans first
            textPlans.forEach(plan => {
                plan.style.opacity = '0';
                plan.style.transform = 'translateY(20px)';
            });

            // Wait for fade out animation, then hide and show
            setTimeout(() => {
                textPlans.forEach(plan => {
                    plan.style.display = 'none';
                });

                allPlans.forEach(plan => {
                    plan.style.display = 'block';
                    // Force reflow
                    plan.offsetHeight;
                    plan.style.opacity = '1';
                    plan.style.transform = 'translateY(0)';
                });
            }, 300);
        }
    });
});


// ===========================
// DOCUMENTATION CODE TABS
// ===========================
const docTabs = document.querySelectorAll('.doc-tab');
const codeExamples = document.querySelectorAll('.code-example');

docTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const lang = tab.dataset.lang;

        // Update active tab
        docTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Show corresponding code example
        codeExamples.forEach(example => {
            if (example.dataset.lang === lang) {
                example.classList.add('active');
            } else {
                example.classList.remove('active');
            }
        });
    });
});

// ===========================
// COPY CODE FUNCTIONALITY
// ===========================
function copyCode(button) {
    const codeBlock = button.closest('.code-example').querySelector('code');
    const textToCopy = codeBlock.textContent;

    navigator.clipboard.writeText(textToCopy).then(() => {
        // Change button text
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        button.style.background = 'rgba(37, 211, 102, 0.2)';

        // Reset after 2 seconds
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.style.background = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy code');
    });
}

// ===========================
// FAQ ACCORDION
// ===========================
const faqQuestions = document.querySelectorAll('.faq-question');

faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
        const faqItem = question.parentElement;
        const isActive = faqItem.classList.contains('active');

        // Close all FAQ items
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
        });

        // Open clicked item if it wasn't active
        if (!isActive) {
            faqItem.classList.add('active');
        }
    });
});

// ===========================
// SCROLL ANIMATIONS
// ===========================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all animated elements
const animatedElements = document.querySelectorAll('.feature-card, .pricing-card, .faq-item');
animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
});

// ===========================
// CHAT SIMULATION
// ===========================
function simulateChat() {
    const messages = document.querySelectorAll('.message');
    let delay = 1000;

    messages.forEach((message, index) => {
        message.style.opacity = '0';

        setTimeout(() => {
            message.style.opacity = '1';
        }, delay * (index + 1));
    });
}

// Start chat simulation when page loads
window.addEventListener('load', () => {
    setTimeout(simulateChat, 1000);

    // Repeat every 10 seconds
    setInterval(simulateChat, 10000);
});

// ===========================
// STATS COUNTER ANIMATION
// ===========================
function animateValue(element, start, end, duration, suffix = '') {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            element.textContent = formatNumber(end) + suffix;
            clearInterval(timer);
        } else {
            element.textContent = formatNumber(Math.floor(current)) + suffix;
        }
    }, 16);
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
}

// Animate stats when they come into view
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
            entry.target.classList.add('animated');

            const statNumbers = entry.target.querySelectorAll('.stat-number');
            statNumbers.forEach((stat, index) => {
                const text = stat.textContent;
                const isPercentage = text.includes('%');
                const value = parseFloat(text.replace(/[^0-9.]/g, ''));

                if (isPercentage) {
                    animateValue(stat, 0, value, 2000, '%');
                } else if (text.includes('K')) {
                    animateValue(stat, 0, value * 1000, 2000);
                } else if (text.includes('M')) {
                    animateValue(stat, 0, value * 1000000, 2000);
                } else {
                    animateValue(stat, 0, value, 2000);
                }
            });
        }
    });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
    statsObserver.observe(heroStats);
}

// ===========================
// PARALLAX EFFECT
// ===========================
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.floating-card');

    parallaxElements.forEach((element, index) => {
        const speed = 0.5 + (index * 0.2);
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px)`;
    });
});

// ===========================
// FORM VALIDATION (IF NEEDED)
// ===========================
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// ===========================
// LAZY LOADING IMAGES
// ===========================
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ===========================
// PERFORMANCE OPTIMIZATION
// ===========================
// Debounce function for scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===========================
// ANALYTICS TRACKING (OPTIONAL)
// ===========================
function trackEvent(category, action, label) {
    // Implement your analytics tracking here
    console.log('Event tracked:', category, action, label);
}

// Track button clicks
document.querySelectorAll('.btn-primary').forEach(button => {
    button.addEventListener('click', () => {
        trackEvent('Button', 'Click', button.textContent.trim());
    });
});

// ===========================
// CONSOLE MESSAGE
// ===========================
console.log('%c🚀 WA Gateway API', 'color: #25D366; font-size: 24px; font-weight: bold;');
console.log('%cDeveloped with ❤️ for Indonesian Businesses', 'color: #128C7E; font-size: 14px;');
console.log('%cInterested in our API? Visit https://wagateway.com', 'color: #666; font-size: 12px;');
