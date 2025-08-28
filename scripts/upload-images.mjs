// upload-images.mjs
// node >=18
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs/promises";
import path from "node:path";
import mime from "mime";

// --- CONFIG ---
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE; // usar service role para subir en lote
const BUCKET = "product-images";
const LOCAL_ROOT = "./images"; // carpeta local que contiene /brand/category/SKU.jpg (sin normalizar)

// estrategia de normalización
function normalizeSegment(s) {
  // 1) Unicode NFKD + remueve diacríticos
  const noDiacritics = s.normalize("NFKD").replace(/\p{Diacritic}+/gu, "");
  // 2) reemplaza espacios y separadores por guiones
  const dashed = noDiacritics.replace(/[\s/_]+/g, "-");
  // 3) quita todo lo no permitido [a-z0-9.-]
  const cleaned = dashed
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, "");
  // 4) compacta guiones
  const compact = cleaned.replace(/-+/g, "-").replace(/^-|-$/g, "");
  return compact;
}

function normalizeKey({ brand, category, sku, ext }) {
  const brandN = normalizeSegment(brand);
  const categoryN = normalizeSegment(category);
  // SKU: a veces conviene mantener mayúsculas; si quieres minúsculas, aplica normalizeSegment
  const skuBase = sku.normalize("NFKD").replace(/\p{Diacritic}+/gu, "");
  const skuClean = skuBase.replace(/[^\w.-]/g, "-").replace(/-+/g, "-");
  const extLower = (ext || ".jpg").toLowerCase();
  return `${brandN}/${categoryN}/${skuClean}${extLower}`;
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
  auth: { persistSession: false },
});

// Carga recursiva de archivos locales y subida con normalización
async function* walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else {
      yield full;
    }
  }
}

async function main() {
  const results = [];
  for await (const filePath of walk(LOCAL_ROOT)) {
    const rel = path.relative(LOCAL_ROOT, filePath);
    // esperamos algo como brand/category/SKU.jpg pero puede venir raro
    const parts = rel.split(path.sep);
    if (parts.length < 3) {
      results.push({ filePath, status: "skipped", reason: "path-incompleto" });
      continue;
    }
    const [brand, category, file] = parts.slice(-3);
    const ext = path.extname(file) || ".jpg";
    const sku = path.basename(file, ext);

    const key = normalizeKey({ brand, category, sku, ext });
    const contentType = mime.getType(ext) || "image/jpeg";
    const fileBuf = await fs.readFile(filePath);

    // Evita duplicados por mayúsculas/minúsculas
    const { data: exists } = await supabase
      .storage
      .from(BUCKET)
      .list(path.dirname(key), { limit: 1000, search: path.basename(key) });

    if (exists?.some(x => x.name.toLowerCase() === path.basename(key).toLowerCase())) {
      results.push({ filePath, key, status: "exists" });
      continue;
    }

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(key, fileBuf, {
        contentType,
        upsert: false,
        cacheControl: "31536000", // 1 año
      });

    if (error) {
      results.push({ filePath, key, status: "error", error: error.message });
    } else {
      results.push({ filePath, key, status: "uploaded" });
    }
  }

  // Log resumido
  const summary = results.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});
  console.table(summary);
  // CSV para luego actualizar la tabla inventory
  const csv = [
    "local_path,normalized_key,status,error",
    ...results.map(r => [
      JSON.stringify(r.filePath),
      JSON.stringify(r.key || ""),
      r.status,
      r.error ? JSON.stringify(r.error) : ""
    ].join(","))
  ].join("\n");
  await fs.writeFile("upload-results.csv", csv, "utf8");
  console.log("Escribí upload-results.csv");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
