import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { usePlugins } from "@/hooks/usePlugins";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, Box, Command, Shield, Hammer, ChefHat, FileInput, FileOutput, Download, AlertTriangle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

function ConnectionStatus() {
  const [status, setStatus] = useState<"checking" | "ok" | "error">("checking");
  const [detail, setDetail] = useState("Prüfe Verbindung...");

  useEffect(() => {
    const check = async () => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !key) {
        setStatus("error");
        setDetail(`Env vars fehlen: URL=${url ? "ja" : "NEIN"}, KEY=${key ? "ja" : "NEIN"}`);
        return;
      }
      try {
        const { error } = await supabase.from("plugins").select("id", { count: "exact", head: true });
        if (error) {
          setStatus("error");
          setDetail(error.message);
        } else {
          setStatus("ok");
          setDetail("Supabase verbunden");
        }
      } catch (e: any) {
        setStatus("error");
        setDetail(e.message);
      }
    };
    check();
  }, []);

  if (status === "checking") return null;

  return (
    <div className={`mx-4 sm:mx-6 lg:mx-8 mt-4 p-3 rounded-lg border flex items-center gap-3 ${status === "ok" ? "bg-emerald-950/30 border-emerald-800/50 text-emerald-400" : "bg-red-950/30 border-red-800/50 text-red-400"}`}>
      {status === "ok" ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">
          {status === "ok" ? "Supabase verbunden" : "Supabase-Verbindung fehlgeschlagen"}
        </p>
        <p className="text-xs opacity-80 font-mono break-all">{detail}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { plugins, loaded, addPlugin, deletePlugin } = usePlugins();
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTagline, setNewTagline] = useState("");
  const router = useRouter();

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const plugin = await addPlugin({ name: newName.trim(), tagline: newTagline.trim() });
    if (!plugin) return;
    setCreateOpen(false);
    setNewName("");
    setNewTagline("");
    router.push(`/plugin?id=${plugin.id}`);
  };

  const totalCommands = plugins.reduce((sum, p) => sum + p.commands.length, 0);
  const totalPermissions = plugins.reduce((sum, p) => sum + p.permissions.length, 0);
  const totalItems = plugins.reduce((sum, p) => sum + p.items.length, 0);
  const totalRecipes = plugins.reduce((sum, p) => sum + p.recipes.length, 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center">
              <Box className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground tracking-tight">PluginForge</h1>
              <p className="text-xs text-muted-foreground leading-none">Minecraft Plugin Concepting</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="/pluginforge-code.tar.gz" download="pluginforge-code.tar.gz">
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Code
              </Button>
            </a>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Neues Plugin
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Plugin erstellen</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Name</Label>
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="z.B. BlockProtector"
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Tagline</Label>
                    <Input
                      value={newTagline}
                      onChange={(e) => setNewTagline(e.target.value)}
                      placeholder="Kurze Beschreibung..."
                      className="bg-secondary border-border"
                    />
                  </div>
                  <Button onClick={handleCreate} className="w-full" disabled={!newName.trim()}>
                    Erstellen & Öffnen
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <ConnectionStatus />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-foreground">{plugins.length}</p>
                  <p className="text-xs text-muted-foreground">Plugins</p>
                </div>
                <Box className="w-8 h-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalCommands}</p>
                  <p className="text-xs text-muted-foreground">Commands</p>
                </div>
                <Command className="w-8 h-8 text-accent/60" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalPermissions}</p>
                  <p className="text-xs text-muted-foreground">Permissions</p>
                </div>
                <Shield className="w-8 h-8 text-chart-5/60" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalItems + totalRecipes}</p>
                  <p className="text-xs text-muted-foreground">Items & Recipes</p>
                </div>
                <Hammer className="w-8 h-8 text-chart-4/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {!loaded ? (
          <div className="text-center py-20 text-muted-foreground">Lade...</div>
        ) : plugins.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <Box className="w-12 h-12 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-semibold text-foreground">Noch keine Plugins</h2>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Erstelle dein erstes Plugin-Konzept und plane Commands, Permissions, Items und Recipes.
            </p>
            <Button onClick={() => setCreateOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Plugin erstellen
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plugins.map((plugin) => (
              <Link key={plugin.id} href={`/plugin?id=${plugin.id}`} className="block group">
                <Card className="bg-card border-border hover:border-primary/50 transition-all duration-200 h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                        {plugin.name || "Unnamed Plugin"}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (confirm("Plugin wirklich löschen?")) deletePlugin(plugin.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    {plugin.tagline && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{plugin.tagline}</p>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {plugin.tags.slice(0, 4).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                          {tag}
                        </Badge>
                      ))}
                      {plugin.tags.length > 4 && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          +{plugin.tags.length - 4}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Command className="w-3 h-3" />
                        {plugin.commands.length}
                      </span>
                      <span className="flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        {plugin.permissions.length}
                      </span>
                      <span className="flex items-center gap-1">
                        <Hammer className="w-3 h-3" />
                        {plugin.items.length}
                      </span>
                      <span className="flex items-center gap-1">
                        <ChefHat className="w-3 h-3" />
                        {plugin.recipes.length}
                      </span>
                      <span className="flex items-center gap-1 ml-auto">
                        <FileInput className="w-3 h-3" />
                        {plugin.version}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}