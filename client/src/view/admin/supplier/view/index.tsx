import { Card, Row, Col, Tag, Avatar, Button } from "antd";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { Link, useParams } from "react-router-dom";
import {
  FaBuilding,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaMoneyCheckAlt,
  FaStickyNote,
} from "react-icons/fa";

import { useSupplier } from "@/hooks/admin/supplier";
import { ArrowLeftOutlined } from "@ant-design/icons";

export default function SupplierDetails() {
  const { id } = useParams();
  const { supplier } = useSupplier(id);

  const InfoRow = ({ label, value }: { label: string; value: any }) => (
    <Row className="mb-3">
      <Col span={8} className="text-gray-500 font-medium">
        {label}
      </Col>
      <Col span={16} className="font-semibold text-gray-800">
        {value || "—"}
      </Col>
    </Row>
  );

  return (
    <div className="!space-y-6">
      {/* Header Card */}
      <Card className="rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar
              size={80}
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${supplier?.companyName}`}
            />
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-semibold !m-0">
                {supplier?.companyName}
              </h2>
              <p className="!m-0 text-gray-500">{supplier?.email}</p>
              <div className="mt-1">
                <Tag color="blue">{supplier?.supplierCode}</Tag>
                <Tag color={supplier?.status === "active" ? "green" : "red"}>
                  {supplier?.status.toUpperCase()}
                </Tag>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-2">
            <Link to={`/admin/supplier/update/${supplier?.id}`}>
              <Button icon={<FiEdit />} className="btn hover:!text-[#69feb0]">
                Edit
              </Button>
            </Link>
            <Link to="/admin/supplier/all">
              <Button className="outlet-btn" icon={<ArrowLeftOutlined />}>
                Back
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card
          title={
            <span className="flex items-center gap-2">
              <FaBuilding /> Company Information
            </span>
          }
        >
          <InfoRow label="Company Name :" value={supplier?.companyName} />
          <InfoRow label="Supplier Code :" value={supplier?.supplierCode} />
          <InfoRow label="Website :" value={supplier?.website} />
          <InfoRow label="Status :" value={supplier?.status} />
        </Card>

        <Card
          title={
            <span className="flex items-center gap-2">
              <FaPhoneAlt /> Contact Information
            </span>
          }
        >
          <InfoRow
            label="Contact Person :"
            value={supplier?.contactPersonName}
          />
          <InfoRow label="Email :" value={supplier?.email} />
          <InfoRow label="Phone :" value={supplier?.phone} />
        </Card>

        <Card
          title={
            <span className="flex items-center gap-2">
              <FaMapMarkerAlt /> Address Information
            </span>
          }
        >
          <InfoRow label="Address :" value={supplier?.address} />
          <InfoRow label="City :" value={supplier?.city} />
          <InfoRow label="State :" value={supplier?.state} />
          <InfoRow label="Postal Code :" value={supplier?.postalCode} />
          <InfoRow label="Country :" value={supplier?.country} />
        </Card>

        <Card
          title={
            <span className="flex items-center gap-2">
              <FaMoneyCheckAlt /> Bank & Tax Information
            </span>
          }
        >
          <InfoRow label="Bank Details :" value={supplier?.bankDetails} />
          <InfoRow label="Tax ID :" value={supplier?.taxId} />
          <InfoRow label="Payment Terms :" value={supplier?.paymentTerms} />
        </Card>

        <Card
          title={
            <span className="flex items-center gap-2">
              <FaStickyNote /> Notes
            </span>
          }
          className="lg:col-span-2"
        >
          <p className="text-gray-700">{supplier?.notes || "—"}</p>
        </Card>
      </div>
    </div>
  );
}
