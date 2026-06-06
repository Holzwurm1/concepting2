import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { PluginData } from "@/types/plugin";

const LS_KEY = "pluginforge_data";

function generateId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function fromDb(row: any): PluginData {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    version: String(row.version ?? "1.0.0"),
    description: String(row.description ?? ""),
    author: String(row.author ?? ""),
    authors: [],
    main: String(row.main_class ?? ""),
    apiVersion: String(row.api_version ?? "1.20"),
    softDepend: [],
    depend: [],
    loadBefore: [],
    prefix: undefined,
    website: undefined,
    tagline: String(row.tagline ?? ""),
    tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    commands: Array.isArray(row.commands) ? row.commands : [],
    permissions: Array.isArray(row.permissions) ? row.permissions : [],
    items: Array.isArray(row.items) ? row.items : [],
    recipes: Array.isArray(row.recipes) ? row.recipes : [],
    notes: String(row.notes ?? ""),
    createdAt: String(row.created_at ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
  };
}

function toJson(plugin: Partial<PluginData>) {
  return {
    id: plugin.id,
    name: plugin.name ?? "",
    version: plugin.version ?? "1.0.0",
    description: plugin.description ?? "",
    author: plugin.author ?? "",
    main: plugin.main ?? "",
    apiVersion: plugin.apiVersion ?? "1.20",
    tagline: plugin.tagline ?? "",
    tags: plugin.tags ?? [],
    commands: plugin.commands ?? [],
    permissions: plugin.permissions ?? [],
    items: plugin.items ?? [],
    recipes: plugin.recipes ?? [],
    notes: plugin.notes ?? "",
    createdAt: plugin.createdAt ?? new Date().toISOString(),
    updatedAt: plugin.updatedAt ?? new Date().toISOString(),
  };
}

function readLocal(): PluginData[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocal(plugins: PluginData[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(plugins));
  } catch {
    // ignore
  }
}

interface PluginsContextType {
  plugins: PluginData[];
  loaded: boolean;
  error: string | null;
  addPlugin: (partial?: Partial<PluginData>) => Promise<PluginData | undefined>;
  updatePlugin: (id: string, updater: Partial<PluginData> | ((prev: PluginData) => PluginData)) => Promise<void>;
  deletePlugin: (id: string) => Promise<void>;
  getPlugin: (id: string) => PluginData | undefined;
  refresh: () => Promise<void>;
}

const PluginsContext = createContext<PluginsContextType | null>(null);

export function PluginsProvider({ children }: { children: React.ReactNode }) {
  const [plugins, setPlugins] = useState<PluginData[]>(readLocal);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const isFetchingRef = useRef(false);

  const fetchPlugins = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const { data, error: dbError } = await supabase.rpc("list_plugins");

      if (dbError) throw dbError;

      const dbPlugins: PluginData[] = (data ? JSON.parse(JSON.stringify(data)) : []).map(fromDb);
      const localPlugins = readLocal();

      // Merge by timestamp: newer wins
      const merged: PluginData[] = [];
      const allIds = new Set([...dbPlugins.map((p: PluginData) => p.id), ...localPlugins.map((p) => p.id)]);

      for (const id of allIds) {
        const dbPlugin = dbPlugins.find((p: PluginData) => p.id === id);
        const localPlugin = localPlugins.find((p) => p.id === id);

        if (dbPlugin && localPlugin) {
          const dbTime = new Date(dbPlugin.updatedAt).getTime();
          const localTime = new Date(localPlugin.updatedAt).getTime();
          merged.push(localTime > dbTime ? localPlugin : dbPlugin);
        } else if (dbPlugin) {
          merged.push(dbPlugin);
        } else {
          merged.push(localPlugin!);
        }
      }

      merged.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      setPlugins(merged);
      writeLocal(merged);
      setError(null);
    } catch (err: any) {
      console.error("Fetch failed:", err);
      const localPlugins = readLocal();
      setPlugins(localPlugins);
      setError("Offline-Modus: Zeige lokale Daten.");
      toast({
        title: "Offline-Modus",
        description: "Supabase nicht erreichbar. Daten werden nur lokal gespeichert.",
        variant: "destructive",
      });
    } finally {
      setLoaded(true);
      isFetchingRef.current = false;
    }
  }, [toast]);

  useEffect(() => {
    fetchPlugins();
    const interval = setInterval(() => {
      fetchPlugins();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchPlugins]);

  const addPlugin = useCallback(async (partial?: Partial<PluginData>) => {
    const id = generateId();
    const now = new Date().toISOString();
    const plugin: PluginData = {
      id,
      name: partial?.name ?? "",
      version: partial?.version ?? "1.0.0",
      description: partial?.description ?? "",
      author: partial?.author ?? "",
      authors: [],
      main: partial?.main ?? "",
      apiVersion: partial?.apiVersion ?? "1.20",
      softDepend: [],
      depend: [],
      loadBefore: [],
      prefix: partial?.prefix,
      website: partial?.website,
      tagline: partial?.tagline ?? "",
      tags: partial?.tags ?? [],
      commands: partial?.commands ?? [],
      permissions: partial?.permissions ?? [],
      items: partial?.items ?? [],
      recipes: partial?.recipes ?? [],
      notes: partial?.notes ?? "",
      createdAt: now,
      updatedAt: now,
    };

    try {
      const { data, error: dbError } = await supabase.rpc("upsert_plugin", {
        p_json: toJson(plugin),
      });

      if (dbError) throw dbError;

      const saved = fromDb(data);
      setPlugins((prev) => {
        const next = [saved, ...prev.filter((p) => p.id !== saved.id)];
        writeLocal(next);
        return next;
      });
      toast({ title: "Plugin erstellt", description: `"${saved.name}" wurde synchronisiert.` });
      return saved;
    } catch (err: any) {
      console.error("Supabase insert failed:", err);
      setPlugins((prev) => {
        const next = [plugin, ...prev.filter((p) => p.id !== plugin.id)];
        writeLocal(next);
        return next;
      });
      toast({
        title: "Plugin erstellt (lokal)",
        description: `"${plugin.name}" wurde nur lokal gespeichert. Supabase-Fehler: ${err.message}`,
        variant: "destructive",
      });
      return plugin;
    }
  }, [toast]);

  const updatePlugin = useCallback(async (id: string, updater: Partial<PluginData> | ((prev: PluginData) => PluginData)) => {
    const current = plugins.find((p) => p.id === id);
    if (!current) {
      toast({ title: "Fehler", description: "Plugin nicht gefunden.", variant: "destructive" });
      return;
    }

    const now = new Date().toISOString();
    const updated = typeof updater === "function"
      ? { ...updater(current), updatedAt: now }
      : { ...current, ...updater, updatedAt: now };

    try {
      const { data, error: dbError } = await supabase.rpc("upsert_plugin", {
        p_json: toJson(updated),
      });

      if (dbError) throw dbError;

      const saved = fromDb(data);
      setPlugins((prev) => {
        const next = prev.map((p) => (p.id === id ? saved : p));
        writeLocal(next);
        return next;
      });
      toast({ title: "Gespeichert", description: "Änderungen wurden synchronisiert." });
    } catch (err: any) {
      console.error("Supabase update failed:", err);
      setPlugins((prev) => {
        const next = prev.map((p) => (p.id === id ? updated : p));
        writeLocal(next);
        return next;
      });
      toast({ title: "Hinweis", description: "Änderung nur lokal gespeichert.", variant: "default" });
    }
  }, [plugins, toast]);

  const deletePlugin = useCallback(async (id: string) => {
    try {
      await supabase.rpc("delete_plugin", { p_id: id });
    } catch (err) {
      console.error("Supabase delete failed:", err);
    }

    setPlugins((prev) => {
      const next = prev.filter((p) => p.id !== id);
      writeLocal(next);
      return next;
    });
    toast({ title: "Plugin gelöscht", description: "Das Plugin wurde entfernt." });
  }, [toast]);

  const getPlugin = useCallback((id: string): PluginData | undefined => {
    return plugins.find((p) => p.id === id);
  }, [plugins]);

  return (
    <PluginsContext.Provider value={{
      plugins,
      loaded,
      error,
      addPlugin,
      updatePlugin,
      deletePlugin,
      getPlugin,
      refresh: fetchPlugins,
    }}>
      {children}
    </PluginsContext.Provider>
  );
}

export function usePlugins() {
  const ctx = useContext(PluginsContext);
  if (!ctx) {
    throw new Error("usePlugins must be used within a PluginsProvider");
  }
  return ctx;
}