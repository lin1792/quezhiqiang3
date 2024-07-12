<template>
  <div class="home card">
    <div class="bts">
      <!-- <div>
        <el-button type="primary" @click="exportAction">生成图片</el-button>
      </div>
      <div>
        <el-button type="primary" @click="saveAsPdf">生成PDF</el-button>
      </div>
      <div>
        <el-button type="primary" @click="saveAsTiff">生成Tiff</el-button>
      </div> -->
      <div id="exportAll">
        <button @click="saveAsImg">生成图片</button>
      </div>
      <div>
        <button  @click="saveAsPdf">生成PDF</button>
      </div>
      <div>
        <button @click="saveAsTiff">生成Tiff</button>
      </div>
      <div>
        <input type="file" @change="handleFileUpload" accept=".xlsx, .xls" />

      </div>
      <div>
        <span>自定义区间点:</span>
        <input type="file" id="fileInput" accept="image/*" />
      </div>
      <div>
        <span>自定义中点:</span>
        <input type="file" id="fileInput2" accept="image/*" />
      </div>
      <!-- <div>
        <span>Y轴位置:</span>
        <el-input v-model="otherParams.yAxis" type="number" style="width: 100px" placeholder="Please input" />
      </div>
      <div>
        <span>x轴宽度:</span>
        <el-input v-model="otherParams.xAxisWidth" type="number" style="width: 100px" placeholder="Please input" />
      </div> -->
    </div>
    <img :src="dataImg" alt="">
    <div  class="preview">
      <div v-for="(item, index1) in tableData" :key="index1">
        <div v-if="item.type != 'line'" class="data">
          <div class="dataItem">{{ item.header }}</div>
          <div class="dataItems">
            <div v-for="(data, index) in item.data" :key="index" class="dataItem">
              <span>{{ data }}</span>
            </div>
          </div>
        </div>
        <div class="data" v-else>
          <ForestPlot ref="ForestPlotRef" :picData="item" :otherParams="otherParams" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import html2canvas from "html2canvas";
import jsPDF from "jsPDF";
import * as XLSX from 'xlsx'
import { ref, onMounted } from "vue";
import { generateUUID } from "../../utils";
const tableData = ref([
  // { header: "23", data: [], type: "data" },
  // { header: "223", data: ["1.002(1.000, 1.004)", "1.002(1.000, 1.004)"], type: "line" },
  // { header: "233", data: [], type: "data" }
] as any);
const ForestPlotRef = ref(null as any);
let otherParams = ref({
  rangeDotImg: "",
  centerDotImg: "",
  yAxis: 1,
  xAxisWidth: 200
} as any);
let dataImg=ref(null as any)
const handleFileSelect = (event: any) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e: any) {
      console.log(e.target.result);
      otherParams.value.rangeDotImg = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};
const handleFileSelect2 = (event: any) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e: any) {
      console.log(e.target.result);
      otherParams.value.centerDotImg = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

//导入excel
const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files ? target.files[0] : null
  if (file) {
    const data = await file.arrayBuffer()
    const workbook = XLSX.read(data, { type: 'array' })

    // 假设读取第一个工作表
    const firstSheetName:any = workbook.SheetNames[0]
    const worksheet:any = workbook.Sheets[firstSheetName]

    // 将工作表转换为JSON
    const jsonData: Array<Array<string | number>> = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      console.log("元数据", jsonData);

      let dataArray: any = [];
      // let header: any = [];
      let headers = jsonData[0];
      headers!.forEach((header: any, index: any) => {
        const isLine = jsonData.slice(1).find((dataItem: any) => {
          try {
            return dataItem[index].match(/([0-9.]+)\(([^)]+)\)/);
          } catch (error) {}
        });
        if (!!isLine) {
          dataArray.push({ header: "", data: [], type: "line", index: index });
          dataArray.push({ header: header, data: [], type: "data", index: index });
        } else {
          dataArray.push({ header: header, data: [], type: "data", index: index });
        }
      });
      dataArray.forEach((dataItem: any) => {
        if (dataItem.type != "line") {
          jsonData.slice(1).forEach((item: any) => {
            dataItem.data.push(item[dataItem.index]);
          });
        } else {
          jsonData.slice(1).forEach((item: any) => {
            let parts = false as any;
            try {
              parts = item[dataItem.index].match(/([0-9.]+)\(([^)]+)\)/);
            } catch (error) {}
            console.log(!!parts);

            let dots: any = [];
            if (!!parts) {
              // 第一个部分是括号外的数值，第二个部分是括号内的数值
              let mainNumber = parseFloat(parts[1]);
              let innerNumbers = parts[2].split(",").map((num: any) => parseFloat(num.trim()));
              // 将所有数值组合成一个数组
              dots = [mainNumber, ...innerNumbers];
            } else {
            }
            dataItem.data.push({ id: generateUUID(), ci: [dots[1], dots[2]], pointEstimate: dots[0] });
          });
        }
        return dataItem;
      });
      tableData.value = dataArray;
      console.log("导入excel", tableData.value);
  }
}

//导出图片
// 导出 -> 这个是按钮的导出按钮的触发事件
// 下载
const saveAsImg = () => {
  let targetDom: any = document.getElementById("exportAll"); //原本需要截图的div
  // console.log("🚀 ~ file: index.vue:33 ~ download ~ targetDom:", targetDom.clientWidth);
  let clonedNode = targetDom.cloneNode(true); //复制一个
  clonedNode.setAttribute("style", `width: ${targetDom.clientHeight};height: ${targetDom.clientWidth};`);
  document.body.appendChild(clonedNode); //放到body后面
  // 转换成canvas
  html2canvas(targetDom, {
    allowTaint: true,
    taintTest: false
  } as any).then(function (canvas) {
    let pageData = canvas.toDataURL("image/png", 1.0);
    saveFile(pageData.replace("image/png", "image/octet-stream"), new Date().getTime() + ".png");
    document.body.removeChild(clonedNode);
  });
};
// 保存路径下载
const saveFile = (data: any, filename: any) => {
  let save_link: any = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
  save_link.href = data;
  save_link.download = filename;
  document.body.appendChild(save_link);
  save_link.click();
  save_link.remove();
};
const saveAsPdf = () => {
  const element: any = document.getElementById("exportAll");
  html2canvas(element).then(canvas => {
    const pageData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(pageData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(pageData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save("content.pdf");
  });
};

const saveAsTiff = async () => {

  const element: any = document.getElementById("exportAll");

// 使用 html2canvas 将元素转换为 canvas
const canvas = await html2canvas(element)
  const imgData = canvas.toDataURL('image/png')
    console.log(imgData);
    dataImg.value=imgData

    // 发送图像数据到服务器端 API
    await $fetch('/api/generate-tiff', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ imageData: imgData })
    }).then((res) =>{
      console.log(res);

    })
// console.log(response);

//   const blob = await response.blob()
//     console.log(blob);

//     const url = URL.createObjectURL(blob)

//     // 创建下载链接
//     const link = document.createElement('a')
//     link.href = url
//     link.download = 'download.tiff'
//     link.click()

//     // 释放 URL 对象
//     URL.revokeObjectURL(url)

};

onMounted(() => {
  document.getElementById("fileInput")!.addEventListener("change", handleFileSelect, false);
  document.getElementById("fileInput2")!.addEventListener("change", handleFileSelect2, false);
});
</script>

<style scoped lang="scss">
* {
  white-space: pre-wrap;
}
.home {
  .bts {
    display: flex;
    align-items: center;
    & > div {
      margin-right: 20px;
    }
    .el-button {
      height: 100%;
      margin-right: 20px;
    }
  }
  .preview {
    display: flex;
    .data {
      display: flex;
      flex-direction: column;
      height: 100%;
      margin: 0 10px;
      .dataItems {
        display: flex;
        flex-direction: column;
        height: calc(100% - 40px);
        & > .dataItem {
          display: flex;
          align-items: center;
          height: 20px;
          font-size: 12px;
        }
      }
      & > .dataItem {
        display: flex;
        align-items: center;
        height: 40px;
        line-height: 1;
        span {
          display: inline-block;
        }
      }
    }
  }
}
</style>
