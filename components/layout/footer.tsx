// components/layout/footer.tsx
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const footerSections = [
  {
    title: "Shop",
    links: [
      { name: "All Products", href: "/explore" },
      { name: "Men", href: "/explore?category=men" },
      { name: "Women", href: "/explore?category=women" },
      { name: "Kids", href: "/explore?category=kids" },
      { name: "Sale", href: "/explore?sale=true" },
    ],
  },
  {
    title: "Customer Service",
    links: [
      { name: "Contact Us", href: "/contact" },
      { name: "FAQ", href: "/faq" },
      { name: "Shipping Info", href: "/shipping" },
      { name: "Returns", href: "/returns" },
      { name: "Size Guide", href: "/size-guide" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About Us", href: "/about" },
      { name: "Careers", href: "/careers" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Sustainability", href: "/sustainability" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">FH</span>
              </div>
              <span className="font-bold text-xl">FashionHub</span>
            </div>
            <p className="text-gray-400 text-sm">
              Discover the best collection of trendy fashion items. Quality,
              style, and comfort in every piece.
            </p>

            {/* Contact Info */}
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>123 Fashion Street, NY 10001</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>hello@fashionhub.com</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="font-semibold text-lg">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="max-w-md">
            <h3 className="font-semibold text-lg mb-2">Stay Updated</h3>
            <p className="text-gray-400 text-sm mb-4">
              Subscribe to get special offers, new arrivals, and fashion tips.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
              />
              <button className="px-6 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg font-medium transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 FashionHub. All rights reserved.
          </p>

          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Badge variant="outline" className="text-gray-400 border-gray-600">
              Secure Shopping
            </Badge>
            <Badge variant="outline" className="text-gray-400 border-gray-600">
              Free Shipping
            </Badge>
            <Badge variant="outline" className="text-gray-400 border-gray-600">
              24/7 Support
            </Badge>
          </div>
        </div>
      </div>
    </footer>
  );
}
