import { useUser } from "@/context-api";
import { Card, Tag, Avatar, Row, Col, Button } from "antd";
import {
  FiEdit,
  FiUser,
  FiHome,
  FiCreditCard,
  FiDollarSign,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";

export default function ViewProfile() {
  const { user } = useUser();
  console.log("user info :", user);

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
      <Card className=" rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar
              size={80}
              src={
                (user?.profilePic as string) ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                  (user?.firstName ?? "") + " " + (user?.lastName ?? "")
                )}`
              }
            />

            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-semibold !m-0">
                {user?.firstName ?? ""} {user?.lastName ?? ""}
              </h2>
              <p className=" !m-0">john.doe@example.com</p>
              <div className="mt-1">
                <Tag color={user?.role === "admin" ? "gold" : "blue"}>
                  {user?.role.toUpperCase() ?? ""}
                </Tag>
                <Tag color={user?.isActive ? "green" : "red"}>
                  {user?.isActive ? "ACTIVE" : "INACTIVE"}
                </Tag>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-2">
            <Link to={`/admin/user/update/${user?.id}`}>
              <Button className="btn hover:!text-[#69feb0]" icon={<FiEdit />}>
                Edit
              </Button>
            </Link>
            <Link to="/admin/invoice/all">
              <Button className="outlet-btn" icon={<ArrowLeftOutlined />}>
                Back
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Grid Layout for Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card
          title={
            <span className="flex items-center gap-2">
              <FiUser /> Personal Information
            </span>
          }
        >
          <InfoRow label="Email : " value={user?.email} />
          <InfoRow label="Username :" value={user?.username} />
          <InfoRow
            label="Allow Login :"
            value={user?.allowLogin ? "Yes" : "No"}
          />
          <InfoRow label="Date of Birth :" value={user?.dateOfBirth} />
          <InfoRow label="Gender :" value={user?.gender} />
          <InfoRow label="Marital Status :" value={user?.maritalStatus} />
          <InfoRow label="Blood Group :" value={user?.bloodGroup} />
          <InfoRow label="Mobile :" value={user?.mobileNumber} />
        </Card>

        <Card
          title={
            <span className="flex items-center gap-2">
              <FiCreditCard /> Bank Information
            </span>
          }
        >
          <InfoRow label="Account Holder :" value={user?.accountHolderName} />
          <InfoRow label="Account Number :" value={user?.accountNumber} />
          <InfoRow label="Bank Name :" value={user?.bankName} />
          <InfoRow label="Bank Code :" value={user?.bankIdentifierCode} />
          <InfoRow label="Branch :" value={user?.branch} />
        </Card>

        <Card
          title={
            <span className="flex items-center gap-2">
              <FiHome /> Address Information
            </span>
          }
        >
          <InfoRow label="Permanent Address :" value={user?.permanentAddress} />
          <InfoRow label="Current Address :" value={user?.currentAddress} />
        </Card>

        <Card
          title={
            <span className="flex items-center gap-2">
              <FiDollarSign /> Tax Information
            </span>
          }
        >
          <InfoRow label="Tax Payer ID :" value={user?.taxPayerId} />
        </Card>
      </div>
    </div>
  );
}
