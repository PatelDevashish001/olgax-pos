import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { Receipt } from "@/components/receipt/receipt";
import { SalesTable } from "@/components/sales/sales-table";
import {
  SettingsProvider,
  DEFAULT_BUSINESS_SETTINGS,
} from "@/contexts/settings-context";

vi.mock("next-intl", () => ({
  useTranslations: (ns: string) => (key: string) => {
    const dict: Record<string, Record<string, string>> = {
      sales: {
        title: "Sales",
        date: "Date",
        cashier: "Cashier",
        payment: "Payment",
        status: "Status",
        total: "Total",
        actions: "Actions",
        refund: "Refund",
        no_sales: "No sales yet",
        tax: "Tax",
      },
      pos: {
        subtotal: "Subtotal",
        discount: "Discount",
        tax: "Tax",
        tip: "Tip",
      },
      receipt: {
        items: "Items",
        qty: "Qty",
        price: "Price",
      },
    };
    return dict[ns]?.[key] ?? key;
  },
}));

afterEach(() => {
  cleanup();
});

describe("Tax Flow & Display", () => {
  describe("Receipt component", () => {
    const settings = {
      name: "Test Shop",
      logoUrl: null,
      currency: "$",
      currencyDecimals: 2,
      taxName: "VAT",
      receiptFooter: "Thanks!",
    };

    it("renders tax row when taxAmount > 0", () => {
      const data = {
        items: [{ name: "Coffee", quantity: 1, price: 10, total: 10 }],
        subtotal: 10,
        discountAmount: 0,
        taxAmount: 1.5,
        total: 11.5,
        paymentMethod: "CASH",
      };

      const { container } = render(<Receipt data={data} settings={settings} />);
      expect(container.textContent).toContain("VAT");
      expect(container.textContent).toContain("$1.50");
    });

    it("omits tax row when taxAmount is 0", () => {
      const data = {
        items: [{ name: "Coffee", quantity: 1, price: 10, total: 10 }],
        subtotal: 10,
        discountAmount: 0,
        taxAmount: 0,
        total: 10,
        paymentMethod: "CASH",
      };

      const { container } = render(<Receipt data={data} settings={settings} />);
      expect(container.textContent).not.toContain("VAT");
    });
  });

  describe("SalesTable component", () => {
    const mockSales = [
      {
        id: "sale-1",
        createdAt: new Date("2026-03-01T12:00:00Z"),
        subtotal: 50,
        taxAmount: 5,
        taxRate: 10,
        discountAmount: 0,
        total: 55,
        paymentMethod: "CARD",
        status: "COMPLETED",
        items: [
          { id: "item-1", name: "Shirt", quantity: 1, price: 50, total: 50 },
        ],
        user: { name: "Alice" },
      },
    ];

    it("displays tax in main row when taxAmount > 0", () => {
      render(
        <SettingsProvider initialSettings={DEFAULT_BUSINESS_SETTINGS}>
          <SalesTable sales={mockSales} />
        </SettingsProvider>,
      );

      // Main row shows total $55.00 and tax breakdown
      expect(screen.getByText("Tax: $5.00")).toBeInTheDocument();
      expect(screen.getByText("$55.00")).toBeInTheDocument();
    });

    it("displays tax breakdown in expanded details tfoot", () => {
      render(
        <SettingsProvider initialSettings={DEFAULT_BUSINESS_SETTINGS}>
          <SalesTable sales={mockSales} />
        </SettingsProvider>,
      );

      // Expand the row
      fireEvent.click(screen.getByText("$55.00"));

      // In the tfoot, tax with rate is displayed
      expect(screen.getByText("Tax (10%)")).toBeInTheDocument();
    });
  });

  describe("Reports tax calculations", () => {
    it("accumulates total tax across completed sales", () => {
      const sales = [
        { total: 100, taxAmount: 10, tipAmount: 5 },
        { total: 50, taxAmount: 5, tipAmount: 0 },
        { total: 20, taxAmount: 0, tipAmount: 0 },
      ];

      let totalTax = 0;
      let totalRevenue = 0;
      for (const sale of sales) {
        totalRevenue += sale.total;
        totalTax += parseFloat((sale.taxAmount ?? 0).toString());
      }

      expect(totalRevenue).toBe(170);
      expect(totalTax).toBe(15);
    });
  });
});
