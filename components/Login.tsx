import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { Eye, EyeOff, Shield, ArrowRight } from "lucide-react";

async function mockSignIn(email: string, password: string) {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  if (email && password) {
    return {
      user: {
        id: '1',
        email,
        name: 'مسؤول تجريبي',
        municipality: 'الجزائر العاصمة',
        role: 'admin'
      },
      access_token: 'mock-token-' + Date.now()
    };
  }
  
  throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
}

interface LoginProps {
  onLogin: (userData: any) => void;
  onSwitchToSignup: () => void;
}

export function Login({ onLogin, onSwitchToSignup }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('يرجى ملء جميع الحقول');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await mockSignIn(email, password);
      localStorage.setItem('access_token', response.access_token);
      console.log('✅ Login successful:', response.user);
      onLogin(response.user);
    } catch (error: any) {
      console.error('❌ Login error:', error);
      setError(error.message || 'خطأ في تسجيل الدخول');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-secondary/30" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">تسجيل الدخول للإدارة</CardTitle>
          <p className="text-muted-foreground">
            للوصول إلى لوحة إدارة البلاغات
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="ادخل كلمة المرور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="pl-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
              {!isLoading && <ArrowRight className="w-4 h-4 mr-2" />}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              ليس لديك حساب؟{' '}
              <button
                onClick={onSwitchToSignup}
                className="text-primary hover:underline"
                disabled={isLoading}
              >
                إنشاء حساب جديد
              </button>
            </p>
          </div>

          <div className="mt-4 p-3 bg-pastel-blue rounded-lg">
            <p className="text-sm text-center text-muted-foreground">
              <strong>ملاحظة:</strong> هذا نموذج تجريبي<br />
              يمكنك استخدام أي بريد إلكتروني وكلمة مرور للتجربة
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}