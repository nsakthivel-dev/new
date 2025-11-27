import { useState } from "react";
import { Link } from "wouter";
import { Menu, X, Sun, Moon, Leaf, Globe, Shield, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage, type Language } from "@/contexts/LanguageContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const languages: { code: Language; name: string; flag: string }[] = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "hi", name: "हिंदी", flag: "🇮🇳" },
  { code: "sw", name: "Kiswahili", flag: "🇰🇪" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
];

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/diagnose", label: t("nav.diagnose") },
    { href: "/library", label: t("nav.library") },
    { href: "/chat", label: t("nav.chat") },
    { href: "/dashboard", label: t("nav.dashboard") },
    { href: "/experts", label: t("nav.experts") },
    { href: "/alerts", label: t("nav.weather") },
    { href: "/download", label: t("nav.download") },
    { href: "/contact", label: t("nav.contact") },
    { href: "/data-storage", label: "Data Storage", icon: <Database className="h-4 w-4 mr-2" /> },
  ];

  const currentLang = languages.find(l => l.code === language) || languages[0];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-primary" data-testid="icon-logo" />
            <span className="text-lg font-bold">Crop Scout</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}>
                <Button variant="ghost" size="sm" data-testid={`link-nav-${link.href.slice(1) || 'home'}`}>
                  {link.icon && link.icon}
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-language-toggle">
                  <Globe className="h-5 w-5" />
                  <span className="sr-only">Change language</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {languages.map(lang => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={language === lang.code ? "bg-accent" : ""}
                    data-testid={`option-language-${lang.code}`}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" data-testid="button-menu-toggle">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col gap-4 mt-8">
                  {navLinks.map(link => (
                    <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start" data-testid={`link-mobile-${link.href.slice(1) || 'home'}`}>
                        {link.icon && link.icon}
                        {link.label}
                      </Button>
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}