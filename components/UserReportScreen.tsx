import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { 
  Camera, 
  MapPin, 
  Lightbulb, 
  Car, 
  Droplets, 
  Trash2, 
  TreePine,
  Construction,
  Building,
  AlertTriangle,
  Upload,
  CheckCircle,
  User,
  IdCard
} from "lucide-react";
import { apiClient } from "../utils/supabase/client";

const issueTypes = [
  { id: 'streetlight', name: 'إنارة عامة', icon: Lightbulb, color: 'bg-pastel-orange' },
  { id: 'pothole', name: 'حفر في الطريق', icon: Construction, color: 'bg-pastel-red' },
  { id: 'water', name: 'تسريب مياه', icon: Droplets, color: 'bg-pastel-blue' },
  { id: 'waste', name: 'مخلفات', icon: Trash2, color: 'bg-pastel-green' },
  { id: 'parking', name: 'مواقف السيارات', icon: Car, color: 'bg-pastel-purple' },
  { id: 'trees', name: 'الأشجار والحدائق', icon: TreePine, color: 'bg-pastel-green' },
  { id: 'building', name: 'مباني عامة', icon: Building, color: 'bg-algerian-accent' },
  { id: 'other', name: 'أخرى', icon: AlertTriangle, color: 'bg-muted' }
];

interface UserReportScreenProps {
  currentUser?: {
    id: string;
    name: string;
    municipality: string;
    role: string;
  } | null;
}

export function UserReportScreen({ currentUser }: UserReportScreenProps) {
  const [selectedIssue, setSelectedIssue] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [reporterName, setReporterName] = useState(currentUser?.name || '');
  const [reporterId, setReporterId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newPhotos = Array.from(event.target.files);
      setPhotos([...photos, ...newPhotos]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedIssue || !description || !reporterName || !reporterId) return;
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      const reportData = {
        type: selectedIssue,
        description,
        location,
        reporterName,
        reporterId,
        photos
      };
      
      const response = await apiClient.submitReport(reportData);
      
      console.log('✅ Report submitted successfully:', response);
      setIsSubmitted(true);
      
      setTimeout(() => {
        setIsSubmitted(false);
        setSelectedIssue('');
        setDescription('');
        setLocation('');
        setPhotos([]);
        if (!currentUser) {
          setReporterName('');
          setReporterId('');
        }
      }, 3000);
      
    } catch (error: any) {
      console.error('❌ Report submission error:', error);
      setSubmitError(error.message || 'خطأ في إرسال البلاغ');
    }
    
    setIsSubmitting(false);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(`${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`);
        },
        () => {
          setLocation('تعذر تحديد الموقع الحالي');
        }
      );
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4" dir="rtl">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl mb-2">تم إرسال البلاغ بنجاح!</h2>
            <p className="text-muted-foreground">
              شكراً لك على المساهمة في تحسين مدينتنا. سيتم مراجعة البلاغ من قبل الجهات المختصة.
            </p>
            {currentUser && (
              <Badge variant="secondary" className="mt-4 bg-pastel-blue">
                مُرسل من: {currentUser.name} ({currentUser.role === 'admin' ? 'مسؤول' : 'مواطن'})
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-secondary/30 p-4" dir="rtl">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center py-6">
          <h1 className="text-2xl mb-2">ابلغ عن مشكلة في مدينتك</h1>
          <p className="text-muted-foreground">
            ساعدنا في تحسين البيئة الحضرية من خلال الإبلاغ عن المشاكل التي تواجهها
          </p>
          {currentUser && (
            <Badge variant="secondary" className="mt-2 bg-pastel-green">
              مرحباً {currentUser.name} - {currentUser.role === 'admin' ? 'مسؤول في ' + currentUser.municipality : 'مواطن'}
            </Badge>
          )}
        </div>

        {submitError && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-red-600 text-center">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                <p>{submitError}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              معلومات المبلغ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm">الاسم الكامل *</label>
                <Input
                  placeholder="أدخل اسمك الكامل"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  disabled={!!currentUser?.name}
                />
                {currentUser?.name && (
                  <p className="text-xs text-muted-foreground">
                    تم استخدام اسمك من الحساب المسجل
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm">رقم بطاقة الهوية *</label>
                <div className="relative">
                  <Input
                    placeholder="123456789012345"
                    value={reporterId}
                    onChange={(e) => setReporterId(e.target.value)}
                    maxLength={15}
                    className="pl-10"
                  />
                  <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  لضمان الشفافية ومنع البلاغات الكاذبة
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              نوع المشكلة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {issueTypes.map((issue) => {
                const Icon = issue.icon;
                return (
                  <button
                    key={issue.id}
                    onClick={() => setSelectedIssue(issue.id)}
                    className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                      selectedIssue === issue.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-lg ${issue.color} flex items-center justify-center mx-auto mb-2`}>
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-sm text-center">{issue.name}</p>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              إضافة صور
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">انقر لإضافة صور أو اسحب الصور هنا</p>
                </div>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handlePhotoUpload}
                />
              </label>
              
              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative aspect-square">
                      <ImageWithFallback
                        src={URL.createObjectURL(photo)}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <Badge variant="secondary" className="absolute top-1 left-1 text-xs">
                        {(photo.size / 1024 / 1024).toFixed(1)}MB
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>وصف المشكلة</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="اكتب وصفاً مفصلاً للمشكلة..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-24"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              الموقع
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="أدخل الموقع أو العنوان"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" onClick={getCurrentLocation}>
                <MapPin className="w-4 h-4" />
              </Button>
            </div>
            {location && (
              <Badge variant="secondary" className="bg-pastel-blue">
                {location}
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Button
              onClick={handleSubmit}
              disabled={!selectedIssue || !description || !reporterName || !reporterId || isSubmitting}
              className="w-full h-12"
              size="lg"
            >
              {isSubmitting ? 'جاري الإرسال...' : 'إرسال البلاغ'}
            </Button>
            
            {(!selectedIssue || !description || !reporterName || !reporterId) && (
              <p className="text-sm text-muted-foreground text-center mt-2">
                يرجى ملء جميع الحقول المطلوبة (نوع المشكلة، الوصف، الاسم، ورقم الهوية)
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}