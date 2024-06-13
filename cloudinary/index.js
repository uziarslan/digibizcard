const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');


// Configure Cloudinary
cloudinary.config({
  cloud_name: 'uzairarslan',
  api_key: '331758793549832',
  api_secret: 'bChbYkF975g46-FsB3tUJe_XkH4',
});

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'Hireddd_Images',
    allowedFormats: ['jpg', 'png', 'jpeg', 'mp4'],
  },
});

module.exports = { storage };
