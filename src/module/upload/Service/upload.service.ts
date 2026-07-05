import cloudinary from '../../../config/cloudinary'
import { generateUUID } from '../../../utils/uuid'
import type { RequestUploadUrlDTO } from '../DTO/index.dto'

export class UploadService {
  requestUploadUrl(companyId: string, dto: RequestUploadUrlDTO) {
    const folder = `${process.env.CLOUDINARY_UPLOAD_FOLDER || 'SwakipOS'}/${companyId}/${dto.purpose}`
    const publicId = generateUUID()
    const timestamp = Math.round(Date.now() / 1000)
    const expiresAt = new Date((timestamp + 5 * 60) * 1000)

    const paramsToSign = { folder, public_id: publicId, timestamp }
    const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET as string)

    return {
      uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/auto/upload`,
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder,
      publicId,
      contentType: dto.contentType,
      expiresAt,
    }
  }
}

export const uploadService = new UploadService()
