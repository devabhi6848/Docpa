/**
 * XSS & HTML Tag Sanitization Utility
 * Neutralizes injected script tags, event handlers, and malicious HTML strings in user-supplied medical text.
 */

const HTML_ENTITIES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
};

/**
 * Escapes HTML characters in a string
 * @param {string} str 
 * @returns {string} Escaped string
 */
export const escapeHtml = (str) => {
  if (!str || typeof str !== "string") return str;
  return str.replace(/[&<>"'/]/g, (match) => HTML_ENTITIES[match]);
};

/**
 * Strips HTML tags entirely from text
 * @param {string} str 
 * @returns {string} Plain text
 */
export const stripHtml = (str) => {
  if (!str || typeof str !== "string") return str;
  return str.replace(/<[^>]*>?/gm, "").trim();
};

/**
 * Sanitizes an array or single string of clinical input text (e.g. complaints, diagnosis)
 * @param {string|string[]} input 
 * @returns {string|string[]}
 */
export const sanitizeClinicalText = (input) => {
  if (Array.isArray(input)) {
    return input.map((item) => stripHtml(item));
  }
  return stripHtml(input);
};
