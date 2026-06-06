---
title: PluginForge
status: in_progress
---
## Vision
Ein Konzept-Tool für Minecraft-Server-Betreiber, um Plugin-Ideen zu planen, zu strukturieren und als Spezifikation zu exportieren. Zielgruppe: Server-Admins und Plugin-Entwickler.

## Design
- Dark industrial dashboard, Graphit-Oberfläche
- `--primary: 160 84% 39%` (Emerald-Grün, Minecraft-Referenz)
- `--background: 220 15% 8%` (tiefes Graphit)
- `--foreground: 220 10% 92%` (hellgrau)
- `--accent: 38 92% 50%` (Gold für Highlights)
- `--muted: 220 12% 18%` (dunkles Panel-Grau)
- `--card: 220 14% 12%`
- `--border: 220 12% 22%`
- Fonts: JetBrains Mono (Code/Export), Inter-ähnlich -> wir nutzen Geist falls vorhanden, sonst system-ui. Headings: Geist/Sans, Body: Geist/Sans, Code: JetBrains Mono
- Style: Dark mode only, kompakte Grid-Layouts für Daten, klarer Tab-Editor

## Features
- Dashboard: Plugin-Liste, Erstellen, Löschen
- Plugin-Editor mit Tabs: Übersicht, Commands, Permissions, Items, Recipes, Import, Export
- Import: Text-Decoder für Markdown, plugin.yml, JSON, TXT
- Export: plugin.yml, Markdown-Spec, JSON (Roundtrip)
- Alles persistiert in localStorage