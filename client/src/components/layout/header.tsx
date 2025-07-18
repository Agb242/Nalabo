import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/components/auth/auth-context";
import { AuthModal } from "@/components/auth/auth-modal";
import { Moon, Sun, User, LogOut, Settings, Zap } from "lucide-react";
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
            
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg">
                <Zap className="h-6 w-6 text-orange-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  <span className="text-orange-500">NA</span>labo
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Plateforme cloud-native de workshops Tech
                </span>
              </div>
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
                    <Link href="/profile" className="flex items-center w-full">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Points: {user?.points || 0}</span>
                  </DropdownMenuItem>
                  {user?.role === 'admin' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Link href="/admin" className="flex items-center w-full">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Administration</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
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