/**
 * Convert a string to a URL-friendly slug
 * @param {string} text - The text to convert to a slug
 * @returns {string} - The URL-friendly slug
 */
export function createSlug(text) {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate a unique slug by appending a number if the slug already exists
 * @param {string} title - The blog post title
 * @param {string} existingSlug - The existing slug (if any)
 * @returns {string} - A unique slug
 */
export function generateUniqueSlug(title, existingSlug = '') {
  const baseSlug = createSlug(title);
  
  // If no existing slug or it's different, return the base slug
  if (!existingSlug || existingSlug === baseSlug) {
    return baseSlug;
  }
  
  // If the existing slug starts with the base slug, extract the number
  const slugPattern = new RegExp(`^${baseSlug}(?:-(\\d+))?$`);
  const match = existingSlug.match(slugPattern);
  
  if (match) {
    const currentNumber = match[1] ? parseInt(match[1]) : 0;
    return `${baseSlug}-${currentNumber + 1}`;
  }
  
  // If no pattern match, just append a number
  return `${baseSlug}-1`;
}

/**
 * Extract the base title from a slug (removes numbering)
 * @param {string} slug - The slug to extract title from
 * @returns {string} - The base title
 */
export function extractTitleFromSlug(slug) {
  if (!slug) return '';
  
  // Remove trailing numbers and hyphens
  return slug.replace(/-?\d+$/, '');
}
