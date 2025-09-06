// app/explore/page.tsx
import ExploreClient from "@/components/explore/explore-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore - FashionHub",
  description: "Discover the best collection of trendy fashion items",
};

export default function ExplorePage() {
  return <ExploreClient />;
}
