import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon } from "lucide-react";

export default function Settings() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex flex-1 items-center gap-2">
          <SettingsIcon className="h-5 w-5 text-[#B22222]" />
          <h1 className="text-lg font-semibold">Settings</h1>
        </div>
      </header>
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>
                Manage your export review settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Settings configuration coming soon. You'll be able to:
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>• Configure AWS credentials</li>
                <li>• Set detection sensitivity levels</li>
                <li>• Manage data retention policies</li>
                <li>• Customize PII detection rules</li>
                <li>• Export configuration templates</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}