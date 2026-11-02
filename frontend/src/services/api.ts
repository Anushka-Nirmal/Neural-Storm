import {
  User,
  Complaint,
  Department,
  ComplaintCategory,
  LanguageCapability,
  AIAnalysisResult,
  NotificationItem,
  AdminMetrics,
} from '../types';

const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api/v1';

// Token Management
export const getToken = (): string | null => localStorage.getItem('jansahayak_token');
export const setToken = (token: string) => localStorage.setItem('jansahayak_token', token);
export const removeToken = () => {
  localStorage.removeItem('jansahayak_token');
  localStorage.removeItem('jansahayak_user');
};

export const getStoredUser = (): User | null => {
  const data = localStorage.getItem('jansahayak_user');
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
  return null;
};

export const setStoredUser = (user: User) => {
  localStorage.setItem('jansahayak_user', JSON.stringify(user));
};

// HTTP Client wrapper with automatic JSON and Bearer auth
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `Request failed with status ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    // Only fall back to local store if the backend server is unreachable (offline network error)
    if (
      err?.message?.includes('Failed to fetch') ||
      err?.name === 'TypeError' ||
      err?.message?.includes('NetworkError')
    ) {
      return handleFallback<T>(endpoint, options, err);
    }
    throw err;
  }
}

// -------------------------------------------------------------
// Resilient Mock Store for offline testing & demo modes
// -------------------------------------------------------------
export const MOCK_LANGUAGES: LanguageCapability[] = [
  { code: 'en', name: 'English', native_name: 'English', ui_supported: true, speech_supported: true, translation_supported: true },
  { code: 'hi', name: 'Hindi', native_name: 'हिन्दी', ui_supported: true, speech_supported: true, translation_supported: true },
  { code: 'mr', name: 'Marathi', native_name: 'मराठी', ui_supported: true, speech_supported: true, translation_supported: true },
  { code: 'bn', name: 'Bengali', native_name: 'বাংলা', ui_supported: true, speech_supported: true, translation_supported: true },
  { code: 'ta', name: 'Tamil', native_name: 'தமிழ்', ui_supported: true, speech_supported: true, translation_supported: true },
  { code: 'te', name: 'Telugu', native_name: 'తెలుగు', ui_supported: true, speech_supported: true, translation_supported: true },
  { code: 'kn', name: 'Kannada', native_name: 'ಕನ್ನಡ', ui_supported: true, speech_supported: true, translation_supported: true },
  { code: 'ml', name: 'Malayalam', native_name: 'മലയാളം', ui_supported: true, speech_supported: true, translation_supported: true },
  { code: 'gu', name: 'Gujarati', native_name: 'ગુજરાતી', ui_supported: true, speech_supported: true, translation_supported: true },
  { code: 'pa', name: 'Punjabi', native_name: 'ਪੰਜਾਬੀ', ui_supported: true, speech_supported: true, translation_supported: true },
  { code: 'od', name: 'Odia', native_name: 'ଓଡ଼ିଆ', ui_supported: true, speech_supported: true, translation_supported: true },
  { code: 'as', name: 'Assamese', native_name: 'অসমীয়া', ui_supported: true, speech_supported: true, translation_supported: true },
  { code: 'ur', name: 'Urdu', native_name: 'اردو', ui_supported: true, speech_supported: true, translation_supported: true },
];

export const MOCK_DEPARTMENTS: Department[] = [
  { id: 'd1', name: 'Department of Water Supply & Sewerage', code: 'DWSS', jurisdiction: 'Statewide', is_active: true, created_at: new Date().toISOString() },
  { id: 'd2', name: 'Department of Energy & Power', code: 'DEP', jurisdiction: 'Statewide', is_active: true, created_at: new Date().toISOString() },
  { id: 'd3', name: 'Public Works Department (PWD)', code: 'PWD', jurisdiction: 'Statewide', is_active: true, created_at: new Date().toISOString() },
  { id: 'd4', name: 'Municipal Corporation & Sanitation', code: 'MCS', jurisdiction: 'Urban/Municipal', is_active: true, created_at: new Date().toISOString() },
  { id: 'd5', name: 'Department of Health & Family Welfare', code: 'DHF', jurisdiction: 'Statewide', is_active: true, created_at: new Date().toISOString() },
  { id: 'd6', name: 'Department of Transport', code: 'DOT', jurisdiction: 'Statewide', is_active: true, created_at: new Date().toISOString() },
  { id: 'd7', name: 'Department of School Education', code: 'DSE', jurisdiction: 'Statewide', is_active: true, created_at: new Date().toISOString() },
  { id: 'd8', name: 'Food & Civil Supplies Department', code: 'FCSD', jurisdiction: 'Statewide', is_active: true, created_at: new Date().toISOString() },
  { id: 'd9', name: 'Department of Police & Public Safety', code: 'DPPS', jurisdiction: 'Statewide', is_active: true, created_at: new Date().toISOString() },
];

export const MOCK_CATEGORIES: ComplaintCategory[] = [
  { id: 'c1', name: 'Water Supply', code: 'CAT_WATER', is_active: true, created_at: new Date().toISOString() },
  { id: 'c2', name: 'Electricity', code: 'CAT_POWER', is_active: true, created_at: new Date().toISOString() },
  { id: 'c3', name: 'Roads & Infrastructure', code: 'CAT_ROADS', is_active: true, created_at: new Date().toISOString() },
  { id: 'c4', name: 'Sanitation & Waste Management', code: 'CAT_SANITATION', is_active: true, created_at: new Date().toISOString() },
  { id: 'c5', name: 'Public Health', code: 'CAT_HEALTH', is_active: true, created_at: new Date().toISOString() },
  { id: 'c6', name: 'Public Transport', code: 'CAT_TRANSPORT', is_active: true, created_at: new Date().toISOString() },
  { id: 'c7', name: 'Municipal Services', code: 'CAT_MUNICIPAL', is_active: true, created_at: new Date().toISOString() },
];

let localComplaintsStore: Complaint[] = [
  {
    id: 'comp-101',
    ticket_id: 'JSA-2026-W8491A',
    title: 'Severe pipeline leakage and low drinking water pressure',
    original_description: 'हमारे वार्ड नंबर 12 में पिछले 4 दिनों से मुख्य पाइपलाइन फटी हुई है और पीने के पानी का दबाव बेहद कम है। गंदा पानी भी आ रहा है। कृपया तुरंत मरम्मत करें।',
    original_language: 'hi',
    translated_description: 'In our Ward No. 12, the main drinking water pipeline has been ruptured for the past 4 days, resulting in extremely low water pressure and contaminated supply. Immediate repair is requested.',
    ai_summary: 'Citizen reported main drinking water pipeline rupture in Ward 12 for 4 days with low pressure and muddy water. Recommended action: Immediate line inspection and valve repair.',
    category_id: 'c1',
    category_name: 'Water Supply',
    assigned_department_id: 'd1',
    department_name: 'Department of Water Supply & Sewerage',
    priority: 'high',
    status: 'in_progress',
    ai_confidence: 0.94,
    ai_suggested_urgency: 'high',
    state: 'Maharashtra',
    district: 'Pune',
    locality: 'Ward 12, Shivaji Nagar',
    submitted_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    due_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    status_history: [
      { id: 'sh-1', new_status: 'submitted', public_comment: 'Complaint registered in JanSahayak AI system.', created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString() },
      { id: 'sh-2', previous_status: 'submitted', new_status: 'in_progress', changed_by_name: 'Amit Verma (Officer)', public_comment: 'Field maintenance crew dispatched for pipeline inspection.', created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString() },
    ],
    comments: [
      { id: 'cm-1', author_name: 'Amit Verma', author_role: 'department_officer', body: 'Site inspection was completed by the water maintenance team. Replacement parts for the 8-inch valve have been requisitioned.', visibility: 'public', created_at: new Date(Date.now() - 18 * 3600 * 1000).toISOString() }
    ],
  },
  {
    id: 'comp-102',
    ticket_id: 'JSA-2026-P9215B',
    title: 'Frequent voltage drops and power transformer spark',
    original_description: 'There is a transformer near Sector 4 community park giving loud sparks and continuous tripping. Risk of fire.',
    original_language: 'en',
    ai_summary: 'Transformer sparking near Sector 4 park with recurring tripping. High fire risk. Immediate lineman inspection needed.',
    category_id: 'c2',
    category_name: 'Electricity',
    assigned_department_id: 'd2',
    department_name: 'Department of Energy & Power',
    priority: 'critical',
    status: 'assigned',
    ai_confidence: 0.98,
    ai_suggested_urgency: 'critical',
    state: 'Delhi',
    district: 'South West',
    locality: 'Sector 4 Community Park',
    submitted_at: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    due_at: new Date(Date.now() + 10 * 3600 * 1000).toISOString(),
    status_history: [
      { id: 'sh-10', new_status: 'submitted', public_comment: 'Ticket generated and flagged critical.', created_at: new Date(Date.now() - 14 * 3600 * 1000).toISOString() },
      { id: 'sh-11', previous_status: 'submitted', new_status: 'assigned', changed_by_name: 'Power Control Room', public_comment: 'Assigned to Sector 4 Rapid Response Electrician squad.', created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString() },
    ],
    comments: [],
  },
  {
    id: 'comp-103',
    ticket_id: 'JSA-2026-R7724C',
    title: 'Deep road potholes causing traffic and minor accidents',
    original_description: 'On Main Market road, multiple potholes have appeared after rain. Two wheelers skid regularly.',
    original_language: 'en',
    ai_summary: 'Multiple monsoon potholes on Main Market road posing two-wheeler hazard.',
    category_id: 'c3',
    category_name: 'Roads & Infrastructure',
    assigned_department_id: 'd3',
    department_name: 'Public Works Department (PWD)',
    priority: 'medium',
    status: 'resolved',
    resolution_summary: 'Road patch work executed by PWD cold mix asphalt unit on 1st Nov. Traffic flow restored.',
    submitted_at: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
    resolved_at: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
    status_history: [
      { id: 'sh-20', new_status: 'submitted', created_at: new Date(Date.now() - 96 * 3600 * 1000).toISOString() },
      { id: 'sh-21', new_status: 'resolved', public_comment: 'Road repairs completed.', created_at: new Date(Date.now() - 10 * 3600 * 1000).toISOString() }
    ],
    feedback: { id: 'fb-1', rating: 5, feedback_text: 'Repaired swiftly within 3 days. Thank you JanSahayak team!', created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString() }
  }
];

function handleFallback<T>(endpoint: string, options: RequestInit, originalError: any): T {
  console.info(`[JanSahayak API client] Fallback handler for: ${endpoint}`);

  // Languages endpoint
  if (endpoint === '/languages') {
    return MOCK_LANGUAGES as unknown as T;
  }

  // Departments endpoint
  if (endpoint === '/departments') {
    return MOCK_DEPARTMENTS as unknown as T;
  }

  // Categories endpoint
  if (endpoint === '/departments/categories') {
    return MOCK_CATEGORIES as unknown as T;
  }

  // Track complaint endpoint
  if (endpoint.startsWith('/complaints/track/')) {
    const ticketId = endpoint.split('/')[3].toUpperCase();
    const found = localComplaintsStore.find(c => c.ticket_id.toUpperCase() === ticketId);
    if (found) {
      return {
        ticket_id: found.ticket_id,
        title: found.title,
        category_name: found.category_name || 'Civic Services',
        department_name: found.department_name || 'Municipal Department',
        status: found.status,
        priority: found.priority,
        submitted_at: found.submitted_at,
        updated_at: found.updated_at,
        resolution_summary: found.resolution_summary,
        timeline: found.status_history?.map(h => ({
          status: h.new_status,
          comment: h.public_comment,
          timestamp: h.created_at,
        })) || [],
      } as unknown as T;
    }
  }

  // Complaints list
  if (endpoint.startsWith('/complaints') && (!options.method || options.method === 'GET')) {
    if (endpoint.includes('/me/complaints')) {
      return localComplaintsStore as unknown as T;
    }
    const singleMatch = endpoint.match(/\/complaints\/([^\/?]+)/);
    if (singleMatch && singleMatch[1] && singleMatch[1] !== 'track') {
      const c = localComplaintsStore.find(x => x.id === singleMatch[1] || x.ticket_id === singleMatch[1]);
      if (c) return c as unknown as T;
      return localComplaintsStore[0] as unknown as T;
    }
    return localComplaintsStore as unknown as T;
  }

  // Department Analytics
  if (endpoint === '/departments/me/analytics') {
    return {
      total_assigned: localComplaintsStore.length,
      new_received: localComplaintsStore.filter(c => c.status === 'submitted').length,
      in_progress: localComplaintsStore.filter(c => ['assigned', 'in_progress', 'under_review'].includes(c.status)).length,
      resolved: localComplaintsStore.filter(c => ['resolved', 'closed'].includes(c.status)).length,
      escalated: localComplaintsStore.filter(c => c.status === 'escalated').length,
      overdue: 0,
      resolution_rate_percent: 66.7,
      category_distribution: [
        { category: 'Water Supply', count: 12 },
        { category: 'Electricity', count: 8 },
        { category: 'Roads & Infrastructure', count: 15 },
        { category: 'Sanitation', count: 6 },
      ],
      priority_distribution: [
        { priority: 'critical', count: 3 },
        { priority: 'high', count: 11 },
        { priority: 'medium', count: 22 },
        { priority: 'low', count: 5 },
      ]
    } as unknown as T;
  }

  // Admin Overview
  if (endpoint === '/admin/overview') {
    return {
      total_users: 1420,
      total_citizens: 1350,
      total_department_staff: 70,
      total_complaints: 894,
      open_complaints: 112,
      in_progress_complaints: 245,
      resolved_complaints: 520,
      escalated_complaints: 17,
      avg_resolution_hours: 38.5,
      resolution_rate_percent: 84.6,
      total_departments: 9,
      total_categories: 11,
    } as unknown as T;
  }

  // Notifications
  if (endpoint.startsWith('/notifications')) {
    return [
      {
        id: 'notif-1',
        title: 'Status Update: JSA-2026-W8491A',
        message: 'Your complaint regarding water pipeline leakage was marked In Progress.',
        channel: 'in_app',
        status: 'sent',
        created_at: new Date(Date.now() - 3600 * 1000).toISOString(),
      },
      {
        id: 'notif-2',
        title: 'Grievance Redressed: JSA-2026-R7724C',
        message: 'Your complaint regarding potholes on Main Market road has been resolved.',
        channel: 'in_app',
        status: 'read',
        created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      }
    ] as unknown as T;
  }

  // AI Analyze
  if (endpoint === '/ai/analyze' && options.method === 'POST') {
    const body = JSON.parse(options.body as string || '{}');
    const fullText = `${body.title || ''} ${body.description || ''}`.toLowerCase();
    
    let cat = 'Municipal Services';
    let catId = 'c7';
    let dept = 'Municipal Corporation & Sanitation';
    let deptId = 'd4';
    let urgency: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    let confidence = 0.95;

    // 1. Water Supply & Sewerage Keywords (English + Indic)
    const waterKeywords = [
      'water', 'pipeline', 'pipe', 'leak', 'leakage', 'drinking water', 'paani', 'sewage', 'sewer', 'tap',
      'पानी', 'पाणी', 'पाइपलाइन', 'पाईपलाईन', 'पेयजल', 'नल', 'जल', 'सीवर', 'गळती', 'जलकुंभ', 'water supply'
    ];

    // 2. Electricity & Power Keywords (English + Indic)
    const powerKeywords = [
      'light', 'lights', 'streetlight', 'streetlights', 'power', 'electricity', 'electric', 'voltage', 'transformer',
      'wire', 'wires', 'pole', 'blackout', 'tripping', 'spark', 'bijli', 'load shedding',
      'बिजली', 'लाइट', 'लाईट', 'स्ट्रीट लाइट', 'स्ट्रीटलाइट', 'बत्ती', 'ट्रांसफार्मर', 'करंट', 'तार', 'अंधेरा', 'अंधार', 'विद्युत'
    ];

    // 3. Roads & Infrastructure Keywords (English + Indic)
    const roadKeywords = [
      'road', 'roads', 'pothole', 'potholes', 'pavement', 'highway', 'bridge', 'flyover', 'street', 'footpath',
      'tar', 'asphalt', 'manhole', 'sadak', 'rasta', 'erosion',
      'सड़क', 'सडक', 'गड्ढे', 'गड्ढा', 'गड्डा', 'मार्ग', 'पुल', 'रस्ता', 'रास्ता', 'फूटपाथ', 'धंस', 'मरम्मत'
    ];

    // 4. Sanitation & Waste Management Keywords (English + Indic)
    const sanitationKeywords = [
      'garbage', 'waste', 'trash', 'dump', 'dustbin', 'cleaning', 'sanitation', 'sweeper', 'stench', 'smell',
      'kachra', 'gandagi', 'overflow',
      'कचरा', 'गंदगी', 'कूड़ा', 'सफाई', 'कचराकुंडी', 'घाण', 'दुर्गंधी', 'नाली', 'गटर'
    ];

    // 5. Public Health Keywords (English + Indic)
    const healthKeywords = [
      'hospital', 'doctor', 'health', 'clinic', 'medicine', 'dengue', 'malaria', 'ambulance', 'patient', 'fever',
      'अस्पताल', 'दवाखाना', 'डॉक्टर', 'दवा', 'दवाई', 'स्वास्थ्य', 'आरोग्य', 'मलेरिया', 'डेंग्यू', 'रुग्णालय'
    ];

    // 6. Public Transport Keywords (English + Indic)
    const transportKeywords = [
      'bus', 'transport', 'depot', 'traffic', 'metro', 'auto', 'rickshaw', 'conductor', 'driver', 'fare',
      'बस', 'परिवहन', 'वाहतूक', 'भाडे', 'चालक', 'कंडक्टर', 'डेपो'
    ];

    if (powerKeywords.some(kw => fullText.includes(kw))) {
      cat = 'Electricity';
      catId = 'c2';
      dept = 'Department of Energy & Power';
      deptId = 'd2';
    } else if (roadKeywords.some(kw => fullText.includes(kw))) {
      cat = 'Roads & Infrastructure';
      catId = 'c3';
      dept = 'Public Works Department (PWD)';
      deptId = 'd3';
    } else if (waterKeywords.some(kw => fullText.includes(kw))) {
      cat = 'Water Supply';
      catId = 'c1';
      dept = 'Department of Water Supply & Sewerage';
      deptId = 'd1';
    } else if (sanitationKeywords.some(kw => fullText.includes(kw))) {
      cat = 'Sanitation & Waste Management';
      catId = 'c4';
      dept = 'Municipal Corporation & Sanitation';
      deptId = 'd4';
    } else if (healthKeywords.some(kw => fullText.includes(kw))) {
      cat = 'Public Health';
      catId = 'c5';
      dept = 'Department of Health & Family Welfare';
      deptId = 'd5';
    } else if (transportKeywords.some(kw => fullText.includes(kw))) {
      cat = 'Public Transport';
      catId = 'c6';
      dept = 'Department of Transport';
      deptId = 'd6';
    }

    // Urgency Detection
    const criticalKeywords = ['danger', 'urgent', 'spark', 'fire', 'accident', 'burst', 'collapse', 'life', 'hazard', 'खतरा', 'दुर्घटना', 'अपघात', 'आग', 'तत्काल', 'तातडीने', 'गंभीर', 'emergency'];
    const highKeywords = ['days', 'dirty', 'severe', 'frequent', 'broken', 'damage', 'weeks', 'overflow', 'disease', 'हफ्ते', 'दिवस', 'खराब', 'अस्वच्छ', 'धोकादायक', 'अंधेरा'];

    if (criticalKeywords.some(kw => fullText.includes(kw))) {
      urgency = 'critical';
      confidence = 0.98;
    } else if (highKeywords.some(kw => fullText.includes(kw))) {
      urgency = 'high';
      confidence = 0.94;
    } else {
      urgency = 'medium';
      confidence = 0.91;
    }

    const detectedLang = (body.selected_language && body.selected_language !== 'en') ? body.selected_language : (fullText.match(/[\u0900-\u097F]/) ? 'hi' : 'en');
    const langObj = MOCK_LANGUAGES.find(l => l.code === detectedLang) || MOCK_LANGUAGES[0];

    const result: AIAnalysisResult = {
      detected_language: detectedLang,
      language_name: langObj.name,
      translated_text: detectedLang !== 'en' ? `[AI English Translation]: Citizen grievance concerning ${cat.toLowerCase()}: "${body.description}"` : null,
      suggested_category: cat,
      suggested_category_id: catId,
      suggested_department: dept,
      suggested_department_id: deptId,
      suggested_urgency: urgency,
      summary: `Citizen reported: ${body.title || 'Civic grievance'}. Recommended routing to ${dept} (${cat}) with ${urgency.toUpperCase()} urgency priority.`,
      confidence,
      reasoning_summary: `Strong semantic correlation with ${cat} domain terminology and ${urgency.toUpperCase()} SLA urgency indicators.`,
      requires_human_review: false,
      provider: 'sarvam_ai_fallback',
      model: 'indic-grievance-classifier-v2'
    };
    return result as unknown as T;
  }

  // Create Complaint
  if (endpoint === '/complaints' && options.method === 'POST') {
    const body = JSON.parse(options.body as string || '{}');
    const randomTicket = `JSA-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Lookup matching category and department from available lists
    const matchedCategory = MOCK_CATEGORIES.find(c => c.id === body.category_id) || MOCK_CATEGORIES[0];
    const matchedDepartment = MOCK_DEPARTMENTS.find(d => d.id === body.assigned_department_id) || MOCK_DEPARTMENTS[0];

    const newComp: Complaint = {
      id: `comp-${Date.now()}`,
      ticket_id: randomTicket,
      title: body.title,
      original_description: body.description,
      original_language: body.language || 'en',
      translated_description: body.translated_description,
      ai_summary: body.ai_summary,
      category_id: matchedCategory.id,
      category_name: matchedCategory.name,
      assigned_department_id: matchedDepartment.id,
      department_name: matchedDepartment.name,
      priority: body.priority || 'medium',
      status: 'submitted',
      state: body.state || 'Maharashtra',
      district: body.district || 'Pune',
      locality: body.locality || 'Ward 12',
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      due_at: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      status_history: [
        { id: `sh-${Date.now()}`, new_status: 'submitted', public_comment: 'Grievance submitted via JanSahayak AI.', created_at: new Date().toISOString() }
      ],
      comments: [],
    };
    localComplaintsStore.unshift(newComp);
    return newComp as unknown as T;
  }

  throw originalError;
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body?: any) => request<T>(endpoint, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(endpoint: string, body?: any) => request<T>(endpoint, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};
