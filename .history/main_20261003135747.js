    // Live JSON preview reflecting the contact form as it's filled in
    const form = document.getElementById('contactForm');
const preview = document.getElementById('jsonPreview');

function esc(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function updatePreview() {
    const name = esc(document.getElementById('fname').value);
    const email = esc(document.getElementById('femail').value);
    const message = esc(document.getElementById('fmsg').value);
    preview.innerHTML = `{
  <span class="k">"name"</span>: <span class="v">"${name}"</span>,
  <span class="k">"email"</span>: <span class="v">"${email}"</span>,
  <span class="k">"message"</span>: <span class="v">"${message}"</span>
}`;
}
['fname', 'femail', 'fmsg'].forEach(id => {
    document.getElementById(id).addEventListener('input', updatePreview);
});

form.addEventListener('submit', function (e) {
    e.preventDefault();
    const btn = form.querySelector('button');
    const original = btn.textContent;
    btn.textContent = '202 Accepted ✓';
    btn.style.background = '#3FBE5C';
    btn.style.borderColor = '#3FBE5C';
    setTimeout(() => {
        btn.textContent = original;
        btn.style.background = '';
        btn.style.borderColor = '';
        form.reset();
        updatePreview();
    }, 2200);
}); <