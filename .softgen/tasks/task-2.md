---
title: Dashboard und Plugin Editor UI
status: done
priority: high
type: feature
tags: [dashboard, editor, tabs, ui]
created_by: agent
created_at: 2026-06-05
position: 2
---
## Notes
- Dashboard mit Plugin-Liste, Erstellen, Löschen
- Plugin-Editor mit Tabs: Overview, Commands, Permissions, Items, Recipes, Import, Export
- Dark industrial Design
- Real-time Speicherung via localStorage

## Checklist
- [x] Dashboard-Seite mit Plugin-Liste
- [x] Plugin erstellen/löschen
- [x] Editor-Shell mit Tabs
- [x] OverviewTab (Name, Version, Author, API, Main, Description, Tags)
- [x] CommandsTab (CRUD für Commands mit Aliases, Usage, Permission)
- [x] PermissionsTab (CRUD für Permissions mit Default)
- [x] ItemsTab (CRUD für Items)
- [x] RecipesTab (CRUD für Recipes)
- [x] ImportTab
- [x] ExportTab

## Acceptance
- User kann Plugins vom Dashboard erstellen, öffnen und bearbeiten
- Alle Editor-Tabs sind bedienbar und speichern in Echtzeit