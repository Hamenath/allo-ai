# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x   | ✅ Yes |

Only the latest release receives security fixes.

---

## Reporting a Vulnerability

**Please do NOT report security vulnerabilities via public GitHub Issues.**

If you discover a security vulnerability in ALLO, please report it privately so we can address it before it is disclosed publicly.

### How to Report

Send a detailed email to: **security@alloai.in**

Include:
- A clear description of the vulnerability
- Steps to reproduce the issue
- The potential impact and severity
- Any proof-of-concept (if applicable) — do not exploit production data

We will acknowledge receipt within **48 hours** and aim to provide a resolution timeline within **5 business days** for critical issues.

---

## What to Expect

1. **Acknowledgement** — We confirm receipt of your report within 48 hours
2. **Assessment** — We investigate and determine severity
3. **Fix** — We develop, test, and deploy a fix
4. **Disclosure** — We coordinate with you on responsible public disclosure timing
5. **Credit** — With your permission, we acknowledge your contribution

---

## Scope

The following are **in scope** for security reports:
- Authentication and authorization bypasses
- Cross-user data access (IDOR)
- Payment or subscription manipulation
- Admin privilege escalation
- Webhook forgery
- Significant XSS vulnerabilities
- Server-side request forgery
- Exposed secrets or credentials

The following are generally **out of scope**:
- Self-XSS requiring the attacker to be logged in as themselves
- Clickjacking on non-sensitive pages
- Missing security headers on public marketing pages only
- Rate limiting on unauthenticated public endpoints that cause no data exposure
- Social engineering attacks
- Denial of service against infrastructure we don't control

---

## Our Commitment

- We will not pursue legal action against researchers acting in good faith
- We will treat your report confidentially until a fix is in place
- We will keep you informed of our progress

---

## Contact

**Security:** security@alloai.in  
**Privacy:** privacy@alloai.in  
**General Support:** support@alloai.in
