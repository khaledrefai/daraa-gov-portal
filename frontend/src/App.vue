<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="logo-wrap">
        <img :src="logoUrl" alt="شعار الشاهين" class="logo" />
        <div class="brand-text">
          <span class="gov-name">محافظة درعا</span>
          <h1 class="service-name">منصة خدمة المواطن</h1>
        </div>
      </div>
      <button class="user-chip" type="button" @click="handleAuthTrigger">
        <span>{{ authLabel }}</span>
      </button>
    </header>

    <main class="app-content">
      <section class="hero-grid">
        <article class="hero-card">
          <h2>خدمات رقمية من أجل مواطن أكثر تمكينًا</h2>
          <p>
            نوفر لك باقة متكاملة من الخدمات الإلكترونية التابعة لمحافظة درعا، مع متابعة آنية للطلبات والشكاوى والمخالفات.
          </p>
          <button class="primary-btn hero-cta" type="button" @click="handleAuthTrigger">
            ابدأ بإدارة خدماتك
          </button>
        </article>
        <article class="insight-card" aria-live="polite">
          <h3>مؤشرات فورية</h3>
          <ul class="insight-list">
            <li v-for="insight in portalInsights" :key="insight.label">
              <span class="insight-value">{{ insight.value }}</span>
              <span class="insight-label">{{ insight.label }}</span>
            </li>
          </ul>
          <p class="insight-note">تتحدث الأرقام بحسب بيانات حسابك الحالية.</p>
        </article>
      </section>

      <div class="content-grid">
        <aside class="sidebar" aria-label="التنقل بين أقسام المنصة">
          <div class="sidebar__intro">
            <h2 class="sidebar__title">مسارات المنصة</h2>
            <p class="sidebar__subtitle">اختر القسم الذي ترغب بإدارته الآن</p>
          </div>
          <nav class="quick-nav" aria-label="أقسام المنصة">
            <button
              v-for="view in views"
              :key="view.id"
              class="quick-nav__item"
              :class="{ 'is-active': activeView === view.id }"
              type="button"
              @click="activeView = view.id"
            >
              {{ view.label }}
            </button>
          </nav>
          <div class="sidebar__card">
            <h3>قنوات الدعم</h3>
            <ul class="support-list">
              <li v-for="channel in supportChannels" :key="channel.label">
                <span class="support-list__label">{{ channel.label }}</span>
                <span class="support-list__value">{{ channel.value }}</span>
              </li>
            </ul>
          </div>
        </aside>

        <section class="view-panel">
          <section
            v-show="activeView === 'servicesSection'"
            id="servicesSection"
            class="view-section"
            aria-labelledby="servicesTitle"
          >
            <header class="view-section__header">
              <h2 id="servicesTitle" class="section-title">تصنيفات الخدمات</h2>
              <p class="section-hint">تصفح الخدمات حسب الجهة المقدمة وابدأ الطلب بخطوات بسيطة.</p>
            </header>
            <div class="categories">
              <template v-if="categories.length">
                <button
                  v-for="category in categories"
                  :key="category"
                  class="category-pill"
                  :class="{ 'is-active': category === selectedCategory }"
                  type="button"
                  @click="selectCategory(category)"
                >
                  {{ category }}
                </button>
              </template>
              <p v-else class="helper-text">لا توجد خدمات متاحة حالياً.</p>
            </div>
            <div class="services">
              <div v-if="isLoadingServices" class="helper-text">جارِ تحميل الخدمات...</div>
              <div v-else-if="serviceError" class="helper-text">{{ serviceError }}</div>
              <div v-else-if="services.length === 0" class="empty-state">لا توجد خدمات ضمن هذا التصنيف حالياً.</div>
              <article v-else v-for="service in services" :key="service.id" class="service-card">
                <h3>{{ service.title }}</h3>
                <p>{{ service.summary }}</p>
                <div class="service-meta">
                  <span><span class="tag">{{ service.category }}</span></span>
                  <span>{{ service.isOnline ? 'متاحة إلكترونياً' : 'تحتاج لمراجعة' }}</span>
                </div>
                <button type="button" @click="openService(service.id)">عرض التفاصيل</button>
              </article>
            </div>
          </section>

          <section
            v-show="activeView === 'casesSection'"
            id="casesSection"
            class="view-section"
            aria-labelledby="casesTitle"
          >
            <header class="view-section__header">
              <h2 id="casesTitle" class="section-title">إدارة الشكاوى والطلبات</h2>
              <p class="section-hint">تابع تقدم المعاملات وقم بمشاركتنا التفاصيل المطلوبة في أي وقت.</p>
            </header>
            <div class="cases-grid">
              <article class="card" id="complaintsCard">
                <header>
                  <h3>خدمة الشكاوى</h3>
                  <p>قدم شكواك وتابع حالتها لحظة بلحظة.</p>
                </header>
                <form class="case-form" @submit.prevent="submitComplaintForm">
                  <label>
                    <span>موضوع الشكوى</span>
                    <input v-model="complaintForm.subject" type="text" required placeholder="اختيار عنوان واضح" />
                  </label>
                  <label>
                    <span>وصف مفصل</span>
                    <textarea v-model="complaintForm.description" required rows="3" placeholder="اشرح المشكلة بالتفصيل"></textarea>
                  </label>
                  <button type="submit" class="primary-btn">إرسال الشكوى</button>
                </form>
                <div class="list" aria-live="polite">
                  <div v-if="!currentUser" class="empty-state">سجّل الدخول للاطلاع على شكاويك.</div>
                  <div v-else-if="complaints.length === 0" class="empty-state">لم يتم تسجيل أي شكوى بعد.</div>
                  <template v-else>
                    <div v-for="complaint in complaints" :key="complaint.id" class="list-item">
                      <h4>{{ complaint.subject }}</h4>
                      <p class="helper-text">التاريخ: {{ complaint.createdAt }}</p>
                      <span class="status-badge">{{ complaint.status }}</span>
                      <details>
                        <summary>تتبع</summary>
                        <ul class="list">
                          <li v-for="(update, index) in complaint.updates" :key="index">{{ update }}</li>
                        </ul>
                      </details>
                    </div>
                  </template>
                </div>
              </article>

              <article class="card" id="requestsCard">
                <header>
                  <h3>خدمة الطلبات</h3>
                  <p>أرسل طلبك للخدمات العامة وتابع مراحل الإنجاز.</p>
                </header>
                <form class="case-form" @submit.prevent="submitRequestForm">
                  <label>
                    <span>نوع الطلب</span>
                    <input v-model="requestForm.type" type="text" required placeholder="مثال: تصريح بناء" />
                  </label>
                  <label>
                    <span>تفاصيل</span>
                    <textarea v-model="requestForm.details" required rows="3" placeholder="أدخل تفاصيل الطلب"></textarea>
                  </label>
                  <button type="submit" class="primary-btn">إرسال الطلب</button>
                </form>
                <div class="list" aria-live="polite">
                  <div v-if="!currentUser" class="empty-state">سجّل الدخول للاطلاع على طلباتك.</div>
                  <div v-else-if="requests.length === 0" class="empty-state">لا توجد طلبات مسجلة.</div>
                  <template v-else>
                    <div v-for="request in requests" :key="request.id" class="list-item">
                      <h4>{{ request.type }}</h4>
                      <p class="helper-text">التاريخ: {{ request.createdAt }}</p>
                      <span class="status-badge">{{ request.status }}</span>
                      <details>
                        <summary>آخر التحديثات</summary>
                        <ul class="list">
                          <li v-for="(update, index) in request.updates" :key="index">{{ update }}</li>
                        </ul>
                      </details>
                    </div>
                  </template>
                </div>
              </article>
            </div>
          </section>

          <section
            v-show="activeView === 'violationsSection'"
            id="violationsSection"
            class="view-section"
            aria-labelledby="violationsTitle"
          >
            <header class="view-section__header">
              <h2 id="violationsTitle" class="section-title">مخالفاتي</h2>
              <p class="section-hint">استعرض مخالفاتك المستحقة واختر ما ترغب بتسديده.</p>
            </header>
            <div class="list">
              <div v-if="!currentUser" class="empty-state">سجّل الدخول لعرض مخالفاتك.</div>
              <div v-else-if="violations.length === 0" class="empty-state">لا توجد مخالفات مسجلة على حسابك.</div>
              <template v-else>
                <div v-for="violation in violations" :key="violation.id" class="list-item">
                  <h4>{{ violation.title }}</h4>
                  <p class="helper-text">تاريخ التحرير: {{ violation.issuedAt }}</p>
                  <p class="helper-text">القيمة: {{ violation.amount.toLocaleString() }} ل.س</p>
                  <span class="status-badge">{{ violation.status }}</span>
                  <button class="inline-link" type="button">دفع إلكتروني قريباً</button>
                </div>
              </template>
            </div>
          </section>
        </section>

        <aside class="support-panel" aria-label="معلومات إضافية">
          <div class="support-card">
            <h3>نصائح للاستفادة القصوى</h3>
            <ul class="tips-list">
              <li v-for="tip in guidanceTips" :key="tip">{{ tip }}</li>
            </ul>
          </div>
          <div class="support-card">
            <h3>حالة الحساب</h3>
            <p v-if="currentUser" class="support-card__status">
              مرحباً {{ currentUser.name }}، يمكنك متابعة معاملتك من تبويب «حسابي».
            </p>
            <p v-else class="support-card__status">
              لم تقم بتسجيل الدخول بعد. ابدأ الآن للاستفادة من جميع خدمات المنصة.
            </p>
            <button class="secondary-btn" type="button" @click="handleAuthTrigger">
              إدارة الحساب
            </button>
          </div>
        </aside>
      </div>
    </main>

    <footer class="app-footer">
      <small>© محافظة درعا - دائرة التحول الرقمي</small>
      <small>جميع الحقوق محفوظة 2025</small>
    </footer>
  </div>

  <div class="bottom-sheet" :aria-hidden="(!isServiceSheetOpen).toString()" @click.self="closeServiceSheet">
    <div class="bottom-sheet__content" role="dialog" aria-modal="true" aria-labelledby="serviceTitle">
      <template v-if="selectedService">
        <div class="sheet-header">
          <h3 id="serviceTitle">{{ selectedService.title }}</h3>
          <button class="close-btn" type="button" aria-label="إغلاق" @click="closeServiceSheet">×</button>
        </div>
        <p>{{ selectedService.summary }}</p>
        <section class="sheet-section">
          <h4>قنوات التواصل</h4>
          <ul class="list">
            <li v-for="(contact, index) in selectedService.contacts" :key="index">
              <strong>{{ contact.label }}:</strong>
              <span> {{ contact.value }}</span>
            </li>
          </ul>
        </section>
        <section class="sheet-section">
          <h4>مسار العمل</h4>
          <ol class="flow-steps">
            <li v-for="(step, index) in selectedService.flow" :key="index">{{ step }}</li>
          </ol>
        </section>
        <section v-if="selectedService.isOnline" class="sheet-section">
          <button class="primary-btn" type="button" @click="handleServiceApply">تقديم الخدمة إلكترونياً</button>
          <div v-if="serviceConfirmationVisible" class="list-item">
            <h4>تم استلام طلبك</h4>
            <p class="helper-text">
              سيتم التواصل معك عبر رقم الهاتف المسجل
              ({{ currentUser ? currentUser.phone : '—' }}) خلال يومي عمل.
            </p>
          </div>
        </section>
        <p v-else class="helper-text">هذه الخدمة تتطلب مراجعة شخصية في مراكز الخدمة.</p>
      </template>
    </div>
  </div>

  <div class="bottom-sheet" :aria-hidden="(!isAuthSheetOpen).toString()" @click.self="closeAuthSheet">
    <div class="bottom-sheet__content" role="dialog" aria-modal="true" aria-labelledby="authTitle">
      <template v-if="isProfileView">
        <div class="sheet-header">
          <h3 id="authTitle">حسابي</h3>
          <button class="close-btn" type="button" aria-label="إغلاق" @click="closeAuthSheet">×</button>
        </div>
        <section class="sheet-section">
          <h4>{{ currentUser ? currentUser.name : '' }}</h4>
          <p class="helper-text">الرقم الوطني: {{ currentUser ? currentUser.nationalId : '' }}</p>
          <p class="helper-text">الهاتف: {{ currentUser ? currentUser.phone : '' }}</p>
        </section>
        <button class="inline-link" type="button" @click="logout">تسجيل الخروج</button>
      </template>
      <template v-else>
        <div class="sheet-header">
          <h3 id="authTitle">بوابة الدخول</h3>
          <button class="close-btn" type="button" aria-label="إغلاق" @click="closeAuthSheet">×</button>
        </div>
        <div class="auth-tabs">
          <button type="button" :class="{ 'is-active': authMode === 'login' }" @click="switchAuthMode('login')">دخول</button>
          <button type="button" :class="{ 'is-active': authMode === 'register' }" @click="switchAuthMode('register')">إنشاء حساب</button>
        </div>

        <form v-if="authMode === 'login'" class="auth-form" @submit.prevent="submitLogin">
          <label>
            <span>رقم الهاتف</span>
            <input v-model="loginForm.phone" name="phone" type="tel" inputmode="numeric" required placeholder="09XXXXXXXX" />
          </label>
          <label>
            <span>كلمة المرور</span>
            <input v-model="loginForm.password" name="password" type="password" required placeholder="••••••••" />
          </label>
          <button type="submit" class="primary-btn">تسجيل الدخول</button>
        </form>

        <template v-else>
          <div v-if="pendingPhone" class="sheet-section">
            <p class="helper-text">تم إرسال رمز التحقق إلى {{ pendingPhone }}. يرجى إدخاله بالأسفل.</p>
          </div>
          <form v-if="pendingPhone" class="auth-form" @submit.prevent="submitOtp">
            <label>
              <span>رمز التحقق</span>
              <input v-model="otpForm.otp" name="otp" type="text" inputmode="numeric" required maxlength="6" placeholder="123456" />
            </label>
            <button type="submit" class="primary-btn">تفعيل الحساب</button>
          </form>
          <form v-else class="auth-form" @submit.prevent="submitRegister">
            <label>
              <span>الاسم الكامل</span>
              <input v-model="registerForm.name" name="name" type="text" required placeholder="الاسم الثلاثي" />
            </label>
            <label>
              <span>الرقم الوطني</span>
              <input
                v-model="registerForm.nationalId"
                name="nationalId"
                type="text"
                inputmode="numeric"
                required
                minlength="11"
                maxlength="11"
                placeholder="مثال: 01234567890"
              />
            </label>
            <label>
              <span>رقم الهاتف</span>
              <input v-model="registerForm.phone" name="phone" type="tel" inputmode="numeric" required placeholder="09XXXXXXXX" />
            </label>
            <label>
              <span>كلمة المرور</span>
              <input v-model="registerForm.password" name="password" type="password" required placeholder="كلمة مرور قوية" />
            </label>
            <button type="submit" class="primary-btn">إنشاء الحساب</button>
          </form>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import logoUrl from './assets/shahin-logo.svg?url';
import {
  fetchServiceCategories,
  fetchServicesByCategory,
  fetchServiceById,
  login,
  register,
  verifyOtp,
  submitComplaint,
  listComplaints,
  submitRequest,
  listRequests,
  listViolations,
} from './data/mockApi';

const categories = ref([]);
const selectedCategory = ref('');
const services = ref([]);
const isLoadingServices = ref(false);
const serviceError = ref('');

const selectedService = ref(null);
const isServiceSheetOpen = ref(false);
const serviceConfirmationVisible = ref(false);

const views = [
  { id: 'servicesSection', label: 'الخدمات الإلكترونية' },
  { id: 'casesSection', label: 'الشكاوى والطلبات' },
  { id: 'violationsSection', label: 'المخالفات' },
];
const supportChannels = [
  { label: 'مركز النداء', value: '199' },
  { label: 'الواتساب الموحد', value: '+963-955-123456' },
  { label: 'البريد الإلكتروني', value: 'support@daraa.gov.sy' },
];
const guidanceTips = [
  'تأكد من اكتمال بياناتك الشخصية قبل تقديم أي طلب.',
  'تابع تحديثات الحالة من قسم «الشكاوى والطلبات».',
  'يمكنك حفظ الخدمات المفضلة من خلال إضافة الطلب إلى حسابك.',
];
const activeView = ref('servicesSection');

const currentUser = ref(null);
const complaints = ref([]);
const requests = ref([]);
const violations = ref([]);

const authMode = ref('login');
const isAuthSheetOpen = ref(false);
const pendingPhone = ref(null);

const loginForm = reactive({ phone: '', password: '' });
const registerForm = reactive({ name: '', nationalId: '', phone: '', password: '' });
const otpForm = reactive({ otp: '' });

const complaintForm = reactive({ subject: '', description: '' });
const requestForm = reactive({ type: '', details: '' });

const authLabel = computed(() => (currentUser.value ? currentUser.value.name.split(' ')[0] : 'تسجيل الدخول'));
const isProfileView = computed(() => !!currentUser.value && authMode.value === 'profile');
const portalInsights = computed(() => {
  const hasUser = !!currentUser.value;
  const insightItems = [
    { label: 'تصنيفات الخدمات', value: categories.value.length },
    { label: 'الخدمات المتاحة', value: services.value.length },
    { label: 'معاملاتك الجارية', value: hasUser ? complaints.value.length + requests.value.length : '—' },
    { label: 'مخالفات نشطة', value: hasUser ? violations.value.length : '—' },
  ];

  return insightItems.map((item) => ({
    ...item,
    value:
      typeof item.value === 'number'
        ? item.value.toLocaleString('ar-EG')
        : item.value,
  }));
});

watch(
  () => [isServiceSheetOpen.value, isAuthSheetOpen.value],
  ([serviceOpen, authOpen]) => {
    if (serviceOpen || authOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }
);

async function loadInitialData() {
  try {
    const loadedCategories = await fetchServiceCategories();
    categories.value = loadedCategories;
    selectedCategory.value = loadedCategories[0] ?? '';
    if (selectedCategory.value) {
      await loadServices(selectedCategory.value);
    }
  } catch (error) {
    serviceError.value = 'تعذر تحميل الخدمات. حاول مجددًا لاحقًا.';
    console.error(error);
  }
}

async function loadServices(category) {
  isLoadingServices.value = true;
  serviceError.value = '';
  services.value = [];
  try {
    const loadedServices = await fetchServicesByCategory(category);
    services.value = loadedServices;
  } catch (error) {
    serviceError.value = 'حدث خطأ أثناء تحميل الخدمات';
    console.error(error);
  } finally {
    isLoadingServices.value = false;
  }
}

function selectCategory(category) {
  if (category === selectedCategory.value) return;
  selectedCategory.value = category;
  loadServices(category);
}

async function openService(serviceId) {
  try {
    const service = await fetchServiceById(serviceId);
    if (service) {
      selectedService.value = service;
      serviceConfirmationVisible.value = false;
      isServiceSheetOpen.value = true;
    }
  } catch (error) {
    console.error(error);
  }
}

function closeServiceSheet() {
  isServiceSheetOpen.value = false;
  serviceConfirmationVisible.value = false;
  selectedService.value = null;
}

function handleAuthTrigger() {
  if (currentUser.value) {
    authMode.value = 'profile';
  } else {
    authMode.value = 'login';
    pendingPhone.value = null;
    otpForm.otp = '';
  }
  isAuthSheetOpen.value = true;
}

function switchAuthMode(mode) {
  authMode.value = mode;
  if (mode === 'login') {
    pendingPhone.value = null;
    otpForm.otp = '';
    registerForm.name = '';
    registerForm.nationalId = '';
    registerForm.phone = '';
    registerForm.password = '';
  } else {
    loginForm.phone = '';
    loginForm.password = '';
  }
}

function closeAuthSheet() {
  isAuthSheetOpen.value = false;
  if (!currentUser.value) {
    authMode.value = 'login';
    pendingPhone.value = null;
    otpForm.otp = '';
  }
}

async function submitLogin() {
  try {
    const user = await login(loginForm.phone, loginForm.password);
    currentUser.value = user;
    loginForm.phone = '';
    loginForm.password = '';
    await refreshUserData();
    closeAuthSheet();
  } catch (error) {
    alert(error.message);
  }
}

async function submitRegister() {
  try {
    const response = await register({ ...registerForm });
    pendingPhone.value = registerForm.phone;
    alert(`${response.message} (رمز تجريبي: ${response.otp})`);
  } catch (error) {
    alert(error.message);
  }
}

async function submitOtp() {
  try {
    const user = await verifyOtp(pendingPhone.value, otpForm.otp);
    if (user) {
      currentUser.value = user;
      pendingPhone.value = null;
      otpForm.otp = '';
      registerForm.name = '';
      registerForm.nationalId = '';
      registerForm.phone = '';
      registerForm.password = '';
      await refreshUserData();
      closeAuthSheet();
    }
  } catch (error) {
    alert(error.message);
  }
}

function logout() {
  currentUser.value = null;
  complaints.value = [];
  requests.value = [];
  violations.value = [];
  authMode.value = 'login';
  closeAuthSheet();
}

async function refreshUserData() {
  if (!currentUser.value) return;
  const phone = currentUser.value.phone;
  try {
    const [userComplaints, userRequests, userViolations] = await Promise.all([
      listComplaints(phone),
      listRequests(phone),
      listViolations(phone),
    ]);
    complaints.value = userComplaints;
    requests.value = userRequests;
    violations.value = userViolations;
  } catch (error) {
    console.error(error);
  }
}

async function submitComplaintForm() {
  if (!currentUser.value) {
    alert('يرجى تسجيل الدخول لإرسال الشكوى.');
    authMode.value = 'login';
    isAuthSheetOpen.value = true;
    return;
  }
  try {
    await submitComplaint({
      userPhone: currentUser.value.phone,
      subject: complaintForm.subject,
      description: complaintForm.description,
    });
    complaintForm.subject = '';
    complaintForm.description = '';
    await refreshUserData();
  } catch (error) {
    alert(error.message);
  }
}

async function submitRequestForm() {
  if (!currentUser.value) {
    alert('يرجى تسجيل الدخول لإرسال الطلب.');
    authMode.value = 'login';
    isAuthSheetOpen.value = true;
    return;
  }
  try {
    await submitRequest({
      userPhone: currentUser.value.phone,
      type: requestForm.type,
      details: requestForm.details,
    });
    requestForm.type = '';
    requestForm.details = '';
    await refreshUserData();
  } catch (error) {
    alert(error.message);
  }
}

function handleServiceApply() {
  if (!currentUser.value) {
    authMode.value = 'login';
    isAuthSheetOpen.value = true;
    return;
  }
  serviceConfirmationVisible.value = true;
}

onMounted(async () => {
  await loadInitialData();
});
</script>
