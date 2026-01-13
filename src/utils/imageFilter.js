export const imageFilter = (req, file, cb) => {
  // Accept images only
  if (
    !file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|webp|WEBP)$/)
  ) {
    req.fileValidationError =
      'Chỉ chấp nhận file ảnh (JPG, JPEG, PNG, GIF, WEBP)';
    return cb(null, false); // Trả về false để reject file
  }
  cb(null, true);
};
