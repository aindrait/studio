'use server';

/**
 * @fileOverview Module CRUD operations.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { modules as allModules, categories as allCategories } from '@/lib/data';
import { Module, Category, Version } from '@/lib/types';

const ModuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  tags: z.array(z.string()),
  description: z.string(),
  content: z.string(),
  image: z.string().optional(),
  versions: z.array(z.object({
    version: z.string(),
    date: z.string(),
    changes: z.array(z.object({
      type: z.enum(["new", "improvement", "fix"]),
      description: z.string(),
    })),
  })),
});

export const getModulesFlow = ai.defineFlow(
  {
    name: 'getModulesFlow',
    inputSchema: z.void(),
    outputSchema: z.array(ModuleSchema),
  },
  async () => {
    return allModules;
  }
);

export const getModuleFlow = ai.defineFlow(
  {
    name: 'getModuleFlow',
    inputSchema: z.string(),
    outputSchema: ModuleSchema.optional(),
  },
  async (id) => {
    return allModules.find(m => m.id === id);
  }
);

export const createModuleFlow = ai.defineFlow(
  {
    name: 'createModuleFlow',
    inputSchema: ModuleSchema,
    outputSchema: ModuleSchema,
  },
  async (module) => {
    // In a real app, you'd save this to a database.
    allModules.push(module);
    return module;
  }
);

export const updateModuleFlow = ai.defineFlow(
  {
    name: 'updateModuleFlow',
    inputSchema: ModuleSchema,
    outputSchema: ModuleSchema.optional(),
  },
  async (module) => {
    const index = allModules.findIndex(m => m.id === module.id);
    if (index !== -1) {
      allModules[index] = module;
      return module;
    }
    return undefined;
  }
);

export const deleteModuleFlow = ai.defineFlow(
  {
    name: 'deleteModuleFlow',
    inputSchema: z.string(), // module id
    outputSchema: z.boolean(),
  },
  async (id) => {
    const index = allModules.findIndex(m => m.id === id);
    if (index !== -1) {
      allModules.splice(index, 1);
      return true;
    }
    return false;
  }
);


export const getCategoriesFlow = ai.defineFlow({
    name: 'getCategoriesFlow',
    inputSchema: z.void(),
    outputSchema: z.array(z.string()),
}, async () => {
    return allCategories;
});

export const createCategoryFlow = ai.defineFlow({
    name: 'createCategoryFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
}, async (category) => {
    if (allCategories.includes(category)) {
        throw new Error(`Category "${category}" already exists.`);
    }
    allCategories.push(category);
    return category;
});

export const updateCategoryFlow = ai.defineFlow({
    name: 'updateCategoryFlow',
    inputSchema: z.object({ oldName: z.string(), newName: z.string() }),
    outputSchema: z.string(),
}, async ({ oldName, newName }) => {
    const index = allCategories.indexOf(oldName);
    if (index === -1) {
        throw new Error(`Category "${oldName}" not found.`);
    }
    if (allCategories.includes(newName) && oldName !== newName) {
      throw new Error(`Category "${newName}" already exists.`);
    }
    allCategories[index] = newName;
    // also update modules
    allModules.forEach(module => {
        if (module.category === oldName) {
            module.category = newName;
        }
    });
    return newName;
});


export const deleteCategoryFlow = ai.defineFlow({
    name: 'deleteCategoryFlow',
    inputSchema: z.string(),
    outputSchema: z.boolean(),
}, async (name) => {
    const isUsed = allModules.some(m => m.category === name);
    if (isUsed) {
        throw new Error(`Category "${name}" is in use and cannot be deleted.`);
    }
    const index = allCategories.indexOf(name);
    if (index !== -1) {
        allCategories.splice(index, 1);
        return true;
    }
    return false;
});


export async function getModules(): Promise<Module[]> {
    return await getModulesFlow();
}

export async function getModule(id: string): Promise<Module | undefined> {
    return await getModuleFlow(id);
}

export async function createModule(module: Module): Promise<Module> {
    return await createModuleFlow(module);
}

export async function updateModule(module: Module): Promise<Module | undefined> {
    return await updateModuleFlow(module);
}

export async function deleteModule(id: string): Promise<boolean> {
    return await deleteModuleFlow(id);
}

export async function getCategories(): Promise<Category[]> {
    return await getCategoriesFlow();
}

export async function createCategory(name: string): Promise<Category> {
    return await createCategoryFlow(name);
}

export async function updateCategory(oldName: string, newName: string): Promise<Category> {
    return await updateCategoryFlow({ oldName, newName });
}

export async function deleteCategory(name: string): Promise<boolean> {
    return await deleteCategoryFlow(name);
}
