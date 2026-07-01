import { ImageManipulator, SaveFormat } from "expo-image-manipulator";

type HeicAsset = { uri: string; mimeType?: string | null; fileName?: string | null };

const HEIC_MIME_TYPES = new Set(["image/heic", "image/heif"]);

function isHeic(asset: HeicAsset): boolean {
  if (asset.mimeType && HEIC_MIME_TYPES.has(asset.mimeType.toLowerCase()))
    return true;
  const ext = asset.uri.split("?")[0].split(".").pop()?.toLowerCase();
  return ext === "heic" || ext === "heif";
}

export async function convertHeicAsset<T extends HeicAsset>(
  asset: T,
): Promise<T> {
  if (!isHeic(asset)) return asset;

  const imageRef = await ImageManipulator.manipulate(asset.uri).renderAsync();
  const result = await imageRef.saveAsync({
    compress: 0.9,
    format: SaveFormat.JPEG,
  });

  const fileName = asset.fileName?.replace(/\.(heic|heif)$/i, ".jpg");

  return { ...asset, uri: result.uri, mimeType: "image/jpeg", fileName };
}
