// ── auth.js — Login Logic ──

const CREDENTIALS = {
  username: 'SLTIET ORGANISATION',
  password: 'DDcetSLTIET'
};

// Redirect if already logged in
if (sessionStorage.getItem('ddcet_auth') === 'true') {
  window.location.replace('dashboard.html');
}

function handleLogin() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const btn      = document.getElementById('login-btn');
  const loader   = document.getElementById('btn-loader');
  const card     = document.querySelector('.login-card');

  // Show loading
  loader.classList.add('show');
  btn.disabled = true;

  // Simulate brief auth delay for UX
  setTimeout(() => {
    loader.classList.remove('show');
    btn.disabled = false;

    if (username === CREDENTIALS.username && password === CREDENTIALS.password) {
      sessionStorage.setItem('ddcet_auth', 'true');
      // Fade out then redirect
      document.querySelector('.login-wrapper').style.animation = 'pageOut 0.3s ease forwards';
      setTimeout(() => window.location.replace('dashboard.html'), 280);
    } else {
      // Show error
      const alert = document.getElementById('error-alert');
      alert.classList.add('show');
      card.classList.add('shake');

      setTimeout(() => {
        alert.classList.remove('show');
        card.classList.remove('shake');
      }, 4000);

      document.getElementById('password').value = '';
      document.getElementById('password').focus();
    }
  }, 600);
}

function togglePassword() {
  const field   = document.getElementById('password');
  const showSVG = document.getElementById('eye-show');
  const hideSVG = document.getElementById('eye-hide');

  if (field.type === 'password') {
    field.type = 'text';
    showSVG.style.display = 'none';
    hideSVG.style.display = 'block';
  } else {
    field.type = 'password';
    showSVG.style.display = 'block';
    hideSVG.style.display = 'none';
  }
}

// Enter key support
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleLogin();
});

// Add page-out animation keyframe dynamically
const style = document.createElement('style');
style.textContent = `
  @keyframes pageOut {
    to { opacity: 0; transform: translateY(-20px); }
  }
`;
document.head.appendChild(style);