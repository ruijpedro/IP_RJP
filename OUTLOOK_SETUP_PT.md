# IP_RJP — Ligação ao Outlook / Microsoft 365

## 1. Microsoft Entra

Entra em `https://entra.microsoft.com` e cria um registo de aplicação:

- Nome: `IP_RJP`
- Supported account types: usa a opção adequada à tua conta
- Redirect URI: **Single-page application (SPA)**
- URI: o endereço da WebApp publicada, por exemplo:
  - `http://localhost:5173/` para testes locais
  - `https://UTILIZADOR.github.io/IP_RJP/` para GitHub Pages

## 2. Códigos necessários

Copia para a app:

- Application (client) ID
- Directory (tenant) ID

Na IP_RJP abre:

`Definições → Outlook / Microsoft 365`

E cola os dois valores.

## 3. Permissões Microsoft Graph

Adiciona permissões delegadas:

- `User.Read`
- `Calendars.Read`
- `Calendars.ReadWrite`

Depois, na app:

`Outlook → Ligar Outlook`

## 4. O que esta versão faz

- Login Microsoft via MSAL.
- Lê eventos da agenda Outlook num intervalo de datas.
- Exporta deslocações do mês para eventos Outlook.
- Exporta prevenções BT/CC do mês para eventos Outlook.

## Nota

Se usares conta profissional da Infraestruturas de Portugal, pode ser necessário consentimento/autorização do administrador de TI.
