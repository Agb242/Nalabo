import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme";
import { Moon, Sun } from "lucide-react";

export function Header() {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string) => location === path;

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-orange-500 to-blue-800 rounded-lg">
              <span className="text-white font-bold text-xl">N</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-blue-800 dark:text-orange-500">Nalabo</h1>
              <p className="text-xs text-slate-600 dark:text-slate-400">Workshops Tech</p>
            </div>
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/workshops">
              <a className={`font-medium transition-colors ${
                isActive("/workshops") 
                  ? "text-orange-500" 
                  : "text-blue-800 dark:text-slate-300 hover:text-orange-500"
              }`}>
                Ateliers
              </a>
            </Link>
            <Link href="/challenges">
              <a className={`font-medium transition-colors ${
                isActive("/challenges") 
                  ? "text-orange-500" 
                  : "text-slate-600 dark:text-slate-300 hover:text-orange-500"
              }`}>
                Défis
              </a>
            </Link>
            <Link href="/dashboard">
              <a className={`font-medium transition-colors ${
                isActive("/dashboard") 
                  ? "text-orange-500" 
                  : "text-slate-600 dark:text-slate-300 hover:text-orange-500"
              }`}>
                Tableau de bord
              </a>
            </Link>
            <a href="#" className="text-slate-600 dark:text-slate-300 hover:text-orange-500 font-medium">
              Communauté
            </a>
            <a href="#" className="text-slate-600 dark:text-slate-300 hover:text-orange-500 font-medium">
              Certifications
            </a>
            <a href="#" className="text-slate-600 dark:text-slate-300 hover:text-orange-500 font-medium">
              Marketplace
            </a>
          </nav>
          
          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-orange-500"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button className="bg-orange-500 text-white hover:bg-orange-600">
              Connexion
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
