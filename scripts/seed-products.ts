// scripts/seed-products.ts
import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

// Use a more flexible type for seeding - bypass strict typing temporarily
// Add after the imports for testing
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Found' : 'Missing');
console.log('Service Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Found' : 'Missing');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Sample vendors data - properly typed for insert
const vendors = [
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
] as const;

// Sample products data - properly typed for insert
const products = [
  {
    slug: "premium-tagerine-shirt",
    sku: "PTS-001",
    title: "Premium Tagerine Shirt",
    description:
      "A beautiful premium tagerine shirt made from high-quality cotton blend. Perfect for casual and semi-formal occasions.",
    price: 257.85,
    currency: "USD",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&h=500&fit=crop",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&h=500&fit=crop&q=80",
    ]),
    sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
    colors: JSON.stringify(["Tagerine", "White", "Navy"]),
    stock: 50,
    weight: 0.3,
    category: "women",
  },
  {
    slug: "leather-tagerine-coat",
    sku: "LTC-002",
    title: "Leather Tagerine Coat",
    description:
      "Luxurious leather coat in tagerine color. Handcrafted with attention to detail and premium materials.",
    price: 257.85,
    currency: "USD",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop",
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop&q=80",
    ]),
    sizes: JSON.stringify(["S", "M", "L", "XL"]),
    colors: JSON.stringify(["Tagerine", "Black", "Brown"]),
    stock: 25,
    weight: 1.2,
    category: "women",
  },
  {
    slug: "classic-tagerine-shirt",
    sku: "CTS-003",
    title: "Tagerine Shirt",
    description:
      "Classic tagerine shirt with modern fit. Made from breathable cotton fabric.",
    price: 240.32,
    currency: "USD",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1603252109303-2751441b4e54?w=500&h=500&fit=crop",
    ]),
    sizes: JSON.stringify(["S", "M", "L", "XL"]),
    colors: JSON.stringify(["Tagerine", "Blue", "Grey"]),
    stock: 40,
    weight: 0.25,
    category: "men",
  },
  {
    slug: "mens-leather-coat",
    sku: "MLC-004",
    title: "Leather Coat",
    description:
      "Premium mens leather coat with classic design. Perfect for formal and casual wear.",
    price: 325.36,
    currency: "USD",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=500&h=500&fit=crop",
    ]),
    sizes: JSON.stringify(["M", "L", "XL", "XXL"]),
    colors: JSON.stringify(["Black", "Brown", "Navy"]),
    stock: 20,
    weight: 1.5,
    category: "men",
  },
  {
    slug: "premium-cotton-coat",
    sku: "PCC-005",
    title: "Tagerine Shirt",
    description:
      "Versatile cotton shirt suitable for various occasions. Comfortable and stylish.",
    price: 126.47,
    currency: "USD",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&h=500&fit=crop",
    ]),
    sizes: JSON.stringify(["S", "M", "L", "XL"]),
    colors: JSON.stringify(["Tagerine", "White", "Pink"]),
    stock: 60,
    weight: 0.2,
    category: "women",
  },
  {
    slug: "classic-leather-coat",
    sku: "CLC-006",
    title: "Leather Coat",
    description:
      "Timeless leather coat with premium finish. A wardrobe essential for the modern individual.",
    price: 257.85,
    currency: "USD",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1506629905057-eb7d95d0d3bf?w=500&h=500&fit=crop",
    ]),
    sizes: JSON.stringify(["M", "L", "XL"]),
    colors: JSON.stringify(["Black", "Brown"]),
    stock: 15,
    weight: 1.3,
    category: "men",
  },
] as const;

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    // Clear existing data first (optional - uncomment if you want to reset)
    // console.log("🧹 Clearing existing data...");
    // await supabase.from("products").delete().neq('id', '00000000-0000-0000-0000-000000000000');
    // await supabase.from("vendors").delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 1. Insert vendors
    console.log("📦 Inserting vendors...");

    // Insert vendors one by one to handle potential conflicts
    const vendorData: typeof vendors[number][] = [];
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

    // 2. Prepare products with vendor_id
    const productsWithVendors = products.map((product: any, index: number) => ({
      ...product,
      vendor_id: vendorData[index % vendorData.length].id, // Distribute products across vendors
    }));

    // 3. Insert products one by one to handle potential conflicts
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

    console.log(
      `✅ Inserted ${vendorData.length} vendors and ${productCount} products`
    );
    console.log("🎉 Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

// Run the seeding function
seedDatabase();
