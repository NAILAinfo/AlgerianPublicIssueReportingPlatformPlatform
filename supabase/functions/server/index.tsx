import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { cors } from 'https://deno.land/x/hono@v3.12.11/middleware.ts'
import { Hono } from 'https://deno.land/x/hono@v3.12.11/mod.ts'
import { logger } from 'https://deno.land/x/hono@v3.12.11/middleware.ts'

const app = new Hono()

// Middleware
app.use('*', logger(console.log))
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// Initialize database tables and storage
async function initializeDatabase() {
  console.log('🔄 Initializing database...')
  
  // Create storage buckets for report photos
  const bucketName = 'make-5213e6b1-report-photos'
  const { data: buckets } = await supabase.storage.listBuckets()
  const bucketExists = buckets?.some(bucket => bucket.name === bucketName)
  
  if (!bucketExists) {
    const { error } = await supabase.storage.createBucket(bucketName, {
      public: false,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
    })
    if (error) console.error('❌ Error creating bucket:', error)
    else console.log('✅ Created storage bucket:', bucketName)
  }
  
  console.log('✅ Database initialized')
}

// Initialize on startup
await initializeDatabase()

// Auth Routes
app.post('/make-server-5213e6b1/auth/signup', async (c) => {
  try {
    const { email, password, name, municipality, phone, idCard } = await c.req.json()
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name, 
        municipality, 
        phone, 
        idCard,
        role: 'admin'
      },
      email_confirm: true // Auto-confirm since email server isn't configured
    })
    
    if (error) {
      console.error('❌ Signup error:', error)
      return c.json({ error: error.message }, 400)
    }
    
    // Store additional user data in KV store
    const { set } = await import('./kv_store.tsx')
    await set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      municipality,
      phone,
      idCard,
      role: 'admin',
      createdAt: new Date().toISOString()
    })
    
    console.log('✅ User created successfully:', email)
    return c.json({ 
      user: { 
        id: data.user.id, 
        email, 
        name, 
        municipality, 
        role: 'admin' 
      } 
    })
  } catch (error) {
    console.error('❌ Signup error:', error)
    return c.json({ error: 'خطأ في إنشاء الحساب' }, 500)
  }
})

app.post('/make-server-5213e6b1/auth/signin', async (c) => {
  try {
    const { email, password } = await c.req.json()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      console.error('❌ Signin error:', error)
      return c.json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }, 401)
    }
    
    // Get user data from KV store
    const { get } = await import('./kv_store.tsx')
    const userData = await get(`user:${data.user.id}`)
    
    console.log('✅ User signed in successfully:', email)
    return c.json({ 
      user: userData || {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || 'مستخدم',
        municipality: data.user.user_metadata?.municipality || 'غير محدد',
        role: 'admin'
      },
      access_token: data.session.access_token 
    })
  } catch (error) {
    console.error('❌ Signin error:', error)
    return c.json({ error: 'خطأ في تسجيل الدخول' }, 500)
  }
})

// Reports Routes
app.post('/make-server-5213e6b1/reports', async (c) => {
  try {
    const formData = await c.req.formData()
    const reportData = JSON.parse(formData.get('data') as string)
    const photos = formData.getAll('photos') as File[]
    
    const { type, description, location, reporterName, reporterId } = reportData
    
    // Generate unique report ID
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Upload photos to storage
    const photoUrls = []
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i]
      if (photo && photo.size > 0) {
        const fileName = `${reportId}_photo_${i + 1}_${Date.now()}.${photo.name.split('.').pop()}`
        
        const { data, error } = await supabase.storage
          .from('make-5213e6b1-report-photos')
          .upload(fileName, photo, {
            contentType: photo.type,
            upsert: false
          })
        
        if (error) {
          console.error('❌ Photo upload error:', error)
        } else {
          // Get signed URL for the photo
          const { data: signedUrlData } = await supabase.storage
            .from('make-5213e6b1-report-photos')
            .createSignedUrl(fileName, 60 * 60 * 24 * 365) // 1 year
          
          if (signedUrlData) {
            photoUrls.push(signedUrlData.signedUrl)
          }
        }
      }
    }
    
    // Store report in KV store
    const { set } = await import('./kv_store.tsx')
    const report = {
      id: reportId,
      type,
      description,
      location,
      reporterName,
      reporterId,
      photos: photoUrls,
      status: 'new',
      priority: 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    await set(`report:${reportId}`, report)
    
    console.log('✅ Report created successfully:', reportId)
    return c.json({ reportId, message: 'تم إرسال البلاغ بنجاح' })
  } catch (error) {
    console.error('❌ Report creation error:', error)
    return c.json({ error: 'خطأ في إرسال البلاغ' }, 500)
  }
})

app.get('/make-server-5213e6b1/reports', async (c) => {
  try {
    // Check authentication for admin
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (accessToken) {
      const { data: { user }, error } = await supabase.auth.getUser(accessToken)
      if (!user?.id) {
        return c.json({ error: 'غير مصرح' }, 401)
      }
    }
    
    // Get all reports from KV store
    const { getByPrefix } = await import('./kv_store.tsx')
    const reports = await getByPrefix('report:')
    
    // Sort by creation date (newest first)
    const sortedReports = reports.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    
    console.log('✅ Retrieved reports:', sortedReports.length)
    return c.json({ reports: sortedReports })
  } catch (error) {
    console.error('❌ Reports retrieval error:', error)
    return c.json({ error: 'خطأ في جلب البلاغات' }, 500)
  }
})

app.put('/make-server-5213e6b1/reports/:id/status', async (c) => {
  try {
    // Check authentication
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (!user?.id) {
      return c.json({ error: 'غير مصرح' }, 401)
    }
    
    const reportId = c.req.param('id')
    const { status } = await c.req.json()
    
    // Get current report
    const { get, set } = await import('./kv_store.tsx')
    const report = await get(`report:${reportId}`)
    
    if (!report) {
      return c.json({ error: 'البلاغ غير موجود' }, 404)
    }
    
    // Update status
    const updatedReport = {
      ...report,
      status,
      updatedAt: new Date().toISOString()
    }
    
    await set(`report:${reportId}`, updatedReport)
    
    console.log('✅ Report status updated:', reportId, status)
    return c.json({ message: 'تم تحديث حالة البلاغ', report: updatedReport })
  } catch (error) {
    console.error('❌ Status update error:', error)
    return c.json({ error: 'خطأ في تحديث البلاغ' }, 500)
  }
})

// Statistics Route (Public)
app.get('/make-server-5213e6b1/statistics', async (c) => {
  try {
    const { getByPrefix } = await import('./kv_store.tsx')
    const reports = await getByPrefix('report:')
    
    // Calculate statistics
    const totalReports = reports.length
    const resolvedReports = reports.filter(r => r.status === 'resolved').length
    const pendingReports = reports.filter(r => r.status === 'new' || r.status === 'in-progress').length
    
    // Group by type
    const issueTypes = reports.reduce((acc, report) => {
      acc[report.type] = (acc[report.type] || 0) + 1
      return acc
    }, {})
    
    // Group by month
    const monthlyData = reports.reduce((acc, report) => {
      const month = new Date(report.createdAt).toISOString().substring(0, 7) // YYYY-MM
      if (!acc[month]) {
        acc[month] = { total: 0, resolved: 0 }
      }
      acc[month].total++
      if (report.status === 'resolved') {
        acc[month].resolved++
      }
      return acc
    }, {})
    
    const statistics = {
      totalReports,
      resolvedReports,
      pendingReports,
      resolutionRate: totalReports > 0 ? ((resolvedReports / totalReports) * 100).toFixed(1) : 0,
      issueTypes,
      monthlyData,
      lastUpdated: new Date().toISOString()
    }
    
    console.log('✅ Statistics calculated:', statistics)
    return c.json({ statistics })
  } catch (error) {
    console.error('❌ Statistics error:', error)
    return c.json({ error: 'خطأ في جلب الإحصائيات' }, 500)
  }
})

// Health check
app.get('/make-server-5213e6b1/health', (c) => {
  return c.json({ status: 'healthy', message: 'بلغني API يعمل بنجاح' })
})

// Error handler
app.onError((err, c) => {
  console.error('❌ Server error:', err)
  return c.json({ error: 'خطأ في الخادم' }, 500)
})

serve(app.fetch)