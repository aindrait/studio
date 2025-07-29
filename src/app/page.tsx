
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
  SidebarGroup,
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

import { type Module, type Category } from "@/lib/types";
import { DocumentationViewer } from "@/components/documentation-viewer";
import { Logo } from "@/components/icons";
import Link from "next/link";
import { getModules, getCategories } from "@/ai/flows/module-crud";
import { useToast } from "@/hooks/use-toast";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function Home() {
  const [modules, setModules] = React.useState<Module[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [search, setSearch] = React.useState("");
  const [selectedModule, setSelectedModule] = React.useState<Module | null>(null);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    async function initialFetch() {
      setLoading(true);
      try {
        const [fetchedModules, fetchedCategories] = await Promise.all([
          getModules(),
          getCategories(),
        ]);

        setModules(fetchedModules);
        setCategories(fetchedCategories);

        if (fetchedModules.length > 0 && !selectedModule) {
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


  const filteredModules = React.useMemo(() => {
    if (!search) return modules;
    return modules.filter(
      (module) =>
        module.name.toLowerCase().includes(search.toLowerCase()) ||
        module.description.toLowerCase().includes(search.toLowerCase()) ||
        module.tags.some((tag) =>
          tag.toLowerCase().includes(search.toLowerCase())
        )
    );
  }, [search, modules]);

  const modulesByCategory = React.useMemo(() => {
    return filteredModules.reduce((acc, module) => {
      const { category } = module;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(module);
      return acc;
    }, {} as Record<string, Module[]>);
  }, [filteredModules]);
  
  const visibleCategories = React.useMemo(() => {
    const visibleCategoryNames = Object.keys(modulesByCategory);
    return categories.filter(cat => visibleCategoryNames.includes(cat.name));
  }, [categories, modulesByCategory]);


  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Logo className="size-6 text-primary" />
            <h1 className="text-lg font-semibold font-headline">MDS Manual</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search modules..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </SidebarGroup>
          <SidebarMenu>
             {loading ? (
              <p className="p-2 text-sm text-muted-foreground">Loading...</p>
            ) : (
            <Accordion
              type="multiple"
              className="w-full"
              key={visibleCategories.map(c => c.name).join('-')}
            >
              {visibleCategories.map((category) => (
                <AccordionItem
                  key={category.name}
                  value={category.name}
                  className="border-none"
                >
                  <AccordionTrigger className="px-2 py-1 text-sm font-medium hover:no-underline hover:bg-accent rounded-md">
                    <div className="flex items-center gap-2">
                      <LayoutGrid className="w-4 h-4" />
                      <span>{category.name}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-1">
                    <SidebarMenu className="pl-4">
                      {modulesByCategory[category.name].map((module) => (
                        <SidebarMenuItem key={module.id}>
                          <SidebarMenuButton
                            onClick={() => setSelectedModule(module)}
                            isActive={selectedModule?.id === module.id}
                            className="w-full justify-start"
                          >
                            <BookOpen />
                            {module.name}
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </AccordionContent>
                </AccordionItem>
              ))}
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
        <main className="p-4 md:p-8">
          <DocumentationViewer module={selectedModule} />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
