import { LoaderProps } from "@/interface/common";
import type { SpinProps } from "antd";

export default function Loader({ loading }: LoaderProps): SpinProps {
  const isBoolean = typeof loading === "boolean";

  const baseIndicator = (
    <div className="flex items-center justify-center h-40">
      <div className="dot-spinner">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="dot-spinner__dot"></div>
        ))}
      </div>
    </div>
  );

  return {
    spinning: isBoolean ? loading : loading.spinning ?? false,
    size: "large",
    indicator: baseIndicator,
    ...(isBoolean ? {} : loading),
  };
}
