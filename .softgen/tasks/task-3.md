---
title: Import und Export
status: done
priority: high
type: feature
tags: [import, export, parser, yaml, markdown, json, zip]
created_by: agent
created_at: 2026-06-05
position: 3
---
## Notes
- Import-Tab mit Text-Paste und Datei-Upload
- Automatische Format-Erkennung (YAML, Markdown, JSON, TXT)
- Markdown-Tabellen-Parser für Commands und Permissions
- YAML-Parser für plugin.yml Commands/Permissions
- Preview mit detaillierter Auflistung
- Merge/Replace Modus
- Export: plugin.yml, Markdown-Spec, JSON einzeln + ZIP mit allem

## Checklist
- [x] ImportTab mit Textarea + Datei-Upload
- [x] Format-Erkennung implementieren
- [x] YAML-Parser für Commands und Permissions
- [x] Markdown-Tabellen-Parser für Commands und Permissions
- [x] Preview mit Detailansicht der erkannten Daten
- [x] Merge/Replace Logik
- [x] ExportTab mit plugin.yml, Markdown, JSON
- [x] ZIP-Download für alle Export-Formate
- [x] JSON-Roundtrip funktioniert

## Acceptance
- Datei-Upload erkennt Commands und Permissions automatisch
- Preview zeigt alle gefundenen Einträge
- Import übernimmt sie ins Plugin
- Export erzeugt valide plugin.yml und lesbare Markdown-Spec
- ZIP enthält alle drei Dateien
