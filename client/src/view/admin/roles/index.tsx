import { Link } from "react-router-dom";
import { Button, Skeleton, Alert } from "antd";
import { MdAddCircleOutline, MdConstruction } from "react-icons/md";
import { DashboardTitle } from "@/components/re-useable/dashboard-titile";
import ToolbarButton from "@/components/re-useable/toolbar-button";

export default function Roles() {
    return (
        <div className="space-y-6">
            <div className="flex md:items-center justify-between flex-col md:flex-row gap-6">
                <DashboardTitle
                    title="Roles"
                    description="Manage and assign user roles to control access and permissions"
                />
                <div className="flex items-center gap-x-3">
                    <ToolbarButton
                        onPdfClick={() => console.log("PDF Export")}
                        onExcelClick={() => console.log("Excel Export")}
                        onRefreshClick={() => console.log("Data Refreshed")}
                    />
                    <Link to="#">
                        <Button
                            type="primary"
                            icon={<MdAddCircleOutline />}
                            className="btn"
                        >
                            Add Role
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Work-in-progress notice */}
            <Alert
                showIcon
                type="info"
                message={<span className="font-medium">Work in progress — stay tuned</span>}
                description={
                    <span className="text-gray-600">
            We’re still building this section. Coming soon: roles list, create/edit
            role modal, permission matrix, and user assignment.
          </span>
                }
                className="rounded-xl"
            />

            {/* Friendly placeholder block */}
            <div className="rounded-2xl border border-dashed p-10 text-center bg-white mt-10 ">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border">
                    <MdConstruction className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">This page is under construction</h3>
                <p className="mt-2 text-gray-500">
                    While we wire up APIs and UI, here’s a placeholder. You can still use the
                    toolbar above to export or refresh.
                </p>

            </div>

            {/* Skeleton preview area (swap with real table later) */}
            {/*<div className="rounded-xl border p-6 bg-white ">*/}
            {/*    <Skeleton active paragraph={{ rows: 5 }} />*/}
            {/*</div>*/}
        </div>
    );
}
