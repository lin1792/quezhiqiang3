<template>
  <div class="IntroduceHeader">
    <header>
    <h1>欢迎来到我们的网站</h1>
    <p>点击下面的按钮</p>
    <p>选择并上传符合格式要求的Excel文件<el-button link type="primary" @click="downloadExcel">下载excel模板</el-button></p>
    <p>轻松生成您的森林图和数据图表</p>
  </header>

  </div>
</template>
<script setup lang="ts">
const downloadExcel = () => {
  const link = document.createElement('a');
  link.href = '/template.xlsx';
  link.download = 'template.xlsx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script>
<style lang="scss" scoped>
.IntroduceHeader{
  display: flex;
  margin:50px 0 0 0 ;
  width: 1200px;
  text-align: center;
  header{
    width: 100%;
  }
}
</style>

