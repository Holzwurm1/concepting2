---
title: "Supabase Backend für geteilte Plugins"
status: done
priority: urgent
type: feature
tags: [supabase, database, backend, plugins]
created_by: agent
created_at: 2026-06-05
position: 5
---
## Notes
Plugins werden jetzt zentral in Supabase gespeichert. Alle Besucher sehen und bearbeiten dieselben Plugins.

## Checklist
- [x] Datenbank-Schema prüfen
- [x] `plugins` Tabelle erstellen mit allen Feldern
- [x] RLS Policies für anonymen Zugriff (public read + insert + update + delete)
- [x] Supabase Types manuell erstellt
- [x] `usePlugins` Hook auf Supabase umgestellt
- [x] Index-Page auf Supabase umgestellt
- [x] Plugin-Editor auf Supabase umgestellt
- [x] TypeScript-Fehler behoben

## Acceptance
- Plugin-Liste wird aus Supabase geladen
- Neue Plugins werden in Supabase gespeichert
- Alle Besucher sehen die gleichen Plugins
- Keine localStorage-Abhängigkeit mehr