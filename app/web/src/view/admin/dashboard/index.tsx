import { useMemo, type ComponentType } from "react";
import { Card, Empty, Skeleton, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Link, useParams } from "react-router-dom";
import {
  MdAssignmentReturn,
  MdInventory2,
  MdPointOfSale,
  MdTrendingUp,
} from "react-icons/md";
import { FiAlertTriangle, FiClock, FiPackage } from "react-icons/fi";
import { GraphChart, DonutChart } from "@/components/charts";
import { useDashboardSummary } from "@/hooks/admin/dashboard";
import { usePermissions } from "@/hooks/common/use-permissions";
import { PERMISSIONS } from "@/data/permissions";
import {
  TDashboardInventoryRiskItem,
  TDashboardTopSellingProduct,
  TDashboardTransaction,
} from "@/interface/common";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const integerFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

function formatCurrency(value = 0) {
  return currencyFormatter.format(value);
}

function formatInteger(value = 0) {
  return integerFormatter.format(value);
}

function getTransactionHref(role: string | undefined, transaction: TDashboardTransaction) {
  if (!role) return "#";

  if (transaction.type === "sale") {
    return `/${role}/sales/view/${transaction.entityId}`;
  }

  if (transaction.type === "purchase") {
    return `/${role}/purchase/view/${transaction.entityId}`;
  }

  if (transaction.type === "sale_return") {
    return `/${role}/sale-return`;
  }

  return `/${role}/purchase-return`;
}

function getTransactionTypeLabel(type: TDashboardTransaction["type"]) {
  if (type === "sale") return "Sale";
  if (type === "purchase") return "Purchase";
  if (type === "sale_return") return "Sale Return";
  return "Purchase Return";
}

function getStatusColor(status: string) {
  const normalized = status?.toLowerCase?.() || "";

  if (["completed", "paid", "approved", "received", "refunded"].includes(normalized)) {
    return "success";
  }

  if (["pending", "issued", "ordered", "po", "partial", "partial_return"].includes(normalized)) {
    return "processing";
  }

  if (["cancelled", "void", "rejected", "draft", "full_return"].includes(normalized)) {
    return "error";
  }

  return "default";
}

interface TKpiCard {
  key: string;
  title: string;
  value: string | number;
  helper: string;
  icon: ComponentType<{ size?: number }>;
  tone: string;
  permission?: string;
}

function KpiCard({ title, value, helper, icon: Icon, tone }: TKpiCard) {
  return (
    <Card bodyStyle={{ padding: 18 }} className="border-0 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-gray-500 !mb-2">{title}</p>
          <h3 className="text-2xl font-semibold text-gray-900 !mb-1">{value}</h3>
          <p className="text-sm text-gray-500 !m-0">{helper}</p>
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tone}`}>
          <Icon size={24} />
        </div>
      </div>
    </Card>
  );
}

function InventoryList({
  title,
  emptyText,
  items,
  rightLabel,
  rightValue,
}: {
  title: string;
  emptyText: string;
  items: TDashboardInventoryRiskItem[];
  rightLabel: (item: TDashboardInventoryRiskItem) => string;
  rightValue: (item: TDashboardInventoryRiskItem) => string;
}) {
  return (
    <Card
      bodyStyle={{ padding: 0 }}
      title={<span className="font-semibold text-gray-800">{title}</span>}
      className="shadow-sm"
    >
      {items.length === 0 ? (
        <div className="py-10">
          <Empty description={emptyText} />
        </div>
      ) : (
        items.map((item, index) => (
          <div
            key={item.productId}
            className={`flex items-center justify-between gap-3 px-5 py-4 ${
              index !== items.length - 1 ? "border-b border-gray-100" : ""
            }`}
          >
            <div className="min-w-0">
              <p className="font-medium text-gray-800 truncate !mb-1">{item.productName}</p>
              <p className="text-xs text-gray-500 !m-0">
                {item.sku ? `SKU: ${item.sku}` : "SKU not set"} | {rightLabel(item)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.18em] text-gray-400 !mb-1">Level</p>
              <p className="font-semibold text-gray-900 !m-0">{rightValue(item)}</p>
            </div>
          </div>
        ))
      )}
    </Card>
  );
}

export default function Dashboard() {
  const { summary, loading } = useDashboardSummary();
  const { hasPermission, isAdmin } = usePermissions();
  const { role } = useParams();

  const canViewSales = isAdmin || hasPermission(PERMISSIONS.VIEW_SALES);
  const canViewStock = isAdmin || hasPermission(PERMISSIONS.VIEW_STOCK);
  const canViewTransactions =
    isAdmin ||
    hasPermission(PERMISSIONS.VIEW_SALES) ||
    hasPermission(PERMISSIONS.VIEW_PURCHASES) ||
    hasPermission(PERMISSIONS.VIEW_PURCHASE_RETURNS) ||
    hasPermission(PERMISSIONS.VIEW_SALE_RETURNS);

  const kpiCards = useMemo<TKpiCard[]>(() => {
    if (!summary) return [];

    return [
      {
        key: "today-sales",
        title: "Today's Sales",
        value: formatCurrency(summary.overview.today.salesTotal),
        helper: `${summary.overview.today.orders} completed orders today`,
        icon: MdPointOfSale,
        tone: "bg-[#d8f3f1] text-[#005555]",
        permission: PERMISSIONS.VIEW_SALES,
      },
      {
        key: "today-profit",
        title: "Today's Profit",
        value: formatCurrency(summary.overview.today.profit),
        helper: `${formatCurrency(summary.overview.today.returnsTotal)} refunded today`,
        icon: MdTrendingUp,
        tone: "bg-[#fef3c7] text-[#b45309]",
        permission: PERMISSIONS.VIEW_SALES,
      },
      {
        key: "month-sales",
        title: "This Month's Sales",
        value: formatCurrency(summary.overview.month.salesTotal),
        helper: `${summary.overview.month.orders} orders this month`,
        icon: MdInventory2,
        tone: "bg-[#e0ecff] text-[#1d4ed8]",
        permission: PERMISSIONS.VIEW_SALES,
      },
      {
        key: "month-profit",
        title: "This Month's Profit",
        value: formatCurrency(summary.overview.month.profit),
        helper: `${formatCurrency(summary.overview.month.returnsTotal)} sales returns this month`,
        icon: MdAssignmentReturn,
        tone: "bg-[#ecfccb] text-[#3f6212]",
        permission: PERMISSIONS.VIEW_SALES,
      },
      {
        key: "low-stock",
        title: "Low Stock",
        value: summary.inventory.lowStockCount,
        helper: "Products at or below reorder point",
        icon: FiAlertTriangle,
        tone: "bg-[#fff1f2] text-[#be123c]",
        permission: PERMISSIONS.VIEW_STOCK,
      },
      {
        key: "expiring-soon",
        title: "Expiring Soon",
        value: summary.inventory.expiringSoonCount,
        helper: "Products expiring in the next 30 days",
        icon: FiClock,
        tone: "bg-[#fff7ed] text-[#c2410c]",
        permission: PERMISSIONS.VIEW_STOCK,
      },
    ];
  }, [summary]);

  const visibleKpiCards = kpiCards.filter(
    (card) => !card.permission || isAdmin || hasPermission(card.permission)
  );

  const visibleTransactions = useMemo(() => {
    if (!summary) return [];

    return summary.recentTransactions.filter((transaction) => {
      if (isAdmin) return true;
      if (transaction.type === "sale") return hasPermission(PERMISSIONS.VIEW_SALES);
      if (transaction.type === "purchase") return hasPermission(PERMISSIONS.VIEW_PURCHASES);
      if (transaction.type === "sale_return") return hasPermission(PERMISSIONS.VIEW_SALE_RETURNS);
      return hasPermission(PERMISSIONS.VIEW_PURCHASE_RETURNS);
    });
  }, [hasPermission, isAdmin, summary]);

  const topSellingColumns = useMemo<ColumnsType<TDashboardTopSellingProduct>>(
    () => [
      {
        title: "Product",
        dataIndex: "productName",
        key: "productName",
        render: (_value, record) => (
          <div>
            <p className="font-medium text-gray-800 !mb-1">{record.productName}</p>
            <p className="text-xs text-gray-500 !m-0">{record.sku || "No SKU"}</p>
          </div>
        ),
      },
      {
        title: "Sold",
        dataIndex: "soldQuantity",
        key: "soldQuantity",
        align: "right",
        render: (value) => formatInteger(Number(value)),
      },
      {
        title: "Revenue",
        dataIndex: "revenue",
        key: "revenue",
        align: "right",
        render: (value) => formatCurrency(Number(value)),
      },
      {
        title: "Profit",
        dataIndex: "profit",
        key: "profit",
        align: "right",
        render: (value) => (
          <span className={Number(value) >= 0 ? "text-emerald-700" : "text-rose-700"}>
            {formatCurrency(Number(value))}
          </span>
        ),
      },
      {
        title: "Stock",
        dataIndex: "stockQuantity",
        key: "stockQuantity",
        align: "right",
        render: (value) => formatInteger(Number(value)),
      },
    ],
    []
  );

  const transactionColumns = useMemo<ColumnsType<TDashboardTransaction>>(
    () => [
      {
        title: "Reference",
        dataIndex: "referenceNo",
        key: "referenceNo",
        render: (_value, record) => (
          <Link to={getTransactionHref(role, record)} className="font-medium !text-[#005555] hover:!text-[#003d3d]">
            {record.referenceNo || `#${record.entityId}`}
          </Link>
        ),
      },
      {
        title: "Type",
        dataIndex: "type",
        key: "type",
        render: (value) => <Tag color="blue">{getTransactionTypeLabel(value)}</Tag>,
      },
      {
        title: "Party",
        dataIndex: "partyName",
        key: "partyName",
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (value) => <Tag color={getStatusColor(value)}>{value}</Tag>,
      },
      {
        title: "Amount",
        dataIndex: "amount",
        key: "amount",
        align: "right",
        render: (value) => formatCurrency(Number(value)),
      },
      {
        title: "Date",
        dataIndex: "transactionDate",
        key: "transactionDate",
        render: (value) => new Date(value).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }),
      },
    ],
    [role]
  );

  if (loading && !summary) {
    return <Skeleton active paragraph={{ rows: 12 }} />;
  }

  if (!summary) {
    return (
      <Card className="shadow-sm">
        <Empty description="Dashboard data could not be loaded" />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
        {visibleKpiCards.map((card) => {
          const { key, ...rest } = card;
          return <KpiCard key={key} {...rest} />;
        })}
      </section>

      {canViewSales || canViewStock ? (
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.7fr_1fr]">
          <GraphChart data={canViewSales ? summary.trend : []} loading={loading} />
          <DonutChart data={canViewStock ? summary.stockDistribution : []} loading={loading} />
        </section>
      ) : null}

      {canViewSales ? (
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
          <Card
            className="shadow-sm"
            title={<span className="font-semibold text-gray-800">Top Selling Products</span>}
            extra={<span className="text-sm text-gray-500">Current month</span>}
          >
            <Table
              rowKey="productId"
              columns={topSellingColumns}
              dataSource={summary.topSellingProducts}
              loading={loading}
              pagination={false}
              locale={{ emptyText: "No completed sales for this month yet" }}
              scroll={{ x: 640 }}
            />
          </Card>

          <Card
            className="shadow-sm"
            title={<span className="font-semibold text-gray-800">Year To Date</span>}
            bodyStyle={{ padding: 20 }}
          >
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500 !mb-1">Sales</p>
                <p className="text-2xl font-semibold text-slate-900 !mb-1">
                  {formatCurrency(summary.overview.year.salesTotal)}
                </p>
                <p className="text-sm text-slate-500 !m-0">
                  {summary.overview.year.orders} orders completed this year
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-emerald-700 !mb-1">Profit</p>
                <p className="text-2xl font-semibold text-emerald-900 !mb-1">
                  {formatCurrency(summary.overview.year.profit)}
                </p>
                <p className="text-sm text-emerald-700 !m-0">
                  {formatCurrency(summary.overview.year.returnsTotal)} refunded this year
                </p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-amber-700 !mb-1">Inventory Base</p>
                <p className="text-2xl font-semibold text-amber-900 !mb-1">
                  {formatInteger(summary.inventory.totalProducts)} products
                </p>
                <p className="text-sm text-amber-700 !m-0">
                  {formatInteger(summary.inventory.sellableCount)} sellable | {formatInteger(summary.inventory.outOfStockCount)} out of stock
                </p>
              </div>
            </div>
          </Card>
        </section>
      ) : null}

      {canViewStock ? (
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <InventoryList
            title="Low Stock Watchlist"
            emptyText="No products are below reorder level"
            items={summary.inventory.lowStockProducts}
            rightLabel={(item) => `Reorder at ${formatInteger(Number(item.reorderPoint || 0))}`}
            rightValue={(item) => formatInteger(Number(item.quantityOnHand || 0))}
          />
          <InventoryList
            title="Expiring Soon"
            emptyText="No lots are expiring in the next 30 days"
            items={summary.inventory.expiringSoonProducts}
            rightLabel={(item) =>
              item.nextExpiryDate
                ? `Expires ${new Date(item.nextExpiryDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}`
                : "No expiry date"
            }
            rightValue={(item) => `${formatInteger(Number(item.daysUntilExpiry || 0))}d`}
          />
        </section>
      ) : null}

      {canViewTransactions ? (
        <section>
          <Card
            className="shadow-sm"
            title={<span className="font-semibold text-gray-800">Recent Transactions</span>}
            extra={
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FiPackage />
                Latest across sales, purchases, and returns
              </div>
            }
          >
            <Table
              rowKey={(record) => `${record.type}-${record.entityId}`}
              columns={transactionColumns}
              dataSource={visibleTransactions}
              loading={loading}
              pagination={false}
              locale={{ emptyText: "No transactions found" }}
              scroll={{ x: 860 }}
            />
          </Card>
        </section>
      ) : null}
    </div>
  );
}
