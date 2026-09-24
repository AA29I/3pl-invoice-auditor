async function runTests() {
  const baseUrl = 'http://localhost:3000';
  console.log('--- Starting Smoke Test against ' + baseUrl + ' ---');

  const publicRoutes = [
    '/',
    '/how-it-works',
    '/pricing',
    '/faq',
    '/contact',
    '/privacy',
    '/terms',
    '/3pl-billing-errors',
    '/3pl-invoice-audit',
    '/fulfillment-invoice-checker',
    '/pick-and-pack-calculator',
    '/login',
    '/register',
    '/reset-password',
  ];

  for (const path of publicRoutes) {
    try {
      const res = await fetch(`${baseUrl}${path}`);
      console.log(`[Public Page] ${path.padEnd(30)} -> HTTP ${res.status}`);
      if (!res.ok) {
        console.error(`FAILED: ${path} returned status ${res.status}`);
      }
    } catch (err: any) {
      console.error(`ERROR: ${path} threw ${err.message}`);
    }
  }

  // Test Authentication
  console.log('\n--- Testing Authentication ---');
  let authCookie = '';
  try {
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@apexapparel.com', password: 'Password123!' }),
    });
    console.log(`[Auth Login] /api/auth/login -> HTTP ${loginRes.status}`);
    const setCookie = loginRes.headers.get('set-cookie');
    if (setCookie) {
      // Find the three_pl_auditor_session cookie
      const match = setCookie.match(/three_pl_auditor_session=[^;]+/);
      if (match) {
        authCookie = match[0];
        console.log(`[Auth Cookie Obtained] ${authCookie.slice(0, 35)}...`);
      } else {
        authCookie = setCookie.split(';')[0];
        console.log(`[Auth Cookie Extracted] ${authCookie.slice(0, 35)}...`);
      }
    } else {
      console.warn(`[Warning] No set-cookie header returned by login.`);
    }
  } catch (err: any) {
    console.error(`ERROR in login: ${err.message}`);
  }

  const authHeaders: Record<string, string> = {};
  if (authCookie) {
    authHeaders['Cookie'] = authCookie;
  }

  // Test Authenticated Pages
  console.log('\n--- Testing Dashboard Pages ---');
  const dashboardRoutes = [
    '/dashboard',
    '/audits',
    '/audits/new',
    '/providers',
    '/providers/new',
    '/settings',
    '/settings/billing',
  ];

  for (const path of dashboardRoutes) {
    try {
      const res = await fetch(`${baseUrl}${path}`, { headers: authHeaders, redirect: 'manual' });
      console.log(`[Dashboard Page] ${path.padEnd(25)} -> HTTP ${res.status} ${res.headers.get('location') || ''}`);
    } catch (err: any) {
      console.error(`ERROR: ${path} threw ${err.message}`);
    }
  }

  // Test API Endpoints
  console.log('\n--- Testing APIs ---');
  try {
    const meRes = await fetch(`${baseUrl}/api/auth/me`, { headers: authHeaders });
    console.log(`[API] /api/auth/me              -> HTTP ${meRes.status}`);
  } catch (err: any) {
    console.error(`ERROR /api/auth/me: ${err.message}`);
  }

  let auditId = '';
  let providerId = '';

  try {
    const provRes = await fetch(`${baseUrl}/api/providers`, { headers: authHeaders });
    console.log(`[API] /api/providers            -> HTTP ${provRes.status}`);
    if (provRes.ok) {
      const provData = await provRes.json();
      const providers = provData.providers || provData;
      if (Array.isArray(providers) && providers.length > 0) {
        providerId = providers[0].id;
        console.log(`[API] Found provider: ${providers[0].name} (ID: ${providerId})`);
      }
    }
  } catch (err: any) {
    console.error(`ERROR /api/providers: ${err.message}`);
  }

  try {
    const auditsRes = await fetch(`${baseUrl}/api/audits`, { headers: authHeaders });
    console.log(`[API] /api/audits               -> HTTP ${auditsRes.status}`);
    if (auditsRes.ok) {
      const auditsData = await auditsRes.json();
      const invoices = auditsData.invoices || auditsData;
      if (Array.isArray(invoices) && invoices.length > 0) {
        auditId = invoices[0].id;
        console.log(`[API] Found audit: ${invoices[0].invoiceNumber || auditId} (ID: ${auditId})`);
      }
    }
  } catch (err: any) {
    console.error(`ERROR /api/audits: ${err.message}`);
  }

  if (providerId) {
    try {
      const provDetailRes = await fetch(`${baseUrl}/providers/${providerId}`, { headers: authHeaders });
      console.log(`[Page] /providers/${providerId} -> HTTP ${provDetailRes.status}`);
    } catch (err: any) {
      console.error(`ERROR /providers/${providerId}: ${err.message}`);
    }

    try {
      const rcNewRes = await fetch(`${baseUrl}/providers/${providerId}/rate-cards/new`, { headers: authHeaders });
      console.log(`[Page] /providers/${providerId}/rate-cards/new -> HTTP ${rcNewRes.status}`);
    } catch (err: any) {
      console.error(`ERROR rate-cards/new: ${err.message}`);
    }
  }

  if (auditId) {
    try {
      const auditDetailRes = await fetch(`${baseUrl}/audits/${auditId}`, { headers: authHeaders });
      console.log(`[Page] /audits/${auditId}       -> HTTP ${auditDetailRes.status}`);
    } catch (err: any) {
      console.error(`ERROR /audits/${auditId}: ${err.message}`);
    }

    try {
      const csvExportRes = await fetch(`${baseUrl}/api/audits/${auditId}/export-csv`, { headers: authHeaders });
      console.log(`[Export CSV] /api/audits/${auditId}/export-csv -> HTTP ${csvExportRes.status} (Content-Type: ${csvExportRes.headers.get('content-type')})`);
    } catch (err: any) {
      console.error(`ERROR export-csv: ${err.message}`);
    }

    try {
      const pdfExportRes = await fetch(`${baseUrl}/api/audits/${auditId}/export-pdf`, { headers: authHeaders });
      console.log(`[Export PDF] /api/audits/${auditId}/export-pdf -> HTTP ${pdfExportRes.status} (Content-Type: ${pdfExportRes.headers.get('content-type')})`);
    } catch (err: any) {
      console.error(`ERROR export-pdf: ${err.message}`);
    }
  }

  console.log('\n--- Smoke Test Completed ---');
}

runTests().catch(console.error);
