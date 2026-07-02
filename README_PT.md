# IP_RJP Professional 1.0

Aplicação profissional para registo de **deslocações** e **prevenções BT/CC**, pensada para apoio ao preenchimento mensal de abonos.

## Inclui

- Dashboard mensal
- Calendário mensal com marcações
- Vista semanal
- Vista diária
- Agenda com pesquisa e filtros
- Registo de deslocações
- Registo de prevenções BT ou CC
- Editar, apagar e duplicar registos
- Viaturas favoritas
- Destinos frequentes
- Perfis de horário
- Exportação PDF
- Exportação CSV
- Exportação Excel XLSX
- Backup/restauro JSON
- Preparação para Outlook / Microsoft 365
- WebApp/PWA
- Build Android por GitHub Actions
- Ícones Android/PWA integrados

## Instalação

```bash
npm install --no-audit --no-fund --legacy-peer-deps
npm run build
```

## Android

```bash
npx cap add android
npx cap sync android
cd android
./gradlew assembleDebug
```

Ou usa o workflow:

`.github/workflows/build-android.yml`

## Publicar WebApp

O projeto é Vite. Depois de `npm run build`, a pasta gerada é `dist`.

## Outlook

A área de definições já tem campos para `Tenant ID` e `Client ID`. A ligação real ao Microsoft Graph fica preparada para a próxima evolução.
