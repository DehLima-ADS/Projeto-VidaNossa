// Login script: accepts any non-empty username AND any non-empty password.
document.getElementById('login-form').addEventListener('submit', function(e){
  e.preventDefault();
  const user = document.getElementById('username').value.trim();
  const pass = document.getElementById('password').value;
  if(!user || !pass){
    alert('Preencha usuário e senha.');
    return;
  }
  // Save to session and redirect to dashboard
  sessionStorage.setItem('pv_user', JSON.stringify({ username: user }));
  window.location.href = 'dashboard.html';
});
