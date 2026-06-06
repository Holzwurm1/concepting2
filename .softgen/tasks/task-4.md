---
title: "InfinityFree Static Export"
status: done
priority: urgent
type: feature
tags: [hosting, static-export, infinityfree, git-bundle]
created_by: agent
created_at: 2026-06-05
position: 4
---
## Notes
InfinityFree unterstützt nur statisches Hosting. Stattdessen wurde ein Git-Bundle erstellt als einfacher Download.

## Checklist
- [x] Git-Repo initialisieren
- [x] Git-Bundle erstellen: `git bundle create public/pluginforge.bundle --all`
- [x] Download-Button auf Git Bundle verlinken
- [x] Bundle validieren

## Acceptance
- Git-Bundle enthält komplette History
- Download-Button liefert `.bundle` Datei
- User kann mit `git clone pluginforge.bundle` entpacken