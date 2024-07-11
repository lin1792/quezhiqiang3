import { defineEventHandler, readBody } from 'h3'
import sharp from 'sharp'

export default eventHandler(async (event) => {
  const body = await readBody(event)
  const { imageData } = body

  if (!imageData) {
    return { error: 'No image data provided' }
  }
  // 将 Base64 数据转换为 Buffer
  const buffer = Buffer.from(imageData.split(',')[1], 'base64')
console.log(buffer);

  // 使用 sharp 将图像数据转换为 TIFF 格式
  const tiffBuffer = await sharp(buffer).tiff().toBuffer()

  // 设置响应头，返回 TIFF 文件
  // event.node.res.setHeader('Content-Type', 'image/tiff')
  // event.node.res.setHeader('Content-Disposition', 'attachment; filename=download.tiff')

  return {
    a: 200
  }
})
