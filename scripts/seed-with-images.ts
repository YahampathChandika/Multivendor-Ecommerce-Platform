// scripts/seed-with-images.ts
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import "dotenv/config";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper function to get Supabase Storage URL
function getStorageUrl(imageName: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/products/${imageName}`;
}

// Read uploaded images mapping if it exists
function getUploadedImages(): Record<string, string> {
  try {
    const mappingFile = "./uploaded-images.json";
    if (fs.existsSync(mappingFile)) {
      const uploadedImages = JSON.parse(fs.readFileSync(mappingFile, "utf8"));
      const mapping: Record<string, string> = {};
      uploadedImages.forEach((img: any) => {
        mapping[img.originalName] = img.publicUrl;
      });
      return mapping;
    }
  } catch (error) {
    console.log("No uploaded images mapping found, using fallback URLs");
  }
  return {};
}

interface VendorInsert {
  name: string;
  email: string;
  description: string;
  logo_url: string;
  is_active: boolean;
}

interface ProductInsert {
  slug: string;
  sku: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  images: string;
  sizes: string;
  colors: string;
  stock: number;
  weight: number;
  category: "men" | "women" | "kids" | "other";
  vendor_id?: string;
}

// Sample vendors
const vendors: VendorInsert[] = [
  {
    name: "FashionHub",
    email: "contact@fashionhub.com",
    description: "Premium fashion and lifestyle brand",
    logo_url: "https://via.placeholder.com/200x200?text=FashionHub",
    is_active: true,
  },
  {
    name: "StyleCo",
    email: "hello@styleco.com",
    description: "Modern casual wear and accessories",
    logo_url: "https://via.placeholder.com/200x200?text=StyleCo",
    is_active: true,
  },
  {
    name: "UrbanWear",
    email: "info@urbanwear.com",
    description: "Street style and contemporary fashion",
    logo_url: "https://via.placeholder.com/200x200?text=UrbanWear",
    is_active: true,
  },
];

async function seedDatabaseWithImages() {
  try {
    console.log("🌱 Starting database seeding with uploaded images...");

    // Get uploaded images mapping
    const uploadedImages = getUploadedImages();
    console.log(
      `📁 Found ${Object.keys(uploadedImages).length} uploaded images`
    );

    // 1. Insert vendors
    console.log("📦 Inserting vendors...");
    const vendorData: { id: string; name: string }[] = [];

    for (const vendor of vendors) {
      const { data, error } = await supabase
        .from("vendors")
        .upsert(vendor, {
          onConflict: "email",
          ignoreDuplicates: false,
        })
        .select()
        .single();

      if (error) {
        console.error("❌ Error inserting vendor:", vendor.name, error);
        continue;
      }

      if (data) {
        vendorData.push(data);
        console.log(`✅ Inserted vendor: ${data.name}`);
      }
    }

    if (vendorData.length === 0) {
      console.error("❌ No vendors were inserted successfully");
      return;
    }

    // 2. Create products with uploaded images
    console.log("🛍️ Creating products with uploaded images...");

    // Map your image files to products (adjust these mappings based on your actual image files)
    const productTemplates = [
      {
        slug: "premium-tagerine-shirt",
        sku: "PTS-001",
        title: "Premium Tagerine Shirt",
        description:
          "A beautiful premium tagerine shirt made from high-quality cotton blend. Perfect for casual and semi-formal occasions.",
        price: 257.85,
        imageFiles: ["shirt1.jpg", "shirt1-alt.jpg"], // Replace with your actual image file names
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["Tagerine", "White", "Navy"],
        stock: 50,
        weight: 0.3,
        category: "women" as const,
      },
      {
        slug: "leather-tagerine-coat",
        sku: "LTC-002",
        title: "Leather Tagerine Coat",
        description:
          "Luxurious leather coat in tagerine color. Handcrafted with attention to detail and premium materials.",
        price: 325.85,
        imageFiles: ["coat1.jpg", "coat1-alt.jpg"],
        sizes: ["S", "M", "L", "XL"],
        colors: ["Tagerine", "Black", "Brown"],
        stock: 25,
        weight: 1.2,
        category: "women" as const,
      },
      {
        slug: "classic-tagerine-shirt",
        sku: "CTS-003",
        title: "Classic Tagerine Shirt",
        description:
          "Classic tagerine shirt with modern fit. Made from breathable cotton fabric.",
        price: 240.32,
        imageFiles: ["shirt2.jpg"],
        sizes: ["S", "M", "L", "XL"],
        colors: ["Tagerine", "Blue", "Grey"],
        stock: 40,
        weight: 0.25,
        category: "men" as const,
      },
      {
        slug: "mens-leather-coat",
        sku: "MLC-004",
        title: "Men's Leather Coat",
        description:
          "Premium mens leather coat with classic design. Perfect for formal and casual wear.",
        price: 325.36,
        imageFiles: ["coat2.jpg"],
        sizes: ["M", "L", "XL", "XXL"],
        colors: ["Black", "Brown", "Navy"],
        stock: 20,
        weight: 1.5,
        category: "men" as const,
      },
      {
        slug: "cotton-blend-shirt",
        sku: "CBS-005",
        title: "Cotton Blend Shirt",
        description:
          "Versatile cotton shirt suitable for various occasions. Comfortable and stylish.",
        price: 126.47,
        imageFiles: ["shirt3.jpg"],
        sizes: ["S", "M", "L", "XL"],
        colors: ["Tagerine", "White", "Pink"],
        stock: 60,
        weight: 0.2,
        category: "women" as const,
      },
    ];

    const products: ProductInsert[] = productTemplates.map(
      (template, index) => {
        // Map image files to URLs (use uploaded images if available, fallback to placeholders)
        const imageUrls = template.imageFiles.map((fileName) => {
          if (uploadedImages[fileName]) {
            return uploadedImages[fileName];
          }
          // Fallback to placeholder or external URL
          return `https://images.unsplash.com/photo-${
            1596755094514 + index
          }?w=500&h=500&fit=crop`;
        });

        return {
          slug: template.slug,
          sku: template.sku,
          title: template.title,
          description: template.description,
          price: template.price,
          currency: "USD",
          images: JSON.stringify(imageUrls),
          sizes: JSON.stringify(template.sizes),
          colors: JSON.stringify(template.colors),
          stock: template.stock,
          weight: template.weight,
          category: template.category,
        };
      }
    );

    // 3. Insert products with vendor assignments
    const productsWithVendors = products.map((product, index) => ({
      ...product,
      vendor_id: vendorData[index % vendorData.length].id,
    }));

    console.log("🛍️ Inserting products...");
    let productCount = 0;

    for (const product of productsWithVendors) {
      const { data, error } = await supabase
        .from("products")
        .upsert(product, {
          onConflict: "slug",
          ignoreDuplicates: false,
        })
        .select()
        .single();

      if (error) {
        console.error("❌ Error inserting product:", product.title, error);
        continue;
      }

      if (data) {
        productCount++;
        console.log(`✅ Inserted product: ${data.title}`);
      }
    }

    console.log(`\n🎉 Database seeding completed successfully!`);
    console.log(
      `✅ Inserted ${vendorData.length} vendors and ${productCount} products`
    );

    if (Object.keys(uploadedImages).length > 0) {
      console.log(
        `🖼️ Used ${Object.keys(uploadedImages).length} uploaded images`
      );
    }
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

// Run the seeding function
if (require.main === module) {
  seedDatabaseWithImages();
}

export { seedDatabaseWithImages };
