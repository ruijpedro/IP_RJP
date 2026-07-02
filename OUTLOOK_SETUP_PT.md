# Ligação ao Outlook

A app tem a área Outlook preparada, mas a ligação real exige registo no Microsoft Entra.

1. Abrir https://entra.microsoft.com
2. Ir a **Registos de aplicações**.
3. Criar novo registo com o nome `IP_RJP`.
4. Copiar:
   - Application / Client ID
   - Directory / Tenant ID
5. Colocar esses valores na app, no menu **Outlook**.

Permissões Microsoft Graph a configurar posteriormente:

- User.Read
- Calendars.Read
- Calendars.ReadWrite
- offline_access
- openid
- profile
