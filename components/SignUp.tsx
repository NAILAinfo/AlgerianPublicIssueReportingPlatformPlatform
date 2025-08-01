import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Alert, AlertDescription } from "./ui/alert";
import { Eye, EyeOff, UserPlus, ArrowRight } from "lucide-react";

const algerianProvinces = [
  'الجزائر العاصمة', 'وهران', 'قسنطينة', 'عنابة', 'البليدة', 'باتنة', 'جيجل', 'سطيف',
  'سيدي بلعباس', 'بسكرة', 'تلمسان', 'بجاية', 'تيارت', 'ورقلة', 'سكيكدة', 'مستغانم'
];

async function mockSignUp(formData: any) {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    user: {
      id: Date.now().toString(),
      email: formData.email,
      name: formData.name,
      municipality: formData.municipality,
      role: 'admin'
    }
  };
}

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  municipality: string;
  phone: string;
  idCard: string;
}

interface SignUpProps {
  onSignUp: (userData: any) => void;
  onSwitchToLogin: () => void;
}

export function SignUp({ onSignUp, onSwitchToLogin }: SignUpProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    municipality: '',
    phone: '',
    idCard: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): string | null => {
    if (!formData.name || !formData.email || !formData.password || !formData.municipality) {
      return 'يرجى ملء جميع الحقول المطلوبة';
    }
    if (formData.password.length < 6) {
      return 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }
    if (formData.password !== formData.confirmPassword) {
      return 'كلمات المرور غير متطابقة';
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      return 'البريد الإلكتروني غير صحيح';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await mockSignUp(formData);
      console.log('✅ Signup successful:', response.user);
      onSignUp(response.user);
    } catch (error: any) {
      console.error('❌ Signup error:', error);
      setError(error.message || 'خطأ في إنشاء الحساب');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-secondary/30" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">إنشاء حساب إداري</CardTitle>
          <p className="text-muted-foreground">
            للانضمام كمسؤول في إدارة البلاغات
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">الاسم الكامل *</Label>
              <Input
                id="name"
                type="text"
                placeholder="أدخل اسمك الكامل"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني *</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@municipality.dz"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="municipality">البلدية *</Label>
              <Select value={formData.municipality} onValueChange={(value) => handleInputChange('municipality', value)} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر البلدية" />
                </SelectTrigger>
                <SelectContent>
                  {algerianProvinces.map((province) => (
                    <SelectItem key={province} value={province}>
                      {province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="0555123456"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="idCard">رقم بطاقة الهوية</Label>
              <Input
                id="idCard"
                type="text"
                placeholder="123456789012345"
                value={formData.idCard}
                onChange={(e) => handleInputChange('idCard', e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="6 أحرف على الأقل"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">تأكيد كلمة المرور *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="أعد كتابة كلمة المرور"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  disabled={isLoading}
                  className="pl-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
              {!isLoading && <ArrowRight className="w-4 h-4 mr-2" />}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              لديك حساب بالفعل؟{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-primary hover:underline"
                disabled={isLoading}
              >
                تسجيل الدخول
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}