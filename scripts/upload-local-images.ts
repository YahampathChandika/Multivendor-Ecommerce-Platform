// scripts/upload-local-images.ts
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import "dotenv/config";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Configuration
const IMAGES_FOLDER = "./public/images/products"; // Adjust path to your images folder
const STORAGE_BUCKET = "product-images";
const STORAGE_FOLDER = "products";

interface UploadedImage {
  originalName: string;
  storagePath: string;
  publicUrl: string;
}

async function uploadLocalImages(): Promise<UploadedImage[]> {
  console.log("🖼️ Starting upload of local images to Supabase Storage...");

  // Check if images folder exists
  if (!fs.existsSync(IMAGES_FOLDER)) {
    console.error(`❌ Images folder not found: ${IMAGES_FOLDER}`);
    console.log("📁 Create the folder and add your images, then run again.");
    return [];
  }

  // Get all image files from the folder
  const imageFiles = fs.readdirSync(IMAGES_FOLDER).filter((file) => {
    const ext = path.extname(file).toLowerCase();
    return [".jpg", ".jpeg", ".png", ".webp"].includes(ext);
  });

  if (imageFiles.length === 0) {
    console.log("📁 No image files found in the images folder.");
    return [];
  }

  console.log(`📁 Found ${imageFiles.length} image files to upload`);

  const uploadedImages: UploadedImage[] = [];

  for (const fileName of imageFiles) {
    try {
      const filePath = path.join(IMAGES_FOLDER, fileName);
      const fileBuffer = fs.readFileSync(filePath);
      const fileExtension = path.extname(fileName).toLowerCase();

      // Generate a clean storage path
      const storagePath = `${STORAGE_FOLDER}/${fileName}`;

      // Determine content type
      let contentType = "image/jpeg";
      if (fileExtension === ".png") contentType = "image/png";
      if (fileExtension === ".webp") contentType = "image/webp";

      console.log(`⬆️ Uploading ${fileName}...`);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, fileBuffer, {
          contentType,
          upsert: true, // Replace if exists
        });

      if (error) {
        console.error(`❌ Error uploading ${fileName}:`, error.message);
        continue;
      }

      // Get public URL
      const { data: publicData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(storagePath);

      const uploadedImage: UploadedImage = {
        originalName: fileName,
        storagePath: data.path,
        publicUrl: publicData.publicUrl,
      };

      uploadedImages.push(uploadedImage);
      console.log(`✅ Uploaded ${fileName}`);
    } catch (error) {
      console.error(`❌ Failed to process ${fileName}:`, error);
    }
  }

  console.log(
    `\n🎉 Upload completed! ${uploadedImages.length} images uploaded successfully.`
  );

  // Save the image mapping to a JSON file for reference
  const mappingFile = "./uploaded-images.json";
  fs.writeFileSync(mappingFile, JSON.stringify(uploadedImages, null, 2));
  console.log(`📄 Image mapping saved to ${mappingFile}`);

  // Display the URLs for easy copying
  console.log("\n📋 Uploaded Image URLs:");
  uploadedImages.forEach((img) => {
    console.log(`${img.originalName}: ${img.publicUrl}`);
  });

  return uploadedImages;
}

// Helper function to get public URL for an image
export function getSupabaseImageUrl(imageName: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${STORAGE_FOLDER}/${imageName}`;
}

// Run if this file is executed directly
if (require.main === module) {
  uploadLocalImages().catch(console.error);
}

export { uploadLocalImages };
