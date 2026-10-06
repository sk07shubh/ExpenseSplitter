import * as ImagePicker from "expo-image-picker";

export async function pickQrImage() {
  const permission =
    await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    throw new Error("Photo library permission is required");
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes:["images"],
    allowsEditing:true,
    quality:0.8,
    base64:true,
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