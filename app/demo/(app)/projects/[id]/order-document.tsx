import {
  smithResidence, WEHRUNGS_LOCATION, formatCurrency, bomLineTotal, bomRetailTotal,
} from "../../../demo-data";

// Two-decimal number, no currency symbol — matches the printed Wehrung's invoice columns.
const num2 = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function OrderDocument() {
  const { bom, order, pricing } = smithResidence;
  const loc = WEHRUNGS_LOCATION;

  const retail = bomRetailTotal(bom);
  const discountAmt = Math.round(retail * (pricing.discountPct / 100) * 100) / 100;
  const taxable = retail - discountAmt; // = contractor price ($18,737)
  const tax = Math.round(taxable * order.taxRate * 100) / 100;
  const total = taxable + tax;

  return (
    <div className="overflow-hidden rounded-lg border border-slate-300 bg-white text-slate-900 shadow-sm">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4">
        <div>
          <div className="text-2xl font-extrabold italic tracking-tight">Wehrung&apos;s</div>
          <div className="text-[9px] font-medium uppercase tracking-[0.2em] text-slate-500">
            Your Partner In Home Improvement
          </div>
        </div>
        <div className="text-center text-xs leading-tight">
          <div className="text-sm font-bold">{loc.name}</div>
          <div>{loc.address}</div>
          <div>{loc.cityZip}</div>
          <div className="font-semibold">PHONE: {loc.phone}</div>
        </div>
        <div className="text-right text-[10px] text-slate-500">PAGE NO 1</div>
      </div>

      {/* ── Meta bar ── */}
      <div className="grid grid-cols-2 gap-px border-y border-slate-300 bg-slate-200 text-xs sm:grid-cols-4 lg:grid-cols-7">
        {[
          ["Cust No", order.custNo],
          ["Job No", order.jobNo],
          ["Purchase Order", order.po],
          ["Reference", order.reference],
          ["Terms", order.terms],
          ["Clerk", order.clerk],
          ["Date", order.date],
        ].map(([label, value]) => (
          <div key={label} className="bg-slate-50 px-3 py-2">
            <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
            <div className="font-medium">{value}</div>
          </div>
        ))}
      </div>

      {/* ── Sold To / Ship To / Order meta ── */}
      <div className="grid gap-4 border-b border-slate-300 px-6 py-4 sm:grid-cols-3">
        <div>
          <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">Sold To</div>
          {order.soldTo.map((l, i) => (
            <div key={i} className={i === 0 ? "text-sm font-semibold" : "text-sm"}>{l}</div>
          ))}
        </div>
        <div>
          <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">Ship To</div>
          {order.shipTo.map((l, i) => (
            <div key={i} className={i === 0 ? "text-sm font-semibold" : "text-sm"}>{l}</div>
          ))}
        </div>
        <div className="sm:text-right">
          <div className="text-lg font-extrabold italic">ORDER: {order.orderNo}</div>
          <div className="mt-1 text-xs text-slate-600">Salesperson: {order.salesperson}</div>
          <div className="text-xs text-slate-600">Due Date: {order.dueDate}</div>
          <div className="text-xs text-slate-600">Tax: MTX — Wehrung&apos;s Macungie</div>
        </div>
      </div>

      {/* ── Line items ── */}
      <div className="overflow-x-auto px-2 py-3 sm:px-6">
        <table className="w-full border-collapse font-mono text-[11px]">
          <thead>
            <tr className="border-b-2 border-slate-300 text-left text-slate-600">
              <th className="px-2 py-1.5 font-semibold">LINE</th>
              <th className="px-2 py-1.5 text-right font-semibold">ORDERED</th>
              <th className="px-2 py-1.5 font-semibold">UM</th>
              <th className="px-2 py-1.5 font-semibold">SKU</th>
              <th className="px-2 py-1.5 font-semibold">DESCRIPTION</th>
              <th className="px-2 py-1.5 text-right font-semibold">PRICE/</th>
              <th className="px-2 py-1.5 font-semibold">PER</th>
              <th className="px-2 py-1.5 text-right font-semibold">EXTENSION</th>
            </tr>
          </thead>
          <tbody>
            {bom.map((line, i) => {
              const priced = line.unitPrice != null;
              return (
                <tr key={i} className="border-b border-slate-100">
                  <td className="px-2 py-1.5 text-slate-500">{i + 1}</td>
                  <td className="px-2 py-1.5 text-right">{line.qtyNum ?? ""}</td>
                  <td className="px-2 py-1.5">{line.um ?? ""}</td>
                  <td className="px-2 py-1.5">{line.sku ?? ""}</td>
                  <td className="px-2 py-1.5 font-sans">
                    {line.item}
                    {!priced && <span className="text-slate-400"> — included in quantities</span>}
                  </td>
                  <td className="px-2 py-1.5 text-right">{priced ? num2(line.unitPrice!) : ""}</td>
                  <td className="px-2 py-1.5">{priced ? `/${line.um}` : ""}</td>
                  <td className="px-2 py-1.5 text-right font-semibold">{priced ? num2(bomLineTotal(line)) : ""}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Totals ── */}
      <div className="flex justify-end border-t border-slate-300 px-6 py-4">
        <div className="w-full max-w-xs space-y-1.5 text-sm">
          <Row label="Subtotal (List)" value={formatCurrency(retail, { cents: true })} />
          <Row
            label={`Contractor Discount (${pricing.discountPct}%)`}
            value={`−${formatCurrency(discountAmt, { cents: true })}`}
            valueClass="text-emerald-700"
          />
          <div className="border-t border-slate-200 pt-1.5">
            <Row label="Taxable" value={formatCurrency(taxable, { cents: true })} />
          </div>
          <Row label="Non-Taxable" value={formatCurrency(0, { cents: true })} />
          <Row label={`PA Sales Tax (${(order.taxRate * 100).toFixed(0)}%)`} value={formatCurrency(tax, { cents: true })} />
          <div className="mt-1 flex items-center justify-between rounded-md bg-slate-900 px-3 py-2 text-white">
            <span className="text-sm font-semibold">TOTAL</span>
            <span className="text-base font-extrabold">{formatCurrency(total, { cents: true })}</span>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="border-t border-slate-200 px-6 py-3 text-center text-[9px] font-medium uppercase tracking-wide text-slate-400">
        Restock fee applies. All stock items must be in good, clean, re-sellable condition. Special order items are non-returnable.
      </div>
    </div>
  );
}

function Row({ label, value, valueClass = "" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-600">{label}</span>
      <span className={`font-medium ${valueClass}`}>{value}</span>
    </div>
  );
}
