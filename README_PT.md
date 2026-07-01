# IP_RJP v2.0

Aplicação profissional simples para registar **deslocações** e **prevenções**, com calendário mensal e resumo para apoio aos abonos.

## Funções principais

- Calendário mensal com marcação **D** para deslocações e **P** para prevenções.
- Registo de deslocações com data, origem, destino, matrícula, hora de saída, hora de chegada e observações.
- Registo de prevenções com data, tipo BT / CC / BT/CC e observações.
- Agenda mensal pesquisável.
- Lista configurável de matrículas frequentes.
- Lista configurável de locais frequentes.
- Duplicar registos habituais.
- Exportar CSV mensal para apoio ao preenchimento dos abonos.
- Imprimir / guardar PDF pelo navegador.
- Backup e reposição em JSON.
- Funciona offline no telemóvel e na WebApp através de localStorage.

## Publicar no GitHub

1. Extrair o ZIP.
2. Abrir a pasta `IP_RJP`.
3. Fazer upload de todos os ficheiros e pastas para o repositório GitHub.
4. Ir a **Actions**.
5. Executar **Build IP_RJP Android APK** para gerar APK.
6. Executar **Build IP_RJP WebApp** para gerar WebApp.

## Android / APK

O workflow já está preparado com:

- Node.js 22.
- Java 21.
- TypeScript instalado.
- Capacitor Android.
- Ícone adaptativo Android `ic_launcher` e `ic_launcher_round`.
- Nome da app: `IP_RJP`.
- App ID: `pt.rjp.ip_rjp`.

## WebApp

O projeto usa Vite + React. Para testar localmente:

```bash
npm install
npm run dev
```

Para gerar a versão WebApp:

```bash
npm run build
```

## Dados

Os dados ficam guardados localmente no dispositivo. Usa o botão **Backup JSON** antes de trocar de telemóvel ou limpar o navegador.
