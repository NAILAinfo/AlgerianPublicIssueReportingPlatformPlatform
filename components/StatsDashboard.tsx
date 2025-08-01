import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Users,
  Calendar,
  Target,
  Activity,
  RefreshCw
} from "lucide-react";
import { apiClient } from "../utils/supabase/client";

const COLORS = ['#4f9cba', '#7eb3d3', '#a8d8ea', '#d4f1f4', '#b8e6b8'];

const issueTypeNames = {
  streetlight: 'إنارة عامة',
  pothole: 'حفر الطرق', 
  water: 'تسريب مياه',
  waste: 'مخلفات',
  parking: 'مواقف السيارات',
  trees: 'الأشجار والحدائق',
  building: 'مباني عامة',
  other: 'أخرى'
};

export function StatsDashboard() {
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await apiClient.getStatistics();
      setStatistics(response.statistics);
      setLastUpdated(new Date());
      
      console.log('✅ Statistics loaded:', response.statistics);
    } catch (error: any) {
      console.error('❌ Failed to fetch statistics:', error);
      setError(error.message || 'فشل في جلب الإحصائيات');
      
      // Fallback to demo data if API fails
      setStatistics({
        totalReports: 0,
        resolvedReports: 0,
        pendingReports: 0,
        resolutionRate: 0,
        issueTypes: {},
        monthlyData: {}
      });
    } finally {
      setLoading(false);
    }
  };

  const formatIssueTypesForChart = () => {
    if (!statistics?.issueTypes) return [];
    
    return Object.entries(statistics.issueTypes).map(([type, count], index) => ({
      name: issueTypeNames[type as keyof typeof issueTypeNames] || type,
      value: count,
      color: COLORS[index % COLORS.length]
    }));
  };

  const formatMonthlyDataForChart = () => {
    if (!statistics?.monthlyData) return [];
    
    const monthNames = {
      '01': 'يناير', '02': 'فبراير', '03': 'مارس', '04': 'أبريل',
      '05': 'مايو', '06': 'يونيو', '07': 'يوليو', '08': 'أغسطس',
      '09': 'سبتمبر', '10': 'أكتوبر', '11': 'نوفمبر', '12': 'ديسمبر'
    };
    
    return Object.entries(statistics.monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6) // Last 6 months
      .map(([month, data]: [string, any]) => ({
        month: monthNames[month.split('-')[1] as keyof typeof monthNames] || month,
        reports: data.total,
        resolved: data.resolved
      }));
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-secondary/30 p-4 flex items-center justify-center" dir="rtl">
        <Card className="text-center p-8">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p>جاري تحميل الإحصائيات...</p>
        </Card>
      </div>
    );
  }

  const totalReports = statistics?.totalReports || 0;
  const resolvedReports = statistics?.resolvedReports || 0;
  const pendingReports = statistics?.pendingReports || 0;
  const resolutionRate = statistics?.resolutionRate || 0;

  const issueTypeData = formatIssueTypesForChart();
  const monthlyData = formatMonthlyDataForChart();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-secondary/30 p-4" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-2xl mb-2">لوحة الإحصائيات</h1>
          <p className="text-muted-foreground">
            تحليل شامل لبلاغات المواطنين وأداء الخدمات البلدية
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Badge variant="secondary" className="bg-pastel-green">
              الإحصائيات عامة ومتاحة للجميع
            </Badge>
            <Button variant="outline" size="sm" onClick={fetchStatistics}>
              <RefreshCw className="w-4 h-4" />
              تحديث
            </Button>
          </div>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground mt-2">
              آخر تحديث: {lastUpdated.toLocaleTimeString('ar-DZ')}
            </p>
          )}
        </div>

        {error && (
          <div className="p-4 bg-yellow-100 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700">{error}</p>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي البلاغات</p>
                  <p className="text-2xl">{totalReports}</p>
                  {totalReports > 0 ? (
                    <div className="flex items-center gap-1 text-green-600 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      نشط
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-gray-600 text-sm">
                      <Clock className="w-4 h-4" />
                      بانتظار البلاغات
                    </div>
                  )}
                </div>
                <div className="w-12 h-12 bg-pastel-blue rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">البلاغات المحلولة</p>
                  <p className="text-2xl">{resolvedReports}</p>
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    {resolutionRate}% نسبة الحل
                  </div>
                </div>
                <div className="w-12 h-12 bg-pastel-green rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">البلاغات المعلقة</p>
                  <p className="text-2xl">{pendingReports}</p>
                  <div className="flex items-center gap-1 text-orange-600 text-sm">
                    <Clock className="w-4 h-4" />
                    قيد المعالجة
                  </div>
                </div>
                <div className="w-12 h-12 bg-pastel-orange rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">معدل الأداء</p>
                  <p className="text-2xl">{resolutionRate}%</p>
                  <div className="flex items-center gap-1 text-blue-600 text-sm">
                    <Target className="w-4 h-4" />
                    كفاءة الحل
                  </div>
                </div>
                <div className="w-12 h-12 bg-pastel-purple rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        {totalReports > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Issue Types Distribution */}
            {issueTypeData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>توزيع أنواع المشاكل</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={issueTypeData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {issueTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Monthly Trends */}
            {monthlyData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>الاتجاهات الشهرية</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="reports" 
                        stroke="#4f9cba" 
                        name="البلاغات الواردة"
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="resolved" 
                        stroke="#b8e6b8" 
                        name="البلاغات المحلولة"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <BarChart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg mb-2">لا توجد بيانات إحصائية بعد</h3>
              <p className="text-muted-foreground">
                ستظهر الإحصائيات والمخططات بعد استلام البلاغات الأولى من المواطنين
              </p>
            </CardContent>
          </Card>
        )}

        {/* Interactive Map Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              الخريطة التفاعلية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 bg-gradient-to-br from-pastel-blue to-pastel-green rounded-lg flex items-center justify-center relative overflow-hidden">
              {/* Map Placeholder */}
              <div className="text-center">
                <MapPin className="w-16 h-16 text-primary mx-auto mb-4" />
                <h3 className="text-lg mb-2">خريطة توزيع البلاغات</h3>
                <p className="text-muted-foreground max-w-md">
                  تظهر هذه الخريطة التفاعلية توزيع البلاغات جغرافياً عبر مختلف مناطق الجزائر
                </p>
                {totalReports === 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    ستظهر نقاط البيانات عند توفر البلاغات
                  </p>
                )}
              </div>
              
              {/* Mock Map Points - only show if there are reports */}
              {totalReports > 0 && (
                <>
                  <div className="absolute top-20 left-32 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="absolute top-40 right-28 w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                  <div className="absolute bottom-32 left-24 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="absolute bottom-20 right-32 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                </>
              )}
            </div>
            
            {/* Map Legend */}
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>عالي الأولوية</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>متوسط الأولوية</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>تم الحل</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>قيد المعالجة</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-pastel-green rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg mb-2">معدل الحل</h3>
              <p className="text-3xl mb-2">{resolutionRate}%</p>
              <p className="text-sm text-muted-foreground">من البلاغات تم حلها بنجاح</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-pastel-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg mb-2">المواطنون النشطون</h3>
              <p className="text-3xl mb-2">{totalReports}</p>
              <p className="text-sm text-muted-foreground">بلاغ تم استلامه</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-pastel-orange rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg mb-2">حالة النظام</h3>
              <p className="text-3xl mb-2">{totalReports > 0 ? 'نشط' : 'جاهز'}</p>
              <p className="text-sm text-muted-foreground">
                {totalReports > 0 ? 'يستقبل البلاغات' : 'في انتظار البلاغات'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}