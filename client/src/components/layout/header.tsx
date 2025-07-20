
import React, { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { useAuth } from '@/components/auth/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { AuthModal } from '@/components/auth/auth-modal';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings,
  Zap,
  Shield,
  Globe
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const navigation = [
    { name: t('nav.workshops'), href: '/workshops' },
    { name: t('nav.challenges'), href: '/challenges' },
    { name: t('nav.community'), href: '/community' }
  ];

  const openAuthModal = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-br from-nalabo-orange to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 animate-logo-float">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-nalabo-orange to-nalabo-blue bg-clip-text text-transparent">
                  Nalabo
                </span>
                <span className="hidden sm:inline text-xs bg-gradient-to-r from-blue-600 to-red-600 text-white px-2 py-1 rounded-full font-semibold">
                  🇫🇷 FR
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <span className="text-gray-700 hover:text-nalabo-orange font-medium transition-colors duration-200 cursor-pointer relative group">
                    {item.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-nalabo-orange group-hover:w-full transition-all duration-300"></span>
                  </span>
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-4">
              <LanguageSwitcher />
              
              {user ? (
                <div className="flex items-center gap-3">
                  <Link href="/dashboard">
                    <Button variant="ghost" className="text-nalabo-blue hover:text-nalabo-orange">
                      {t('nav.dashboard')}
                    </Button>
                  </Link>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-nalabo-orange to-orange-500 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-medium">{user.firstName}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                          <User className="h-4 w-4" />
                          {t('auth.profile')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                          <Settings className="h-4 w-4" />
                          {t('auth.settings')}
                        </Link>
                      </DropdownMenuItem>
                      {(user.role === 'admin' || user.role === 'community_admin') && (
                        <DropdownMenuItem asChild>
                          <Link href="/admin-dashboard" className="flex items-center gap-2 cursor-pointer">
                            <Shield className="h-4 w-4" />
                            {t('auth.adminDashboard')}
                          </Link>
                        </DropdownMenuItem>
                      )}
                      {user.role === 'super_admin' && (
                        <DropdownMenuItem asChild>
                          <Link href="/super-admin-dashboard" className="flex items-center gap-2 cursor-pointer">
                            <Shield className="h-4 w-4" />
                            {t('auth.superAdminDashboard')}
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={logout}
                        className="flex items-center gap-2 cursor-pointer text-red-600 hover:text-red-700"
                      >
                        <LogOut className="h-4 w-4" />
                        {t('auth.logout')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    onClick={() => openAuthModal('login')}
                    className="text-nalabo-blue hover:text-nalabo-orange font-medium"
                  >
                    {t('auth.login')}
                  </Button>
                  <Button 
                    onClick={() => openAuthModal('register')}
                    className="bg-gradient-to-r from-nalabo-orange to-orange-500 hover:from-orange-500 hover:to-nalabo-orange text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    {t('auth.register')}
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center gap-2">
              <LanguageSwitcher />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md">
              <div className="py-4 space-y-2">
                {navigation.map((item) => (
                  <Link key={item.name} href={item.href}>
                    <div 
                      className="block px-4 py-3 text-gray-700 hover:text-nalabo-orange hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </div>
                  </Link>
                ))}
                
                {user ? (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <Link href="/dashboard">
                      <div 
                        className="block px-4 py-3 text-gray-700 hover:text-nalabo-orange hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {t('nav.dashboard')}
                      </div>
                    </Link>
                    <Link href="/profile">
                      <div 
                        className="block px-4 py-3 text-gray-700 hover:text-nalabo-orange hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {t('auth.profile')}
                      </div>
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      {t('auth.logout')}
                    </button>
                  </div>
                ) : (
                  <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        openAuthModal('login');
                        setIsMenuOpen(false);
                      }}
                      className="w-full justify-start text-left px-4 py-3"
                    >
                      {t('auth.login')}
                    </Button>
                    <Button
                      onClick={() => {
                        openAuthModal('register');
                        setIsMenuOpen(false);
                      }}
                      className="w-full bg-gradient-to-r from-nalabo-orange to-orange-500 hover:from-orange-500 hover:to-nalabo-orange text-white mx-4 rounded-lg"
                    >
                      {t('auth.register')}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </>
  );
}
