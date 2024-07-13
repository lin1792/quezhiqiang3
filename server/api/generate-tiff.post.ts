import { defineEventHandler, readBody, sendStream, setHeaders } from 'h3'
import sharp from 'sharp'

export default eventHandler(async (event) => {
  const body = await readBody(event)
  const { imageData } = body

  if (!imageData) {
    return { error: 'No image data provided' }
  }
  // 将 Base64 数据转换为 Buffer
  const buffer = Buffer.from(imageData.split(',')[1], 'base64')

  // 使用 sharp 将图像数据转换为 TIFF 格式
  const tiffBuffer = await sharp(buffer).tiff().toBuffer()

  // 设置响应头，通知浏览器这是一个文件下载
  setHeaders(event, {
    'Content-Disposition': `attachment; filename=${new Date().getTime() }".tiff"`,
    'Content-Type': 'image/tiff',
    'Content-Length': tiffBuffer.length
  })

  // 返回文件 Buffer
  return tiffBuffer
})

  // 设置响应头，返回 TIFF 文件
  // event.node.res.setHeader('Content-Type', 'image/tiff')
  // event.node.res.setHeader('Content-Disposition', 'attachment; filename=download.tiff')
