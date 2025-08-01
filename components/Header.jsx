import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { User, Shield, Home, BarChart3, LogOut } from "lucide-react";

export function Header({ activeView, onViewChange, currentUser, onLogout }) {
  const handleAdminAccess = () => {
    if (currentUser) {
      onViewChange('admin');
    } else {
      onViewChange('login');
    }
  };

  return (
    <header className="bg-white border-b border-border shadow-sm sticky top-0 z-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Home className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-primary">بلغني</h1>
              <p className="text-sm text-muted-foreground">منصة الإبلاغ عن المشاكل البلدية</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-2">
            <Button
              variant={activeView === 'user' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('user')}
              className="gap-2"
            >
              <User className="w-4 h-4" />
              إبلاغ عن مشكلة
            </Button>
            
            <Button
              variant={activeView === 'admin' || activeView === 'login' || activeView === 'signup' ? 'default' : 'ghost'}
              size="sm"
              onClick={handleAdminAccess}
              className="gap-2"
            >
              <Shield className="w-4 h-4" />
              لوحة الإدارة
            </Button>
            
            <Button
              variant={activeView === 'stats' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('stats')}
              className="gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              الإحصائيات
            </Button>
          </nav>

          {/* User Status and Actions */}
          <div className="flex items-center gap-2">
            {currentUser ? (
              <>
                <Badge variant="secondary" className="bg-pastel-green">
                  {currentUser.name}
                </Badge>
                <Badge variant="outline" className="bg-pastel-blue">
                  {currentUser.role === 'admin' ? `مسؤول - ${currentUser.municipality}` : 'مواطن'}
                </Badge>
                <Button variant="ghost" size="sm" onClick={onLogout} className="gap-2">
                  <LogOut className="w-4 h-4" />
                  تسجيل الخروج
                </Button>
              </>
            ) : (
              <Badge variant="secondary" className="bg-pastel-blue text-primary">
                زائر
              </Badge>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}