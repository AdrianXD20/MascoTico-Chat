const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configuración de Cloudinary desde variables de entorno
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dwokgau3f',
    api_key: process.env.CLOUDINARY_API_KEY || '286896193943182',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'mJ-_JNUUnwTFcyhnX-D8utn_R30'
});

// Configuración de Multer con Cloudinary
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'images',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        resource_type: 'image',
    },
});

const upload = multer({ storage });

module.exports = { upload };
