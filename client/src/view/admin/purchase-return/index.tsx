import { Alert as AlertPR } from "antd";
import { MdConstruction as MdBuildPR } from "react-icons/md";
import { DashboardTitle as DashboardTitlePR } from "@/components/re-useable/dashboard-titile";
import ToolbarButtonPR from "@/components/re-useable/toolbar-button";

export default function PurchaseReturn() {
    return (
        <div className="space-y-6">
            <div className="flex md:items-center justify-between flex-col md:flex-row gap-6">
                <DashboardTitlePR
                    title="Purchase Returns"
                    description="Process and track purchase returns and credit notes"
                />
                <div className="flex items-center gap-x-3">
                    <ToolbarButtonPR
                        onPdfClick={() => console.log("Returns: PDF Export")}
                        onExcelClick={() => console.log("Returns: Excel Export")}
                        onRefreshClick={() => console.log("Returns: Data Refreshed")}
                    />
                </div>
            </div>

            {/* Work-in-progress notice */}
            <AlertPR
                showIcon
                type="info"
                message={<span className="font-medium">Work in progress — stay tuned</span>}
                description={
                    <span className="text-gray-600">
            Coming soon: returns list/table, create return flow linked to original PO,
            restock/dispose options, credit note generation, and audit trail.
          </span>
                }
                className="rounded-xl"
            />

            {/* Friendly placeholder block */}
            <div className="rounded-2xl border border-dashed p-10 text-center bg-white mt-10">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border">
                    <MdBuildPR className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">This page is under construction</h3>
                <p className="mt-2 text-gray-500">
                    While we connect the flows, use the toolbar for quick exports or refresh.
                </p>
            </div>
        </div>
    );
}
