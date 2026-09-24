import { generateDisputePdf } from '../src/lib/export/pdf-generator';

try {
  console.log('Testing generateDisputePdf...');
  const bytes = generateDisputePdf({
    workspaceName: 'Apex Apparel Co.',
    providerName: 'RDX Sports Global Logistics',
    invoiceNumber: 'INV-2026-08-DEMO',
    invoiceDate: '2026-08-31',
    totalBilledCents: 100000,
    potentialDiscrepancyCents: 1250,
    confirmedDiscrepancyCents: 0,
    flags: [{
      lineNumber: 1,
      reference: 'REF123',
      category: 'BASE_PICK_PACK',
      expectedRateCents: 285,
      billedTotalCents: 350,
      differenceCents: 65,
      ruleTitle: 'Rate Overcharge',
      status: 'OPEN',
      notes: 'Test note',
    }]
  });
  console.log('Success! Generated PDF bytes:', bytes.length);
} catch (err: any) {
  console.error('Error caught in generateDisputePdf:', err);
}
