import type { PluginData, PluginCommand, PluginPermission, PluginItem, PluginRecipe } from "@/types/plugin";

interface ParsedPluginData {
  name?: string;
  version?: string;
  description?: string;
  author?: string;
  authors?: string[];
  main?: string;
  apiVersion?: string;
  softDepend?: string[];
  depend?: string[];
  loadBefore?: string[];
  prefix?: string;
  website?: string;
  tagline?: string;
  tags?: string[];
  commands?: PluginCommand[];
  permissions?: PluginPermission[];
  items?: PluginItem[];
  recipes?: PluginRecipe[];
  notes?: string;
}

export function detectFormat(text: string): "yaml" | "markdown" | "json" | "txt" {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return "json";
  
  // Markdown-Features haben Vorrang
  const hasMarkdownFeatures = /^#\s+/m.test(trimmed) || /^\|\s*.+\s*\|/m.test(trimmed);
  if (hasMarkdownFeatures) return "markdown";
  
  // Klare YAML-Frontmatter
  if (trimmed.startsWith("---")) return "yaml";
  
  // YAML-Struktur: name + version als Zeilenanfang
  const lines = trimmed.split("\n");
  const hasYamlStructure = lines.some((l) => l.match(/^name:\s*\S+/)) &&
                           lines.some((l) => l.match(/^version:\s*\S+/));
  if (hasYamlStructure) return "yaml";
  
  return "txt";
}

function parseMarkdownTable(lines: string[], startIdx: number): { headers: string[]; rows: string[][]; endIdx: number } | null {
  // Prüfe, ob die nächste Zeile ein Separator ist — sonst ist es keine valide Tabelle
  if (startIdx + 1 >= lines.length) return null;
  const nextLine = lines[startIdx + 1];
  if (!nextLine.includes("|") || !nextLine.includes("-")) return null;

  const headers: string[] = [];
  const rows: string[][] = [];
  let i = startIdx;

  if (i < lines.length && lines[i].includes("|")) {
    headers.push(...lines[i].split("|").map((h) => h.trim()).filter(Boolean));
    i++;
  }
  // Skip separator
  if (i < lines.length && lines[i].includes("|") && lines[i].includes("-")) {
    i++;
  }
  while (i < lines.length && lines[i].includes("|")) {
    const cells = lines[i].split("|").map((c) => c.trim()).filter(Boolean);
    if (cells.length > 0) rows.push(cells);
    i++;
  }

  if (headers.length === 0 || rows.length === 0) return null;
  return { headers: headers.map((h) => h.toLowerCase()), rows, endIdx: i - 1 };
}

function isCommandTable(headers: string[]): boolean {
  return headers.some((h) => h.includes("command") || h.includes("cmd") || h.includes("usage"));
}

function isPermissionTable(headers: string[]): boolean {
  return headers.some(
    (h) =>
      (h.includes("permission") || h.includes("node")) &&
      !h.includes("command") &&
      !h.includes("cmd") &&
      !h.includes("usage")
  );
}

function rowToCommand(headers: string[], row: string[]): PluginCommand {
  const get = (keywords: string[]) => {
    for (let i = 0; i < headers.length; i++) {
      if (keywords.some((k) => headers[i].includes(k))) return row[i] || "";
    }
    return "";
  };
  const name = get(["command", "cmd", "name"]).replace(/^\//, "");
  return {
    id: Math.random().toString(36).substring(2, 15),
    name,
    description: get(["description", "desc"]),
    usage: get(["usage", "use"]),
    aliases: get(["alias", "aliases"])
      .split(/[,;|]/)
      .map((s) => s.trim())
      .filter(Boolean),
    permission: get(["permission", "perm"]),
    permissionMessage: "",
  };
}

function rowToPermission(headers: string[], row: string[]): PluginPermission {
  const get = (keywords: string[]) => {
    for (let i = 0; i < headers.length; i++) {
      if (keywords.some((k) => headers[i].includes(k))) return row[i] || "";
    }
    return "";
  };
  const def = get(["default", "def"]).toLowerCase();
  const defaultValue: PluginPermission["default"] =
    def === "true" ? "true" : def === "false" ? "false" : def === "not_op" ? "not_op" : "op";
  return {
    id: Math.random().toString(36).substring(2, 15),
    name: get(["permission", "perm", "node", "name"]),
    description: get(["description", "desc"]),
    default: defaultValue,
    children: [],
  };
}

export function parsePluginYaml(text: string): ParsedPluginData {
  const result: ParsedPluginData = {};
  const lines = text.split("\n");
  let currentSection = "";
  let sectionIndent = 0;

  function getIndent(line: string): number {
    let count = 0;
    for (const ch of line) {
      if (ch === " " || ch === "\t") count++;
      else break;
    }
    return count;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const indent = getIndent(line);

    if (indent === 0) {
      const match = line.match(/^([a-zA-Z0-9_\-]+):\s*(.*)$/);
      if (match) {
        const key = match[1];
        const value = match[2].trim();
        switch (key) {
          case "name": result.name = value; break;
          case "version": result.version = value; break;
          case "description": result.description = value; break;
          case "author": result.author = value; break;
          case "authors": result.authors = value.split(",").map((s) => s.trim()).filter(Boolean); break;
          case "main": result.main = value; break;
          case "api-version": result.apiVersion = value; break;
          case "softdepend": result.softDepend = value.split(",").map((s) => s.trim()).filter(Boolean); break;
          case "depend": result.depend = value.split(",").map((s) => s.trim()).filter(Boolean); break;
          case "loadbefore": result.loadBefore = value.split(",").map((s) => s.trim()).filter(Boolean); break;
          case "prefix": result.prefix = value; break;
          case "website": result.website = value; break;
        }
      }
      if (trimmed === "commands:") {
        currentSection = "commands";
        sectionIndent = indent;
        result.commands = result.commands || [];
        continue;
      }
      if (trimmed === "permissions:") {
        currentSection = "permissions";
        sectionIndent = indent;
        result.permissions = result.permissions || [];
        continue;
      }
    }

    if (currentSection === "commands" && indent > sectionIndent) {
      const cmdMatch = line.match(/^\s+([a-zA-Z0-9_\-]+):\s*$/);
      if (cmdMatch) {
        const cmdName = cmdMatch[1];
        const cmd: PluginCommand = {
          id: Math.random().toString(36).substring(2, 15),
          name: cmdName,
          description: "",
          usage: "",
          aliases: [],
          permission: "",
          permissionMessage: "",
        };
        let j = i + 1;
        while (j < lines.length) {
          const subLine = lines[j];
          const subTrimmed = subLine.trim();
          const subIndent = getIndent(subLine);
          if (subTrimmed && subIndent <= indent) break;
          const subMatch = subLine.match(/^\s+(description|usage|aliases|permission|permission-message):\s*(.*)$/);
          if (subMatch) {
            const subKey = subMatch[1];
            const subValue = subMatch[2].trim();
            if (subKey === "description") cmd.description = subValue;
            if (subKey === "usage") cmd.usage = subValue;
            if (subKey === "permission") cmd.permission = subValue;
            if (subKey === "permission-message") cmd.permissionMessage = subValue;
            if (subKey === "aliases") cmd.aliases = subValue.split(",").map((s) => s.trim()).filter(Boolean);
          }
          j++;
        }
        result.commands?.push(cmd);
        i = j - 1;
      }
    }

    if (currentSection === "permissions" && indent > sectionIndent) {
      const permMatch = line.match(/^\s+([a-zA-Z0-9_.*\-]+):\s*$/);
      if (permMatch) {
        const permName = permMatch[1];
        const perm: PluginPermission = {
          id: Math.random().toString(36).substring(2, 15),
          name: permName,
          description: "",
          default: "op",
          children: [],
        };
        let j = i + 1;
        while (j < lines.length) {
          const subLine = lines[j];
          const subTrimmed = subLine.trim();
          const subIndent = getIndent(subLine);
          if (subTrimmed && subIndent <= indent) break;
          const subMatch = subLine.match(/^\s+(description|default|children):\s*(.*)$/);
          if (subMatch) {
            const subKey = subMatch[1];
            const subValue = subMatch[2].trim();
            if (subKey === "description") perm.description = subValue;
            if (subKey === "default") perm.default = subValue as PluginPermission["default"];
            if (subKey === "children") perm.children = subValue.split(",").map((s) => s.trim()).filter(Boolean);
          }
          j++;
        }
        result.permissions?.push(perm);
        i = j - 1;
      }
    }
  }

  return result;
}

export function parseMarkdown(text: string): ParsedPluginData {
  const result: ParsedPluginData = {};
  const lines = text.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    const h1Match = line.match(/^#\s+(.+)$/);
    if (h1Match) {
      result.name = h1Match[1].trim();
      continue;
    }

    const taglineMatch = line.match(/^\*\*(.+?)\*\*$/);
    if (taglineMatch && !result.tagline) {
      result.tagline = taglineMatch[1].trim();
      continue;
    }

    const fieldMatch = line.match(/^\*\*(.+?):\*\*\s*(.+)$/);
    if (fieldMatch) {
      const key = fieldMatch[1].toLowerCase().trim();
      const value = fieldMatch[2].trim();
      if (key.includes("version")) result.version = value;
      if (key.includes("author")) {
        result.author = value;
        result.authors = value.split(",").map((s) => s.trim()).filter(Boolean);
      }
      if (key.includes("api")) result.apiVersion = value;
      if (key.includes("main")) result.main = value;
      continue;
    }

    if (line.toLowerCase().includes("description") && i + 1 < lines.length) {
      const descLines: string[] = [];
      let j = i + 1;
      while (j < lines.length && !lines[j].trim().startsWith("#") && !lines[j].trim().startsWith("|") && !lines[j].trim().startsWith("-")) {
        if (lines[j].trim()) descLines.push(lines[j].trim());
        j++;
      }
      if (descLines.length > 0) {
        result.description = descLines.join(" ");
        i = j - 1;
      }
    }

    // Parse markdown tables
    if (line.includes("|")) {
      const table = parseMarkdownTable(lines, i);
      if (table) {
        const { headers, rows, endIdx } = table;
        if (isCommandTable(headers)) {
          if (!result.commands) result.commands = [];
          for (const row of rows) {
            result.commands.push(rowToCommand(headers, row));
          }
          i = endIdx;
        } else if (isPermissionTable(headers)) {
          if (!result.permissions) result.permissions = [];
          for (const row of rows) {
            result.permissions.push(rowToPermission(headers, row));
          }
          i = endIdx;
        }
      }
    }
  }

  return result;
}

export function parseJson(text: string): ParsedPluginData {
  try {
    const parsed = JSON.parse(text);
    if (typeof parsed !== "object" || parsed === null) return {};
    return parsed as ParsedPluginData;
  } catch {
    return {};
  }
}

export function parseText(text: string): ParsedPluginData {
  const format = detectFormat(text);
  if (format === "yaml") return parsePluginYaml(text);
  if (format === "markdown") return parseMarkdown(text);
  if (format === "json") return parseJson(text);

  const result: ParsedPluginData = {};
  const lines = text.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const kvMatch = trimmed.match(/^(Name|Version|Author|API|Main|Description)[:\s]+(.+)$/i);
    if (kvMatch) {
      const key = kvMatch[1].toLowerCase();
      const value = kvMatch[2].trim();
      if (key === "name") result.name = value;
      if (key === "version") result.version = value;
      if (key === "author") {
        result.author = value;
        result.authors = value.split(",").map((s) => s.trim()).filter(Boolean);
      }
      if (key === "api" || key === "api-version") result.apiVersion = value;
      if (key === "main") result.main = value;
      if (key === "description") result.description = value;
    }
  }

  return result;
}

export function mergePluginData(existing: PluginData, parsed: ParsedPluginData, mode: "merge" | "replace"): PluginData {
  if (mode === "replace") {
    return {
      ...existing,
      ...parsed,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    } as PluginData;
  }

  const merged: PluginData = {
    ...existing,
    updatedAt: new Date().toISOString(),
  };

  if (parsed.name && !existing.name) merged.name = parsed.name;
  if (parsed.version && !existing.version) merged.version = parsed.version;
  if (parsed.description && !existing.description) merged.description = parsed.description;
  if (parsed.author && !existing.author) merged.author = parsed.author;
  if (parsed.authors && parsed.authors.length > 0) merged.authors = [...new Set([...existing.authors, ...parsed.authors])];
  if (parsed.main && !existing.main) merged.main = parsed.main;
  if (parsed.apiVersion && !existing.apiVersion) merged.apiVersion = parsed.apiVersion;
  if (parsed.softDepend) merged.softDepend = [...new Set([...existing.softDepend, ...parsed.softDepend])];
  if (parsed.depend) merged.depend = [...new Set([...existing.depend, ...parsed.depend])];
  if (parsed.loadBefore) merged.loadBefore = [...new Set([...existing.loadBefore, ...parsed.loadBefore])];
  if (parsed.prefix && !existing.prefix) merged.prefix = parsed.prefix;
  if (parsed.website && !existing.website) merged.website = parsed.website;
  if (parsed.tagline && !existing.tagline) merged.tagline = parsed.tagline;
  if (parsed.tags) merged.tags = [...new Set([...existing.tags, ...parsed.tags])];
  if (parsed.notes && !existing.notes) merged.notes = parsed.notes;

  if (parsed.commands) {
    const existingNames = new Set(existing.commands.map((c) => c.name.toLowerCase()));
    const newCommands = parsed.commands.filter((c) => !existingNames.has(c.name.toLowerCase()));
    merged.commands = [...existing.commands, ...newCommands];
  }

  if (parsed.permissions) {
    const existingNames = new Set(existing.permissions.map((p) => p.name.toLowerCase()));
    const newPermissions = parsed.permissions.filter((p) => !existingNames.has(p.name.toLowerCase()));
    merged.permissions = [...existing.permissions, ...newPermissions];
  }

  if (parsed.items) {
    const existingIds = new Set(existing.items.map((i) => i.id));
    const newItems = parsed.items.filter((i) => !existingIds.has(i.id));
    merged.items = [...existing.items, ...newItems];
  }

  if (parsed.recipes) {
    const existingIds = new Set(existing.recipes.map((r) => r.id));
    const newRecipes = parsed.recipes.filter((r) => !existingIds.has(r.id));
    merged.recipes = [...existing.recipes, ...newRecipes];
  }

  return merged;
}

export function generatePluginYml(plugin: PluginData): string {
  const lines: string[] = [];
  lines.push(`name: ${plugin.name || "MyPlugin"}`);
  lines.push(`version: ${plugin.version || "1.0.0"}`);
  if (plugin.description) lines.push(`description: ${plugin.description}`);
  if (plugin.author) lines.push(`author: ${plugin.author}`);
  if (plugin.authors.length > 0) lines.push(`authors: [${plugin.authors.join(", ")}]`);
  if (plugin.main) lines.push(`main: ${plugin.main}`);
  if (plugin.apiVersion) lines.push(`api-version: ${plugin.apiVersion}`);
  if (plugin.prefix) lines.push(`prefix: ${plugin.prefix}`);
  if (plugin.website) lines.push(`website: ${plugin.website}`);
  if (plugin.depend.length > 0) lines.push(`depend: [${plugin.depend.join(", ")}]`);
  if (plugin.softDepend.length > 0) lines.push(`softdepend: [${plugin.softDepend.join(", ")}]`);
  if (plugin.loadBefore.length > 0) lines.push(`loadbefore: [${plugin.loadBefore.join(", ")}]`);

  if (plugin.commands.length > 0) {
    lines.push("");
    lines.push("commands:");
    for (const cmd of plugin.commands) {
      lines.push(`  ${cmd.name}:`);
      if (cmd.description) lines.push(`    description: ${cmd.description}`);
      if (cmd.usage) lines.push(`    usage: ${cmd.usage}`);
      if (cmd.aliases.length > 0) lines.push(`    aliases: [${cmd.aliases.join(", ")}]`);
      if (cmd.permission) lines.push(`    permission: ${cmd.permission}`);
      if (cmd.permissionMessage) lines.push(`    permission-message: ${cmd.permissionMessage}`);
    }
  }

  if (plugin.permissions.length > 0) {
    lines.push("");
    lines.push("permissions:");
    for (const perm of plugin.permissions) {
      lines.push(`  ${perm.name}:`);
      if (perm.description) lines.push(`    description: ${perm.description}`);
      lines.push(`    default: ${perm.default}`);
      if (perm.children && perm.children.length > 0) lines.push(`    children: [${perm.children.join(", ")}]`);
    }
  }

  return lines.join("\n");
}

export function generateMarkdownSpec(plugin: PluginData): string {
  const lines: string[] = [];
  lines.push(`# ${plugin.name || "Unnamed Plugin"}`);
  lines.push("");
  if (plugin.tagline) lines.push(`**${plugin.tagline}**`);
  lines.push("");
  lines.push(`| Field | Value |`);
  lines.push(`|-------|-------|`);
  lines.push(`| **Version** | ${plugin.version || "1.0.0"} |`);
  lines.push(`| **Author** | ${plugin.author || "-"} |`);
  lines.push(`| **API** | ${plugin.apiVersion || "-"} |`);
  lines.push(`| **Main** | ${plugin.main || "-"} |`);
  lines.push("");
  if (plugin.description) {
    lines.push("## Description");
    lines.push("");
    lines.push(plugin.description);
    lines.push("");
  }
  if (plugin.tags.length > 0) {
    lines.push(`**Tags:** ${plugin.tags.join(", ")}`);
    lines.push("");
  }
  if (plugin.commands.length > 0) {
    lines.push("## Commands");
    lines.push("");
    lines.push(`| Command | Description | Usage | Aliases | Permission |`);
    lines.push(`|---------|-------------|-------|---------|------------|`);
    for (const cmd of plugin.commands) {
      lines.push(`| \`/${cmd.name}\` | ${cmd.description || "-"} | ${cmd.usage || "-"} | ${cmd.aliases.join(", ") || "-"} | ${cmd.permission || "-"} |`);
    }
    lines.push("");
  }
  if (plugin.permissions.length > 0) {
    lines.push("## Permissions");
    lines.push("");
    lines.push(`| Permission | Default | Description |`);
    lines.push(`|------------|---------|-------------|`);
    for (const perm of plugin.permissions) {
      lines.push(`| \`${perm.name}\` | ${perm.default} | ${perm.description || "-"} |`);
    }
    lines.push("");
  }
  if (plugin.items.length > 0) {
    lines.push("## Items");
    lines.push("");
    for (const item of plugin.items) {
      lines.push(`### ${item.displayName || item.name}`);
      lines.push(`- Material: ${item.material}`);
      if (item.lore.length > 0) lines.push(`- Lore: ${item.lore.join(", ")}`);
      if (item.enchantments.length > 0) lines.push(`- Enchantments: ${item.enchantments.map((e) => `${e.name} ${e.level}`).join(", ")}`);
      lines.push("");
    }
  }
  if (plugin.recipes.length > 0) {
    lines.push("## Recipes");
    lines.push("");
    for (const recipe of plugin.recipes) {
      lines.push(`### ${recipe.name}`);
      lines.push(`- Type: ${recipe.type}`);
      lines.push(`- Result: ${recipe.result} x${recipe.resultAmount}`);
      lines.push("");
    }
  }
  if (plugin.notes) {
    lines.push("## Notes");
    lines.push("");
    lines.push(plugin.notes);
    lines.push("");
  }
  return lines.join("\n");
}

export function generateJson(plugin: PluginData): string {
  return JSON.stringify(plugin, null, 2);
}