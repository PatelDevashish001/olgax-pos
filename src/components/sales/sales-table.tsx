"use client";

import { Fragment, useState } from "react";
import { useTranslations } from "next-intl";
import { RotateCcw } from "lucide-react";
import { useFormatCurrency } from "@/contexts/settings-context";
import { RefundModal } from "./refund-modal";

interface SaleItem {
  id: string;
  name: string;
  quantity: number;
  price: { toString(): string };
  total: { toString(): string };
  notes?: string | null;
  productId?: string | null;
}

interface Sale {
  id: string;
  createdAt: Date;
  total: { toString(): string } | number;
  subtotal?: { toString(): string } | number | null;
  taxAmount?: { toString(): string } | number | null;
  taxRate?: { toString(): string } | number | null;
  discountAmount?: { toString(): string } | number | null;
  tipAmount?: { toString(): string } | number | null;
  paymentMethod: string;
  status: string;
  items: SaleItem[];
  user: { name: string } | null;
}

interface SalesTableProps {
  sales: Sale[];
}

export function SalesTable({ sales }: SalesTableProps) {
  const t = useTranslations("sales");
  const tr = useTranslations("receipt");
  const tp = useTranslations("pos");
  const formatCurrency = useFormatCurrency();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [refunding, setRefunding] = useState<Sale | null>(null);

  const saleDateFormatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });

  if (sales.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-muted-foreground text-sm">
        {t("no_sales")}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border overflow-x-auto text-sm">
        <table className="w-full">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">{t("date")}</th>
              <th className="px-4 py-3 text-left font-medium">
                {t("cashier")}
              </th>
              <th className="px-4 py-3 text-left font-medium">
                {t("payment")}
              </th>
              <th className="px-4 py-3 text-left font-medium">{t("status")}</th>
              <th className="px-4 py-3 text-right font-medium">{t("total")}</th>
              <th className="px-4 py-3 text-center font-medium">
                {t("actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sales.flatMap((sale, idx) => {
              const saleTimestamp = new Date(sale.createdAt).getTime();
              const saleKey = `${sale.id ?? "no-id"}-${saleTimestamp}-${idx}`;

              const mainRow = (
                <tr
                  key={`${saleKey}-main`}
                  className="hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() =>
                    setExpanded(expanded === sale.id ? null : sale.id)
                  }
                >
                  <td className="px-4 py-3">
                    {saleDateFormatter.format(new Date(sale.createdAt))}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {sale.user?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">{sale.paymentMethod}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        sale.status === "VOIDED"
                          ? "text-destructive"
                          : "text-green-600"
                      }
                    >
                      {sale.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    <div>
                      {formatCurrency(parseFloat(sale.total.toString()))}
                    </div>
                    {sale.taxAmount != null &&
                      parseFloat(sale.taxAmount.toString()) > 0 && (
                        <div className="text-xs font-normal text-muted-foreground">
                          {t("tax")}:{" "}
                          {formatCurrency(
                            parseFloat(sale.taxAmount.toString()),
                          )}
                        </div>
                      )}
                  </td>
                  <td
                    className="px-4 py-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-center">
                      {sale.status === "COMPLETED" && (
                        <button
                          onClick={() => setRefunding(sale)}
                          className="flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                          title="Issue Refund"
                        >
                          <RotateCcw className="h-3 w-3" /> {t("refund")}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );

              if (expanded !== sale.id) {
                return [mainRow];
              }

              const detailRow = (
                <tr className="bg-muted/20" key={`${saleKey}-details`}>
                  <td colSpan={6} className="px-6 py-3">
                    <table className="w-full text-xs">
                      <thead>
                        <tr>
                          <th className="text-left py-1">{tr("items")}</th>
                          <th className="text-right py-1">{tr("qty")}</th>
                          <th className="text-right py-1">{tr("price")}</th>
                          <th className="text-right py-1">{t("total")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sale.items.map((item, i) => {
                          const itemKey = `${item.id ?? "no-item-id"}-${saleKey}-${i}`;
                          return (
                            <Fragment key={itemKey}>
                              <tr>
                                <td className="py-1">{item.name}</td>
                                <td className="text-right py-1">
                                  {item.quantity}
                                </td>
                                <td className="text-right py-1">
                                  {formatCurrency(
                                    parseFloat(item.price.toString()),
                                  )}
                                </td>
                                <td className="text-right py-1">
                                  {formatCurrency(
                                    parseFloat(item.total.toString()),
                                  )}
                                </td>
                              </tr>
                              {item.notes && (
                                <tr>
                                  <td
                                    colSpan={4}
                                    className="pb-1 pl-3 text-[10px] italic text-muted-foreground"
                                  >
                                    {item.notes}
                                  </td>
                                </tr>
                              )}
                            </Fragment>
                          );
                        })}
                      </tbody>
                      <tfoot className="border-t border-muted">
                        {sale.subtotal != null && (
                          <tr>
                            <td
                              colSpan={3}
                              className="pt-2 text-right text-muted-foreground"
                            >
                              {tp("subtotal")}
                            </td>
                            <td className="pt-2 text-right font-medium">
                              {formatCurrency(
                                parseFloat(sale.subtotal.toString()),
                              )}
                            </td>
                          </tr>
                        )}
                        {sale.discountAmount != null &&
                          parseFloat(sale.discountAmount.toString()) > 0 && (
                            <tr>
                              <td
                                colSpan={3}
                                className="py-0.5 text-right text-muted-foreground"
                              >
                                {tp("discount")}
                              </td>
                              <td className="py-0.5 text-right font-medium text-destructive">
                                -
                                {formatCurrency(
                                  parseFloat(sale.discountAmount.toString()),
                                )}
                              </td>
                            </tr>
                          )}
                        {sale.taxAmount != null &&
                          parseFloat(sale.taxAmount.toString()) > 0 && (
                            <tr>
                              <td
                                colSpan={3}
                                className="py-0.5 text-right text-muted-foreground"
                              >
                                {t("tax")}
                                {sale.taxRate != null &&
                                parseFloat(sale.taxRate.toString()) > 0
                                  ? ` (${parseFloat(sale.taxRate.toString())}%)`
                                  : ""}
                              </td>
                              <td className="py-0.5 text-right font-medium">
                                {formatCurrency(
                                  parseFloat(sale.taxAmount.toString()),
                                )}
                              </td>
                            </tr>
                          )}
                        {sale.tipAmount != null &&
                          parseFloat(sale.tipAmount.toString()) > 0 && (
                            <tr>
                              <td
                                colSpan={3}
                                className="py-0.5 text-right text-muted-foreground"
                              >
                                {tp("tip")}
                              </td>
                              <td className="py-0.5 text-right font-medium">
                                {formatCurrency(
                                  parseFloat(sale.tipAmount.toString()),
                                )}
                              </td>
                            </tr>
                          )}
                        <tr>
                          <td colSpan={3} className="py-1 text-right font-bold">
                            {t("total")}
                          </td>
                          <td className="py-1 text-right font-bold">
                            {formatCurrency(parseFloat(sale.total.toString()))}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </td>
                </tr>
              );

              return [mainRow, detailRow];
            })}
          </tbody>
        </table>
      </div>

      {refunding && (
        <RefundModal
          saleId={refunding.id}
          saleTotal={parseFloat(refunding.total.toString())}
          items={refunding.items}
          onClose={() => setRefunding(null)}
        />
      )}
    </>
  );
}
