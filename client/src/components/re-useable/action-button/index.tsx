import React from "react";
import { Link } from "react-router-dom";
import { Space } from "antd";
import { FiEye, FiEdit, FiTrash2 } from "react-icons/fi";
import {TActionButtonProps} from "@/interface/menu-and-common";

export const ActionButton: React.FC<TActionButtonProps> = ({
  viewUrl,
  editUrl,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <Space>
      {/* View */}
      {viewUrl ? (
        <Link to={viewUrl}>
          <button className="action-btn group bg-[#005555]/10 hover:bg-[#005555]/15">
            <FiEye size={16} className="action-text" />
          </button>
        </Link>
      ) : (
        onView && (
          <button
            onClick={onView}
            className="action-btn group bg-[#005555]/10 hover:bg-[#005555]/15"
          >
            <FiEye size={16} className="action-text" />
          </button>
        )
      )}

      {/* Edit */}
      {editUrl ? (
        <Link to={editUrl}>
          <button
            onClick={onView}
            className="action-btn group bg-[#005555]/10 hover:bg-[#005555]/15"
          >
            <FiEdit size={16} className="action-text" />
          </button>
        </Link>
      ) : (
        onEdit && (
          <button
            onClick={onEdit}
            className="action-btn group bg-[#005555]/10 hover:bg-[#005555]/15"
          >
            <FiEdit size={16} className="action-text" />
          </button>
        )
      )}

      {/* Delete */}
      {onDelete && (
        <button
          onClick={onDelete}
          className="action-btn group bg-red-500/15 hover:bg-red-500/25"
        >
          <FiTrash2
            size={16}
            className="text-red-500 group-hover:text-red-600 [transition:0.3s]"
          />
        </button>
      )}
    </Space>
  );
};
