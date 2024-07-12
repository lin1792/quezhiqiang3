<template>
  <div ref="chart"></div>
</template>

<script lang="ts" setup>
import * as d3 from "d3";
import { onMounted, ref, watch } from "vue";

const props = defineProps({
  picData: {
    type: Object,
    default: {} as any
  },
  otherParams: {
    type: Object,
    default: {} as any
  }
} as any);

const chart = ref(null as any);
const data = ref([] as any);
let min = ref(0 as any);
let max = ref(0 as any);
// 监听 picData 的变化

const drawChart = () => {
  // 定义图表的宽度和高度
  const margin = { top: 40, right: 20, bottom: 20, left: 20 },
    width = Number(props.otherParams.xAxisWidth),
    height = data.value.length * 20 + margin.top + margin.bottom;

  // 清除以前的图表（如果有）
  d3.select(chart.value).select("svg").remove();

  // 创建新的 SVG 元素
  const svg = d3
    .select(chart.value)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // 定义 x 轴和 y 轴的比例尺
  const x: any = d3
    .scaleLinear()
    .domain([min.value, max.value])
    .range([0, Number(props.otherParams.xAxisWidth)]);
  const y: any = d3
    .scaleBand()
    .domain(data.value.map((d: any) => d.id))
    .range([0, height - margin.top - margin.bottom])
    .padding(0.1);

  // 添加 x 轴，并将其移到底部
  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
    .call(d3.axisBottom(x));

  // 创建 y 轴，并将其位置移动到 x 轴的 1.0 位置
  svg
    .append("g")
    .attr("transform", `translate(${x(props.otherParams.yAxis || 0)},0)`)
    .call(
      d3
        .axisLeft(y)
        .tickSize(0)
        .tickFormat("" as any)
    );

  // 绘制置信区间的线
  svg
    .selectAll(".ci-line")
    .data(data.value)
    .enter()
    .append("line")
    .attr("class", "ci-line")
    .attr("x1", (d: any) => x(d.ci[0]))
    .attr("x2", (d: any) => x(d.ci[1]))
    .attr("y1", (d: any) => y(d.id) + y.bandwidth() / 2)
    .attr("y2", (d: any) => y(d.id) + y.bandwidth() / 2)
    .attr("stroke", "black");

  if (props.otherParams.rangeDotImg) {
    // 添加置信区间两个端点的圆点
    // 图片点
    svg
      .selectAll(".point1")
      .data(data.value)
      .enter()
      .append("image")
      .attr("class", "point1")
      .attr("x", (d: any) => x(d.ci[0]) - 5) // 调整位置使图片居中
      .attr("y", (d: any) => y(d.id) + y.bandwidth() / 2 - 5) // 调整位置使图片居中
      .attr("width", (d: any) => (d.ci[0] ? 10 : 0)) // 设置图片宽度
      .attr("height", 10) // 设置图片高度
      .attr("xlink:href", props.otherParams.rangeDotImg); // 自定义图片路径
    svg
      .selectAll(".point2")
      .data(data.value)
      .enter()
      .append("image")
      .attr("class", "point2")
      .attr("x", (d: any) => x(d.ci[1]) - 5) // 调整位置使图片居中
      .attr("y", (d: any) => y(d.id) + y.bandwidth() / 2 - 5) // 调整位置使图片居中
      .attr("width", (d: any) => (d.ci[1] ? 10 : 0)) // 设置图片宽度
      .attr("height", 10) // 设置图片高度
      .attr("xlink:href", props.otherParams.rangeDotImg); // 自定义图片路径
  } else {
    //默认点
    svg
      .selectAll(".point1")
      .data(data.value)
      .enter()
      .append("line")
      .attr("class", "point1")
      .attr("x1", (d: any) => x(d.ci[0]))
      .attr("x2", (d: any) => x(d.ci[0]))
      .attr("y1", (d: any) => y(d.id) + y.bandwidth() / 2 - 3)
      .attr("y2", (d: any) => y(d.id) + y.bandwidth() / 2 + 3)
      .attr("stroke", "black")
      .attr("stroke-width", (d: any) => (d.ci[0] ? 1 : 0));
    // .append("circle")
    // .attr("class", "point1")
    // .attr("cx", (d: any) => x(d.ci[0]))
    // .attr("cy", (d: any) => y(d.id) + y.bandwidth() / 2)
    // .attr("r", (d: any) => (d.ci[0] ? 2 : 0))
    // .attr("fill", "#2879ff");

    svg
      .selectAll(".point2")
      .data(data.value)
      .enter()
      .append("line")
      .attr("class", "point2")
      .attr("x1", (d: any) => x(d.ci[1]))
      .attr("x2", (d: any) => x(d.ci[1]))
      .attr("y1", (d: any) => y(d.id) + y.bandwidth() / 2 - 3)
      .attr("y2", (d: any) => y(d.id) + y.bandwidth() / 2 + 3)
      .attr("stroke", "black")
      .attr("stroke-width", (d: any) => (d.ci[0] ? 1 : 0));
    // .append("circle")
    // .attr("class", "point2")
    // .attr("cx", (d: any) => x(d.ci[1]))
    // .attr("cy", (d: any) => y(d.id) + y.bandwidth() / 2)
    // .attr("r", (d: any) => (d.ci[1] ? 2 : 0))
    // .attr("fill", "#2879ff");
  }
  if (props.otherParams.centerDotImg) {
    // 绘制点估计
    svg
      .selectAll(".point3")
      .data(data.value)
      .enter()
      .append("image")
      .attr("class", "point3")
      .attr("x", (d: any) => x(d.pointEstimate) - 10) // 调整位置使图片居中
      .attr("y", (d: any) => y(d.id) + y.bandwidth() / 2 - 10) // 调整位置使图片居中
      .attr("width", (d: any) => (d.pointEstimate ? 20 : 0)) // 设置图片宽度
      .attr("height", 20) // 设置图片高度
      .attr("xlink:href", props.otherParams.centerDotImg); // 自定义图片路径
  } else {
    // 绘制点估计
    svg
      .selectAll(".point3")
      .data(data.value)
      .enter()
      .append("circle")
      .attr("class", "point3")
      .attr("cx", (d: any) => x(d.pointEstimate))
      .attr("cy", (d: any) => y(d.id) + y.bandwidth() / 2)
      .attr("r", (d: any) => (d.pointEstimate ? 3 : 0))
      .attr("fill", "#337fff");
  }

  // 添加 p 值标签
  // svg
  //   .selectAll(".p-value")
  //   .data(data.value)
  //   .enter()
  //   .append("text")
  //   .attr("class", "p-value")
  //   .attr("x", d => x(d.ci[1]) + 5)
  //   .attr("y", d => y(d.id) + y.bandwidth() / 2)
  //   .attr("dy", ".35em")
  //   .text(d => `p=${d.p}`);
};
watch(
  () => props.picData,
  (newVal: any, oldVal: any) => {
    console.log("picData old:", oldVal);
    console.log("picData new:", newVal);
    data.value = newVal.data;
    // 计算x轴坐标
    let minMaxList = data.value.filter((item: any) => {
      return Number(item.ci[0]);
    });
    min.value = minMaxList[0].ci[0];
    max.value = minMaxList[0].ci[1];
    minMaxList.forEach((item: any) => {
      console.log(typeof item.ci[1] == "number");
      if (typeof item.ci[1] == "number") {
        max.value - item.ci[1] < 0 ? (max.value = item.ci[1]) : "";
      }
      if (typeof item.ci[0] == "number") {
        min.value - item.ci[0] > 0 ? (min.value = item.ci[0]) : "";
      }
    });
    // 固定坐标必须有0,1
    max.value < 1 ? (max.value = 1) : "";
    min.value > 0 ? (min.value = 0) : "";
    console.log(min.value, max.value);

    drawChart();
  },
  { deep: true, immediate: true }
);
watch(
  () => props.otherParams,
  (newVal: any, oldVal: any) => {
    console.log("picData old:", oldVal);
    console.log("picData new:", newVal);
    drawChart();
  },
  { deep: true, immediate: true }
);
onMounted(() => {
  drawChart();
});
defineExpose({
  drawChart,
  data
});
</script>

<style lang="scss" scoped>
svg {
  font: 10px sans-serif;
}
.axis path,
.axis line {
  fill: none;
  shape-rendering: crispEdges;
}
.ci-line {
  stroke: black;
  stroke-width: 1px;
}
.point {
  fill: red;
  stroke: black;
  stroke-width: 1px;
}
.p-value {
  font-size: 12px;
  fill: black;
}
</style>
