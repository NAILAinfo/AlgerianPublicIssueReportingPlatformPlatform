import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import {
  Search,
  Filter,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Car,
  Droplets,
  Trash2,
  TreePine,
  Construction,
  Building,
  AlertTriangle,
  MapPin,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { apiClient } from "../utils/supabase/client.jsx";

const issueIcons = {
  streetlight: Lightbulb,
  pothole: Construction,
  water: Droplets,
  waste: Trash2,
  parking: Car,
  trees: TreePine,
  building: Building,
  other: AlertTriangle,
};

const issueNames = {
  streetlight: "إنارة عامة",
  pothole: "حفر في الطريق",
  water: "تسريب مياه",
  waste: "مخلفات",
  parking: "مواقف السيارات",
  trees: "الأشجار والحدائق",
  building: "مباني عامة",
  other: "أخرى",
};

const statusNames = {
  new: "جديد",
  "in-progress": "قيد المعالجة",
  resolved: "تم الحل",
};

const priorityNames = {
  low: "منخفض",
  medium: "متوسط",
  high: "عالي",
};

export function AdminDashboard({ currentUser }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await apiClient.getReports();
      setReports(response.reports || []);
      console.log('✅ Reports loaded:', response.reports?.length || 0);
    } catch (error) {
      console.error('❌ Failed to fetch reports:', error);
      setError(error.message || 'فشل في جلب البلاغات');
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reporterName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    const matchesType = typeFilter === "all" || report.type === typeFilter;
    const matchesPriority = priorityFilter === "all" || report.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  const updateReportStatus = async (reportId, newStatus) => {
    try {
      await apiClient.updateReportStatus(reportId, newStatus);

      // Update local state
      setReports(reports.map((report) =>
        report.id === reportId ? { ...report, status: newStatus, updatedAt: new Date().toISOString() } : report
      ));

      console.log('✅ Status updated:', reportId, newStatus);
    } catch (error) {
      console.error('❌ Failed to update status:', error);
      setError(error.message || 'فشل في تحديث الحالة');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "new":
        return <AlertCircle className="w-4 h-4" />;
      case "in-progress":
        return <Clock className="w-4 h-4" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "new":
        return "bg-red-100 text-red-700";
      case "in-progress":
        return "bg-yellow-100 text-yellow-700";
      case "resolved":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "low":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-DZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-secondary/30 p-4 flex items-center justify-center" dir="rtl">
        <Card className="text-center p-8">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p>جاري تحميل البلاغات...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-secondary/30 p-4" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl">لوحة إدارة البلاغات</h1>
            <p className="text-muted-foreground">
              إدارة ومتابعة بلاغات المواطنين
            </p>
            {currentUser && (
              <Badge variant="secondary" className="mt-2 bg-pastel-green">
                مرحباً {currentUser.name} - {currentUser.municipality}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchReports}>
              <RefreshCw className="w-4 h-4" />
              تحديث
            </Button>
            <Badge variant="secondary" className="bg-pastel-blue">
              إجمالي البلاغات: {reports.length}
            </Badge>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-100 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              تصفية البلاغات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث في البلاغات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="حالة البلاغ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="new">جديد</SelectItem>
                  <SelectItem value="in-progress">قيد المعالجة</SelectItem>
                  <SelectItem value="resolved">تم الحل</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="نوع المشكلة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="streetlight">إنارة عامة</SelectItem>
                  <SelectItem value="pothole">حفر في الطريق</SelectItem>
                  <SelectItem value="water">تسريب مياه</SelectItem>
                  <SelectItem value="waste">مخلفات</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="الأولوية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأولويات</SelectItem>
                  <SelectItem value="high">عالي</SelectItem>
                  <SelectItem value="medium">متوسط</SelectItem>
                  <SelectItem value="low">منخفض</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.map((report) => {
            const Icon = issueIcons[report.type];
            return (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Issue Icon */}
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>

                      {/* Report Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="truncate">{report.description}</h3>
                          <Badge variant="outline" className={getPriorityColor(report.priority)}>
                            {priorityNames[report.priority]}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {report.location || 'لم يتم تحديد الموقع'}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(report.createdAt)}
                          </div>
                          {report.photos && report.photos.length > 0 && (
                            <Badge variant="secondary">{report.photos.length} صور</Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">{issueNames[report.type]}</Badge>
                          <Badge className={getStatusColor(report.status)}>
                            {getStatusIcon(report.status)}
                            {statusNames[report.status]}
                          </Badge>
                        </div>

                        {/* Reporter Information */}
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">المبلغ:</span> {report.reporterName} 
                          <span className="mx-2">•</span>
                          <span className="font-medium">رقم الهوية:</span> {report.reporterId}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>

                      <Select
                        value={report.status}
                        onValueChange={(value) => updateReportStatus(report.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">جديد</SelectItem>
                          <SelectItem value="in-progress">قيد المعالجة</SelectItem>
                          <SelectItem value="resolved">تم الحل</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredReports.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg mb-2">لا توجد بلاغات</h3>
              <p className="text-muted-foreground">
                {reports.length === 0 
                  ? 'لم يتم استلام أي بلاغات بعد' 
                  : 'لا توجد بلاغات تطابق المرشحات المحددة'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}