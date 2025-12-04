import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export default function AIAssistant() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex flex-1 items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#B22222]" />
          <h1 className="text-lg font-semibold">AI Exports Assistant</h1>
        </div>
      </header>
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Export Analysis</CardTitle>
              <CardDescription>
                Advanced AI features for comprehensive data analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This feature is coming soon. The AI Assistant will provide:
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>• Automated data classification suggestions</li>
                <li>• Pattern recognition across multiple exports</li>
                <li>• Compliance recommendations</li>
                <li>• Smart remediation strategies</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}