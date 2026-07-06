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

  var exifOrientation;
  try {
    exifOrientation = await exifr.orientation(inputBuf);
    process.stderr.write("[WORKER] exifr orientation: " + exifOrientation + "\n");
  } catch (e) {
    process.stderr.write("[WORKER] exifr error: " + (e.message || e) + "\n");
  }

  var jpegBuf;
  try {
    jpegBuf = await convert({ buffer: inputBuf, format: "JPEG", quality: 0.8 });
    process.stderr.write("[WORKER] converted to " + jpegBuf.length + " bytes\n");
  } catch (e) {
    process.stderr.write("[WORKER] FAIL converting HEIC: " + (e.message || e) + "\n");
    process.exit(1);
  }

  var meta = await sharp(jpegBuf).metadata();
  process.stderr.write("[WORKER] jpeg dims before rotation: " + meta.width + "x" + meta.height + "\n");

  var rotateAngle = 0;
  if (exifOrientation && ORIENTATION_TO_ANGLE[exifOrientation] !== undefined) {
    var angle = ORIENTATION_TO_ANGLE[exifOrientation];
    var expectedPortrait = (exifOrientation === 6 || exifOrientation === 8);
    var isLandscape = meta.width > meta.height;
    // Only apply EXIF rotation if heic-convert didn't already rotate the pixels
    // For modern iPhones (iOS 13+): heic-convert applies irot → JPEG already portrait
    // For older iPhones: heic-convert outputs raw sensor data → JPEG is landscape
    if (expectedPortrait && isLandscape) {
      rotateAngle = angle;
    } else if (exifOrientation === 3) {
      rotateAngle = angle;
    }
  }

  process.stderr.write("[WORKER] rotateAngle: " + rotateAngle + "\n");

  try {
    await sharp(jpegBuf)
      .rotate(rotateAngle)
      .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true })
      .toFile(outputPath);

    var meta2 = await sharp(outputPath).metadata();
    process.stderr.write("[WORKER] output dims: " + meta2.width + "x" + meta2.height + "\n");
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
