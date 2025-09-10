import { useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Button,
  Divider,
  Space,
  Badge,
  Image,
  Tooltip,
  InputNumber,
  Statistic,
  Progress,
} from "antd";
import {
  ShoppingCartOutlined,
  HeartOutlined,
  ShareAltOutlined,
  BarcodeOutlined,
  TagOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";
import { useProduct } from "@/hooks/admin/products";

const { Title, Text, Paragraph } = Typography;

export default function ProductDetails() {
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  const { id } = useParams();
  const { product } = useProduct(id);

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return {
          color: "success",
          icon: <CheckCircleOutlined />,
          text: "Active",
        };
      case "inactive":
        return {
          color: "default",
          icon: <InfoCircleOutlined />,
          text: "Inactive",
        };
      case "out_of_stock":
        return {
          color: "error",
          icon: <WarningOutlined />,
          text: "Out of Stock",
        };
      default:
        return { color: "default", icon: <InfoCircleOutlined />, text: status };
    }
  };

  const getStockStatus = () => {
    if (!product?.isTrackStock)
      return { color: "default", text: "Not Tracked" };

    const stockQty = product.stockQuantity ?? 0; // fallback to 0 if undefined
    const reorderLevel = product.reorderLevel ?? 0;

    if (stockQty <= 0) return { color: "error", text: "Out of Stock" };
    if (stockQty <= reorderLevel)
      return { color: "warning", text: "Low Stock" };

    return { color: "success", text: "In Stock" };
  };

  const getStockPercentage = () => {
    if (!product?.isTrackStock) return 0;

    const stockQty = product.stockQuantity ?? 0;
    const reorderLevel = product.reorderLevel ?? 0;

    const maxStock = Math.max(stockQty, reorderLevel * 3);
    return maxStock > 0 ? (stockQty / maxStock) * 100 : 0;
  };

  const statusConfig = getStatusConfig(product?.status ?? "");
  const stockStatus = getStockStatus();
  const stockPercentage = getStockPercentage();

  const tags = (product?.tags ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag);

  return (
    <div className="">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Badge
            color={statusConfig.color}
            text={statusConfig.text}
            className="font-medium"
          />
          <Badge
            color={stockStatus.color}
            text={stockStatus.text}
            className="font-medium"
          />
        </div>
        <Title level={1} className="text-foreground">
          {product?.name}
        </Title>
        <Paragraph className="text-lg text-muted-foreground mb-4">
          {product?.description}
        </Paragraph>
      </div>
      <Row gutter={[32, 32]}>
        {/* Product Image */}
        <Col xs={24} lg={10}>
          <Card className="card-elevated border-0">
            <div className="relative overflow-hidden rounded-lg bg-accent/20">
              {!imageError ? (
                <Image
                  src={
                    product?.imageUrl
                      ? "https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTExL3BmLXM1MC1wYWktMDAwMzItMDEuanBn.jpg"
                      : "https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTExL3BmLXM1MC1wYWktMDAwMzItMDEuanBn.jpg "
                  }
                  alt={product?.name}
                  className="w-full h-auto object-cover transition-smooth hover:scale-105"
                  onError={() => setImageError(true)}
                  preview={{
                    mask: <div className="text-white">Click to preview</div>,
                  }}
                />
              ) : (
                <div className="w-full h-96 flex items-center justify-center bg-muted">
                  <div className="text-center text-muted-foreground">
                    <BarcodeOutlined className="text-4xl mb-2" />
                    <p>Image not available</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </Col>

        {/* Product Information */}
        <Col xs={24} lg={14}>
          <Card className="card-elevated">
            {/* Identity Section */}
            <Title level={4} className="!mb-5 flex items-center">
              <InfoCircleOutlined className="mr-2 !text-[#005555]" />
              Product Identity
            </Title>
            <Row gutter={[24, 16]}>
              <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                <div className="text-left">
                  <Text type="secondary" className="block text-sm">
                    SKU
                  </Text>
                  <Text strong className="text-base">
                    {product?.sku}
                  </Text>
                </div>
              </Col>

              <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                <div className="text-left">
                  <Text type="secondary" className="block text-sm">
                    Barcode
                  </Text>
                  <Tooltip title="Click to copy barcode">
                    <Text
                      strong
                      className="text-base cursor-pointer hover:!text-[#005555] transition-fast"
                      onClick={() =>
                        navigator.clipboard.writeText(product?.barcode ?? "")
                      }
                    >
                      <BarcodeOutlined className="mr-1" />
                      {product?.barcode}
                    </Text>
                  </Tooltip>
                </div>
              </Col>

              <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                <div className="text-left">
                  <Text type="secondary" className="block text-sm">
                    Created
                  </Text>
                  <Text strong className="text-base">
                    {dayjs(product?.createdAt).format("DD MMM YYYY")}
                  </Text>
                </div>
              </Col>

              <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                <div className="text-left">
                  <Text type="secondary" className="block text-sm">
                    Updated
                  </Text>
                  <Text strong className="text-base">
                    {dayjs(product?.updatedAt).format("DD MMM YYYY")}
                  </Text>
                </div>
              </Col>
            </Row>

            <Divider />

            {/* Stock Management */}
            {product?.isTrackStock && (
              <>
                <Title level={4} className="!mb-5 flex items-center">
                  <InfoCircleOutlined className="mr-2 !text-[#005555]" />
                  Stock Management
                </Title>
                <Row gutter={[24, 16]} align="middle">
                  <Col xs={24} sm={8}>
                    <Statistic
                      title="Current Stock"
                      value={product.stockQuantity}
                      suffix="units"
                      valueStyle={{
                        color:
                          stockStatus.color === "success"
                            ? "hsl(var(--success))"
                            : stockStatus.color === "warning"
                            ? "hsl(var(--warning))"
                            : "hsl(var(--destructive))",
                      }}
                    />
                  </Col>
                  <Col xs={24} sm={8}>
                    <Statistic
                      title="Reorder Level"
                      value={product.reorderLevel}
                      suffix="units"
                    />
                  </Col>
                  <Col xs={24} sm={8}>
                    <Text type="secondary" className="block text-sm mb-2">
                      Stock Level
                    </Text>
                    <Progress
                      percent={Math.round(stockPercentage)}
                      status={
                        stockStatus.color === "error"
                          ? "exception"
                          : stockStatus.color === "warning"
                          ? "active"
                          : "success"
                      }
                      strokeColor={{
                        "0%":
                          stockStatus.color === "error"
                            ? "hsl(var(--destructive))"
                            : stockStatus.color === "warning"
                            ? "hsl(var(--warning))"
                            : "hsl(var(--success))",
                        "100%":
                          stockStatus.color === "error"
                            ? "hsl(var(--destructive))"
                            : stockStatus.color === "warning"
                            ? "hsl(var(--warning))"
                            : "hsl(var(--success))",
                      }}
                    />
                  </Col>
                </Row>
                <Divider />
              </>
            )}

            {/* Tags */}
            {tags?.length > 0 && (
              <>
                <Title level={4} className="!mb-5 flex items-center">
                  <TagOutlined className="mr-2 !text-[#005555]" />
                  Tags
                </Title>
                <Space size="small" wrap>
                  {tags?.map((tag, index) => (
                    <Tag key={index} color="blue" className="capitalize">
                      {tag}
                    </Tag>
                  ))}
                </Space>
                <Divider />
              </>
            )}

            {/* Action Buttons */}
            <Row gutter={[16, 16]} align="middle" className="!pt-1">
              <Col xs={24} sm={8}>
                <div className="flex items-center space-x-2 ">
                  <Text strong>Quantity:</Text>
                  <InputNumber
                    min={1}
                    max={product?.stockQuantity}
                    value={quantity}
                    onChange={(value) => setQuantity(value || 1)}
                    className="w-20"
                  />
                </div>
              </Col>
              <Col xs={24} sm={16}>
                <Space wrap className="w-full items-center md:justify-end">
                  <Button
                    size="large"
                    icon={<ShoppingCartOutlined />}
                    className="btn"
                    disabled={(product?.stockQuantity ?? 0) <= 0}
                  >
                    Add to Cart
                  </Button>
                  <Button
                    size="large"
                    icon={<HeartOutlined />}
                    className="hover:!text-[#005555] hover:!border-[#005555]"
                  >
                    Wishlist
                  </Button>
                  <Button
                    size="large"
                    icon={<ShareAltOutlined />}
                    className="hover:!text-[#005555] hover:!border-[#005555]"
                  >
                    Share
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
