import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/components/auth/auth-context";
import { AuthModal } from "@/components/auth/auth-modal";
import { Moon, Sun, User, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const isActive = (path: string) => location === path;

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-500 to-blue-800 rounded-lg shadow-lg">
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7v10c0 5.55 3.84 10 9 10s9-4.45 9-10V7l-8-5zM12 4.44L18.18 7 12 10.56 5.82 7 12 4.44zM4 8.18l7 4.08v8.34c-3.94-.64-7-4.19-7-8.6v-3.82zm16 7.82c0 4.41-3.06 7.96-7 8.6v-8.34l7-4.08v3.82z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-blue-800 dark:text-orange-500">Nalabo</h1>
              <p className="text-xs text-slate-600 dark:text-slate-400">Plateforme Cloud-Native de Workshops Tech</p>
            </div>
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/workshops">
              <span className={`font-medium transition-colors ${
                isActive("/workshops") 
                  ? "text-orange-500" 
                  : "text-blue-800 dark:text-slate-300 hover:text-orange-500"
              }`}>
                Ateliers
              </span>
            </Link>
            <Link href="/challenges">
              <span className={`font-medium transition-colors ${
                isActive("/challenges") 
                  ? "text-orange-500" 
                  : "text-slate-600 dark:text-slate-300 hover:text-orange-500"
              }`}>
                Défis
              </span>
            </Link>
            <Link href="/dashboard">
              <span className={`font-medium transition-colors ${
                isActive("/dashboard") 
                  ? "text-orange-500" 
                  : "text-slate-600 dark:text-slate-300 hover:text-orange-500"
              }`}>
                Tableau de bord
              </span>
            </Link>
            <span className="text-slate-600 dark:text-slate-300 hover:text-orange-500 font-medium cursor-pointer">
              Communauté
            </span>
            <span className="text-slate-600 dark:text-slate-300 hover:text-orange-500 font-medium cursor-pointer">
              Certifications
            </span>
            <span className="text-slate-600 dark:text-slate-300 hover:text-orange-500 font-medium cursor-pointer">
              Marketplace
            </span>
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
            
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{user?.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Points: {user?.points || 0}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Déconnexion</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={() => setAuthModalOpen(true)}
                className="bg-orange-500 text-white hover:bg-orange-600"
              >
                Connexion
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
      />
    </header>
  );
}
