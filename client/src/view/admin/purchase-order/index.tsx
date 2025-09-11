import { Alert } from "antd";
import { MdConstruction } from "react-icons/md";
import { DashboardTitle } from "@/components/re-useable/dashboard-titile";
import ToolbarButton from "@/components/re-useable/toolbar-button";

export default function PurchaseOrder() {
    return (
        <div className="space-y-6">
            <div className="flex md:items-center justify-between flex-col md:flex-row gap-6">
                <DashboardTitle
                    title="Purchase Orders"
                    description="Create and manage purchase orders with vendors, items, and approvals"
                />
                <div className="flex items-center gap-x-3">
                    <ToolbarButton
                        onPdfClick={() => console.log("POs: PDF Export")}
                        onExcelClick={() => console.log("POs: Excel Export")}
                        onRefreshClick={() => console.log("POs: Data Refreshed")}
                    />
                </div>
            </div>

            {/* Work-in-progress notice */}
            <Alert
                showIcon
                type="info"
                message={<span className="font-medium">Work in progress — stay tuned</span>}
                description={
                    <span className="text-gray-600">
            We’re still building this section. Coming soon: PO list/table, create/edit PO modal,
            vendor selection, line items, taxes/discounts, and approval workflow.
          </span>
                }
                className="rounded-xl"
            />

            {/* Friendly placeholder block */}
            <div className="rounded-2xl border border-dashed p-10 text-center bg-white mt-10">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border">
                    <MdConstruction className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">This page is under construction</h3>
                <p className="mt-2 text-gray-500">
                    While we wire up APIs and UI, here’s a placeholder. You can still use the toolbar above to export or refresh.
                </p>
            </div>
        </div>
    );
}
