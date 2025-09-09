"use client";
import React, { useState } from "react";
import ReactApexChart from "react-apexcharts";
import dayjs, { Dayjs } from "dayjs";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import { Card, ConfigProvider, DatePicker, Tag } from "antd";
import { HiOutlineShoppingCart } from "react-icons/hi";
import { GrOverview } from "react-icons/gr";

dayjs.extend(quarterOfYear);

type DataPoint = {
  x: string;
  y: number;
};

type Series = {
  name: string;
  data: DataPoint[];
};

export const GraphChart: React.FC = () => {
  const [state] = useState<{
    series: Series[];
    options: ApexCharts.ApexOptions;
  }>({
    series: [
      {
        name: "sales",
        data: [
          { x: "2019/01/01", y: 400 },
          { x: "2019/04/01", y: 430 },
          { x: "2019/07/01", y: 448 },
          { x: "2019/10/01", y: 470 },
          { x: "2020/01/01", y: 540 },
          { x: "2020/04/01", y: 580 },
          { x: "2020/07/01", y: 690 },
          { x: "2020/10/01", y: 690 },
        ],
      },
    ],
    options: {
      chart: {
        type: "bar",
        height: 380,
        toolbar: {
          show: false,
        },
      },
      xaxis: {
        type: "category",
        labels: {
          formatter: (val: string) => "Q" + dayjs(val).quarter(),
        },
        group: {
          style: {
            fontSize: "10px",
            fontWeight: 700,
          },
          groups: [
            { title: "2019", cols: 4 },
            { title: "2020", cols: 4 },
          ],
        },
      },
      tooltip: {
        x: {
          formatter: (val: string | number) =>
            "Q" + dayjs(val).quarter() + " " + dayjs(val).format("YYYY"),
        },
      },
    },
  });

  const onChange = (date: Dayjs) => {
    if (date) {
      console.log("Date: ", date);
    } else {
      console.log("Clear");
    }
  };

  return (
    <Card
      className="w-full h-[450px] overflow-hidden"
      title={
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center !m-0">
            <Tag className="!py-1 !border-none" color="cyan">
              <HiOutlineShoppingCart size={20} />
            </Tag>
            Sales Overview
          </h2>
          <ConfigProvider
            theme={{
              components: {
                DatePicker: {
                  hoverBorderColor: "#005555",
                  activeBorderColor: "#005555",
                  activeShadow: "0 0 0 2px rgba(124,58,237,0.12)",
                },
              },
            }}
          >
            <DatePicker
              presets={[
                { label: "Yesterday", value: dayjs().add(-1, "d") },
                { label: "Last Week", value: dayjs().add(-7, "d") },
                { label: "Last Month", value: dayjs().add(-1, "month") },
                { label: "Last Year", value: dayjs().add(-1, "year") },
              ]}
              onChange={onChange}
            />
          </ConfigProvider>
        </div>
      }
    >
      <ReactApexChart
        options={state.options}
        series={state.series}
        type="bar"
        height={420}
      />
    </Card>
  );
};

export const DonutChart: React.FC = () => {
  const categories = ["Suppliers", "Categories", "Products", "Purchases"];
  const values = [12, 8, 45, 20]; // demo numbers

  const [activeIndex, setActiveIndex] = useState<number | null>(null); // null = Total

  const total = values.reduce((a, b) => a + b, 0);

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "donut",
      width: 380,
      events: {
        dataPointSelection: (_event, _chartContext, config) => {
          setActiveIndex(config.dataPointIndex);
        },
      },
    },
    labels: categories,
    plotOptions: {
      pie: {
        startAngle: -90,
        endAngle: 270,
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
      formatter: (val, opts) =>
        `${val} - ${opts.w.globals.series[opts.seriesIndex]}`,
    },
    tooltip: { y: { formatter: (val) => val.toString() } },
  };

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center !m-0">
            <Tag className="!py-1 !border-none" color="error">
              <GrOverview size={20} />
            </Tag>
            POS Overview
          </h2>
          <ConfigProvider
            theme={{
              components: {
                DatePicker: {
                  hoverBorderColor: "#005555", // border on hover
                  activeBorderColor: "#005555", // border on focus/active
                  activeShadow: "0 0 0 2px rgba(124,58,237,0.12)",
                },
              },
            }}
          >
            <DatePicker
              presets={[
                { label: "Yesterday", value: dayjs().add(-1, "d") },
                { label: "Last Week", value: dayjs().add(-7, "d") },
                { label: "Last Month", value: dayjs().add(-1, "month") },
                { label: "Last Year", value: dayjs().add(-1, "year") },
              ]}
              onChange={(e) => console.log(e)}
            />
          </ConfigProvider>
        </div>
      }
    >
      <div className="flex justify-center">
        <ReactApexChart
          key={activeIndex ?? "total"}
          options={options}
          series={values}
          type="donut"
          width={420}
        />
      </div>
    </Card>
  );
};
