<template>
  <div class="home card">
    <!-- <img :src="dataImg" alt=""> -->
    <div id="exportAll" class="preview">
      <div v-for="(item, index1) in tableData" :key="index1">
        <div v-if="item.type != 'line'" class="data">
          <div class="header">{{ item.header }}</div>
          <div class="dataItems">
            <div v-for="(data, index) in item.data" :key="index" class="dataItem">
              <span>{{ data }}</span>
            </div>
          </div>
        </div>
        <div  class="data" v-else>
          <ForestPlot ref="ForestPlotRef" :picData="item" :otherParams="otherParams" />
        </div>
      </div>
    </div>
    <div class="bts">

      <div>
        <div class="bt">
          <button class="btn btn-primary" @click="triggerFileInput">导入excel</button>
          <input type="file" ref="fileInput" @change="handleFileUpload" accept=".xlsx, .xls" />
        </div>
      </div>
      <div>
        <div class="bt">
          <button class="btn btn-primary btn-outline">自定义区间点</button>
          <input type="file" ref="fileInput1" id="fileInput" accept="image/*" />
        </div>
      </div>
      <div>
        <div class="bt ">
          <button class="btn btn-primary btn-outline">自定义中点</button>
          <input type="file" ref="fileInput2" id="fileInput2" accept="image/*" />
        </div>
      </div>

      <div class="exports">
        <h5>导出为：</h5>
        <div class="bts flex">
          <button class="btn flex-1 mr-2" @click="saveAsImg">PNG</button>
        <button class="btn flex-1 mr-2" @click="saveAsPdf">PDF</button>
        <button class="btn flex-1" @click="saveAsTiff">Tiff</button>
        </div>
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
    <!-- <div :class="'EmptyUpload'+(!isEmptyUploadShow?' hideEmptyUpload':'')" >
      <div class="upload bg-primary"  @dragover.prevent="onDragOver"
    @drop.prevent="onDrop"  @click="triggerFileInput">
          点击上传Excel文件
          <br/>
          或拖拽到此处
      </div>
    </div> -->
  </div>
</template>

<script lang="ts" setup>
// import html2canvas from "html2canvas";
import html2canvas from 'html2canvas-pro';
import { jsPDF } from "jspdf";
import * as XLSX from 'xlsx'
import { ref, onMounted } from "vue";
import { generateUUID } from "../../utils";

let isEmptyUploadShow = ref(true)
const fileInput = ref(null as any)
const triggerFileInput = () => {
  fileInput.value.click()
}

const onDragOver = (event:any) => {
  event.preventDefault()
  // 可添加视觉反馈
}

const onDrop = (event:any) => {
  event.preventDefault()
  const files:any = event.dataTransfer.files
  if (files.length) {
    handleFileUpload({ target: { files } } as any)
  }
}

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
    isEmptyUploadShow.value=false
    // 读取第一个工作表
    const firstSheetName:any = workbook.SheetNames[0]
    const worksheet:any = workbook.Sheets[firstSheetName]

    // 将工作表转换为JSON
    const jsonData: Array<Array<string | number>> = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      console.log("元数据", jsonData);

      let dataArray: any = [];
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
const saveAsImg = () => {
  let element: any = document.getElementById("exportAll"); //原本需要截图的div
  // 转换成canvas
  html2canvas(element).then((canvas:any) =>{
    let imgData = canvas.toDataURL("image/png");
    dataImg.value=imgData
    let save_link: any = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
  save_link.href = imgData.replace("image/png", "image/octet-stream");
  save_link.download =  new Date().getTime() + ".png";
  document.body.appendChild(save_link);
  save_link.click();
  save_link.remove();
  });
};

// 导出为pdf
const saveAsPdf = () => {
  const element: any = document.getElementById("exportAll");
  html2canvas(element).then((canvas:any) => {
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
//导出为tiff
const saveAsTiff = async () => {
  const element: any = document.getElementById("exportAll");
// 使用 html2canvas 将元素转换为 canvas
const canvas = await html2canvas(element)
  const imgData = canvas.toDataURL('image/png')
    dataImg.value=imgData
    // 发送图像数据到服务器端 API
  await $fetch('/api/generate-tiff', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ imageData: imgData })
    }).then(async (res:any) =>{
      const blob =  res
    const url = URL.createObjectURL(blob)
    // 创建下载链接
    const link = document.createElement('a')
    link.href = url
    link.download = 'download.tiff'
    link.click()

    // 释放 URL 对象
    URL.revokeObjectURL(url)
    })
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
  display: flex;
  flex-direction: row;
  position: relative;
  width: 100vw;
  // height: 100vh;
  background-color: #f5f5f5;
  &>.bts {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 250px;
    background-color: #fff;
    padding-top: 50px;
    padding: 50px 10px;
    & > div {
      width: 100%;
      margin-bottom: 10px;
      .bt{
        button{
          width: 100%;
        }
        input{
          display: none;
        }
      }
    }
    .exports{
      .bts{
        display: flex;
      }
    }
    .el-button {
      height: 100%;
      margin-right: 20px;
    }
  }
  .preview {
    display: flex;
    flex: 1;
    .data {
      display: flex;
      flex-direction: column;
      // height: 100%;
      margin: 0 10px;
      .dataItems {
        display: flex;
        flex-direction: column;
        height: calc(100% - 40px);
        .dataItem {
          display: flex;
          align-items: center;
          height: 20px;
          font-size: 12px;
          span {
          display: inline-block;
        }
        }
      }
      .header {
        display: flex;
        align-items: center;
        height: 40px;
        line-height: 1;
      }
    }
  }
  .EmptyUpload{
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  width: 100vw;
  height: 100vh;
  left: 0;
  top: 0;
  background-color: #ffffff;
  .upload{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 400px;
    height: 300px;
    border-radius: 20px;
    cursor: pointer;
    font-size: 32px;
    color: #ffffff;
    text-align: center;
  }
}
@keyframes fadeOut {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    display: none;
  }
}
.hideEmptyUpload{
animation: fadeOut .3s ease-in-out forwards;
}
}
</style>
