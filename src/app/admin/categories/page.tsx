
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, MoreHorizontal, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getCategories, createCategory, updateCategory, deleteCategory, reorderCategories } from "@/ai/flows/module-crud";
import { Category } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { arrayMove } from "@/lib/utils";
import { useSession } from "@/lib/session-client";

export default function CategoriesPage() {
  const { session, loading: sessionLoading } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [initialOrder, setInitialOrder] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const [isDirty, setIsDirty] = useState(false);

  const isEditor = session?.role === 'editor';

  async function fetchCategories() {
    try {
      setLoading(true);
      const fetchedCategories = await getCategories();
      setCategories(fetchedCategories);
      setInitialOrder(fetchedCategories);
      setIsDirty(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to fetch categories",
        description: "Could not load the list of categories.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  useEffect(() => {
      const isOrderChanged = JSON.stringify(categories) !== JSON.stringify(initialOrder);
      setIsDirty(isOrderChanged);
  }, [categories, initialOrder]);

  const handleOpenDialog = (category: Category | null = null) => {
    if (isEditor) return;
    if (category) {
      setIsEditing(true);
      setCurrentCategory(category);
      setCategoryName(category.name);
    } else {
      setIsEditing(false);
      setCurrentCategory(null);
      setCategoryName("");
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (isEditor) return;
    if (!categoryName.trim()) {
        toast({
            variant: "destructive",
            title: "Validation Error",
            description: "Category name cannot be empty.",
        });
        return;
    }
    
    try {
      if (isEditing && currentCategory) {
        await updateCategory(currentCategory.name, categoryName);
        toast({ title: "Category Updated" });
      } else {
        await createCategory({name: categoryName});
        toast({ title: "Category Created" });
      }
      fetchCategories();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: error.message || "Could not save the category.",
      });
    }
  };
  
  const confirmDelete = (name: string) => {
    if (isEditor) return;
    setCategoryToDelete(name);
    setIsAlertOpen(true);
  };

  const handleDelete = async () => {
    if (!categoryToDelete || isEditor) return;

    try {
      await deleteCategory(categoryToDelete);
      toast({
        title: "Category Deleted",
      });
      fetchCategories();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: error.message || "Could not delete the category. It might be in use by a module.",
      });
    } finally {
      setIsAlertOpen(false);
      setCategoryToDelete(null);
    }
  };

  const handleReorder = (index: number, direction: 'up' | 'down') => {
      if (isEditor) return;
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= categories.length) return;
      const reorderedCategories = arrayMove(categories, index, newIndex);
      setCategories(reorderedCategories);
  };

  const handleSaveOrder = async () => {
      if (isEditor) return;
      try {
          await reorderCategories(categories);
          toast({ title: "Category Order Saved" });
          setInitialOrder(categories);
          setIsDirty(false);
      } catch (error) {
          toast({
              variant: "destructive",
              title: "Failed to save order",
              description: "Could not update the category order."
          });
      }
  };

  if (sessionLoading) {
    return <p>Loading...</p>
  }
  
  if (isEditor) {
      return (
          <Card>
              <CardHeader>
                  <CardTitle>Access Denied</CardTitle>
                  <CardDescription>You do not have permission to manage categories.</CardDescription>
              </CardHeader>
          </Card>
      )
  }


  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-headline">Categories</CardTitle>
              <CardDescription>
                Manage and reorder your documentation categories.
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()} disabled={isEditor}>
              <PlusCircle className="mr-2" />
              New Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading categories...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-[120px]">Reorder</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category, index) => (
                  <TableRow key={category.name}>
                    <TableCell className="font-medium text-left">{category.name}</TableCell>
                     <TableCell>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleReorder(index, 'up')} disabled={index === 0 || isEditor}>
                                <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleReorder(index, 'down')} disabled={index === categories.length - 1 || isEditor}>
                                <ArrowDown className="h-4 w-4" />
                            </Button>
                        </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={isEditor}>
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleOpenDialog(category)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => confirmDelete(category.name)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
         {isDirty && !isEditor && (
            <CardFooter className="flex justify-end">
                <Button onClick={handleSaveOrder}>Save Order</Button>
            </CardFooter>
        )}
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Category" : "New Category"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the category
                      &quot;{categoryToDelete}&quot;.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
