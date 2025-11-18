/* script.js
   Controle de sessão, agendamentos e usuários online.
   Salva tudo em localStorage e usa sessionStorage para sessão corrente.
*/

(function(){
  // helpers
  function getLocal(key, def){ try{ const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; }catch(e){ return def; } }
  function setLocal(key,val){ localStorage.setItem(key, JSON.stringify(val)); }
  function uid(){ return 'id-' + Math.random().toString(36).slice(2,9); }
  function formatDateIso(iso){ if(!iso) return ''; const d = new Date(iso); return d.toLocaleString(); }

  // Sessão
  const currentUser = sessionStorage.getItem('currentUser');
  const isAdmin = sessionStorage.getItem('isAdmin') === 'true';

  if(!currentUser){
    // redireciona para login se não estiver logado
    location.href = 'index.html';
  }

  // Elementos
  const currentUserName = document.getElementById('currentUserName');
  const btnLogoutTop = document.getElementById('logoutTop');
  const btnLogoutSidebar = document.getElementById('btn-logout');
  const indicatorPacientes = document.getElementById('indicator-pacientes');
  const indicatorAgend = document.getElementById('indicator-agend');
  const indicatorProximos = document.getElementById('indicator-proximos');

  const formAgenda = document.getElementById('formAgenda');
  const inputNome = document.getElementById('inputNome');
  const inputTipo = document.getElementById('inputTipo');
  const inputData = document.getElementById('inputData');
  const inputHora = document.getElementById('inputHora');
  const tbodyAgend = document.getElementById('tbodyAgend');
  const onlineList = document.getElementById('onlineList');
  const loginHistoryDiv = document.getElementById('loginHistory');
  const btnCancelarEdicao = document.getElementById('btnCancelarEdicao');

  let editingId = null;

  // Atualiza nome no header
  currentUserName.textContent = currentUser + (isAdmin ? ' (ADM)' : '');

  // Logout
  function doLogout(){
    // remove dos online
    const online = getLocal('onlineUsers', []);
    const newOnline = online.filter(u => u !== currentUser);
    setLocal('onlineUsers', newOnline);

    // limpa sessão
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('isAdmin');

    // voltar ao login
    location.href = 'index.html';
  }
  btnLogoutTop.addEventListener('click', doLogout);
  if(btnLogoutSidebar) btnLogoutSidebar.addEventListener('click', doLogout);

  // Carrega e exibe online / histórico
  function renderOnline(){
    const online = getLocal('onlineUsers', []);
    onlineList.innerHTML = '';
    if(online.length === 0){
      onlineList.innerHTML = '<div class="small">Nenhum usuário online</div>';
      return;
    }
    online.forEach(u => {
      const div = document.createElement('div');
      div.className = 'user-line';
      div.innerHTML = `<div class="dot"></div><div style="font-weight:600">${u}</div><div style="margin-left:auto;font-size:12px;color:${u===currentUser? '#0b7a63':'#6b7280'}">${u===currentUser? 'Você' : ''}</div>`;
      onlineList.appendChild(div);
    });
    // indicadores de pacientes (simulado): número de usuários online como "pacientes cadastrados"
    indicatorPacientes.textContent = online.length;
  }

  function renderHistory(){
    const history = getLocal('loginHistory', []);
    loginHistoryDiv.innerHTML = '';
    if(history.length === 0){
      loginHistoryDiv.innerHTML = '<div class="small">Nenhum login registrado</div>';
      return;
    }
    history.slice(0,8).forEach(h => {
      const el = document.createElement('div');
      el.className = 'small';
      const t = new Date(h.time);
      el.innerHTML = `<div style="padding:6px 0;border-bottom:1px solid #eef3f7">${h.user} • ${t.toLocaleString()}</div>`;
      loginHistoryDiv.appendChild(el);
    });
  }

  // Agendamentos: carregar, salvar, renderizar
  function carregarAgend(){
    return getLocal('agendamentos', []);
  }
  function salvarAgend(lista){
    setLocal('agendamentos', lista);
    renderAgendamentos();
  }

  function renderAgendamentos(){
    const lista = carregarAgend();
    tbodyAgend.innerHTML = '';
    if(lista.length === 0){
      tbodyAgend.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#6b7280;padding:18px">Nenhum agendamento</td></tr>`;
      indicatorAgend.textContent = 0;
      indicatorProximos.textContent = 0;
      return;
    }

    // calcula proximos 7 dias
    const now = new Date();
    const in7 = new Date(); in7.setDate(now.getDate()+7);
    let proximosCount = 0;

    lista.forEach(item => {
      const tr = document.createElement('tr');
      const dateStr = item.data;
      const timeStr = item.hora;
      const combined = dateStr && timeStr ? new Date(`${dateStr}T${timeStr}`) : null;
      if(combined && combined >= now && combined <= in7) proximosCount++;

      tr.innerHTML = `
        <td>${item.nome}</td>
        <td>${item.tipo}</td>
        <td>${item.data || '-'}</td>
        <td>${item.hora || '-'}</td>
        <td>${item.criadoPor || '-'}</td>
        <td class="actions"></td>
      `;

      // ações: editar/excluir (visível somente para admin)
      const actionsTd = tr.querySelector('td.actions');
      if(isAdmin){
        const btnEdit = document.createElement('button');
        btnEdit.textContent = 'Editar';
        btnEdit.style.marginRight = '8px';
        btnEdit.addEventListener('click', () => startEdit(item.id));

        const btnDel = document.createElement('button');
        btnDel.textContent = 'Excluir';
        btnDel.addEventListener('click', () => {
          if(confirm('Confirma exclusão deste agendamento?')){
            excluirAgendamento(item.id);
          }
        });

        actionsTd.appendChild(btnEdit);
        actionsTd.appendChild(btnDel);
      } else {
        actionsTd.innerHTML = `<span class="pill">Sem permissão</span>`;
      }

      tbodyAgend.appendChild(tr);
    });

    indicatorAgend.textContent = lista.length;
    indicatorProximos.textContent = proximosCount;
  }

  // criar
  formAgenda.addEventListener('submit', function(e){
    e.preventDefault();
    const nome = inputNome.value.trim();
    const tipo = inputTipo.value;
    const data = inputData.value;
    const hora = inputHora.value;

    if(!nome || !data || !hora){
      alert('Preencha Nome, Data e Hora.');
      return;
    }

    const lista = carregarAgend();

    if(editingId){
      // editar (apenas ADM faz a edição pelo botão editar, mas edição via formulário também respeita permissão)
      if(!isAdmin){
        alert('Somente ADM pode editar agendamentos.');
        return;
      }
      const idx = lista.findIndex(a => a.id === editingId);
      if(idx === -1){ alert('Agendamento não encontrado'); resetForm(); return; }
      lista[idx].nome = nome;
      lista[idx].tipo = tipo;
      lista[idx].data = data;
      lista[idx].hora = hora;
      lista[idx].editadoEm = new Date().toISOString();
      salvarAgend(lista);
      editingId = null;
      btnCancelarEdicao.style.display = 'none';
      document.getElementById('btnSalvar').textContent = 'Marcar agendamento';
    } else {
      // criar
      const novo = {
        id: uid(),
        nome,
        tipo,
        data,
        hora,
        criadoPor: currentUser,
        criadoEm: new Date().toISOString()
      };
      lista.push(novo);
      salvarAgend(lista);
    }

    resetForm();
  });

  function startEdit(id){
    if(!isAdmin){
      alert('Somente ADM pode editar.');
      return;
    }
    const lista = carregarAgend();
    const item = lista.find(a => a.id === id);
    if(!item){ alert('Agendamento não encontrado'); return; }
    inputNome.value = item.nome;
    inputTipo.value = item.tipo;
    inputData.value = item.data;
    inputHora.value = item.hora;
    editingId = id;
    btnCancelarEdicao.style.display = 'inline-block';
    document.getElementById('btnSalvar').textContent = 'Salvar alterações';
    window.scrollTo({top:0, behavior:'smooth'});
  }

  btnCancelarEdicao.addEventListener('click', function(){
    editingId = null;
    resetForm();
    btnCancelarEdicao.style.display = 'none';
    document.getElementById('btnSalvar').textContent = 'Marcar agendamento';
  });

  function excluirAgendamento(id){
    if(!isAdmin){ alert('Somente ADM pode excluir.'); return; }
    let lista = carregarAgend();
    lista = lista.filter(a => a.id !== id);
    salvarAgend(lista);
  }

  function resetForm(){
    formAgenda.reset();
  }

  // Inicializações
  function boot(){
    // Se não existir lista inicial, cria vazia
    if(!localStorage.getItem('agendamentos')) setLocal('agendamentos', []);
    if(!localStorage.getItem('onlineUsers')) setLocal('onlineUsers', getLocal('onlineUsers', []));
    if(!localStorage.getItem('loginHistory')) setLocal('loginHistory', getLocal('loginHistory', []));

    renderOnline();
    renderHistory();
    renderAgendamentos();

    // atualiza online a cada 10s (simulação)
    setInterval(renderOnline, 10000);
  }

  boot();

  // se fechar a aba, remover dos online (tentativa)
  window.addEventListener('beforeunload', function(){
    const online = getLocal('onlineUsers', []);
    const newOnline = online.filter(u => u !== currentUser);
    setLocal('onlineUsers', newOnline);
  });

})();
// Navegação entre seções do painel
const menuLinks = document.querySelectorAll('.sidebar ul li a[data-section]');
const sections = document.querySelectorAll('.section');

menuLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = link.getAttribute('data-section');

    // Atualiza visual do menu
    menuLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');

    // Mostra a seção correspondente
    sections.forEach(sec => sec.classList.remove('active'));
    document.getElementById(target).classList.add('active');
  });
});
