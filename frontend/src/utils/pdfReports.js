import { formatMoney } from '../components/UI.jsx';

export function printTransactionInvoice({ business, sale }) {
  const invoiceNo = shortId(sale.id);
  const rows = [
    {
      description: `${sale.product_name} (${sale.cylinder_size})`,
      quantity: sale.quantity,
      unitPrice: sale.unit_price,
      total: sale.total_amount
    }
  ];

  openPrintableDocument({
    title: `Invoice ${invoiceNo}`,
    html: invoiceTemplate({
      business,
      title: 'Sales Invoice',
      subtitle: `Invoice #${invoiceNo}`,
      meta: [
        ['Date', new Date(sale.created_at).toLocaleString()],
        ['Payment', sale.payment_method],
        ['Customer', sale.customer_name || 'Walk-in customer']
      ],
      rows,
      total: sale.total_amount,
      footer: business.receipt_footer
    })
  });
}

export function printDailySalesReport({ business, date, sales }) {
  const filtered = sales.filter((sale) => toDateKey(sale.created_at) === date);
  const total = filtered.reduce((sum, sale) => sum + Number(sale.total_amount || 0), 0);
  const units = filtered.reduce((sum, sale) => sum + Number(sale.quantity || 0), 0);

  openPrintableDocument({
    title: `Daily Sales ${date}`,
    html: invoiceTemplate({
      business,
      title: 'Daily Sales Report',
      subtitle: new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      meta: [
        ['Transactions', filtered.length],
        ['Units sold', units],
        ['Generated', new Date().toLocaleString()]
      ],
      rows: filtered.map((sale) => ({
        description: `${sale.product_name} (${sale.cylinder_size})`,
        quantity: sale.quantity,
        unitPrice: sale.unit_price,
        total: sale.total_amount,
        customer: sale.customer_name || 'Walk-in',
        payment: sale.payment_method,
        time: new Date(sale.created_at).toLocaleTimeString()
      })),
      total,
      footer: business.receipt_footer,
      emptyText: 'No sales were recorded for this day.',
      daily: true
    })
  });
}

export function toDateKey(value) {
  return new Date(value).toISOString().slice(0, 10);
}

function invoiceTemplate({ business, title, subtitle, meta, rows, total, footer, emptyText, daily = false }) {
  return `
    <!doctype html>
    <html>
      <head>
        <title>${escapeHtml(title)}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            background: #e2e8f0;
            color: #0f172a;
            font-family: Inter, Arial, sans-serif;
          }
          .page {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            background: white;
            padding: 28px;
          }
          .brand {
            display: flex;
            justify-content: space-between;
            gap: 24px;
            border-bottom: 3px solid #0f172a;
            padding-bottom: 20px;
          }
          .logo {
            width: 54px;
            height: 54px;
            border-radius: 16px;
            background: linear-gradient(135deg, #f97316, #1d4ed8);
            color: white;
            display: grid;
            place-items: center;
            font-weight: 900;
            font-size: 24px;
          }
          .business { display: flex; gap: 14px; align-items: center; }
          h1, h2, p { margin: 0; }
          h1 { font-size: 26px; }
          .muted { color: #64748b; }
          .doc-title { text-align: right; }
          .doc-title h2 { font-size: 28px; color: #1d4ed8; }
          .meta {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin: 26px 0;
          }
          .meta-card {
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 12px;
            background: #f8fafc;
          }
          .meta-card span { display: block; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 800; }
          .meta-card strong { display: block; margin-top: 4px; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th {
            background: #0f172a;
            color: white;
            text-align: left;
            padding: 12px;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: .04em;
          }
          td {
            border-bottom: 1px solid #e2e8f0;
            padding: 12px;
            font-size: 13px;
            vertical-align: top;
          }
          .amount { text-align: right; font-weight: 800; }
          .totals {
            margin-top: 22px;
            margin-left: auto;
            width: 280px;
            border-radius: 14px;
            overflow: hidden;
            border: 1px solid #e2e8f0;
          }
          .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 14px 16px;
            background: #f8fafc;
          }
          .totals-row.final {
            background: #0f172a;
            color: white;
            font-size: 18px;
            font-weight: 900;
          }
          .footer {
            margin-top: 44px;
            border-top: 1px solid #e2e8f0;
            padding-top: 16px;
            color: #64748b;
            text-align: center;
            font-size: 12px;
          }
          .empty {
            border: 1px dashed #cbd5e1;
            border-radius: 14px;
            padding: 28px;
            text-align: center;
            color: #64748b;
            background: #f8fafc;
          }
          @media print {
            body { background: white; }
            .page { width: auto; min-height: auto; margin: 0; padding: 0; }
            @page { margin: 14mm; }
          }
        </style>
      </head>
      <body>
        <main class="page">
          <section class="brand">
            <div class="business">
              <div class="logo">G</div>
              <div>
                <h1>${escapeHtml(business.business_name)}</h1>
                <p class="muted">Gas POS sales document</p>
              </div>
            </div>
            <div class="doc-title">
              <h2>${escapeHtml(title)}</h2>
              <p class="muted">${escapeHtml(subtitle)}</p>
            </div>
          </section>

          <section class="meta">
            ${meta.map(([label, value]) => `
              <div class="meta-card">
                <span>${escapeHtml(label)}</span>
                <strong>${escapeHtml(String(value))}</strong>
              </div>
            `).join('')}
          </section>

          ${rows.length === 0 ? `<div class="empty">${escapeHtml(emptyText || 'No records available.')}</div>` : `
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  ${daily ? '<th>Customer</th><th>Payment</th><th>Time</th>' : ''}
                  <th>Qty</th>
                  <th class="amount">Unit Price</th>
                  <th class="amount">Total</th>
                </tr>
              </thead>
              <tbody>
                ${rows.map((row) => `
                  <tr>
                    <td><strong>${escapeHtml(row.description)}</strong></td>
                    ${daily ? `<td>${escapeHtml(row.customer)}</td><td>${escapeHtml(row.payment)}</td><td>${escapeHtml(row.time)}</td>` : ''}
                    <td>${escapeHtml(String(row.quantity))}</td>
                    <td class="amount">${formatMoney(row.unitPrice, business.currency)}</td>
                    <td class="amount">${formatMoney(row.total, business.currency)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}

          <section class="totals">
            <div class="totals-row">
              <span>Subtotal</span>
              <strong>${formatMoney(total, business.currency)}</strong>
            </div>
            <div class="totals-row final">
              <span>Total</span>
              <span>${formatMoney(total, business.currency)}</span>
            </div>
          </section>

          <p class="footer">${escapeHtml(footer || 'Thank you for your business.')}</p>
        </main>
        <script>
          window.addEventListener('load', () => {
            window.print();
          });
        </script>
      </body>
    </html>
  `;
}

function openPrintableDocument({ title, html }) {
  const printWindow = window.open('', '_blank', 'width=980,height=720');
  if (!printWindow) {
    throw new Error('Allow popups to generate the PDF.');
  }
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.document.title = title;
}

function shortId(value) {
  return String(value || '').slice(0, 8).toUpperCase();
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
