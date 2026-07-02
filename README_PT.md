# IP_RJP

**Deslocações • Prevenções BT/CC**

Autor: **Rui Jorge Pedro**  
Infraestruturas de Portugal  
© 2026

## O que inclui esta reorganização

- Projeto reorganizado por módulos.
- Cabeçalho limpo: `IP_RJP` e `Deslocações • Prevenções BT/CC`.
- Menu **Sobre** com autor, Infraestruturas de Portugal e © 2026.
- Gestão de deslocações.
- Prevenções apenas **BT** ou **CC**.
- Atividades profissionais.
- Viaturas pré-carregadas:
  - `03-ZQ-46` — Fiat — Branco — Viatura de serviço.
  - `23-ZP-64` — Renault Kangoo — Branco — Viatura de serviço.
  - `87-HN-72` — Mitsubishi L200 DI-D — Branco — Pick-up de serviço.
- Fotografias das viaturas incluídas em `public/vehicles`.
- Exportação mensal em PDF, CSV e Excel.
- Área Outlook preparada para Client ID e Tenant ID.
- GitHub Actions para WebApp e Android.
- Android recriado automaticamente no workflow para evitar erro de `gradlew` em falta.

## Upload para GitHub

Extrai o ZIP e envia os ficheiros soltos para o repositório:

- `src`
- `public`
- `resources`
- `.github`
- `package.json`
- `vite.config.js`
- `capacitor.config.ts`
- `index.html`

Não é necessário enviar pasta `android`; o workflow cria-a automaticamente.
