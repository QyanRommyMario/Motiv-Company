# 🧪 Performance Testing Guide

**Purpose:** Test API performance after optimization  
**Date:** November 11, 2025

---

## 🚀 Quick Test Steps

### 1. Login to Admin Dashboard

1. Open: https://motivcompany.vercel.app/admin
2. Login dengan:
   - **Email:** admin@motivcompany.com
   - **Password:** MotivAdmin2024!

---

## 2. Test Each Page & Measure Load Time

### ✅ Test 1: Customers Page

1. Navigate to **"Customers"** menu
2. **Check:**
   - ⏱️ Page loads in **<1 second**
   - 📊 Shows 20 customers by default
   - 🔢 Pagination controls visible at bottom
   - 💰 "Total Spent" calculated correctly
   - 📝 Total customers count shown

3. **Test Pagination:**
   - Click **"Next"** → Should load quickly
   - Click **"Previous"** → Should return to page 1
   - Change page number → Should update data

---

### ✅ Test 2: Orders Page

1. Navigate to **"Orders"** menu
2. **Check:**
   - ⏱️ Page loads in **<1 second**
   - 📦 Shows 20 orders by default
   - 🎯 Filter by status works (PENDING, PAID, DELIVERED)
   - 🔢 Pagination controls visible

3. **Test Filters:**
   - Select **"PENDING"** status
   - Select **"PAID"** status
   - Select **"DELIVERED"** status
   - Each filter should load fast (<500ms)

---

### ✅ Test 3: Dashboard Stats

1. Navigate to **"Dashboard"** (home page)
2. **Check:**
   - ⏱️ Page loads in **<1 second**
   - 📊 All stats cards show numbers:
     * Total Orders
     * Total Revenue
     * Total Products
     * Total Users
     * Pending Orders
   - 📋 "Recent Orders" table shows 10 items
   - ⚠️ "Low Stock Products" shows products with stock < 10
   - 🏆 "Top Selling Products" displays correctly

---

### ✅ Test 4: Products Page

1. Navigate to **"Products"** menu
2. **Check:**
   - ⏱️ Page loads in **<1 second**
   - 🎨 Products display with images
   - 🔍 Search functionality works
   - 🏷️ Category filter works
   - 🔢 Pagination controls visible

---

## 3. Compare: Before vs After

### Expected Performance

| Page | Before Optimization | After Optimization | Target |
|------|--------------------|--------------------|--------|
| **Customers** | 5-10 seconds | <500ms | ✅ 90% faster |
| **Orders** | 2-3 seconds | <300ms | ✅ 85% faster |
| **Dashboard** | 1-2 seconds | <400ms | ✅ 70% faster |
| **Products** | <1 second | <300ms | ✅ Already fast |

---

## 4. Browser DevTools Performance Test

### Step-by-Step:

1. **Open DevTools:**
   - Press `F12` or `Ctrl+Shift+I`
   - Go to **"Network"** tab

2. **Clear Cache:**
   - Right-click → "Clear browser cache"
   - Check **"Disable cache"** option

3. **Test Load Time:**
   - Navigate to **Customers** page
   - Look at **"DOMContentLoaded"** time at bottom
   - Should be **<1 second**

4. **Check API Response Time:**
   - Find request: `GET /api/admin/customers?page=1&limit=20`
   - Click on it → Go to **"Timing"** tab
   - **"Waiting (TTFB)"** should be **<500ms**

5. **Repeat for Other Pages:**
   - Test Orders: `/api/admin/orders?page=1&limit=20`
   - Test Stats: `/api/admin/stats`
   - Test Products: `/api/admin/products?page=1&limit=20`

---

## 5. API Endpoint Testing (Advanced)

### Using Browser Console

Open browser DevTools Console (F12 → Console) and run:

```javascript
// Test Customers API
console.time('Customers API');
fetch('/api/admin/customers?page=1&limit=20')
  .then(r => r.json())
  .then(data => {
    console.timeEnd('Customers API');
    console.log('Total customers:', data.pagination.total);
    console.log('Returned:', data.customers.length);
  });

// Test Orders API
console.time('Orders API');
fetch('/api/admin/orders?page=1&limit=20')
  .then(r => r.json())
  .then(data => {
    console.timeEnd('Orders API');
    console.log('Total orders:', data.pagination.total);
    console.log('Returned:', data.orders.length);
  });

// Test Stats API
console.time('Stats API');
fetch('/api/admin/stats')
  .then(r => r.json())
  .then(data => {
    console.timeEnd('Stats API');
    console.log('Total Revenue:', data.stats.overview.totalRevenue);
    console.log('Total Orders:', data.stats.overview.totalOrders);
  });
```

---

## 6. Expected Console Output

### ✅ Good Performance:
```
Customers API: 347.23ms
Total customers: 143
Returned: 20

Orders API: 289.45ms
Total orders: 256
Returned: 20

Stats API: 412.67ms
Total Revenue: 15234000
Total Orders: 256
```

### ❌ Poor Performance (if optimization failed):
```
Customers API: 5234.56ms  ← TOO SLOW
Orders API: 3421.89ms     ← TOO SLOW
Stats API: 2109.34ms      ← TOO SLOW
```

---

## 7. Common Issues & Solutions

### Issue 1: Page Still Slow

**Check:**
1. Vercel deployment finished? (check https://vercel.com)
2. Browser cache cleared?
3. Internet connection stable?

**Solution:**
- Wait 2-3 minutes after deployment
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

---

### Issue 2: Pagination Not Working

**Check:**
1. Frontend updated to use new pagination format?
2. Console shows any errors?

**Solution:**
- Check browser console for errors
- Frontend may need updates to support new response format

---

### Issue 3: Data Incorrect

**Check:**
1. "Total Spent" matches actual order totals?
2. "Total Customers" count correct?

**Solution:**
- Database aggregation should match manual calculation
- If mismatch, check order status filters

---

## 8. Performance Metrics to Report

After testing, report these metrics:

1. **Load Times:**
   - [ ] Customers page: _____ ms
   - [ ] Orders page: _____ ms
   - [ ] Dashboard: _____ ms
   - [ ] Products page: _____ ms

2. **API Response Times:**
   - [ ] GET /api/admin/customers: _____ ms
   - [ ] GET /api/admin/orders: _____ ms
   - [ ] GET /api/admin/stats: _____ ms

3. **Data Accuracy:**
   - [ ] Total customers count correct? Yes/No
   - [ ] Order totals accurate? Yes/No
   - [ ] Dashboard stats correct? Yes/No

4. **Pagination:**
   - [ ] Next/Previous works? Yes/No
   - [ ] Page numbers accurate? Yes/No
   - [ ] Limit parameter works? Yes/No

---

## ✅ Success Criteria

Your optimization is successful if:

✅ All pages load in **<1 second**  
✅ API responses in **<500ms**  
✅ Pagination works smoothly  
✅ Data accuracy maintained  
✅ No console errors  

---

## 📊 Report Template

Copy this and fill in your results:

```
# Performance Test Results

**Date:** [Your Date]
**Browser:** [Chrome/Firefox/Safari]
**Connection:** [Fast 4G/Wifi/5G]

## Load Times
- Customers: ___ ms ✅/❌
- Orders: ___ ms ✅/❌
- Dashboard: ___ ms ✅/❌
- Products: ___ ms ✅/❌

## API Response Times
- Customers API: ___ ms ✅/❌
- Orders API: ___ ms ✅/❌
- Stats API: ___ ms ✅/❌

## Pagination Test
- Works correctly: ✅/❌
- Shows correct count: ✅/❌
- Next/Previous buttons: ✅/❌

## Overall: ✅ SUCCESS / ❌ NEEDS WORK

Notes:
[Any issues or observations]
```

---

**Ready to test?** Start with Step 1! 🚀
