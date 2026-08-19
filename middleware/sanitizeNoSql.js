/**
 * Deep NoSQL Injection Sanitizer
 * Recursively strips keys starting with '$' or containing '.' from request body, query, and params
 * to neutralize MongoDB Operator Injection attacks (e.g. { "$gt": "" }).
 */

const sanitizeInPlace = (obj) => {
  if (!obj || typeof obj !== "object") return;

  if (Array.isArray(obj)) {
    obj.forEach((item) => sanitizeInPlace(item));
    return;
  }

  for (const key of Object.keys(obj)) {
    if (key.startsWith("$") || key.includes(".")) {
      delete obj[key];
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      sanitizeInPlace(obj[key]);
    }
  }
};

export const sanitizeNoSql = (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    sanitizeInPlace(req.body);
  }

  if (req.query && typeof req.query === "object") {
    sanitizeInPlace(req.query);
  }

  if (req.params && typeof req.params === "object") {
    sanitizeInPlace(req.params);
  }

  next();
};
