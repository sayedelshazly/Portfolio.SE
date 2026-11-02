// ============================================================
// Theme
// Keeps the saved preference, follows the OS when none is set.
// ============================================================
const themeToggle = document.getElementById('themeToggle');
const themePreference = window.matchMedia('(prefers-color-scheme: light)');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let hasExplicitTheme = false;

try {
    hasExplicitTheme = ['light', 'dark'].includes(localStorage.getItem('portfolio-theme'));
} catch {
    hasExplicitTheme = true;
}

function setTheme(theme, persist = false) {
    const selectedTheme = theme === 'light' ? 'light' : 'dark';
    document.documentElement.dataset.theme = selectedTheme;

    if (themeToggle) {
        const nextTheme = selectedTheme === 'light' ? 'dark' : 'light';
        const label = `Switch to ${nextTheme} mode`;
        themeToggle.setAttribute('aria-label', label);
        themeToggle.title = label;
    }

    if (persist) {
        hasExplicitTheme = true;
        try {
            localStorage.setItem('portfolio-theme', selectedTheme);
        } catch {
            // Keep the selected theme for this page view when storage is unavailable.
        }
    }
}

if (themeToggle) {
    setTheme(document.documentElement.dataset.theme || 'dark');
    themeToggle.addEventListener('click', () => {
        setTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light', true);
    });
}

const updateSystemTheme = event => {
    if (!hasExplicitTheme) setTheme(event.matches ? 'light' : 'dark');
};

if (themePreference.addEventListener) {
    themePreference.addEventListener('change', updateSystemTheme);
} else {
    themePreference.addListener(updateSystemTheme);
}

window.addEventListener('storage', event => {
    if (event.key !== 'portfolio-theme') return;
    if (event.newValue === 'light' || event.newValue === 'dark') {
        hasExplicitTheme = true;
        setTheme(event.newValue);
    } else if (event.newValue === null) {
        hasExplicitTheme = false;
        setTheme(themePreference.matches ? 'light' : 'dark');
    }
});

// ============================================================
// Preloader
// A short branded beat, not a fixed wait: the page is revealed as
// soon as it is ready, never later than the minimum.
// ============================================================
const preloader = document.getElementById('preloader');

function finishLoading() {
    const minimumDisplayTime = 520;
    const elapsed = performance.now() - (window.__pageLoadStartedAt || performance.now());
    const wait = Math.max(0, minimumDisplayTime - elapsed);

    window.setTimeout(() => {
        document.documentElement.classList.remove('is-loading');
        document.documentElement.classList.add('is-ready');
        if (preloader) preloader.setAttribute('aria-hidden', 'true');
        document.dispatchEvent(new CustomEvent('site:ready'));
    }, wait);
}

if (document.readyState === 'complete') {
    finishLoading();
} else {
    window.addEventListener('load', finishLoading, { once: true });
}

// ============================================================
// Navigation
// ============================================================
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

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
        if (!(event.target instanceof Element)) return;

        if (event.target.closest('.nav-close')) {
            setNavigationOpen(false);
            navToggle.focus();
            return;
        }

        if (event.target.closest('a')) setNavigationOpen(false);
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

// ============================================================
// Scroll UI
// Reading progress, sticky header, back-to-top, and the
// experience rail that fills as the section passes by.
// ============================================================
const progressBar = document.getElementById('readingProgress');
const header = document.querySelector('header');
const backToTop = document.querySelector('.back-to-top');
const experienceLog = document.querySelector('.log');
const navSections = [...document.querySelectorAll('.nav-links a[href^="#"]')]
    .filter(link => link.getAttribute('href').length > 1)
    .map(link => ({ link, target: document.getElementById(link.getAttribute('href').slice(1)) }))
    .filter(item => item.target);
let scrollUpdateQueued = false;

function updateScrollUI() {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;

    if (progressBar) progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 12);
    if (backToTop) backToTop.classList.toggle('is-visible', window.scrollY > 500);

    if (experienceLog) {
        const rect = experienceLog.getBoundingClientRect();
        const start = window.innerHeight * 0.85;
        const travelled = start - rect.top;
        const rail = Math.min(1, Math.max(0, travelled / Math.max(rect.height, 1)));
        experienceLog.style.setProperty('--log-progress', rail.toFixed(4));
    }

    if (navSections.length) {
        const readingLine = window.innerHeight * 0.38;
        const current = navSections.find(({ target }) => {
            const rect = target.getBoundingClientRect();
            return rect.top <= readingLine && rect.bottom > readingLine;
        });
        navSections.forEach(({ link }) => {
            if (current && link === current.link) {
                link.setAttribute('aria-current', 'location');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }

    scrollUpdateQueued = false;
}

window.addEventListener('scroll', () => {
    if (!scrollUpdateQueued) {
        scrollUpdateQueued = true;
        window.requestAnimationFrame(updateScrollUI);
    }
}, { passive: true });

window.addEventListener('resize', () => {
    if (!scrollUpdateQueued) {
        scrollUpdateQueued = true;
        window.requestAnimationFrame(updateScrollUI);
    }
}, { passive: true });

updateScrollUI();

// ============================================================
// Entrance motion
// One observer drives every revealed block so the page keeps a
// single motion vocabulary.
// ============================================================
const revealItems = document.querySelectorAll(
    '.section-head, .about-grid, .skill-card, .log-entry, .project-card, .contact-grid, .journal-intro, .journal-feature, .journal-category, .journal-article, .fact-list'
);

if ('IntersectionObserver' in window) {
    document.documentElement.classList.add('has-reveal');

    revealItems.forEach(item => {
        item.setAttribute('data-reveal', '');
        const siblings = [...item.parentElement.children].filter(child =>
            child.matches('.skill-card, .log-entry, .project-card, .journal-article')
        );
        if (siblings.length > 1) {
            item.style.setProperty('--reveal-delay', `${(siblings.indexOf(item) % 4) * 80}ms`);
        }
    });

    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealItems.forEach(item => revealObserver.observe(item));
} else {
    revealItems.forEach(item => item.classList.add('is-visible'));
}

// ============================================================
// Stat count-up
// Runs once, when the numbers are actually on screen.
// ============================================================
const counters = document.querySelectorAll('[data-count]');

function runCounter(el) {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    if (!Number.isFinite(target)) return;

    if (reduceMotion.matches) {
        el.textContent = `${target}${suffix}`;
        return;
    }

    const duration = 900;
    const startTime = performance.now();

    function tick(now) {
        const elapsed = Math.min(1, (now - startTime) / duration);
        const eased = 1 - Math.pow(1 - elapsed, 3);
        el.textContent = `${Math.round(target * eased)}${suffix}`;
        if (elapsed < 1) window.requestAnimationFrame(tick);
    }

    el.textContent = `0${suffix}`;
    window.requestAnimationFrame(tick);
}

if (counters.length) {
    if ('IntersectionObserver' in window) {
        const counterObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                runCounter(entry.target);
                counterObserver.unobserve(entry.target);
            });
        }, { threshold: 0.6 });

        counters.forEach(counter => counterObserver.observe(counter));
    } else {
        counters.forEach(runCounter);
    }
}

// ============================================================
// Contact form
// The JSON panel mirrors the request body; the button reflects
// the request lifecycle.
// ============================================================
const form = document.getElementById('contactForm');
const preview = document.getElementById('jsonPreview');

function esc(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function updatePreview() {
    if (!preview) return;
    const nameField = document.getElementById('fname');
    const emailField = document.getElementById('femail');
    const messageField = document.getElementById('fmsg');
    if (!nameField || !emailField || !messageField) return;

    const name = esc(nameField.value.trim());
    const email = esc(emailField.value.trim());
    const message = esc(messageField.value.trim());

    preview.innerHTML = `{
  <span class="k">"name"</span>: <span class="v">"${name}"</span>,
  <span class="k">"email"</span>: <span class="v">"${email}"</span>,
  <span class="k">"message"</span>: <span class="v">"${message}"</span>
}`;
}

['fname', 'femail', 'fmsg'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updatePreview);
});

if (form) {
    form.addEventListener('submit', event => {
        event.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        if (!btn) return;

        const originalContent = btn.innerHTML;
        btn.disabled = true;
        btn.textContent = 'Sending…';

        window.setTimeout(() => {
            btn.classList.add('is-sent');
            btn.textContent = '201 Created ✓';

            window.setTimeout(() => {
                btn.classList.remove('is-sent');
                btn.innerHTML = originalContent;
                btn.disabled = false;
                form.reset();
                updatePreview();
            }, 2200);
        }, 900);
    });
}
