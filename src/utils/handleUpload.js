import cloudinary from "../config/connectCloudinary.js";

export const handleUploadImage = async (file) => {
    const res = await cloudinary.uploader.upload(file, {
        resource_type: "auto"
    });

    return res;
}

export const handleUploadAudio = async (audio) => {
    const res = await cloudinary.uploader.upload(audio, {
        resource_type: "video"
    });

    return res;
}