(function (global) {
  const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

  const servicesData = [
    {
      id: 'consular-1',
      category: 'خدمات قنصلية',
      title: 'تصديق وثيقة دراسية',
      summary: 'تصديق الوثائق الصادرة من الجهات التعليمية داخل المحافظة للاستخدام خارج البلاد.',
      contacts: [
        { label: 'البريد الإلكتروني', value: 'consulate@daraa.gov.sy' },
        { label: 'الهاتف', value: '011-222-3344' },
      ],
      flow: [
        'تقديم طلب التصديق وإرفاق صورة عن الوثيقة الأصلية.',
        'مطابقة الوثيقة مع السجلات لدى مديرية التربية.',
        'دفع الرسوم واستلام الوثيقة المختومة.'
      ],
      isOnline: true,
    },
    {
      id: 'civil-1',
      category: 'خدمات سجل النفوس',
      title: 'استصدار بيان عائلي',
      summary: 'الحصول على بيان عائلي إلكتروني معتمد للاستخدام أمام الجهات الرسمية.',
      contacts: [
        { label: 'مركز الاتصال', value: '199' },
        { label: 'البريد', value: 'civil@daraa.gov.sy' }
      ],
      flow: [
        'التحقق من بيانات الأسرة عبر الرقم الوطني.',
        'مراجعة القيود الورقية وإدخال أي تعديلات.',
        'إصدار البيان والتوقيع الإلكتروني.'
      ],
      isOnline: true,
    },
    {
      id: 'water-1',
      category: 'خدمات مؤسسة المياه',
      title: 'طلب صيانة عداد مياه',
      summary: 'تقديم طلب لصيانة أو استبدال عداد المياه في المنزل أو المنشأة.',
      contacts: [
        { label: 'الهاتف', value: '015-556677' },
        { label: 'الواتساب', value: '+963-955-123456' }
      ],
      flow: [
        'تقديم طلب الصيانة مع تحديد العنوان بالتفصيل.',
        'جدولة زيارة فريق الصيانة خلال 48 ساعة.',
        'إرسال تقرير فني وإقفال الطلب.'
      ],
      isOnline: true,
    },
    {
      id: 'property-1',
      category: 'خدمات المصالح العقارية',
      title: 'الحصول على مخطط عقاري',
      summary: 'طلب نسخة إلكترونية من المخطط العقاري وفق الإحداثيات المحددة.',
      contacts: [
        { label: 'الدعم الفني', value: 'property@daraa.gov.sy' }
      ],
      flow: [
        'إدخال بيانات العقار والقطعة والمنطقة العقارية.',
        'مراجعة البيانات من قبل الموظف المختص.',
        'إرسال نسخة إلكترونية ممهورة بختم رقمي.'
      ],
      isOnline: false,
    },
    {
      id: 'education-1',
      category: 'خدمات مديرية التربية',
      title: 'نقل طالب بين المدارس',
      summary: 'تقديم طلب نقل طالب من مدرسة إلى أخرى ضمن المحافظة.',
      contacts: [
        { label: 'خط الدعم', value: '012-778899' }
      ],
      flow: [
        'تقديم الطلب مرفقًا بالموافقة الخطية من ولي الأمر.',
        'دراسة الطاقة الاستيعابية للمدرسة المستقبِلة.',
        'إصدار قرار النقل وإشعار المدارس المعنية.'
      ],
      isOnline: true,
    },
    {
      id: 'social-1',
      category: 'خدمات الشؤون الاجتماعية والعمل',
      title: 'طلب بطاقة إعانة أسرية',
      summary: 'تسجيل الأسر ذات الدخل المحدود للحصول على بطاقة الإعانة الشهرية.',
      contacts: [
        { label: 'مركز خدمة المواطن', value: '014-445566' }
      ],
      flow: [
        'تقديم البيانات العائلية وإثبات الدخل.',
        'زيارة ميدانية للتأكد من الاستحقاق.',
        'إدراج الأسرة ضمن قوائم الدعم.'
      ],
      isOnline: true,
    },
    {
      id: 'suggestions-1',
      category: 'خدمة الاقتراحات',
      title: 'مشاركة مقترح تطويري',
      summary: 'شاركنا أفكارك لتحسين الخدمات المقدمة للمواطنين.',
      contacts: [
        { label: 'البريد', value: 'ideas@daraa.gov.sy' }
      ],
      flow: [
        'إرسال المقترح عبر المنصة أو البريد.',
        'تقييم الفكرة من قبل لجنة التحول الرقمي.',
        'إدراج المقترحات المقبولة ضمن خطة العمل.'
      ],
      isOnline: true,
    },
    {
      id: 'complaints-service',
      category: 'خدمة الشكاوى',
      title: 'متابعة الشكوى',
      summary: 'راجع حالة الشكوى المقدمة من خلال المنصة وتواصل مع فريق المتابعة.',
      contacts: [
        { label: 'الخط الساخن', value: '115' }
      ],
      flow: [
        'تقديم الشكوى وتحديد الجهة المعنية.',
        'مراجعة الشكوى وتحديد الأولوية.',
        'التواصل مع المواطن وتقديم الحل.'
      ],
      isOnline: true,
    },
    {
      id: 'requests-service',
      category: 'خدمة الطلبات',
      title: 'متابعة الطلب',
      summary: 'تابع طلباتك المقدمة عبر المنصة مع تحديثات الحالة.',
      contacts: [
        { label: 'مركز خدمة المواطن', value: '014-112233' }
      ],
      flow: [
        'تقديم الطلب مع الوثائق المطلوبة.',
        'التدقيق الفني والإداري.',
        'إشعار المواطن بالإنجاز أو طلب استكمال.'
      ],
      isOnline: true,
    },
    {
      id: 'violations-service',
      category: 'عرض مخالفات المواطن',
      title: 'الاطلاع على المخالفات وسدادها',
      summary: 'استعرض مخالفاتك المسجلة واختر المخالفة المناسبة لتسديدها إلكترونياً.',
      contacts: [
        { label: 'قسم الجباية المركزي', value: '013-224466' }
      ],
      flow: [
        'الدخول إلى حساب المواطن وعرض قائمة المخالفات.',
        'اختيار المخالفة وتحديد وسيلة السداد المناسبة.',
        'تأكيد عملية الدفع واستلام إيصال إلكتروني.'
      ],
      isOnline: true,
    },
  ];

  const users = [
    {
      id: 'u-100',
      name: 'أحمد الخطيب',
      nationalId: '0123456789',
      phone: '0955123456',
      password: 'Pass@123',
      verified: true,
    },
  ];

  const complaints = [
    {
      id: 'c-1',
      userPhone: '0955123456',
      subject: 'انقطاع مياه',
      description: 'انقطاع مياه مستمر منذ ثلاثة أيام في حي المحطة.',
      status: 'قيد المعالجة',
      updates: ['تم تسجيل الشكوى', 'تم تحويلها إلى مؤسسة المياه'],
      createdAt: '2025-01-08',
    },
  ];

  const requests = [
    {
      id: 'r-1',
      userPhone: '0955123456',
      type: 'طلب ترخيص إشغال رصيف',
      details: 'طلب وضع منصة مؤقتة أمام المحل لمدة أسبوعين.',
      status: 'بانتظار المرفقات',
      updates: ['تم استلام الطلب', 'يرجى استكمال صورة السجل التجاري'],
      createdAt: '2025-01-02',
    },
  ];

  const violations = [
    {
      id: 'v-1',
      userPhone: '0955123456',
      title: 'مخالفة مرورية',
      amount: 25000,
      status: 'غير مسددة',
      issuedAt: '2024-12-20',
    },
    {
      id: 'v-2',
      userPhone: '0955123456',
      title: 'مخالفة إشغال رصيف',
      amount: 18000,
      status: 'قيد التحصيل',
      issuedAt: '2024-11-15',
    },
  ];

  const otpStore = new Map();

  const api = {
    async fetchServiceCategories() {
      await delay();
      const categories = [...new Set(servicesData.map((service) => service.category))];
      return categories;
    },
    async fetchServicesByCategory(category) {
      await delay();
      return servicesData.filter((service) => service.category === category);
    },
    async fetchServiceById(id) {
      await delay();
      return servicesData.find((service) => service.id === id);
    },
    async login(phone, password) {
      await delay();
      const user = users.find((u) => u.phone === phone && u.password === password);
      if (!user) {
        throw new Error('بيانات الدخول غير صحيحة');
      }
      if (!user.verified) {
        throw new Error('يجب تفعيل الحساب عبر رمز التحقق المرسل');
      }
      return { ...user };
    },
    async register({ name, nationalId, phone, password }) {
      await delay();
      if (users.some((u) => u.phone === phone)) {
        throw new Error('رقم الهاتف مسجل مسبقًا');
      }
      const newUser = {
        id: `u-${Date.now()}`,
        name,
        nationalId,
        phone,
        password,
        verified: false,
      };
      users.push(newUser);
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      otpStore.set(phone, otp);
      return { message: 'تم إرسال رمز التحقق برسالة نصية', otp }; // otp للإظهار التجريبي
    },
    async verifyOtp(phone, code) {
      await delay();
      const stored = otpStore.get(phone);
      if (!stored || stored !== code) {
        throw new Error('رمز التحقق غير صحيح');
      }
      otpStore.delete(phone);
      const user = users.find((u) => u.phone === phone);
      if (user) {
        user.verified = true;
      }
      return { ...user };
    },
    async submitComplaint({ userPhone, subject, description }) {
      await delay();
      const complaint = {
        id: `c-${Date.now()}`,
        userPhone,
        subject,
        description,
        status: 'قيد المراجعة',
        updates: ['تم استلام الشكوى'],
        createdAt: new Date().toISOString().slice(0, 10),
      };
      complaints.unshift(complaint);
      return complaint;
    },
    async listComplaints(phone) {
      await delay();
      return complaints.filter((c) => c.userPhone === phone);
    },
    async submitRequest({ userPhone, type, details }) {
      await delay();
      const request = {
        id: `r-${Date.now()}`,
        userPhone,
        type,
        details,
        status: 'قيد التدقيق',
        updates: ['تم تسجيل الطلب'],
        createdAt: new Date().toISOString().slice(0, 10),
      };
      requests.unshift(request);
      return request;
    },
    async listRequests(phone) {
      await delay();
      return requests.filter((r) => r.userPhone === phone);
    },
    async listViolations(phone) {
      await delay();
      return violations.filter((v) => v.userPhone === phone);
    },
  };

  global.MockApi = api;
})(window);
