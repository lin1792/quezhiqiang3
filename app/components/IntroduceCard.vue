<template>
  <div class="IntroduceCard">
    <div class="card">
      <img src="@/assets/images/introduce1.png" alt="">
      <h3>快速导入</h3>
      <p>通过简单的拖拽或选择文件，快速将Excel数据导入系统。</p>
    </div>
    <div class="card">
      <img src="@/assets/images/introduce2.png" alt="">
      <h3>自定义坐标轴</h3>
      <p>可根据需求自定义坐标轴的区间和点形状，使图表更加直观和易读。</p>
    </div>
    <div class="card">
      <img src="@/assets/images/introduce3.png" alt="">
      <h3>图表导出</h3>
      <p>支持将生成的图表导出为图片、PDF、TIFF等格式，方便保存和分享。</p>
    </div>
    <div class="card">
      <img src="@/assets/images/introduce4.png" alt="">
      <h3>个性化定制</h3>
      <p>支持图表的图标个性化定制，满足用户对图表外观的个性化需求。</p>
    </div>
  </div>
</template>
<script setup lang="ts">

</script>
<style lang="scss" scoped>
.IntroduceCard{
  display: flex;
margin:0 0 40px 0 ;
width: 1200px;
.card{
  display: flex;
  flex-direction: column;
  align-items: center;
  // width: 300px;
  // height: 300px;
  margin-right: 30px;
  flex: 1;
  padding: 0;
  border: 0;
  box-shadow: none;
  img{
    height: 200px;
  }
  p{
    color: #666666;
    margin: 0;
  }
}
.card:nth-last-of-type(1){
  margin: 0;
}
}
</style>

