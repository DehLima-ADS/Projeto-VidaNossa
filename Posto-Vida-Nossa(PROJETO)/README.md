# Posto Vida Nossa — Sistema de Agendamentos (Frontend)

Projeto frontend com login simples (aceita qualquer nome e senha) e painel (dashboard.html).
Ideal para apresentação local ou subir no GitHub Pages.

## Como usar
1. Descompacte o ZIP.
2. Abra `index.html` no navegador ou use Live Server no VS Code.
3. Digite qualquer nome de usuário e qualquer senha e clique em Entrar.
4. Você será redirecionado para `dashboard.html`.

## Estrutura
- index.html         → Tela de login
- dashboard.html     → Painel com menu lateral fixo e seções (Dashboard, Agendamentos, Pacientes)
- css/style.css      → Estilos (tema hospitalar moderno)
- js/login.js        → Lógica do login (aceita qualquer nome e senha)
- js/dashboard.js    → Lógica do painel (nav, logout, controle de seções)
- img/icon.svg       → Ícone hospitalar no topo da barra lateral

## Observações
- Para apresentação: o login aceita qualquer nome e senha (não use em produção).
- Dados de pacientes/agendamentos são simulados (texto estático).
