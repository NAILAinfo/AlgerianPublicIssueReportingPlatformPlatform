// Mock Supabase client for demo purposes
// In a real implementation, this would use actual Supabase

// Mock data storage
let mockReports = [
  {
    id: 'report_1',
    type: 'streetlight',
    description: 'عمود إنارة لا يعمل في شارع الاستقلال',
    location: 'شارع الاستقلال، الجزائر العاصمة',
    reporterName: 'أحمد بن علي',
    reporterId: '123456789012345',
    photos: [],
    status: 'new',
    priority: 'high',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'report_2',
    type: 'pothole',
    description: 'حفرة كبيرة في الطريق تشكل خطراً على السيارات',
    location: 'طريق هواري بومدين، وهران',
    reporterName: 'فاطمة محمد',
    reporterId: '987654321098765',
    photos: [],
    status: 'in-progress',
    priority: 'high',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'report_3',
    type: 'water',
    description: 'تسريب مياه من الأنبوب الرئيسي',
    location: 'حي بن عكنون، الجزائر العاصمة',
    reporterName: 'محمد الطاهر',
    reporterId: '456789123456789',
    photos: [],
    status: 'resolved',
    priority: 'medium',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  }
];

// Mock API functions
export async function mockSubmitReport(reportData) {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const photoUrls = reportData.photos.map((_, index) => 
    `https://mock-storage.example.com/${reportId}_photo_${index + 1}.jpg`
  );
  
  const newReport = {
    id: reportId,
    type: reportData.type,
    description: reportData.description,
    location: reportData.location,
    reporterName: reportData.reporterName,
    reporterId: reportData.reporterId,
    photos: photoUrls,
    status: 'new',
    priority: 'medium',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  mockReports.unshift(newReport);
  
  console.log('✅ Mock report submitted:', newReport);
  
  return {
    reportId,
    message: 'تم إرسال البلاغ بنجاح'
  };
}

export async function mockGetReports() {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('✅ Mock reports fetched:', mockReports.length);
  
  return {
    reports: [...mockReports]
  };
}

export async function mockUpdateReportStatus(reportId, status) {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const reportIndex = mockReports.findIndex(r => r.id === reportId);
  if (reportIndex === -1) {
    throw new Error('البلاغ غير موجود');
  }
  
  mockReports[reportIndex] = {
    ...mockReports[reportIndex],
    status,
    updatedAt: new Date().toISOString()
  };
  
  console.log('✅ Mock report status updated:', reportId, status);
  
  return {
    message: 'تم تحديث حالة البلاغ',
    report: mockReports[reportIndex]
  };
}

export async function mockGetStatistics() {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const totalReports = mockReports.length;
  const resolvedReports = mockReports.filter(r => r.status === 'resolved').length;
  const pendingReports = mockReports.filter(r => r.status === 'new' || r.status === 'in-progress').length;
  
  const issueTypes = {};
  mockReports.forEach(report => {
    issueTypes[report.type] = (issueTypes[report.type] || 0) + 1;
  });
  
  const monthlyData = {};
  mockReports.forEach(report => {
    const month = report.createdAt.substring(0, 7);
    if (!monthlyData[month]) {
      monthlyData[month] = { total: 0, resolved: 0 };
    }
    monthlyData[month].total++;
    if (report.status === 'resolved') {
      monthlyData[month].resolved++;
    }
  });
  
  const statistics = {
    totalReports,
    resolvedReports,
    pendingReports,
    resolutionRate: totalReports > 0 ? ((resolvedReports / totalReports) * 100).toFixed(1) : '0',
    issueTypes,
    monthlyData,
    lastUpdated: new Date().toISOString()
  };
  
  console.log('✅ Mock statistics calculated:', statistics);
  
  return { statistics };
}

export const apiClient = {
  submitReport: mockSubmitReport,
  getReports: mockGetReports,
  updateReportStatus: mockUpdateReportStatus,
  getStatistics: mockGetStatistics
};

export function getAuthToken() {
  return localStorage.getItem('access_token');
}

export function setAuthToken(token) {
  localStorage.setItem('access_token', token);
}

export function removeAuthToken() {
  localStorage.removeItem('access_token');
}

export function isAuthenticated() {
  return !!getAuthToken();
}