
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
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center gap-3 cursor-pointer">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-semibold text-gray-800">
                  Nalabo
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <span className="text-gray-600 hover:text-blue-600 font-medium transition-colors cursor-pointer">
                    {item.name}
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
                    <Button variant="ghost" className="text-gray-600 hover:text-blue-600">
                      {t('nav.dashboard')}
                    </Button>
                  </Link>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{user.firstName}</span>
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
                    className="text-gray-600 hover:text-blue-600 font-medium"
                  >
                    {t('auth.login')}
                  </Button>
                  <Button 
                    onClick={() => openAuthModal('register')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
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
            <div className="lg:hidden border-t border-gray-200 bg-white">
              <div className="py-4 space-y-2">
                {navigation.map((item) => (
                  <Link key={item.name} href={item.href}>
                    <div 
                      className="block px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg cursor-pointer"
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
                        className="block px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg cursor-pointer"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {t('nav.dashboard')}
                      </div>
                    </Link>
                    <Link href="/profile">
                      <div 
                        className="block px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg cursor-pointer"
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
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white mx-4 rounded-lg"
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
