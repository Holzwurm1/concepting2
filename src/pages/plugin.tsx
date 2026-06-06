import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { usePlugins } from "@/hooks/usePlugins";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  LayoutDashboard,
  Command,
  Shield,
  Hammer,
  ChefHat,
  FileInput,
  FileOutput,
} from "lucide-react";
import { OverviewTab } from "@/components/editor/OverviewTab";
import { CommandsTab } from "@/components/editor/CommandsTab";
import { PermissionsTab } from "@/components/editor/PermissionsTab";
import { ItemsTab } from "@/components/editor/ItemsTab";
import { RecipesTab } from "@/components/editor/RecipesTab";
import { ImportTab } from "@/components/editor/ImportTab";
import { ExportTab } from "@/components/editor/ExportTab";
import type { PluginTab } from "@/types/plugin";

const tabConfig: { value: PluginTab; label: string; icon: React.ReactNode }[] = [
  { value: "overview", label: "Übersicht", icon: <LayoutDashboard className="w-4 h-4" /> },
  { value: "commands", label: "Commands", icon: <Command className="w-4 h-4" /> },
  { value: "permissions", label: "Permissions", icon: <Shield className="w-4 h-4" /> },
  { value: "items", label: "Items", icon: <Hammer className="w-4 h-4" /> },
  { value: "recipes", label: "Recipes", icon: <ChefHat className="w-4 h-4" /> },
  { value: "import", label: "Import", icon: <FileInput className="w-4 h-4" /> },
  { value: "export", label: "Export", icon: <FileOutput className="w-4 h-4" /> },
];

export default function PluginEditor() {
  const router = useRouter();
  const id = router.query.id;
  const { plugins, loaded, updatePlugin, getPlugin } = usePlugins();
  const [activeTab, setActiveTab] = useState<PluginTab>("overview");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const plugin = loaded && id ? getPlugin(id as string) : undefined;

  if (!mounted || !loaded || !router.isReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">
        Lade...
      </div>
    );
  }

  if (!plugin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Plugin nicht gefunden.</p>
        <Link href="/">
          <Button variant="outline">Zurück zum Dashboard</Button>
        </Link>
      </div>
    );
  }

  const handleUpdate = (data: Partial<typeof plugin>) => {
    updatePlugin(plugin.id, data);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-foreground truncate">
              {plugin.name || "Unnamed Plugin"}
            </h1>
            <p className="text-[11px] text-muted-foreground truncate">
              {plugin.tagline || plugin.version}
            </p>
          </div>
          <div className="text-[11px] text-muted-foreground font-mono">
            {plugin.version}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as PluginTab)} className="h-full flex flex-col">
          <ScrollArea className="w-full whitespace-nowrap">
            <TabsList className="bg-secondary border-border inline-flex h-9">
              {tabConfig.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>

          <div className="mt-4 flex-1 min-h-0">
            <TabsContent value="overview" className="mt-0 h-full">
              <OverviewTab plugin={plugin} onUpdate={handleUpdate} />
            </TabsContent>
            <TabsContent value="commands" className="mt-0 h-full">
              <CommandsTab plugin={plugin} onUpdate={handleUpdate} />
            </TabsContent>
            <TabsContent value="permissions" className="mt-0 h-full">
              <PermissionsTab plugin={plugin} onUpdate={handleUpdate} />
            </TabsContent>
            <TabsContent value="items" className="mt-0 h-full">
              <ItemsTab plugin={plugin} onUpdate={handleUpdate} />
            </TabsContent>
            <TabsContent value="recipes" className="mt-0 h-full">
              <RecipesTab plugin={plugin} onUpdate={handleUpdate} />
            </TabsContent>
            <TabsContent value="import" className="mt-0 h-full">
              <ImportTab plugin={plugin} onUpdate={handleUpdate} />
            </TabsContent>
            <TabsContent value="export" className="mt-0 h-full">
              <ExportTab plugin={plugin} />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
}