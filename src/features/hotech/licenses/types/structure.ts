export interface FlatStructureItem {
  id: string;
  name: string;
  type: "company" | "branch" | "department" | "section" | "unit";
  parentId: string | null;
  licenseId: string;
}
