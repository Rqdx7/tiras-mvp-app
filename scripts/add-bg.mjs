import sharp from "sharp";
import { readdirSync, renameSync, unlinkSync } from "fs";
import { join } from "path";

const dir = "public/products";
const BG = { r: 239, g: 231, b: 220 };

// Process both .png and .jpg (from previous runs)
const files = readdirSync(dir).filter((f) => f.endsWith(".png") || f.endsWith(".jpg"));

for (const file of files) {
  const input = join(dir, file);
  const img = sharp(input);
  const { width, height, channels: ch } = await img.metadata();
  const channels = ch ?? 3;

  const { data } = await img.removeAlpha().raw().toBuffer({ resolveWithObject: true });

  // Replace near-white / light-gray checker pixels with brand beige
  for (let i = 0; i < data.length; i += 3) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const brightness = (r + g + b) / 3;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max === 0 ? 0 : (max - min) / max;
    if (brightness > 185 && saturation < 0.12) {
      data[i] = BG.r;
      data[i + 1] = BG.g;
      data[i + 2] = BG.b;
    }
  }

  const outPath = join(dir, file.replace(/\.(png|jpg)$/, ".jpg"));
  const tmp = outPath + ".tmp";

  await sharp(data, { raw: { width, height, channels: 3 } })
    .jpeg({ quality: 95 })
    .toFile(tmp);

  unlinkSync(input);
  renameSync(tmp, outPath);
  console.log("✓", file, "→", outPath.split(/[/\\]/).pop());
}
