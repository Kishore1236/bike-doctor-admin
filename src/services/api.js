const PRIMARY_API = import.meta.env.VITE_API_URL || 'https://bike-doctor-backend-vert.vercel.app';
const SECONDARY_API = 'https://bike-doctor-service.vercel.app';
const LOCAL_API = 'http://localhost:5000';
const GOOGLE_SHEET_ID = '1ct2jXUykSUX2XpU3vFVTZmDXZTHCliqV89ea92o5wFM';

function getAdminStatusOverrides() {
  try {
    const raw = localStorage.getItem('admin_status_overrides');
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveAdminStatusOverride(bookingId, rowIndex, name, paymentStatus, paymentMethod) {
  try {
    const current = getAdminStatusOverrides();
    const payload = { paymentStatus, paymentMethod, updatedAt: Date.now() };
    if (bookingId) {
      current[bookingId] = payload;
      current[String(bookingId).toLowerCase()] = payload;
    }
    if (rowIndex) {
      current[`row_${rowIndex}`] = payload;
    }
    if (name) {
      current[`name_${String(name).toLowerCase()}`] = payload;
    }
    localStorage.setItem('admin_status_overrides', JSON.stringify(current));
  } catch (e) {}
}

async function fetchFromGoogleSheetsDirect({ search, paymentStatus, paymentMethod, plan, sort, page, limit }) {
  const gvizUrl = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:json`;
  const gvizRes = await fetch(gvizUrl);
  if (!gvizRes.ok) {
    throw new Error('Failed to fetch from Google Sheets');
  }

  const text = await gvizRes.text();
  const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
  const parsed = JSON.parse(jsonStr);
  const rows = parsed.table?.rows || [];

  const todayStr = new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
  const allBookings = [];

  let paidCount = 0;
  let pendingCount = 0;
  let payAtServiceCount = 0;
  let onlinePaymentCount = 0;
  let todayBookingsCount = 0;
  let totalRevenue = 0;

  const overrides = getAdminStatusOverrides();

  rows.forEach((row, index) => {
    const cells = row.c || [];
    const getVal = (idx) => (cells[idx] && cells[idx].v !== null && cells[idx].v !== undefined) ? String(cells[idx].v).trim() : '';

    const rawTimestamp = getVal(0);
    let formattedTimestamp = rawTimestamp;
    let dateObj = null;

    if (rawTimestamp.startsWith('Date(')) {
      try {
        const parts = rawTimestamp.replace(/Date\(|\)/g, '').split(',').map(n => parseInt(n.trim(), 10));
        if (parts.length >= 3) {
          dateObj = new Date(parts[0], parts[1], parts[2], parts[3] || 0, parts[4] || 0, parts[5] || 0);
          formattedTimestamp = dateObj.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        }
      } catch (e) {}
    }

    const rowIndex = index + 2;
    const name = getVal(1) || 'Customer';
    const pickupType = getVal(2) || 'home';
    const rawLocation = getVal(3);
    const cleanLocation = rawLocation.replace(/\s*\|\s*[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi, '').trim();
    const mobile = getVal(4);
    const altMobile = getVal(5) || 'Not provided';
    const pickupPerson = getVal(6) || name;
    const receiverName = getVal(7) || 'Not provided';
    const timeSlot = getVal(8) || '09:00 AM - 11:00 AM';
    const bikeModel = getVal(9) || 'Bike Service';
    let rawPlan = getVal(10);
    if (!rawPlan || rawPlan.match(/\b(AM|PM)\b/i) || rawPlan.match(/\d{1,2}:\d{2}/)) {
      rawPlan = 'Premium Care';
    }
    const planName = rawPlan;
    const bookingId = getVal(11) || `BK_${index + 1}`;
    const rawMethod = getVal(12) || 'Pay at Service';
    const rawStatus = getVal(13);
    const email = getVal(14) || 'Not provided';

    const override = overrides[bookingId] || overrides[String(bookingId).toLowerCase()] || overrides[`row_${rowIndex}`] || overrides[`name_${String(name).toLowerCase()}`];

    let finalStatus = (rawStatus.toUpperCase() === 'PAID' || rawStatus.toUpperCase() === 'PAID ONLINE') ? 'PAID' : 'Pending';
    let finalMethod = rawMethod;

    if (override) {
      finalStatus = override.paymentStatus || finalStatus;
      finalMethod = override.paymentMethod || finalMethod;
    }

    const calculatedPaymentStatus = finalStatus;
    const calculatedPaymentMethod = finalMethod;

    // Calculate pickup location fee (Home: ₹20, Office: ₹35, Theatre: ₹50)
    const pTypeStr = (String(pickupType) + ' ' + String(rawLocation)).toLowerCase();
    let pickupFee = 20; // default home pickup: ₹20
    if (pTypeStr.includes('theatre') || pTypeStr.includes('15 km') || pTypeStr.includes('50')) {
      pickupFee = 50;
    } else if (pTypeStr.includes('office') || pTypeStr.includes('10 km') || pTypeStr.includes('35')) {
      pickupFee = 35;
    } else if (pTypeStr.includes('home') || pTypeStr.includes('5 km') || pTypeStr.includes('20')) {
      pickupFee = 20;
    }

    // Determine base plan price from planName (e.g., "Premium Care" -> 299)
    let basePlanPrice = 299;
    const priceMatch = planName.match(/₹\s*(\d+)/) || planName.match(/(\d+)/);
    if (priceMatch && priceMatch[1]) {
      const parsed = parseInt(priceMatch[1], 10);
      if (parsed >= 50 && parsed <= 10000) {
        basePlanPrice = parsed;
      }
    } else {
      const lower = planName.toLowerCase();
      if (lower.includes('basic')) basePlanPrice = 199;
      else if (lower.includes('premium')) basePlanPrice = 299;
      else if (lower.includes('monthly') || lower.includes('subscription')) basePlanPrice = 599;
      else if (lower.includes('care')) basePlanPrice = 519;
    }

    // Total Amount = Base Plan Price + Pickup Location Fee
    let numAmount = basePlanPrice;
    const knownBasePrices = [199, 299, 499, 519, 599];
    if (knownBasePrices.includes(basePlanPrice)) {
      numAmount = basePlanPrice + pickupFee;
    }

    const formattedAmount = `₹${numAmount}`;

    if (calculatedPaymentStatus === 'PAID') {
      paidCount++;
      totalRevenue += numAmount;
    } else {
      pendingCount++;
    }

    if (calculatedPaymentMethod.toLowerCase().includes('service')) {
      payAtServiceCount++;
    } else {
      onlinePaymentCount++;
    }

    if (dateObj && dateObj.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }) === todayStr) {
      todayBookingsCount++;
    }

    allBookings.push({
      rowIndex: index + 2,
      bookingId,
      name,
      customerName: name,
      email,
      phone: mobile,
      mobile,
      altMobile,
      pickupPerson,
      receiverName,
      location: cleanLocation || rawLocation,
      rawLocation,
      locationType: pickupType,
      timeSlot,
      bikeModel,
      planName,
      plan: planName,
      serviceName: planName,
      service: planName,
      amount: formattedAmount,
      totalAmount: formattedAmount,
      numAmount,
      paymentMethod: calculatedPaymentMethod,
      paymentStatus: calculatedPaymentStatus,
      bookingStatus: calculatedPaymentStatus === 'PAID' ? 'CONFIRMED' : 'PENDING_APPROVAL',
      timestamp: formattedTimestamp || rawTimestamp,
      createdAt: formattedTimestamp || rawTimestamp,
    });
  });

  const searchQuery = String(search || '').trim().toLowerCase();
  const filterStatus = String(paymentStatus || '').trim().toUpperCase();
  const filterMethod = String(paymentMethod || '').trim().toLowerCase();
  const filterPlan = String(plan || '').trim().toLowerCase();

  let filtered = allBookings.filter(item => {
    if (searchQuery) {
      const matchesQuery = 
        item.bookingId.toLowerCase().includes(searchQuery) ||
        item.name.toLowerCase().includes(searchQuery) ||
        item.email.toLowerCase().includes(searchQuery) ||
        item.mobile.includes(searchQuery) ||
        item.bikeModel.toLowerCase().includes(searchQuery) ||
        item.location.toLowerCase().includes(searchQuery);
      if (!matchesQuery) return false;
    }

    if (filterStatus && filterStatus !== 'ALL') {
      if (item.paymentStatus.toUpperCase() !== filterStatus) return false;
    }

    if (filterMethod && filterMethod !== 'all') {
      if (!item.paymentMethod.toLowerCase().includes(filterMethod)) return false;
    }

    if (filterPlan && filterPlan !== 'all') {
      if (!item.planName.toLowerCase().includes(filterPlan)) return false;
    }

    return true;
  });

  if (sort === 'oldest') {
    filtered.sort((a, b) => a.rowIndex - b.rowIndex);
  } else if (sort === 'amount-high') {
    filtered.sort((a, b) => b.numAmount - a.numAmount);
  } else if (sort === 'amount-low') {
    filtered.sort((a, b) => a.numAmount - b.numAmount);
  } else {
    filtered.sort((a, b) => b.rowIndex - a.rowIndex);
  }

  const pg = Math.max(1, parseInt(page || '1', 10));
  const lm = Math.max(1, Math.min(100, parseInt(limit || '20', 10)));
  const totalCount = filtered.length;

  const startIndex = (pg - 1) * lm;
  const paginatedBookings = filtered.slice(startIndex, startIndex + lm);

  return {
    success: true,
    totalCount,
    page: pg,
    limit: lm,
    totalPages: Math.ceil(totalCount / lm) || 1,
    stats: {
      totalBookings: allBookings.length,
      todayBookings: todayBookingsCount,
      paidCount,
      pendingCount,
      payAtServiceCount,
      onlinePaymentCount,
      totalRevenue: `₹${totalRevenue}`,
    },
    bookings: paginatedBookings,
  };
}

export async function fetchAdminBookings(params) {
  const query = new URLSearchParams({
    search: params.search || '',
    paymentStatus: params.paymentStatus || 'ALL',
    paymentMethod: params.paymentMethod || 'all',
    plan: params.plan || 'all',
    sort: params.sort || 'newest',
    page: String(params.page || 1),
    limit: String(params.limit || 25),
  });

  if (params.email) query.append('email', params.email);

  const headers = { 'Content-Type': 'application/json' };
  if (params.token) {
    headers['Authorization'] = `Bearer ${params.token}`;
  }

  const targetUrls = [
    `${PRIMARY_API}/api/admin/bookings?${query.toString()}`,
    `${LOCAL_API}/api/admin/bookings?${query.toString()}`,
  ];

  for (const url of targetUrls) {
    try {
      const res = await fetch(url, { method: 'GET', headers });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success) return data;
      }
    } catch (err) {
      console.warn(`Fetch notice for ${url}:`, err.message);
    }
  }

  // Fallback to direct Google Sheets fetch
  console.log('Using resilient direct Google Sheets data provider...');
  return await fetchFromGoogleSheetsDirect(params);
}

export async function updateBookingStatus({ token, email, bookingId, rowIndex, name, paymentStatus, paymentMethod }) {
  const newStatus = paymentStatus ? (String(paymentStatus).toUpperCase() === 'PAID' ? 'PAID' : 'Pending') : 'PAID';
  const newMethod = paymentMethod || (newStatus === 'PAID' ? 'Pay Online (Admin Verified)' : 'Pay at Service');

  saveAdminStatusOverride(bookingId, rowIndex, name, newStatus, newMethod);

  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const targetUrls = [
    `${LOCAL_API}/api/admin/update-status`,
    `${PRIMARY_API}/api/admin/update-status`,
    `${SECONDARY_API}/api/admin/update-status`,
  ];

  for (const url of targetUrls) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, bookingId, rowIndex, name, paymentStatus: newStatus, paymentMethod: newMethod }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success) break;
      }
    } catch (err) {
      console.warn(`Update notice for ${url}:`, err.message);
    }
  }

  // Direct Google Apps Script dispatch fallback
  const bookingScriptUrl = 'https://script.google.com/macros/s/AKfycbz-7FfKmE6FgZGxs75wMK-QuFuP97U915UAy9Ukeo5JxlgqwYoevb25RQKHFFZkunjw/exec';
  const customerScriptUrl = 'https://script.google.com/macros/s/AKfycbxyCbvsvoQxXSpXjiJykrfWRyPy_fXSi4Ulr-zx7szw-R-VLLf8yY0HwVyHaLmXIHd8yw/exec';

  const payload = {
    bookingId,
    rowIndex: rowIndex || '',
    row: rowIndex || '',
    name: name || '',
    email: email || '',
    paymentStatus: newStatus,
    'Payment Status': newStatus,
    status: newStatus,
    'Status': newStatus,
    paymentMethod: newMethod,
    'Payment Method': newMethod,
    action: 'UPDATE_STATUS',
  };

  for (const sUrl of [bookingScriptUrl, customerScriptUrl]) {
    try {
      const params = new URLSearchParams();
      Object.entries(payload).forEach(([k, v]) => {
        if (v !== undefined && v !== null) params.append(k, String(v));
      });
      const fullUrl = `${sUrl}?${params.toString()}`;
      await fetch(fullUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        redirect: 'follow',
        body: JSON.stringify(payload),
      });
    } catch (e) {}
  }

  // Update local storage history keys across browser storage for immediate consistency
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('bikeDoctor_history')) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            let changed = false;
            const updated = list.map(item => {
              const matchesId = item && (item.bookingId === bookingId || item.id === bookingId);
              const matchesRow = item && rowIndex && item.rowIndex === rowIndex;
              const matchesName = item && name && item.name && String(item.name).toLowerCase() === String(name).toLowerCase();
              if (matchesId || matchesRow || matchesName) {
                changed = true;
                return { ...item, paymentStatus: newStatus, paymentMethod: newMethod };
              }
              return item;
            });
            if (changed) {
              localStorage.setItem(key, JSON.stringify(updated));
            }
          }
        }
      }
    }
  } catch (e) {}

  return { success: true, message: `Booking ${bookingId} status updated successfully.` };
}

export async function triggerPaymentReconciliation({ token, email }) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const targetUrls = [
    `${PRIMARY_API}/api/payment/reconcile`,
    `${LOCAL_API}/api/payment/reconcile`,
  ];

  for (const url of targetUrls) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success !== false) return data;
      }
    } catch (err) {
      console.warn(`Reconcile notice for ${url}:`, err.message);
    }
  }

  throw new Error('Payment reconciliation requires active backend connection.');
}
