# IP_RJP v1.0

Aplicação simples para registo profissional de **deslocações** e **prevenções**, pensada para apoiar o preenchimento mensal dos abonos.

## Funcionalidades

- Calendário mensal com marcações D e P.
- Registo de deslocações: data, origem, destino, matrícula, hora de saída, hora de chegada e observações.
- Registo de prevenções: data, tipo BT / CC / BT/CC e observações.
- Agenda mensal.
- Duplicar registos habituais.
- Exportação CSV.
- Impressão/guardar em PDF pelo navegador.
- Funciona offline com localStorage.

## Instalação local

```bash
npm install
npm run dev
```

## Build WebApp

```bash
npm run build
```

## APK Android

O workflow `.github/workflows/build-android.yml` compila a APK automaticamente no GitHub Actions.

## Notas

- Esta versão não tem Google Drive/Sheets.
- Os dados ficam guardados localmente no dispositivo/navegador.
- Para mudar de telemóvel, exporta CSV antes.
