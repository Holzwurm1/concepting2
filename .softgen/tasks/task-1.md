---
title: Design System und Core Models
status: done
priority: urgent
type: chore
tags: [design-system, theme, models, localstorage]
created_by: agent
created_at: 2026-06-05
position: 1
---
## Notes
- Dark industrial Theme mit Graphit-Hintergrund
- Emerald-Grün Primary, Gold Accent
- JetBrains Mono für Code, Geist/Sans für UI
- Alle Plugin-Datentypen definiert
- localStorage Hook für Persistenz

## Checklist
- [x] globals.css mit Dark-Theme Variablen
- [x] tailwind.config.ts mit Custom Tokens
- [x] Plugin-Typen (Command, Permission, Item, Recipe, PluginData)
- [x] usePlugins Hook mit localStorage
- [x] pluginParser mit Import/Export Funktionen

## Acceptance
- Design ist konsistent auf allen Seiten
- Farben und Typografie passen zum Konzept
- Typen decken alle Plugin-Aspekte ab
- localStorage speichert und lädt Plugins korrekt