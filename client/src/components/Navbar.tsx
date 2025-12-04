import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Sun, Moon, Leaf, Globe, ChevronDown, Users, Sprout } from "lucide-react";
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
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/diagnose", label: t("nav.diagnose") },
    { href: "/library", label: t("nav.library") },
    { href: "/crop-library", label: "Crop Library", icon: <Sprout className="h-4 w-4" /> },
    { href: "/chat", label: "AI Assistant" },
    { href: "/dashboard", label: t("nav.dashboard") },
    { href: "/experts", label: t("nav.experts") },
    { href: "/alerts", label: t("nav.weather") },
    { href: "/contact", label: t("nav.contact") },
    { href: "/farm-connect", label: "FarmConnect", icon: <Users className="h-4 w-4" /> },
  ];

  const currentLang = languages.find(l => l.code === language) || languages[0];

  return (
    <nav 
      className={`
        fixed top-0 left-0 right-0 z-50 
        transition-all duration-500 ease-in-out
        ${scrolled 
          ? 'bg-background/80 backdrop-blur-xl shadow-lg border-b border-border/50' 
          : 'bg-background/60 backdrop-blur-md border-b border-border/30'
        }
      `}
    >
      <div className="w-full px-2 sm:px-3 lg:px-4">
        <div className="flex h-14 sm:h-16 lg:h-18 items-center justify-between gap-2">
          {/* Logo Section - Compact on Mobile */}
          <Link href="/" className="group flex items-center gap-2 sm:gap-3 relative">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-lg sm:blur-xl rounded-full group-hover:bg-primary/30 transition-all duration-300" />
              <div className="relative bg-gradient-to-br from-primary to-primary/70 p-1.5 sm:p-2 lg:p-2.5 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg group-hover:shadow-primary/50 transition-all duration-300 group-hover:scale-110">
                <Leaf className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-primary-foreground" data-testid="icon-logo" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Crop Scout
              </span>
              <span className="hidden sm:block text-[9px] lg:text-[10px] text-muted-foreground font-medium tracking-wider">
                AI POWERED
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - All Items Visible */}
          <div className="hidden lg:flex items-center gap-0.5 flex-1 justify-center mx-2">
            {navLinks.map(link => {
              const isActive = location === link.href;
              return (
                <Link key={link.href} href={link.href}>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className={`
                      relative px-2 xl:px-3 py-2 rounded-lg font-medium text-xs xl:text-sm
                      transition-all duration-300 group whitespace-nowrap
                      ${isActive 
                        ? 'text-primary bg-primary/10' 
                        : 'text-foreground/70 hover:text-foreground hover:bg-accent/50'
                      }
                    `}
                    data-testid={`link-nav-${link.href.slice(1) || 'home'}`}
                  >
                    {link.icon && <span className="mr-1">{link.icon}</span>}
                    <span className="hidden xl:inline">{link.label}</span>
                    <span className="xl:hidden">{link.label.split(' ')[0]}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full" />
                    )}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Right Section - Controls - Compact */}
          <div className="flex items-center gap-1">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl hover:bg-accent/50 transition-all duration-300 group"
                  data-testid="button-language-toggle"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/10 group-hover:to-primary/5 rounded-lg sm:rounded-xl transition-all duration-300" />
                  <Globe className="h-4 w-4 sm:h-5 sm:w-5 relative z-10" />
                  <span className="sr-only">Change language</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-background/95 backdrop-blur-xl border-border/50">
                {languages.map(lang => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`
                      cursor-pointer transition-colors
                      ${language === lang.code 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "hover:bg-accent/50"
                      }
                    `}
                    data-testid={`option-language-${lang.code}`}
                  >
                    <span className="mr-3 text-lg">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl hover:bg-accent/50 transition-all duration-300 group overflow-hidden"
              data-testid="button-theme-toggle"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/10 group-hover:to-primary/5 rounded-lg sm:rounded-xl transition-all duration-300" />
              <div className="relative z-10">
                {theme === "light" ? (
                  <Moon className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:rotate-12" />
                ) : (
                  <Sun className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:rotate-90" />
                )}
              </div>
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl hover:bg-accent/50 transition-all duration-300"
                  data-testid="button-menu-toggle"
                >
                  {mobileOpen ? (
                    <X className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 rotate-90" />
                  ) : (
                    <Menu className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300" />
                  )}
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="right" 
                className="w-[85vw] sm:w-80 bg-background/95 backdrop-blur-xl border-l border-border/50 p-0"
              >
                <div className="flex flex-col gap-1 mt-16 px-3 sm:px-4">
                  <div className="mb-2 pb-3 border-b border-border/50">
                    <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Navigation
                    </p>
                  </div>
                  {navLinks.map(link => {
                    const isActive = location === link.href;
                    return (
                      <Link 
                        key={link.href} 
                        href={link.href} 
                        onClick={() => setMobileOpen(false)}
                      >
                        <Button 
                          variant="ghost" 
                          className={`
                            w-full justify-start rounded-lg py-4 sm:py-5 transition-all duration-300 h-auto
                            ${isActive 
                              ? 'bg-primary/10 text-primary font-semibold border-l-3 border-primary' 
                              : 'hover:bg-accent/50 border-l-3 border-transparent'
                            }
                          `}
                          data-testid={`link-mobile-${link.href.slice(1) || 'home'}`}
                        >
                          {link.icon && <span className="mr-2 sm:mr-3">{link.icon}</span>}
                          <span className="text-sm sm:text-base">{link.label}</span>
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}