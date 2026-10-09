// Live JSON preview reflecting the contact form as it's filled in
const preloader = document.getElementById('preloader');

function finishLoading() {
    const minimumDisplayTime = 2000;
    const elapsed = performance.now() - (window.__pageLoadStartedAt || performance.now());
    const wait = Math.max(0, minimumDisplayTime - elapsed);

    window.setTimeout(() => {
        document.documentElement.classList.remove('is-loading');
        document.documentElement.classList.add('is-ready');
        if (preloader) preloader.setAttribute('aria-hidden', 'true');
    }, wait);
}

if (document.readyState === 'complete') {
    finishLoading();
} else {
    window.addEventListener('load', finishLoading, { once: true });
}

// Subtle entrance motion, active section links, and reading progress.
const revealItems = document.querySelectorAll(
    '.section-head, .about-grid, .skill-card, .log-entry, .project-card, .contact-grid'
);

if ('IntersectionObserver' in window) {
    document.documentElement.classList.add('has-reveal');

    revealItems.forEach((item, index) => {
        item.setAttribute('data-reveal', '');
        const siblings = [...item.parentElement.children].filter(child =>
            child.matches('.skill-card, .log-entry, .project-card')
        );
        if (siblings.length > 1) {
            item.style.setProperty('--reveal-delay', `${(siblings.indexOf(item) % 4) * 90}ms`);
        }
    });

    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });

    revealItems.forEach(item => revealObserver.observe(item));

    const sectionLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
    const observedSections = sectionLinks
        .filter(link => link.getAttribute('href').length > 1)
        .map(link => document.getElementById(link.getAttribute('href').slice(1)))
        .filter(Boolean);

    const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            sectionLinks.forEach(link => {
                if (link.getAttribute('href') === `#${entry.target.id}`) {
                    link.setAttribute('aria-current', 'location');
                } else {
                    link.removeAttribute('aria-current');
                }
            });
        });
    }, { rootMargin: '-30% 0px -60% 0px' });

    observedSections.forEach(section => sectionObserver.observe(section));
} else {
    revealItems.forEach(item => item.classList.add('is-visible'));
}

const progressBar = document.getElementById('readingProgress');
const header = document.querySelector('header');
const backToTop = document.querySelector('.back-to-top');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
let scrollUpdateQueued = false;

function setNavigationOpen(open) {
    if (!navToggle || !navLinks) return;
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    navLinks.classList.toggle('is-open', open);
}

if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
        setNavigationOpen(navToggle.getAttribute('aria-expanded') !== 'true');
    });

    navLinks.addEventListener('click', event => {
        if (event.target instanceof Element && event.target.closest('.nav-close')) {
            setNavigationOpen(false);
            navToggle.focus();
        }
    });

    document.addEventListener('click', event => {
        if (event.target instanceof Node &&
            !navLinks.contains(event.target) &&
            !navToggle.contains(event.target)) {
            setNavigationOpen(false);
        }
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
            setNavigationOpen(false);
            navToggle.focus();
        }
    });

    const desktopNavigation = window.matchMedia('(min-width: 921px)');
    const closeNavigationOnDesktop = event => {
        if (event.matches) setNavigationOpen(false);
    };

    if (desktopNavigation.addEventListener) {
        desktopNavigation.addEventListener('change', closeNavigationOnDesktop);
    } else {
        desktopNavigation.addListener(closeNavigationOnDesktop);
    }
}

function updateScrollUI() {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;

    if (progressBar) progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 12);
    if (backToTop) backToTop.classList.toggle('is-visible', window.scrollY > 500);
    scrollUpdateQueued = false;
}

window.addEventListener('scroll', () => {
    if (!scrollUpdateQueued) {
        scrollUpdateQueued = true;
        window.requestAnimationFrame(updateScrollUI);
    }
}, { passive: true });
updateScrollUI();

const form = document.getElementById('contactForm');
const preview = document.getElementById('jsonPreview');

// دالة تنظيف آمنة ضد الثغرات (HTML Escape)
function esc(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function updatePreview() {
    const name = esc(document.getElementById('fname').value.trim());
    const email = esc(document.getElementById('femail').value.trim());
    const message = esc(document.getElementById('fmsg').value.trim());

    preview.innerHTML = `{
  <span class="k">"name"</span>: <span class="s">"${name}"</span>,
  <span class="k">"email"</span>: <span class="s">"${email}"</span>,
  <span class="k">"message"</span>: <span class="s">"${message}"</span>
}`;
}

// الاستماع لمدخلات النموذج بشكل موحد
['fname', 'femail', 'fmsg'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updatePreview);
});

// التعامل مع حدث الإرسال بشكل واقعي (Pending -> Success)
form.addEventListener('submit', function (e) {
    e.preventDefault();
    const btn = form.querySelector('button');
    const originalText = btn.textContent;

    // حالة الإرسال (Pending Request)
    btn.textContent = 'Sending...';
    btn.disabled = true;
    btn.style.opacity = '0.7';

    // محاكاة استجابة الـ API (Network Request Simulation)
    setTimeout(() => {
        btn.textContent = '201 Created ✓';
        btn.style.background = '#3FBE5C';
        btn.style.borderColor = '#3FBE5C';
        btn.style.opacity = '1';

        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
            btn.style.borderColor = '';
            btn.disabled = false;
            form.reset();
            updatePreview();
        }, 2000);
    }, 1000);
});
