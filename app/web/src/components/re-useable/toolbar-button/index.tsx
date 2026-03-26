import React from "react";
import { Button, Tooltip } from "antd";
import { BiSolidFilePdf } from "react-icons/bi";
import { BsFileEarmarkExcelFill } from "react-icons/bs";
import { SlRefresh } from "react-icons/sl";
import { TToolbarButtonProps } from "@/interface/menu-and-common";

const ToolbarButton: React.FC<TToolbarButtonProps> = ({
  onPdfClick,
  onExcelClick,
  onRefreshClick,
}) => {
  return (
    <div className="flex items-center gap-2">
      {onPdfClick && (
        <Tooltip title="Export as PDF">
          <Button
            color="default"
            variant="filled"
            className="!p-2 !text-red-500"
            onClick={onPdfClick}
          >
            <BiSolidFilePdf size={20} />
          </Button>
        </Tooltip>
      )}

      {onExcelClick && (
        <Tooltip title="Export as Excel">
          <Button
            color="default"
            variant="filled"
            className="!p-2 !text-green-500"
            onClick={onExcelClick}
          >
            <BsFileEarmarkExcelFill size={18} />
          </Button>
        </Tooltip>
      )}

      {onRefreshClick && (
        <Tooltip title="Refresh">
          <Button
            color="default"
            variant="filled"
            className="!p-2 group !bg-[#005555]/10 hover:!bg-[#005555]/15"
            onClick={onRefreshClick}
          >
            <SlRefresh className="action-text" size={16} />
          </Button>
        </Tooltip>
      )}
    </div>
  );
};

export default ToolbarButton;
