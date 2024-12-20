import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  constructor() {
    this.initializeCloudinary();
  }

  private initializeCloudinary(): void {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  public async uploadStream(
    imageName: string,
    buffer: Buffer,
    generateThumbnail: boolean = false,
  ): Promise<{
    url: string;
    alt_text: string;
    public_id: string;
    thumbnail_url?: string;
  }> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          public_id: imageName,
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }

          const altText = `Image for ${result.public_id}`;
          const response: {
            url: string;
            alt_text: string;
            public_id: string;
            thumbnail_url?: string;
          } = {
            url: result.secure_url,
            alt_text: altText,
            public_id: result.public_id,
          };

          // Conditionally add the thumbnail_url
          if (generateThumbnail) {
            response.thumbnail_url = cloudinary.url(result.public_id, {
              resource_type: 'image',
              fetch_format: 'auto',
              quality: 'auto',
              crop: 'fit',
              gravity: 'auto',
              width: 150,
              height: 150,
            });
          }

          resolve(response);
        },
      );

      // Stream the buffer to Cloudinary
      const readableStream = new Readable();
      readableStream.push(buffer);
      readableStream.push(null);
      readableStream.pipe(stream);
    });
  }
}
