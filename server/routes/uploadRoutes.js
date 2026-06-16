const router = require("express").Router();
const multer = require("multer");
const streamifier = require("streamifier");
const cloudinary = require("../config/cloudinary");

const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("file"), async (req, res) => {

    const streamUpload = (buffer) =>
        new Promise((resolve, reject) => {

            const stream = cloudinary.uploader.upload_stream(
                { resource_type: "auto" },
                (err, result) => {
                    if (result) resolve(result);
                    else reject(err);
                }
            );

            streamifier.createReadStream(buffer).pipe(stream);
        });

    const result = await streamUpload(req.file.buffer);

    res.json({
        url: result.secure_url,
        type: result.resource_type,
        name: req.file.originalname
    });
});

module.exports = router;