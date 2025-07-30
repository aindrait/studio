
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import Link from "next/link";
import { Logo } from "@/components/icons";
import { Bot, FileText, Folder, ArrowLeft, GitCommitHorizontal, Users, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/user-nav";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { getAppSettings } from "@/ai/flows/module-crud";


export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }
  
  const isAdmin = session.role === 'admin';
  const appSettings = await getAppSettings();

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-muted/40 flex">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <Logo className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-lg font-semibold font-headline">
                  {appSettings?.appName || 'MDS Manual'} Admin
                </h1>
                <p className="text-xs text-sidebar-foreground/80">{appSettings?.appSubtitle}</p>
              </div>
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
              {isAdmin && (
                <>
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
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/admin/users">
                        <Users />
                        Users
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                   <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/admin/settings">
                        <Settings />
                        Settings
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
               {!isAdmin && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/admin/versions">
                        <GitCommitHorizontal />
                        Versions
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
               )}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="flex-1 flex flex-col">
          <header className="bg-background border-b sticky top-0 z-10">
            <div className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-4">
                   <SidebarTrigger className="md:hidden" />
                   <Link href="/">
                    <Button variant="outline" size="icon" className="h-8 w-8 hidden sm:flex">
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <UserNav user={session} />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
