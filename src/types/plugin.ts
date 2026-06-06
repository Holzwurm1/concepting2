export interface PluginCommand {
  id: string;
  name: string;
  description: string;
  usage: string;
  aliases: string[];
  permission: string;
  permissionMessage?: string;
}

export interface PluginPermission {
  id: string;
  name: string;
  description: string;
  default: "true" | "false" | "op" | "not_op";
  children?: string[];
}

export interface PluginItem {
  id: string;
  name: string;
  material: string;
  displayName: string;
  lore: string[];
  enchantments: { name: string; level: number }[];
  customModelData?: number;
  unbreakable?: boolean;
  glow?: boolean;
}

export interface PluginRecipe {
  id: string;
  name: string;
  type: "shaped" | "shapeless" | "furnace" | "smithing";
  result: string;
  resultAmount: number;
  ingredients: { slot?: string; item: string; amount: number }[];
  shape?: string[];
}

export interface PluginData {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  authors: string[];
  main: string;
  apiVersion: string;
  softDepend: string[];
  depend: string[];
  loadBefore: string[];
  prefix?: string;
  website?: string;
  tagline: string;
  tags: string[];
  commands: PluginCommand[];
  permissions: PluginPermission[];
  items: PluginItem[];
  recipes: PluginRecipe[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type PluginTab = "overview" | "commands" | "permissions" | "items" | "recipes" | "import" | "export";