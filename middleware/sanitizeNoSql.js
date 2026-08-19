/**
 * Deep NoSQL Injection Sanitizer
 * Recursively strips keys starting with '$' or containing '.' from request body, query, and params
 * to neutralize MongoDB Operator Injection attacks (e.g. { "$gt": "" }).
 */

const cleanObject = (obj) => {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => cleanObject(item));
  }

  const sanitized = {};

  for (const [key, value] of Object.entries(obj)) {
    // Strip forbidden MongoDB operator prefixes and dot-notation paths
    if (key.startsWith("$") || key.includes(".")) {
      continue;
    }

    if (value !== null && typeof value === "object") {
      sanitized[key] = cleanObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

export const sanitizeNoSql = (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    req.body = cleanObject(req.body);
  }

  if (req.query && typeof req.query === "object") {
    req.query = cleanObject(req.query);
  }

  if (req.params && typeof req.params === "object") {
    req.params = cleanObject(req.params);
  }

  next();
};
