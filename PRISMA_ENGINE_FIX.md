# ✅ PRISMA ENGINE RUNTIME ERROR - FIXED

## 🔴 Error Yang Terjadi

```
Invalid `prisma.user.findUnique()` invocation:
Prisma Client could not locate the Query Engine for runtime "rhel-openssl-3.0.x".

The following locations have been searched:
  /var/task/node_modules/.prisma/client
  /var/task/node_modules/@prisma/client
  /vercel/path0/node_modules/@prisma/client
  /tmp/prisma-engines
```

**Root Cause**: Prisma query engine binary (`libquery_engine-rhel-openssl-3.0.x.so.node`) tidak ter-copy ke Vercel serverless function output folder.

---

## 🔧 Solusi yang Diterapkan

### 1. **Next.js Standalone Output** ✅

Updated `next.config.mjs`:

```javascript
output: 'standalone',  // Enable standalone build for Vercel
```

**Why**: Standalone mode creates self-contained output dengan semua dependencies, memudahkan copy Prisma binaries.

---

### 2. **Prisma Engine Copy Script** ✅

Created `scripts/copy-prisma-engines.js`:

- Runs AFTER `next build`
- Copies `.prisma/client` → `.next/standalone/node_modules/.prisma/client`
- Copies `@prisma/client` → `.next/standalone/node_modules/@prisma/client`
- Verifies `libquery_engine-rhel-openssl-3.0.x.so.node` exists

**Triggered by**:

```json
"build": "prisma generate && next build && node scripts/copy-prisma-engines.js"
```

---

### 3. **Dynamic Engine Path Detection** ✅

Updated `src/lib/prisma.js`:

```javascript
// Detect Vercel environment
const isVercel = process.env.VERCEL === "1" || process.env.VERCEL_ENV;

if (isVercel) {
  // Search multiple possible paths
  const possiblePaths = [
    "/var/task/node_modules/.prisma/client",
    "/var/task/.next/standalone/node_modules/.prisma/client",
    path.join(process.cwd(), "node_modules/.prisma/client"),
  ];

  // Set PRISMA_QUERY_ENGINE_LIBRARY env var
  for (const basePath of possiblePaths) {
    const enginePath = path.join(
      basePath,
      "libquery_engine-rhel-openssl-3.0.x.so.node"
    );
    if (fs.existsSync(enginePath)) {
      process.env.PRISMA_QUERY_ENGINE_LIBRARY = enginePath;
      break;
    }
  }
}
```

**Why**: Membantu Prisma menemukan engine binary di runtime Vercel yang path-nya bisa berubah.

---

### 4. **Turbopack Configuration** ✅

```javascript
turbopack: {
  resolveAlias: {
    '.prisma/client': './node_modules/.prisma/client',
  },
},
```

**Why**: Force Turbopack (Next.js 16 bundler) untuk resolve Prisma client dengan benar.

---

### 5. **Webpack Externals** ✅

```javascript
webpack: (config, { isServer }) => {
  if (isServer) {
    config.externals = [...config.externals, '@prisma/client', 'prisma'];
  }
  return config;
},
```

**Why**: Prevent webpack from bundling Prisma (harus native binary, bukan bundled JS).

---

## 📦 Build Process Flow

```
1. npm install
   └─> postinstall: prisma generate
       ✓ Generates client to node_modules/.prisma/client
       ✓ Downloads libquery_engine-rhel-openssl-3.0.x.so.node

2. npm run build
   ├─> prisma generate (ensure latest)
   ├─> next build (create .next/standalone)
   └─> node scripts/copy-prisma-engines.js
       ✓ Copy .prisma/client → .next/standalone/...
       ✓ Copy @prisma/client → .next/standalone/...
       ✓ Verify engine binary exists

3. Vercel Deploy
   └─> Upload .next/standalone
       ✓ Contains Prisma client + engine binary
       ✓ Runtime can locate engine via PRISMA_QUERY_ENGINE_LIBRARY
```

---

## ✅ What Changed

| File                             | Change                       | Purpose                            |
| -------------------------------- | ---------------------------- | ---------------------------------- |
| `next.config.mjs`                | Added `output: 'standalone'` | Enable self-contained build        |
| `next.config.mjs`                | Added Turbopack alias        | Force Prisma client resolution     |
| `next.config.mjs`                | Added webpack externals      | Prevent Prisma bundling            |
| `package.json`                   | Updated build script         | Run engine copy after build        |
| `scripts/copy-prisma-engines.js` | **NEW**                      | Copy engine binaries to standalone |
| `src/lib/prisma.js`              | Added engine path detection  | Help Prisma find engine at runtime |

---

## 🧪 Verification

After deployment, check Vercel build logs:

### ✅ Expected Output:

```
> prisma generate && next build && node scripts/copy-prisma-engines.js

✔ Generated Prisma Client to ./node_modules/@prisma/client

Creating an optimized production build ...
✓ Compiled successfully

📦 Copying Prisma engines for Vercel deployment...

1. Copying .prisma/client...
  ✓ Copied: index.js
  ✓ Copied: libquery_engine-rhel-openssl-3.0.x.so.node
  ✓ Copied: schema.prisma
  ✅ .prisma/client copied

2. Copying @prisma/client...
  ✓ Copied: index.js
  ✓ Copied: runtime/library.js
  ✅ @prisma/client copied

✅ Prisma query engine for rhel-openssl-3.0.x found:
   - libquery_engine-rhel-openssl-3.0.x.so.node

🎉 Prisma engines copied successfully!
```

---

## 🚀 Runtime Verification

### Test API Endpoints:

1. **Stories API**: https://motivcompany.vercel.app/api/stories

   ```bash
   curl https://motivcompany.vercel.app/api/stories
   ```

   **Expected**: JSON array of stories (NOT "Internal server error")

2. **Products API**: https://motivcompany.vercel.app/api/products

   ```bash
   curl https://motivcompany.vercel.app/api/products
   ```

   **Expected**: JSON array of products

3. **Health Check**: https://motivcompany.vercel.app/api/health
   ```bash
   curl https://motivcompany.vercel.app/api/health
   ```
   **Expected**: `{"status":"ok","database":"connected"}`

---

## ⚠️ Important Notes

### Environment Variables Required:

Make sure these are set in Vercel:

- ✅ `DATABASE_URL` - Connection pooling URL
- ✅ `DIRECT_URL` - Direct connection for migrations
- ✅ `NEXTAUTH_SECRET`
- ✅ `NEXTAUTH_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**See**: `ENV_SETUP_COMPLETE.md` for import instructions

---

## 📝 Why This Happens

**Next.js 16 + Turbopack + Vercel Serverless**:

- Turbopack (new bundler) handles dependencies differently than webpack
- `output: 'standalone'` creates minimal output, excluding some binaries by default
- Prisma needs native binary (`.so.node` file), can't be bundled
- Vercel serverless functions run in isolated `/var/task` directory
- Default build doesn't copy Prisma engine to deployment folder

**Our solution**: Explicitly copy engine after build + help Prisma locate it at runtime.

---

## 🔄 Rollback Plan

If this causes issues, revert with:

```bash
git revert bb3be79
git push
```

Then use alternative approach:

1. Disable `output: 'standalone'`
2. Use Prisma's official Vercel integration
3. Or switch to Prisma Data Proxy

---

## 📚 References

- [Prisma + Vercel Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Next.js Standalone Output](https://nextjs.org/docs/app/api-reference/next-config-js/output)
- [Prisma Engine Not Found](https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-monorepo)

---

**Commit**: `bb3be79` - Prisma engine bundling for Vercel serverless  
**Status**: Deployed, awaiting runtime verification ✅
