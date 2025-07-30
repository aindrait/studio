
"use client";

import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  BookOpen,
  LayoutGrid,
  Search,
  ShieldCheck,
} from "lucide-react";

import { type Module, type Category, type AppSettings } from "@/lib/types";
import { DocumentationViewer } from "@/components/documentation-viewer";
import { Logo } from "@/components/icons";
import Link from "next/link";
import { getModules, getCategories, getAppSettings } from "@/ai/flows/module-crud";
import { useToast } from "@/hooks/use-toast";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { cn } from "@/lib/utils";

export default function Home() {
  const [modules, setModules] = React.useState<Module[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [appSettings, setAppSettings] = React.useState<AppSettings | null>(null);
  const [search, setSearch] = React.useState("");
  const [selectedModule, setSelectedModule] = React.useState<Module | null>(null);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    async function initialFetch() {
      setLoading(true);
      try {
        const [fetchedModules, fetchedCategories, fetchedSettings] = await Promise.all([
          getModules(),
          getCategories(),
          getAppSettings(),
        ]);

        setModules(fetchedModules);
        setCategories(fetchedCategories);
        setAppSettings(fetchedSettings ?? { appName: "MDS Manual" });


        const welcomeModule = fetchedModules.find(m => m.isWelcome);
        if (welcomeModule) {
          setSelectedModule(welcomeModule);
        } else if (fetchedCategories.length > 0 && fetchedModules.length > 0) {
            // Find the first module in the first category that has modules
            const firstCategoryWithModules = fetchedCategories.find(c => fetchedModules.some(m => m.category === c.name));
            if (firstCategoryWithModules) {
              const firstModule = fetchedModules.find(m => m.category === firstCategoryWithModules.name);
              setSelectedModule(firstModule || null);
            } else {
              setSelectedModule(fetchedModules[0] || null);
            }
        } else if (fetchedModules.length > 0) {
           setSelectedModule(fetchedModules[0]);
        }

      } catch (error) {
        toast({
          variant: "destructive",
          title: "Failed to fetch data",
        });
      } finally {
        setLoading(false);
      }
    }
    initialFetch();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 


  const filteredModuleIds = React.useMemo(() => {
    if (!search) return new Set(modules.map(m => m.id));
    return new Set(modules
      .filter(
        (module) =>
          module.name.toLowerCase().includes(search.toLowerCase()) ||
          module.description.toLowerCase().includes(search.toLowerCase()) ||
          module.tags.some((tag) =>
            tag.toLowerCase().includes(search.toLowerCase())
          )
      ).map(m => m.id));
  }, [search, modules]);

  const modulesByCategory = React.useMemo(() => {
    return modules.reduce((acc, module) => {
      const { category } = module;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(module);
      return acc;
    }, {} as Record<string, Module[]>);
  }, [modules]);
  
  const visibleCategories = React.useMemo(() => {
    if (!search) {
      return categories;
    }
    const visibleCategoryNames = new Set(modules.filter(m => filteredModuleIds.has(m.id)).map(m => m.category));
    return categories.filter(cat => visibleCategoryNames.has(cat.name));
  }, [categories, modules, filteredModuleIds, search]);


  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Logo className="size-6 text-primary" />
            <div>
              <h1 className="text-lg font-semibold font-headline">{appSettings?.appName}</h1>
              <p className="text-xs text-sidebar-foreground/80">{appSettings?.appSubtitle}</p>
            </div>
          </div>
            <div className="relative mt-2">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search modules..."
                className="pl-8 bg-sidebar-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
        </SidebarHeader>
        <SidebarContent>
          
          <SidebarMenu>
             {loading ? (
              <p className="p-2 text-sm text-muted-foreground">Loading...</p>
            ) : (
            <Accordion
              type="multiple"
              className="w-full"
            >
              {categories.map((category) => {
                const categoryModules = modulesByCategory[category.name] || [];
                const hasVisibleModules = categoryModules.some(m => filteredModuleIds.has(m.id));

                if (search && !hasVisibleModules) return null;

                return (
                  <AccordionItem
                    key={category.name}
                    value={category.name}
                    className="border-none"
                  >
                    <AccordionTrigger className="px-2 py-1 text-sm font-medium hover:no-underline hover:bg-sidebar-accent rounded-md">
                      <div className="flex items-center gap-2">
                        <LayoutGrid className="w-4 h-4" />
                        <span>{category.name}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-1">
                      <SidebarMenu className="pl-4">
                        {categoryModules.map((module) => (
                          <SidebarMenuItem key={module.id} className={cn(
                            "transition-opacity duration-300",
                            search && !filteredModuleIds.has(module.id) ? 'opacity-30' : 'opacity-100'
                          )}>
                            <SidebarMenuButton
                              onClick={() => setSelectedModule(module)}
                              isActive={selectedModule?.id === module.id}
                              className={cn("w-full justify-start", 
                                search && filteredModuleIds.has(module.id) && "ring-2 ring-primary/50"
                              )}
                            >
                              <BookOpen />
                              {module.name}
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
            )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           <SidebarMenuButton asChild>
            <Link href="/admin" className="w-full justify-start">
              <ShieldCheck />
              Admin Panel
            </Link>
          </SidebarMenuButton>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between p-4 border-b">
          <SidebarTrigger />
          <h2 className="text-xl font-bold font-headline">
            {selectedModule ? selectedModule.name : "Welcome"}
          </h2>
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <div className="w-7 h-7" />
          </div>
        </header>
        <main className="p-4 md:p-8 flex-1">
          <DocumentationViewer module={selectedModule} />
        </main>
        <footer className="text-center p-4 text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Mukti Group
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
