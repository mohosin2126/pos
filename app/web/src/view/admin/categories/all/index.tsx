import { useEffect, useMemo, useState } from "react";
import { showConfirmDelete } from "@/components/re-useable/delete-modal";
import {
  Button,
  Card,
  Col,
  Dropdown,
  Input,
  message,
  Pagination,
  Skeleton,
  Typography,
} from "antd";
import { DashboardTitle } from "@/components/re-useable/dashboard-titile";
import ToolbarButton from "@/components/re-useable/toolbar-button";
import { MdAddCircleOutline, MdOutlineSearch } from "react-icons/md";
import type { TCategoryPayload } from "@/interface/common";
import CustomModal from "@/components/modal";
import CategoryForm from "../form";
import { useCategories, useDeleteCategory } from "@/hooks/admin/categories";
import { BsBox, BsThreeDots } from "react-icons/bs";
import dayjs from "dayjs";
import Loader from "@/components/re-useable/loader";

const { Title, Text } = Typography;

export default function CategoriesAll() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
  const [updateData, setUpdateData] = useState<TCategoryPayload | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const { deleteItem } = useDeleteCategory();
  const { categories, refetch, loading } = useCategories();


  const handleAdd = () => {
    setUpdateData(null);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setUpdateData(null);
  };

  const filteredCategories = categories
    ?.filter(
      (cat) =>
        (cat?.name ?? "").toLowerCase().includes(searchText.toLowerCase()) ||
        (cat?.description ?? "")
          .toLowerCase()
          .includes(searchText.toLowerCase())
    )
    ?.sort(
      (a, b) =>
        new Date(b.createdAt ?? 0).getTime() -
        new Date(a.createdAt ?? 0).getTime()
    );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText]);

  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCategories?.slice(start, start + pageSize) ?? [];
  }, [filteredCategories, currentPage, pageSize]);

  const menuItems = [
    {
      key: "edit",
      label: "Edit",
    },
    {
      key: "delete",
      label: "Delete",
    },
  ];

  const handleMenuClick = (e: any, cat: any) => {
    if (e.key === "edit") {

      setUpdateData(cat);
      setIsOpen(true);
    }

    if (e.key === "delete") {
      showConfirmDelete({
        title: "Delete Category",
        content: `Are you sure you want to delete "${cat.name}"? This action cannot be undone.`,
        onConfirm: async () => {
          if (cat?.id !== undefined) {
            const result = await deleteItem(cat.id);
            console.log("delete result is :", result);
          } else {
            console.warn("Cannot delete: category id is undefined");
          }
          refetch();
          message.success("Category deleted successfully");
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex md:items-center justify-between flex-col md:flex-row gap-6">
        <DashboardTitle
          title="Categories"
          description="Manage and organize all categories in one place"
        />
        <div className="flex items-center gap-x-3">
          <ToolbarButton onRefreshClick={() => refetch()} />
          <Button
            onClick={handleAdd}
            type="primary"
            icon={<MdAddCircleOutline />}
            className="btn hover:!text-[#69feb0]"
          >
            Add Category
          </Button>
        </div>
      </div>

      {/* Modal */}
      <CustomModal
        isOpen={isOpen}
        setIsOpen={handleClose}
        title={updateData ? "Update Category" : "Create Category"}
        description={
          updateData
            ? "Update category details here."
            : "Add a new category to organize and manage your items effectively."
        }
        width="530px"
      >
        <CategoryForm
          isOpen={isOpen}
          onClose={handleClose}
          updateValue={updateData}
          refetch={refetch}
        />
      </CustomModal>

      {/* Category List */}
      <Card
        title={
          <div className="flex items-center justify-between gap-4 flex-wrap my-6">
            <Input
              placeholder="Search by category name..."
              prefix={<MdOutlineSearch color="gray" size={16} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="md:!w-72 !font-normal"
              allowClear
            />
          </div>
        }
      >
        {loading ? (
          <div className="grid gap-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1">
            {[...Array(6)].map((_, index) => (
              <Col key={index}>
                <Card className="text-center relative">
                  {/* Skeleton Icon */}
                  <div className="bg-blue-100 rounded-full p-4 mb-4 flex w-max mx-auto items-center justify-center">
                    <Skeleton.Avatar active size={24} shape="circle" />
                  </div>

                  {/* Skeleton Title */}
                  <Skeleton.Input
                    style={{ width: "100%", height: 24, margin: "0 auto 8px" }}
                    active
                    size="small"
                  />

                  {/* Skeleton Description */}
                  <Skeleton
                    paragraph={{
                      rows: 1,
                      width: "100%",
                      style: { margin: "12px 0 0" },
                    }}
                    active
                  />

                  {/* Skeleton Date */}
                  <Skeleton.Input
                    style={{ width: 100, height: 14, margin: "12px auto 0" }}
                    active
                    size="small"
                  />
                </Card>
              </Col>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1">
            {paginatedCategories.map((cat) => (
              <Col key={cat.id}>
                <Card className=" text-center relative">
                  {/* Dropdown for dots */}
                  <Dropdown
                    menu={{
                      items: menuItems,
                      onClick: (e) => handleMenuClick(e, cat),
                    }}
                    trigger={["click"]}
                    placement="bottomRight"
                    overlayStyle={{ minWidth: "8rem" }}
                  >
                    <div className="absolute right-3 top-3 cursor-pointer w-8 h-8 bg-[#005555]/10 hover:bg-[#005555]/20 rounded-full flex items-center justify-center">
                      <BsThreeDots color="#005555" size={22} />
                    </div>
                  </Dropdown>

                  {/* Optional Icon */}
                  <div className="bg-blue-100 text-blue-600 rounded-full p-4 mb-4 flex w-max mx-auto items-center text-center">
                    <BsBox size={24} />
                  </div>
                  {/* Category Name */}
                  <Title level={5} className="!mb-2 ">
                    {cat?.name}
                  </Title>

                  {/* Description */}
                  <Text type="secondary" className="">
                    {cat?.description}
                  </Text>

                  {/* Date */}
                  <Text type="secondary" className="text-xs block !mt-4">
                    Added: {dayjs(cat?.createdAt).format("MMMM D, YYYY")}
                  </Text>
                </Card>
              </Col>
            ))}
          </div>
        )}

        {filteredCategories.length === 0 && (
          <p className="text-center text-gray-500 col-span-full">
            No categories found
          </p>
        )}

        {filteredCategories.length > 0 && (
          <div className="mt-6 flex justify-end">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredCategories.length}
              showSizeChanger
              showQuickJumper
              pageSizeOptions={["6", "9", "12", "18"]}
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} of ${total} categories`
              }
              onChange={(page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              }}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
