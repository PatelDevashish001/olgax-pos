export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
  notes?: string;
}

export interface ReceiptData {
  saleId?: string;
  customerName?: string;
  items: ReceiptItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  tipAmount?: number;
  total: number;
  paymentMethod: string;
  paymentLines?: { method: string; amount: number }[];
  amountTendered?: number;
  changeDue?: number;
  createdAt?: Date;
}

export interface ReceiptSettings {
  name: string;
  logoUrl: string | null;
  currency: string;
  currencyDecimals: number;
  taxName: string;
  receiptFooter: string;
}

interface ReceiptProps {
  data: ReceiptData;
  settings: ReceiptSettings;
}

function fmt(amount: number, currency = "$", decimals = 2) {
  return `${currency}${amount.toFixed(decimals)}`;
}

export function Receipt({ data, settings }: ReceiptProps) {
  const c = settings.currency;
  const d = settings.currencyDecimals;
  const now = data.createdAt ?? new Date();

  return (
    <div
      id="receipt-print"
      className="font-mono text-xs w-72 mx-auto bg-white text-black p-4 print:w-full print:text-[10pt] print:p-0"
      style={{ fontFamily: "monospace" }}
    >
      {/* Header */}
      <div className="text-center mb-3">
        {settings.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={settings.logoUrl}
            alt="logo"
            className="h-12 mx-auto mb-2 object-contain"
          />
        )}
        <p className="font-bold text-sm">{settings.name}</p>
      </div>

      <div className="border-t border-dashed border-black my-2" />

      {/* Date & Sale ID */}
      <div className="flex justify-between text-[10px] mb-2">
        <span>{now.toLocaleDateString()}</span>
        <span>{now.toLocaleTimeString()}</span>
      </div>
      {data.saleId && (
        <p className="text-[10px] text-center mb-2">
          Sale #{data.saleId.slice(-8).toUpperCase()}
        </p>
      )}
      {data.customerName && (
        <p className="text-[10px] text-center mb-2">For: {data.customerName}</p>
      )}

      <div className="border-t border-dashed border-black my-2" />

      {/* Items */}
      <div className="space-y-1 mb-2">
        {data.items.map((item, i) => (
          <div key={i}>
            <div className="flex justify-between">
              <span className="flex-1 truncate pr-2">{item.name}</span>
              <span>{fmt(item.total, c, d)}</span>
            </div>
            {item.quantity > 1 && (
              <div className="text-[10px] text-gray-500 pl-2">
                {item.quantity} × {fmt(item.price, c, d)}
              </div>
            )}
            {item.notes && (
              <div className="text-[10px] text-gray-500 pl-2 italic">
                {item.notes}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-black my-2" />

      {/* Totals */}
      <div className="space-y-0.5 mb-2">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{fmt(data.subtotal, c, d)}</span>
        </div>
        {data.discountAmount > 0 && (
          <div className="flex justify-between">
            <span>Discount</span>
            <span>-{fmt(data.discountAmount, c, d)}</span>
          </div>
        )}
        {data.taxAmount > 0 && (
          <div className="flex justify-between">
            <span>{settings.taxName || "Tax"}</span>
            <span>{fmt(data.taxAmount, c, d)}</span>
          </div>
        )}
        {data.tipAmount != null && data.tipAmount > 0 && (
          <div className="flex justify-between">
            <span>Tip</span>
            <span>{fmt(data.tipAmount, c, d)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-sm border-t border-black pt-1 mt-1">
          <span>TOTAL</span>
          <span>{fmt(data.total, c, d)}</span>
        </div>
      </div>

      {/* Payment */}
      <div className="space-y-0.5 mb-2 text-[10px]">
        {data.paymentLines && data.paymentLines.length > 0 ? (
          data.paymentLines.map((line, i) => (
            <div key={i} className="flex justify-between">
              <span>{line.method}</span>
              <span>{fmt(line.amount, c, d)}</span>
            </div>
          ))
        ) : (
          <div className="flex justify-between">
            <span>Payment</span>
            <span>{data.paymentMethod}</span>
          </div>
        )}
        {data.amountTendered != null &&
          data.amountTendered > 0 &&
          !data.paymentLines?.length && (
            <div className="flex justify-between">
              <span>Tendered</span>
              <span>{fmt(data.amountTendered, c, d)}</span>
            </div>
          )}
        {data.changeDue != null && data.changeDue > 0 && (
          <div className="flex justify-between">
            <span>Change</span>
            <span>{fmt(data.changeDue, c, d)}</span>
          </div>
        )}
      </div>

      <div className="border-t border-dashed border-black my-2" />

      {/* Footer */}
      {settings.receiptFooter && (
        <p className="text-center text-[10px] mt-2">{settings.receiptFooter}</p>
      )}
    </div>
  );
}
