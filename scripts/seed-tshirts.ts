// scripts/seed-tshirts.ts (updated for your renamed images)
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import "dotenv/config";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Read uploaded images mapping
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

// T-Shirt focused vendors
const vendors: VendorInsert[] = [
  {
    name: "ComfortWear",
    email: "contact@comfortwear.com",
    description: "Premium comfort t-shirts and casual wear",
    logo_url: "https://via.placeholder.com/200x200?text=ComfortWear",
    is_active: true,
  },
  {
    name: "UrbanTees",
    email: "hello@urbantees.com",
    description: "Street style and graphic t-shirts",
    logo_url: "https://via.placeholder.com/200x200?text=UrbanTees",
    is_active: true,
  },
  {
    name: "ClassicFit",
    email: "info@classicfit.com",
    description: "Timeless t-shirt designs for everyone",
    logo_url: "https://via.placeholder.com/200x200?text=ClassicFit",
    is_active: true,
  },
];

async function seedTShirts() {
  try {
    console.log("👕 Starting t-shirt database seeding with renamed images...");

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

    // 2. Create t-shirt products using your numbered image names
    console.log("👕 Creating t-shirt products...");

    const tshirtProducts = [
      {
        slug: "classic-white-tshirt",
        sku: "CWT-001",
        title: "Classic White T-Shirt",
        description:
          "Essential white t-shirt made from 100% premium cotton. Perfect for layering or wearing alone.",
        price: 29.99,
        imageFiles: ["tshirt-basic (1).png"],
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        colors: ["White", "Off-White", "Cream"],
        stock: 100,
        weight: 0.2,
        category: "other" as const,
      },
      {
        slug: "casual-blue-tshirt",
        sku: "CBT-002",
        title: "Casual Blue T-Shirt",
        description:
          "Comfortable blue t-shirt with a relaxed fit. Great for everyday casual wear.",
        price: 34.99,
        imageFiles: ["tshirt-basic (2).png"],
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["Blue", "Navy", "Light Blue"],
        stock: 75,
        weight: 0.22,
        category: "men" as const,
      },
      {
        slug: "premium-gray-tshirt",
        sku: "PGT-003",
        title: "Premium Gray T-Shirt",
        description:
          "High-quality gray t-shirt with superior comfort and durability. Perfect for any occasion.",
        price: 39.99,
        imageFiles: ["tshirt-basic (3).png"],
        sizes: ["S", "M", "L", "XL"],
        colors: ["Gray", "Charcoal", "Light Gray"],
        stock: 60,
        weight: 0.25,
        category: "men" as const,
      },
      {
        slug: "vintage-black-tshirt",
        sku: "VBT-004",
        title: "Vintage Black T-Shirt",
        description:
          "Vintage-style black t-shirt with a worn-in feel and classic fit.",
        price: 42.99,
        imageFiles: ["tshirt-basic (4).png"],
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["Black", "Charcoal Black", "Faded Black"],
        stock: 50,
        weight: 0.23,
        category: "men" as const,
      },
      {
        slug: "graphic-navy-tshirt",
        sku: "GNT-005",
        title: "Graphic Navy T-Shirt",
        description:
          "Stylish navy t-shirt with unique design elements. Stand out from the crowd.",
        price: 37.99,
        imageFiles: ["tshirt-basic (5).png"],
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["Navy", "Dark Blue", "Midnight Blue"],
        stock: 45,
        weight: 0.21,
        category: "women" as const,
      },
      {
        slug: "fitted-red-tshirt",
        sku: "FRT-006",
        title: "Fitted Red T-Shirt",
        description:
          "Form-fitting red t-shirt that accentuates your silhouette perfectly.",
        price: 35.99,
        imageFiles: ["tshirt-basic (6).png"],
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["Red", "Crimson", "Cherry Red"],
        stock: 40,
        weight: 0.19,
        category: "women" as const,
      },
      {
        slug: "oversized-green-tshirt",
        sku: "OGT-007",
        title: "Oversized Green T-Shirt",
        description:
          "Trendy oversized green t-shirt for a relaxed and comfortable look.",
        price: 41.99,
        imageFiles: ["tshirt-basic (7).png"],
        sizes: ["S", "M", "L", "XL"],
        colors: ["Green", "Forest Green", "Olive"],
        stock: 35,
        weight: 0.27,
        category: "other" as const,
      },
      {
        slug: "polo-cream-tshirt",
        sku: "PCT-008",
        title: "Polo Style Cream T-Shirt",
        description:
          "Elegant polo-style t-shirt in cream color. Perfect for semi-formal occasions.",
        price: 46.99,
        imageFiles: ["tshirt-basic (8).png"],
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["Cream", "Beige", "Ivory"],
        stock: 30,
        weight: 0.24,
        category: "men" as const,
      },
      {
        slug: "henley-brown-tshirt",
        sku: "HBT-009",
        title: "Henley Brown T-Shirt",
        description:
          "Classic henley-style brown t-shirt with button detail at the neck.",
        price: 44.99,
        imageFiles: ["tshirt-basic (9).png"],
        sizes: ["S", "M", "L", "XL"],
        colors: ["Brown", "Chocolate", "Tan"],
        stock: 25,
        weight: 0.26,
        category: "men" as const,
      },
      {
        slug: "muscle-charcoal-tshirt",
        sku: "MCT-010",
        title: "Muscle Fit Charcoal T-Shirt",
        description:
          "Athletic muscle-fit t-shirt in charcoal. Perfect for workouts and active wear.",
        price: 38.99,
        imageFiles: ["tshirt-basic (10).png"],
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["Charcoal", "Dark Gray", "Slate"],
        stock: 55,
        weight: 0.2,
        category: "men" as const,
      },
      {
        slug: "longsleve-burgundy-tshirt",
        sku: "LBT-011",
        title: "Long Sleeve Burgundy T-Shirt",
        description: "Elegant long sleeve t-shirt in rich burgundy color.",
        price: 49.99,
        imageFiles: ["tshirt-basic (11).png"],
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["Burgundy", "Wine", "Maroon"],
        stock: 20,
        weight: 0.28,
        category: "women" as const,
      },
      {
        slug: "pocket-khaki-tshirt",
        sku: "PKT-012",
        title: "Pocket Khaki T-Shirt",
        description:
          "Casual t-shirt with chest pocket in khaki color. Great for everyday wear.",
        price: 33.99,
        imageFiles: ["tshirt-basic (12).png"],
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["Khaki", "Tan", "Sand"],
        stock: 65,
        weight: 0.22,
        category: "men" as const,
      },
      {
        slug: "striped-coral-tshirt",
        sku: "SCT-013",
        title: "Striped Coral T-Shirt",
        description: "Fashionable striped t-shirt in beautiful coral color.",
        price: 41.99,
        imageFiles: ["tshirt-basic (13).png"],
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["Coral", "Pink", "Salmon"],
        stock: 30,
        weight: 0.21,
        category: "women" as const,
      },
      {
        slug: "designer-emerald-tshirt",
        sku: "DET-014",
        title: "Designer Emerald T-Shirt",
        description:
          "Premium designer t-shirt in stunning emerald green. Limited edition.",
        price: 59.99,
        imageFiles: ["tshirt-basic (14).png"],
        sizes: ["S", "M", "L", "XL"],
        colors: ["Emerald", "Jade", "Forest Green"],
        stock: 15,
        weight: 0.25,
        category: "other" as const,
      },
      {
        slug: "athletic-purple-tshirt",
        sku: "APT-015",
        title: "Athletic Purple T-Shirt",
        description:
          "Performance athletic t-shirt in vibrant purple. Moisture-wicking fabric.",
        price: 45.99,
        imageFiles: ["tshirt-basic (15).png"],
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["Purple", "Violet", "Plum"],
        stock: 35,
        weight: 0.18,
        category: "other" as const,
      },
      {
        slug: "premium-orange-tshirt",
        sku: "POT-016",
        title: "Premium Orange T-Shirt",
        description:
          "Bold orange t-shirt made from premium cotton blend. Make a statement.",
        price: 52.99,
        imageFiles: ["tshirt-basic (16).png"],
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["Orange", "Burnt Orange", "Tangerine"],
        stock: 25,
        weight: 0.24,
        category: "women" as const,
      },
    ];

    const products: ProductInsert[] = tshirtProducts.map((template, index) => {
      // Map image files to URLs
      const imageUrls = template.imageFiles.map((fileName) => {
        if (uploadedImages[fileName]) {
          return uploadedImages[fileName];
        }
        // Fallback to placeholder if image not found
        console.warn(
          `⚠️ Image ${fileName} not found in uploads, using placeholder`
        );
        return `https://images.unsplash.com/photo-${
          1581338834647 + index
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
    });

    // 3. Insert products with vendor assignments
    const productsWithVendors = products.map((product, index) => ({
      ...product,
      vendor_id: vendorData[index % vendorData.length].id,
    }));

    console.log("👕 Inserting t-shirt products...");
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
        console.log(`✅ Inserted t-shirt: ${data.title}`);
      }
    }

    console.log(`\n🎉 T-shirt seeding completed successfully!`);
    console.log(
      `✅ Inserted ${vendorData.length} vendors and ${productCount} t-shirt products`
    );

    if (Object.keys(uploadedImages).length > 0) {
      console.log(
        `👕 Used ${Object.keys(uploadedImages).length} t-shirt images`
      );
    }
  } catch (error) {
    console.error("❌ T-shirt seeding failed:", error);
    process.exit(1);
  }
}

// Run the seeding function
if (require.main === module) {
  seedTShirts();
}

export { seedTShirts };
