export type ModuleCategory = string;

export type VersionChange = {
  type: "new" | "improvement" | "fix";
  description: string;
};

export type Version = {
  version: string;
  date: string;
  changes: VersionChange[];
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
  isWelcome?: boolean;
};

export type Category = {
  name: string;
};

export type AdminUser = {
  id: string;
  username: string;
  password?: string; // Should be hashed in a real app. Optional when sending to client.
  role: 'admin' | 'editor';
}
