# IP_RJP v1.1

Aplicação simples para agenda profissional, focada apenas em:

- Registo de dias de prevenção
- Registo de deslocações
- Matrícula da viatura
- Hora de saída
- Hora de chegada
- Resumo mensal
- Exportação CSV
- WebApp
- APK Android

## Como publicar a WebApp no GitHub Pages

1. Extrair o ZIP.
2. Criar um repositório GitHub, por exemplo `IP_RJP`.
3. Enviar todos os ficheiros e pastas soltos para a raiz do repositório.
4. Ir a **Settings > Pages**.
5. Em **Source**, escolher **GitHub Actions**.
6. Ir a **Actions**.
7. Executar o workflow **Build IP_RJP WebApp**.
8. No fim, abrir o endereço gerado pelo GitHub Pages.

## Como gerar APK

1. Ir a **Actions**.
2. Executar o workflow **Build IP_RJP Android APK**.
3. No fim, descarregar o artefacto `IP_RJP-debug-apk`.

## Uso

A app guarda os dados localmente no telemóvel ou navegador.

### Deslocações

Campos principais:

- Data
- Origem
- Destino
- Matrícula
- Hora de saída
- Hora de chegada
- Observações

### Prevenções

Campos principais:

- Data
- Tipo: BT, CC ou BT/CC
- Observações

## Nota

Esta versão é offline/local. A sincronização Google pode ser adicionada numa versão futura.


## Correção v1.2
Workflow Android atualizado para Node.js 22, necessário para as versões recentes do Capacitor CLI.
