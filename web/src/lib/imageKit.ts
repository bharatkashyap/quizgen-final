import ImageKit from "imagekit";

// Initialize ImageKit (do this outside the function to reuse the instance)
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

async function uploadToImageKit(
  file: File | string,
  fileName: string,
  folder: string
): Promise<{ url: string; type: string }> {
  let upload;
  let type = "url";
  if (typeof file === "string") {
    upload = file;
  }
  // Convert File to base64
  else {
    const buffer = await file.arrayBuffer();
    upload = Buffer.from(buffer).toString("base64");
    type = file.type;
  }

  const result = await imagekit.upload({
    file: upload,
    fileName,
    folder,
    useUniqueFileName: true,
  });

  return {
    url: result.url,
    type: type,
  };
}

export { uploadToImageKit };
