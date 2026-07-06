var inputPath = process.argv[2];
var outputPath = process.argv[3];

if (!inputPath || !outputPath) {
  process.stderr.write("[WORKER] missing args\n");
  process.exit(1);
}

var convert, sharp, fs, exifr;

try {
  convert = require("heic-convert");
} catch (e) {
  process.stderr.write("[WORKER] FAIL loading heic-convert: " + (e.message || e) + "\n");
  process.exit(1);
}

try {
  sharp = require("sharp");
} catch (e) {
  process.stderr.write("[WORKER] FAIL loading sharp: " + (e.message || e) + "\n");
  process.exit(1);
}

try {
  fs = require("fs");
} catch (e) {
  process.stderr.write("[WORKER] FAIL loading fs: " + (e.message || e) + "\n");
  process.exit(1);
}

try {
  exifr = require("exifr");
} catch (e) {
  process.stderr.write("[WORKER] FAIL loading exifr: " + (e.message || e) + "\n");
  process.exit(1);
}

var ORIENTATION_TO_ANGLE = { 1: 0, 3: 180, 6: 90, 8: 270 };

async function main() {
  var inputBuf;
  try {
    inputBuf = fs.readFileSync(inputPath);
  } catch (e) {
    process.stderr.write("[WORKER] FAIL reading input: " + (e.message || e) + "\n");
    process.exit(1);
  }

  var rotateAngle = 0;
  try {
    var or = await exifr.orientation(inputBuf);
    if (or && ORIENTATION_TO_ANGLE[or] !== undefined) {
      rotateAngle = ORIENTATION_TO_ANGLE[or];
    }
  } catch (e) {}

  var jpegBuf;
  try {
    jpegBuf = await convert({ buffer: inputBuf, format: "JPEG", quality: 0.8 });
  } catch (e) {
    process.stderr.write("[WORKER] FAIL converting HEIC: " + (e.message || e) + "\n");
    process.exit(1);
  }

  try {
    await sharp(jpegBuf)
      .rotate(rotateAngle)
      .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true })
      .toFile(outputPath);
  } catch (e) {
    process.stderr.write("[WORKER] FAIL sharp resize: " + (e.message || e) + "\n");
    process.exit(1);
  }

  try { fs.unlinkSync(inputPath); } catch (e) {}
}

main().then(function () { process.exit(0); }).catch(function (err) {
  process.stderr.write("[WORKER] unexpected error: " + (err.message || String(err)) + "\n");
  try { fs.unlinkSync(inputPath); } catch (e) {}
  process.exit(1);
});
