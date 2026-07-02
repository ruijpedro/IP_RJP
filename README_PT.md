# IP_RJP v2.1

Aplicação simples para calendário/agenda profissional com foco em:

- Registo de deslocações;
- Registo de dias de prevenção;
- Prevenções apenas do tipo **BT** ou **CC**;
- Matrícula da viatura;
- Hora de saída e hora de chegada;
- Resumo mensal para apoio aos abonos;
- Exportação CSV e impressão/guardar como PDF;
- WebApp/PWA e preparação para APK Android com Capacitor.

## Como usar

1. Abrir a app.
2. Escolher o mês no topo.
3. No calendário, selecionar o dia.
4. Criar **Deslocação** ou **Prevenção**.
5. No fim do mês, usar **CSV** ou **PDF** no resumo mensal.

## Prevenções

As prevenções são apenas:

- **BT**
- **CC**

A opção BT/CC foi removida.

## GitHub / WebApp

```bash
npm install --legacy-peer-deps
npm run build
```

O resultado da WebApp fica em `dist/`.

## APK Android

O workflow `.github/workflows/build-android.yml` usa Node 22 e cria a APK debug automaticamente nos Artifacts do GitHub Actions.
