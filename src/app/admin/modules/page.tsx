
"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, MoreHorizontal, Trash2, Pencil, Star } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getModules, deleteModule, getCategories, updateModule } from "@/ai/flows/module-crud";
import { Module, Category } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ModulesPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const fetchModulesAndCategories = async () => {
    try {
      setLoading(true);
      const [fetchedModules, fetchedCategories] = await Promise.all([
        getModules(),
        getCategories(),
      ]);
      setModules(fetchedModules);
      setCategories(fetchedCategories);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to fetch data",
        description: "Could not load modules and categories.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModulesAndCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredModules = useMemo(() => {
    if (selectedCategory === "all") {
      return modules;
    }
    return modules.filter((module) => module.category === selectedCategory);
  }, [modules, selectedCategory]);

  const totalPages = Math.ceil(filteredModules.length / ITEMS_PER_PAGE);

  const paginatedModules = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredModules.slice(startIndex, endIndex);
  }, [filteredModules, currentPage]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  const handleDelete = async (moduleId: string) => {
    if (confirm("Are you sure you want to delete this module?")) {
      try {
        await deleteModule(moduleId);
        toast({
          title: "Module Deleted",
          description: "The module has been successfully deleted.",
        });
        fetchModulesAndCategories();
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Deletion Failed",
          description: "Could not delete the module.",
        });
      }
    }
  };

  const handleEdit = (moduleId: string) => {
    router.push(`/admin/modules/edit/${moduleId}`);
  };

  const handleSetWelcome = async (module: Module) => {
    try {
        const updatedModule = { ...module, isWelcome: true };
        await updateModule(updatedModule);
        toast({
            title: "Welcome Page Set",
            description: `"${module.name}" is now the welcome page.`
        });
        fetchModulesAndCategories();
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Could not set the welcome page."
        });
    }
  };
  
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="font-headline">Modules</CardTitle>
            <CardDescription>
              Create, edit, and manage your documentation modules.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
             <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.name} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button asChild>
              <Link href="/admin/modules/new">
                <PlusCircle className="mr-2" />
                New Module
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading modules...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedModules.map((module) => (
                <TableRow key={module.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    {module.isWelcome && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                    {module.name}
                  </TableCell>
                  <TableCell>{module.category}</TableCell>
                  <TableCell>{module.tags.join(", ")}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleEdit(module.id)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                         {!module.isWelcome && (
                            <DropdownMenuItem onClick={() => handleSetWelcome(module)}>
                                <Star className="mr-2 h-4 w-4" />
                                Set as welcome page
                            </DropdownMenuItem>
                         )}
                        <DropdownMenuItem onClick={() => handleDelete(module.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
         {!loading && paginatedModules.length === 0 && (
          <div className="text-center p-8 text-muted-foreground">
            No modules found for the selected category.
          </div>
        )}
      </CardContent>
       {totalPages > 1 && (
        <CardFooter className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
