import { generateUUID } from '../../../utils/uuid'
import type { RequestUploadUrlDTO } from '../DTO/index.dto'

const extensionByType: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
}

export class UploadService {
  requestUploadUrl(companyId: string, dto: RequestUploadUrlDTO) {
    const extension = extensionByType[dto.contentType]
    const key = `uploads/${companyId}/${dto.purpose}/${generateUUID()}.${extension}`
    const baseUrl = process.env.CDN_URL || process.env.API_LINK || 'http://localhost:9999'
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    return {
      uploadUrl: `${baseUrl.replace(/\/$/, '')}/api/v1/uploads/mock-put/${key}`,
      fileUrl: `${baseUrl.replace(/\/$/, '')}/${key}`,
      key,
      contentType: dto.contentType,
      expiresAt,
    }
  }
}

export const uploadService = new UploadService()
