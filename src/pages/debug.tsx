import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle } from "lucide-react";

function generateTestId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function DebugPage() {
  const [results, setResults] = useState<{ label: string; status: "pending" | "ok" | "error"; detail?: string }[]>([]);
  const [running, setRunning] = useState(false);

  const addResult = (label: string, status: "ok" | "error", detail?: string) => {
    setResults((prev) => [...prev, { label, status, detail }]);
  };

  const runTests = async () => {
    setResults([]);
    setRunning(true);

    // Test 1: Environment Variables
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      addResult("Environment Variables", "error", `URL: ${url ? "ja" : "FEHLT"}, KEY: ${key ? "ja" : "FEHLT"}`);
      setRunning(false);
      return;
    }
    addResult("Environment Variables", "ok", "Beide gesetzt");

    // Test 2: Supabase Connection
    try {
      const { error } = await supabase.from("plugins").select("id", { count: "exact", head: true });
      if (error) {
        addResult("Supabase Verbindung", "error", error.message);
        setRunning(false);
        return;
      }
      addResult("Supabase Verbindung", "ok", "Tabelle erreichbar");
    } catch (err: any) {
      addResult("Supabase Verbindung", "error", err.message);
      setRunning(false);
      return;
    }

    // Test 3: RPC upsert_plugin
    const testId = generateTestId();
    try {
      const { data: insertData, error: insertError } = await supabase.rpc("upsert_plugin", {
        p_json: {
          id: testId,
          name: "DEBUG_TEST_PLUGIN",
          version: "1.0.0",
          createdAt: new Date().toISOString(),
        },
      });

      if (insertError) {
        addResult("RPC upsert_plugin", "error", insertError.message);
      } else {
        addResult("RPC upsert_plugin", "ok", `Test-Plugin erstellt (ID: ${testId})`);
      }
    } catch (err: any) {
      addResult("RPC upsert_plugin", "error", err.message);
    }

    // Test 4: RPC list_plugins
    try {
      const { data: listData, error: listError } = await supabase.rpc("list_plugins");
      if (listError) {
        addResult("RPC list_plugins", "error", listError.message);
      } else {
        const count = Array.isArray(listData) ? listData.length : 0;
        addResult("RPC list_plugins", "ok", `${count} Plugins in DB gefunden`);
      }
    } catch (err: any) {
      addResult("RPC list_plugins", "error", err.message);
    }

    // Test 5: RPC delete_plugin
    try {
      const { error: deleteError } = await supabase.rpc("delete_plugin", { p_id: testId });
      if (deleteError) {
        addResult("RPC delete_plugin", "error", deleteError.message);
      } else {
        addResult("RPC delete_plugin", "ok", "Test-Daten gelöscht");
      }
    } catch (err: any) {
      addResult("RPC delete_plugin", "error", err.message);
    }

    setRunning(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  const allOk = results.length > 0 && results.every((r) => r.status === "ok");
  const hasError = results.length > 0 && results.some((r) => r.status === "error");

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-foreground">PluginForge Debug</h1>
        <p className="text-muted-foreground">
          Testet die Supabase RPC-Functions. Öffne auf der <strong>Live-URL</strong>.
        </p>

        {!process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <div className="p-4 rounded-lg border border-red-800/50 bg-red-950/30 text-red-400">
            <p className="font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Environment Variables fehlen!
            </p>
            <ul className="text-sm font-mono mt-2 space-y-1">
              <li>NEXT_PUBLIC_SUPABASE_URL=https://djqsipcdmovnnljuuqak.supabase.co</li>
              <li>NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqcXNpcGNkbW92bm5sanV1cWFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2NjgwOTMsImV4cCI6MjA5NjI0NDA5M30.NMKLEnPT6Wov0Yc9P2O70bR3-CiR2SoTLUjc7MP4zww</li>
            </ul>
          </div>
        )}

        <Button onClick={runTests} disabled={running}>
          {running ? "Tests laufen..." : "Tests erneut ausführen"}
        </Button>

        <div className="space-y-3">
          {results.map((r, i) => (
            <Card key={i} className={r.status === "error" ? "border-destructive" : "border-primary"}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Schritt {i + 1}: {r.label}</CardTitle>
                  <Badge variant={r.status === "ok" ? "default" : "destructive"}>
                    {r.status === "ok" ? "OK" : "FEHLER"}
                  </Badge>
                </div>
              </CardHeader>
              {r.detail && (
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground font-mono break-all">{r.detail}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {allOk && (
          <p className="text-green-400 font-semibold flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Alle Tests bestanden! Live-Sync funktioniert.
          </p>
        )}
        {hasError && (
          <p className="text-destructive font-semibold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Es gab Fehler. Der erste rote Eintrag zeigt das Problem.
          </p>
        )}
      </div>
    </div>
  );
}