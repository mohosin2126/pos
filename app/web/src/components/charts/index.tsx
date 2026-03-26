"use client";
import React, { useMemo, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { Card, Empty, Tag } from "antd";
import { HiOutlineShoppingCart } from "react-icons/hi";
import { GrOverview } from "react-icons/gr";
import { TDashboardDistributionItem, TDashboardTrendPoint } from "@/interface/common";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

interface TGraphChartProps {
  data: TDashboardTrendPoint[];
  loading?: boolean;
}

interface TDonutChartProps {
  data: TDashboardDistributionItem[];
  loading?: boolean;
}

export const GraphChart: React.FC<TGraphChartProps> = ({ data, loading = false }) => {
  const totalSales = useMemo(
    () => data.reduce((sum, item) => sum + Number(item.sales || 0), 0),
    [data]
  );
  const totalProfit = useMemo(
    () => data.reduce((sum, item) => sum + Number(item.profit || 0), 0),
    [data]
  );
  const totalOrders = useMemo(
    () => data.reduce((sum, item) => sum + Number(item.orders || 0), 0),
    [data]
  );
  const peakSalesDay = useMemo(() => {
    if (!data.length) return null;
    return [...data].sort((a, b) => Number(b.sales || 0) - Number(a.sales || 0))[0];
  }, [data]);

  const chartConfig = useMemo(() => {
    const categories = data.map((item) => item.label);

    return {
      series: [
        {
          name: "Net Sales",
          type: "area" as const,
          data: data.map((item) => item.sales),
        },
        {
          name: "Profit",
          type: "line" as const,
          data: data.map((item) => item.profit),
        },
      ],
      options: {
        chart: {
          type: "line",
          height: 340,
          toolbar: {
            show: false,
          },
        },
        colors: ["#0f766e", "#c2410c"],
        stroke: {
          curve: "smooth",
          width: [3, 3],
          dashArray: [0, 8],
        },
        markers: {
          size: [0, 4],
          strokeWidth: 2,
          strokeColors: ["#ffffff", "#c2410c"],
          colors: ["#0f766e", "#ffffff"],
          hover: {
            sizeOffset: 2,
          },
        },
        dataLabels: {
          enabled: false,
        },
        grid: {
          borderColor: "#e5e7eb",
          strokeDashArray: 3,
          padding: {
            left: 4,
            right: 6,
            top: 12,
            bottom: 0,
          },
        },
        xaxis: {
          categories,
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
          labels: {
            style: {
              colors: "#6b7280",
              fontSize: "12px",
              fontWeight: 500,
            },
          },
        },
        fill: {
          type: ["gradient", "solid"],
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.22,
            opacityTo: 0.02,
            stops: [0, 100],
          },
        },
        yaxis: {
          labels: {
            formatter: (value: number) => currencyFormatter.format(value),
            style: {
              colors: ["#6b7280"],
              fontSize: "12px",
            },
          },
        },
        tooltip: {
          shared: true,
          intersect: false,
          y: {
            formatter: (value: number) => currencyFormatter.format(value),
          },
        },
        legend: {
          position: "top",
          horizontalAlign: "right",
          fontSize: "12px",
          fontWeight: 600,
        },
      } satisfies ApexCharts.ApexOptions,
    };
  }, [data]);

  return (
    <Card
      className="w-full overflow-hidden"
      bodyStyle={{ padding: 18 }}
      title={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="!text-base md:!text-lg font-semibold flex items-center !m-0">
            <Tag className="!py-1 !border-none" color="cyan">
              <HiOutlineShoppingCart size={20} />
            </Tag>
            <span className="!text-base md:!text-lg font-semibold !mr-2">
              Sales And Profit
            </span>
          </div>
          <p className="!m-0 text-sm text-gray-500">Last 7 days</p>
        </div>
      }
    >
      {!loading && data.length === 0 ? (
        <div className="h-[360px] flex items-center justify-center">
          <Empty description="No trend data available" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 border-b border-slate-100 pb-4 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400 !mb-1">7 Day Sales</p>
              <p className="text-xl font-semibold text-slate-900 !mb-0">
                {currencyFormatter.format(totalSales)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400 !mb-1">7 Day Profit</p>
              <p className="text-xl font-semibold text-slate-900 !mb-0">
                {currencyFormatter.format(totalProfit)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400 !mb-1">Peak Day</p>
              <p className="text-xl font-semibold text-slate-900 !mb-0">
                {peakSalesDay ? peakSalesDay.label : "--"}
              </p>
              <p className="text-xs text-slate-500 !mb-0">{totalOrders} orders</p>
            </div>
          </div>

          <ReactApexChart
            options={chartConfig.options}
            series={chartConfig.series}
            type="line"
            height={340}
          />
        </div>
      )}
    </Card>
  );
};

export const DonutChart: React.FC<TDonutChartProps> = ({ data, loading = false }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const categories = useMemo(() => data.map((item) => item.label), [data]);
  const values = useMemo(() => data.map((item) => item.value), [data]);
  const total = values.reduce((sum, value) => sum + value, 0);

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "donut",
      events: {
        dataPointSelection: (_event, _chartContext, config) => {
          setActiveIndex(config?.dataPointIndex ?? null);
        },
      },
    },
    labels: categories,
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            name: {
              show: true,
              offsetY: -10,
              formatter: () =>
                activeIndex === null ? "Total" : categories[activeIndex],
            },
            value: {
              show: true,
              fontSize: "18px",
              fontWeight: 600,
              offsetY: 10,
              formatter: () =>
                activeIndex === null
                  ? total.toString()
                  : values[activeIndex].toString(),
            },
            total: {
              show: true,
              label: activeIndex === null ? "Total" : categories[activeIndex],
              formatter: () =>
                activeIndex === null
                  ? total.toString()
                  : values[activeIndex].toString(),
            },
          },
        },
      },
    },
    dataLabels: { enabled: true },
    fill: { type: "gradient" },
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "center",
      floating: false,
      fontSize: "12px",
      itemMargin: { horizontal: 10, vertical: 0 },
      formatter: (val, opts) => {
        const seriesIndex = opts?.seriesIndex ?? -1;
        const seriesValue =
          seriesIndex >= 0 ? opts?.w.globals.series[seriesIndex] : undefined;

        return `${val} - ${seriesValue ?? 0}`;
      },
    },
    tooltip: { y: { formatter: (val) => val.toString() } },
  };

  return (
    <Card
      title={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center !m-0">
            <Tag className="!py-1 !border-none" color="error">
              <GrOverview size={20} />
            </Tag>
            <span className="!text-base md:!text-lg font-semibold !mr-2">
              Inventory Mix
            </span>
          </div>
          <p className="!m-0 text-sm text-gray-500">Current stock health</p>
        </div>
      }
    >
      {!loading && data.length === 0 ? (
        <div className="h-[320px] flex items-center justify-center">
          <Empty description="No inventory data available" />
        </div>
      ) : (
        <div className="mx-auto w-full max-w-[360px] overflow-hidden">
          <ReactApexChart
            key={activeIndex ?? "total"}
            options={{
              ...options,
              responsive: [
                {
                  breakpoint: 1280,
                  options: {
                    chart: {
                      width: 320,
                    },
                  },
                },
                {
                  breakpoint: 768,
                  options: {
                    chart: {
                      width: 280,
                    },
                  },
                },
              ],
            }}
            series={values}
            type="donut"
            width="100%"
          />
        </div>
      )}
    </Card>
  );
};

