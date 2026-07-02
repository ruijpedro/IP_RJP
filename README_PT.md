# IP_RJP

Autor  
Rui Jorge Pedro

Infraestruturas de Portugal

© 2026

## Funções principais

- Deslocações
- Prevenções BT/CC
- Atividades
- Viaturas
- Exportação PDF, CSV e Excel
- Preparação para Outlook / Microsoft 365

## Correção desta versão

Esta versão remove a pasta Android incompleta e passa a recriar automaticamente a plataforma Android completa durante o GitHub Actions.

O erro corrigido era:

```text
chmod: cannot access 'gradlew': No such file or directory
```

## Como atualizar no GitHub

1. Extrair o ZIP.
2. Apagar no repositório antigo a pasta `android`, se existir.
3. Enviar todos os ficheiros novos para o GitHub.
4. Confirmar que existe a pasta `android-res`.
5. Correr o workflow **Build Android APK**.

A APK ficará em:

```text
Actions → Build Android APK → Artifacts → IP_RJP_Debug_APK
```
