export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createProductSlug(title: string): string {
  return slugify(title);
}

export function createCategorySlug(category: string): string {
  return slugify(category);
}
