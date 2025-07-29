export type ModuleCategory = "Core Systems" | "User Interface" | "Data Management";

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
