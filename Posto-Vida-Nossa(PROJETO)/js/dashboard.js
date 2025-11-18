// Dashboard navigation and session check
(function(){
  const user = JSON.parse(sessionStorage.getItem('pv_user') || 'null');
  if(!user){
    // not logged in -> redirect to login
    window.location.href = 'index.html';
    return;
  }
  // personalize (optional) - show username in title
  const title = document.querySelector('.sidebar h3');
  if(title) title.textContent = 'Posto Vida Nossa — ' + (user.username || '');
  const counts = { pacientes:12, agendamentos:8, proximos:3 };
  document.getElementById('count-pacientes').textContent = counts.pacientes;
  document.getElementById('count-agendamentos').textContent = counts.agendamentos;
  document.getElementById('count-proximos').textContent = counts.proximos;

  // nav buttons
  document.querySelectorAll('#nav-menu button[data-target]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('#nav-menu button').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.dataset.target;
      document.querySelectorAll('.card.section').forEach(s=>s.style.display = 'none');
      const el = document.getElementById(target);
      if(el) el.style.display = '';
    });
  });

  // logout
  document.getElementById('btn-logout').addEventListener('click', ()=>{
    sessionStorage.removeItem('pv_user');
    window.location.href = 'index.html';
  });
})();
