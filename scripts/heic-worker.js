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
    process.stderr.write("[WORKER] exifr orientation: " + or + "\n");
    if (or && ORIENTATION_TO_ANGLE[or] !== undefined) {
      rotateAngle = ORIENTATION_TO_ANGLE[or];
    }
  } catch (e) {
    process.stderr.write("[WORKER] exifr error: " + (e.message || e) + "\n");
  }

  process.stderr.write("[WORKER] rotateAngle: " + rotateAngle + "\n");

  var jpegBuf;
  try {
    jpegBuf = await convert({ buffer: inputBuf, format: "JPEG", quality: 0.8 });
    process.stderr.write("[WORKER] converted to " + jpegBuf.length + " bytes\n");
  } catch (e) {
    process.stderr.write("[WORKER] FAIL converting HEIC: " + (e.message || e) + "\n");
    process.exit(1);
  }

  // If exifr didn't find orientation, try reading EXIF from the HEIC file manually
  if (rotateAngle === 0) {
    try {
      process.stderr.write("[WORKER] trying fallback EXIF parse\n");
      var exifData = await exifr.parse(inputBuf, { tiff: true, ifd0: true });
      process.stderr.write("[WORKER] exifr parse: " + JSON.stringify(exifData).slice(0, 200) + "\n");
      if (exifData && exifData.Orientation !== undefined) {
        var or2 = exifData.Orientation;
        if (ORIENTATION_TO_ANGLE[or2] !== undefined) {
          rotateAngle = ORIENTATION_TO_ANGLE[or2];
        }
      }
    } catch (e) {
      process.stderr.write("[WORKER] exifr parse error: " + (e.message || e) + "\n");
    }
  }

  try {
    var meta = await sharp(jpegBuf).metadata();
    process.stderr.write("[WORKER] jpeg dims before rotation: " + meta.width + "x" + meta.height + " orientation:" + meta.orientation + "\n");

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
