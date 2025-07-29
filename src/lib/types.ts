export type ModuleCategory = string;

export type Version = {
  version: string;
  date: string;
  changes: {
    type: "new" | "improvement" | "fix";
    description: string;
  }[];
};

export type Module = {
  id: string;
  name: string;
  category: ModuleCategory;
  tags: string[];
  description: string;
  content: string; // Rich text/HTML content
  image?: string;
  versions: Version[];
};

export type Category = string;
