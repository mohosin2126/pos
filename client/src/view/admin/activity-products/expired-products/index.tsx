import { Link } from "react-router-dom";
import { DashboardTitle } from "@/components/re-useable/dashboard-titile";
import ToolbarButton from "@/components/re-useable/toolbar-button";
import { Button } from "antd";
import { MdAddCircleOutline } from "react-icons/md";

export default function ExpiredProducts() {
  return (
    <div className="space-y-6">
      <div className="flex md:items-center justify-between flex-col md:flex-row gap-6">
        <DashboardTitle
          title="Expired Products"
          description="Track and manage products that have passed their expiration date"
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
              Add Product
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
