import { Link } from "wouter";
import { Leaf, Facebook, Twitter, Youtube } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
  const { t } = useLanguage();

  const footerSections = [
    {
      title: "Platform",
      links: [
        { label: t("nav.home"), href: "/" },
        { label: t("nav.diagnose"), href: "/diagnose" },
        { label: t("nav.library"), href: "/library" },
        { label: t("nav.chat"), href: "/chat" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: t("nav.experts"), href: "/experts" },
        { label: t("nav.alerts"), href: "/alerts" },
        { label: t("nav.dashboard"), href: "/dashboard" },
        { label: t("nav.download"), href: "/download" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: t("nav.contact"), href: "/contact" },
        { label: "FAQ", href: "/contact#faq" },
        { label: "About", href: "/about" },
        { label: "Privacy", href: "/privacy" },
      ],
    },
  ];

  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4" data-testid="link-footer-home">
              <Leaf className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">Crop Scout</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              {t("hero.subtitle")}
            </p>
            <div className="flex gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover-elevate p-2 rounded-md" data-testid="link-social-facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover-elevate p-2 rounded-md" data-testid="link-social-twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover-elevate p-2 rounded-md" data-testid="link-social-youtube">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {footerSections.map(section => (
            <div key={section.title}>
              <h3 className="font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map(link => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid={`link-footer-${link.href.slice(1)}`}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© 2025 Crop Disease & Pest Scout. All rights reserved.</p>
          <p className="mt-2">Powered by AI • FAO & ICAR Guidelines</p>
        </div>
      </div>
    </footer>
  );
}
