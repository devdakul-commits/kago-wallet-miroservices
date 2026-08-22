import { v2 as cloudinary } from 'cloudinary';
cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL ?? '' });
export async function uploadBufferToCloudinary(buffer, opts) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: opts.folder, public_id: opts.public_id }, (error, result) => {
            if (error)
                return reject(error);
            if (!result || !result.secure_url)
                return reject(new Error('No upload result'));
            resolve(result.secure_url);
        });
        stream.end(buffer);
    });
}
