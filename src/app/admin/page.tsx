import { Button } from "@/components/ui/button";
import { TocGenerator } from "@/components/admin/toc-generator";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/icons";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-muted/40">
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" legacyBehavior passHref>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Back to app</span>
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Logo className="h-6 w-6 text-primary" />
                <h1 className="text-lg font-semibold font-headline">
                  ModuleMaestro Admin
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <TocGenerator />
        </div>
      </main>
    </div>
  );
}
