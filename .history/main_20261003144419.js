// Live JSON preview reflecting the contact form as it's filled in
const preloader = document.getElementById('preloader');

function finishLoading() {
    const minimumDisplayTime = 1500;
    const elapsed = performance.now() - (window.__pageLoadStartedAt || performance.now());
    const wait = Math.max(0, minimumDisplayTime - elapsed);

    window.setTimeout(() => {
        document.documentElement.classList.remove('is-loading');
        if (preloader) preloader.setAttribute('aria-hidden', 'true');
    }, wait);
}

if (document.readyState === 'complete') {
    finishLoading();
} else {
    window.addEventListener('load', finishLoading, { once: true });
}

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
