'use server';

/**
 * @fileOverview Module CRUD operations using a file-based JSON database.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { Module, Category, Version } from '@/lib/types';
import fs from 'fs/promises';
import path from 'path';

// Define the structure of our database
const DbSchema = z.object({
  modules: z.array(z.any()), // Using any for now to avoid schema duplication, will be validated on use
  categories: z.array(z.string()),
});

type Db = z.infer<typeof DbSchema>;

const dbPath = path.join(process.cwd(), 'src', 'lib', 'db.json');

// Helper function to read the database file
async function readDb(): Promise<Db> {
  try {
    const fileContent = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    // If the file doesn't exist or is empty, return a default structure
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return { modules: [], categories: [] };
    }
    console.error("Error reading database file:", error);
    throw new Error("Could not read from database.");
  }
}

// Helper function to write to the database file
async function writeDb(data: Db): Promise<void> {
  try {
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error("Error writing to database file:", error);
    throw new Error("Could not write to database.");
  }
}


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
    const db = await readDb();
    return db.modules;
  }
);

export const getModuleFlow = ai.defineFlow(
  {
    name: 'getModuleFlow',
    inputSchema: z.string(),
    outputSchema: ModuleSchema.optional(),
  },
  async (id) => {
    const db = await readDb();
    return db.modules.find(m => m.id === id);
  }
);

export const createModuleFlow = ai.defineFlow(
  {
    name: 'createModuleFlow',
    inputSchema: ModuleSchema,
    outputSchema: ModuleSchema,
  },
  async (module) => {
    const db = await readDb();
    db.modules.push(module);
    await writeDb(db);
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
    const db = await readDb();
    const index = db.modules.findIndex(m => m.id === module.id);
    if (index !== -1) {
      db.modules[index] = module;
      await writeDb(db);
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
    const db = await readDb();
    const index = db.modules.findIndex(m => m.id === id);
    if (index !== -1) {
      db.modules.splice(index, 1);
      await writeDb(db);
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
    const db = await readDb();
    return db.categories;
});

export const createCategoryFlow = ai.defineFlow({
    name: 'createCategoryFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
}, async (category) => {
    const db = await readDb();
    if (db.categories.includes(category)) {
        throw new Error(`Category "${category}" already exists.`);
    }
    db.categories.push(category);
    await writeDb(db);
    return category;
});

export const updateCategoryFlow = ai.defineFlow({
    name: 'updateCategoryFlow',
    inputSchema: z.object({ oldName: z.string(), newName: z.string() }),
    outputSchema: z.string(),
}, async ({ oldName, newName }) => {
    const db = await readDb();
    const index = db.categories.indexOf(oldName);
    if (index === -1) {
        throw new Error(`Category "${oldName}" not found.`);
    }
    if (db.categories.includes(newName) && oldName !== newName) {
      throw new Error(`Category "${newName}" already exists.`);
    }
    db.categories[index] = newName;
    // also update modules
    db.modules.forEach(module => {
        if (module.category === oldName) {
            module.category = newName;
        }
    });
    await writeDb(db);
    return newName;
});


export const deleteCategoryFlow = ai.defineFlow({
    name: 'deleteCategoryFlow',
    inputSchema: z.string(),
    outputSchema: z.boolean(),
}, async (name) => {
    const db = await readDb();
    const isUsed = db.modules.some(m => m.category === name);
    if (isUsed) {
        throw new Error(`Category "${name}" is in use and cannot be deleted.`);
    }
    const index = db.categories.indexOf(name);
    if (index !== -1) {
        db.categories.splice(index, 1);
        await writeDb(db);
        return true;
    }
    return false;
});


// Exported functions that components will call
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
