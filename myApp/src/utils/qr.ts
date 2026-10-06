import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library/legacy";
import { File, Paths } from "expo-file-system";

export async function pickQrImage() {
  const permission =
    await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    throw new Error("Photo library permission is required");
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    quality: 0.8,
    base64: true,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const asset = result.assets[0];

  if (!asset.base64) {
    throw new Error("Could not read the QR image");
  }

  const mime = asset.mimeType || "image/jpeg";

  return `data:${mime};base64,${asset.base64}`;
}

export async function downloadQrImage(dataUri: string) {
  if (!dataUri) {
    throw new Error("QR image is not available");
  }

  const commaIndex = dataUri.indexOf(",");

  if (commaIndex === -1) {
    throw new Error("Invalid QR image");
  }

  const base64 = dataUri.slice(commaIndex + 1);

  const file = new File(Paths.cache, "bill-spitter-qr.jpg");

  if (!file.exists) {
    file.create();
  }

  file.write(base64, {
    encoding: "base64",
  });

  const permission = await MediaLibrary.requestPermissionsAsync();

  if (!permission.granted) {
    throw new Error("Photo library permission is required");
  }

  await MediaLibrary.createAssetAsync(file.uri);
}