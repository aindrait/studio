
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import Link from "next/link";
import { Logo } from "@/components/icons";
import { Bot, FileText, Folder, ArrowLeft, GitCommitHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-muted/40 flex"> {/* Added flex */}
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <Logo className="h-6 w-6 text-primary" />
              <h1 className="text-lg font-semibold font-headline">
                ModuleMaestro Admin
              </h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/modules">
                    <FileText />
                    Modules
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/categories">
                    <Folder />
                    Categories
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/versions">
                    <GitCommitHorizontal />
                    Versions
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="flex-1"> {/* Added flex-1 to content */}
          <header className="bg-background border-b sticky top-0 z-10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center gap-4">
                  <Link href="/">
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-8"> {/* Added padding */}
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
