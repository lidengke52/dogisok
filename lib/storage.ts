/**
 * 存储服务抽象层 - 支持多个云存储提供商
 * 
 * 当前使用：Vercel Blob
 * 可切换到：阿里云 OSS、AWS S3、腾讯云 COS、七牛云 等
 * 
 * 迁移指南：
 * 1. 修改此文件中的 getStorageProvider() 函数
 * 2. 新增对应的存储提供商实现
 * 3. 其余代码无需改动
 */

export type StorageProvider = "vercel-blob" | "aliyun-oss" | "aws-s3" | "tencent-cos"

export interface IStorageService {
  uploadFile(file: File, path: string): Promise<string>
  deleteFile(url: string): Promise<void>
  getPublicUrl(path: string): string
}

class VercelBlobStorage implements IStorageService {
  async uploadFile(file: File, path: string): Promise<string> {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("path", path)

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || "上传失败")
    }

    const data = await response.json()
    return data.url
  }

  async deleteFile(url: string): Promise<void> {
    // Vercel Blob 暂不支持通过前端删除
    console.warn("[存储] Vercel Blob 暂不支持前端删除，请通过管理后台删除")
  }

  getPublicUrl(path: string): string {
    return `${process.env.NEXT_PUBLIC_BLOB_URL}/${path}`
  }
}

/**
 * 阿里云 OSS 存储 - 迁移时启用
 * 需要配置环境变量：
 * - NEXT_PUBLIC_OSS_BUCKET
 * - NEXT_PUBLIC_OSS_REGION
 * - OSS_ACCESS_KEY_ID
 * - OSS_ACCESS_KEY_SECRET
 */
class AliyunOSSStorage implements IStorageService {
  async uploadFile(file: File, path: string): Promise<string> {
    // 实现通过 OSS 客户端上传
    // 参考：https://help.aliyun.com/document_detail/32069.html
    throw new Error("阿里云 OSS 支持需要额外配置")
  }

  async deleteFile(url: string): Promise<void> {
    throw new Error("阿里云 OSS 删除需要额外配置")
  }

  getPublicUrl(path: string): string {
    const bucket = process.env.NEXT_PUBLIC_OSS_BUCKET
    const region = process.env.NEXT_PUBLIC_OSS_REGION
    return `https://${bucket}.${region}.aliyuncs.com/${path}`
  }
}

/**
 * 获取当前存储服务
 * 根据环境变量自动选择提供商
 */
function getStorageProvider(): IStorageService {
  const provider = (process.env.NEXT_PUBLIC_STORAGE_PROVIDER || "vercel-blob") as StorageProvider

  switch (provider) {
    case "aliyun-oss":
      return new AliyunOSSStorage()
    case "aws-s3":
      throw new Error("AWS S3 支持需要配置")
    case "tencent-cos":
      throw new Error("腾讯云 COS 支持需要配置")
    case "vercel-blob":
    default:
      return new VercelBlobStorage()
  }
}

// 导出单例
export const storage = getStorageProvider()
