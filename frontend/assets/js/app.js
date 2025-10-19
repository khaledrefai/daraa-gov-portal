const state = {
  categories: [],
  selectedCategory: null,
  services: [],
  selectedService: null,
  currentUser: null,
  complaints: [],
  requests: [],
  violations: [],
  authMode: 'login',
  pendingPhone: null,
};

const elements = {
  categoriesContainer: document.getElementById('categoriesContainer'),
  servicesContainer: document.getElementById('servicesContainer'),
  serviceSheet: document.getElementById('serviceSheet'),
  serviceSheetContent: document.querySelector('#serviceSheet .bottom-sheet__content'),
  authTrigger: document.getElementById('authTrigger'),
  authUserLabel: document.getElementById('authUserLabel'),
  authSheet: document.getElementById('authSheet'),
  authSheetContent: document.querySelector('#authSheet .bottom-sheet__content'),
  complaintForm: document.getElementById('complaintForm'),
  complaintsList: document.getElementById('complaintsList'),
  requestForm: document.getElementById('requestForm'),
  requestsList: document.getElementById('requestsList'),
  violationsList: document.getElementById('violationsList'),
  quickNav: document.querySelector('.quick-nav'),
  views: document.querySelectorAll('.view'),
  navButtons: document.querySelectorAll('.quick-nav__item'),
};

async function initialize() {
  try {
    const categories = await MockApi.fetchServiceCategories();
    state.categories = categories;
    state.selectedCategory = categories[0] || null;
    renderCategories();
    if (state.selectedCategory) {
      await loadServices(state.selectedCategory);
    }
    updateAuthUI();
    setupNavigation();
    renderComplaints();
    renderRequests();
    renderViolations();
  } catch (error) {
    console.error('Initialization error', error);
  }
}

function setupNavigation() {
  elements.quickNav.addEventListener('click', (event) => {
    const target = event.target.closest('button[data-target]');
    if (!target) return;
    elements.navButtons.forEach((btn) => btn.classList.remove('is-active'));
    target.classList.add('is-active');

    const id = target.dataset.target;
    elements.views.forEach((view) => {
      view.classList.toggle('is-active', view.id === id);
    });
  });
}

function renderCategories() {
  elements.categoriesContainer.innerHTML = '';
  if (state.categories.length === 0) {
    elements.categoriesContainer.innerHTML = '<p class="helper-text">لا توجد خدمات متاحة حالياً.</p>';
    return;
  }

  state.categories.forEach((category) => {
    const button = document.createElement('button');
    button.className = 'category-pill' + (category === state.selectedCategory ? ' is-active' : '');
    button.textContent = category;
    button.type = 'button';
    button.addEventListener('click', async () => {
      state.selectedCategory = category;
      renderCategories();
      await loadServices(category);
    });
    elements.categoriesContainer.appendChild(button);
  });
}

async function loadServices(category) {
  elements.servicesContainer.innerHTML = '<div class="helper-text">جارِ تحميل الخدمات...</div>';
  try {
    const services = await MockApi.fetchServicesByCategory(category);
    state.services = services;
    renderServices();
  } catch (error) {
    elements.servicesContainer.innerHTML = `<div class="helper-text">حدث خطأ أثناء تحميل الخدمات</div>`;
    console.error(error);
  }
}

function renderServices() {
  elements.servicesContainer.innerHTML = '';
  if (state.services.length === 0) {
    elements.servicesContainer.innerHTML = '<div class="empty-state">لا توجد خدمات ضمن هذا التصنيف حالياً.</div>';
    return;
  }

  state.services.forEach((service) => {
    const card = document.createElement('article');
    card.className = 'service-card';
    card.innerHTML = `
      <h3>${service.title}</h3>
      <p>${service.summary}</p>
      <div class="service-meta">
        <span><span class="tag">${service.category}</span></span>
        <span>${service.isOnline ? 'متاحة إلكترونياً' : 'تحتاج لمراجعة'}</span>
      </div>
      <button type="button">عرض التفاصيل</button>
    `;
    card.querySelector('button').addEventListener('click', () => openServiceSheet(service.id));
    elements.servicesContainer.appendChild(card);
  });
}

async function openServiceSheet(serviceId) {
  try {
    const service = await MockApi.fetchServiceById(serviceId);
    state.selectedService = service;
    renderServiceSheet();
    toggleSheet(elements.serviceSheet, true);
  } catch (error) {
    console.error(error);
  }
}

function renderServiceSheet() {
  const service = state.selectedService;
  if (!service) return;
  const contacts = service.contacts
    .map((contact) => `<li><strong>${contact.label}:</strong> <span>${contact.value}</span></li>`)
    .join('');
  const steps = service.flow.map((step) => `<li>${step}</li>`).join('');
  const onlineAction = service.isOnline
    ? `<button class="primary-btn" type="button" id="applyServiceBtn">تقديم الخدمة إلكترونياً</button>`
    : `<p class="helper-text">هذه الخدمة تتطلب مراجعة شخصية في مراكز الخدمة.</p>`;

  elements.serviceSheetContent.innerHTML = `
    <div class="sheet-header">
      <h3 id="serviceTitle">${service.title}</h3>
      <button class="close-btn" type="button" aria-label="إغلاق">×</button>
    </div>
    <p>${service.summary}</p>
    <section class="sheet-section">
      <h4>قنوات التواصل</h4>
      <ul class="list">${contacts}</ul>
    </section>
    <section class="sheet-section">
      <h4>مسار العمل</h4>
      <ol class="flow-steps">${steps}</ol>
    </section>
    ${onlineAction}
  `;

  elements.serviceSheetContent
    .querySelector('.close-btn')
    .addEventListener('click', () => toggleSheet(elements.serviceSheet, false));

  const applyBtn = document.getElementById('applyServiceBtn');
  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      if (!state.currentUser) {
        openAuthSheet('login');
        return;
      }
      applyForService(service);
    });
  }
}

function applyForService(service) {
  const confirmation = document.createElement('div');
  confirmation.className = 'sheet-section';
  confirmation.innerHTML = `
    <div class="list-item">
      <h4>تم استلام طلبك</h4>
      <p>سيتم التواصل معك عبر رقم الهاتف المسجل (${state.currentUser.phone}) خلال يومي عمل.</p>
    </div>
  `;
  elements.serviceSheetContent.appendChild(confirmation);
}

function toggleSheet(sheet, isOpen) {
  sheet.setAttribute('aria-hidden', String(!isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
  if (sheet === elements.authSheet) {
    elements.authTrigger.setAttribute('aria-expanded', String(isOpen));
  }
}

elements.serviceSheet.addEventListener('click', (event) => {
  if (event.target === elements.serviceSheet) {
    toggleSheet(elements.serviceSheet, false);
  }
});

elements.authSheet.addEventListener('click', (event) => {
  if (event.target === elements.authSheet) {
    toggleSheet(elements.authSheet, false);
  }
});

elements.authTrigger.addEventListener('click', () => {
  openAuthSheet(state.currentUser ? 'profile' : 'login');
});

function updateAuthUI() {
  if (state.currentUser) {
    elements.authUserLabel.textContent = state.currentUser.name.split(' ')[0];
  } else {
    elements.authUserLabel.textContent = 'تسجيل الدخول';
  }
}

function openAuthSheet(mode = 'login') {
  state.authMode = mode;
  renderAuthSheet();
  toggleSheet(elements.authSheet, true);
}

function renderAuthSheet() {
  const content = [];

  if (state.currentUser && state.authMode === 'profile') {
    content.push(`
      <div class="sheet-header">
        <h3 id="authTitle">حسابي</h3>
        <button class="close-btn" type="button" aria-label="إغلاق">×</button>
      </div>
      <div class="sheet-section">
        <h4>${state.currentUser.name}</h4>
        <p class="helper-text">الرقم الوطني: ${state.currentUser.nationalId}</p>
        <p class="helper-text">الهاتف: ${state.currentUser.phone}</p>
      </div>
      <button class="inline-link" id="logoutBtn">تسجيل الخروج</button>
    `);
  } else {
    const tabs = `
      <div class="sheet-header">
        <h3 id="authTitle">بوابة الدخول</h3>
        <button class="close-btn" type="button" aria-label="إغلاق">×</button>
      </div>
      <div class="auth-tabs">
        <button type="button" data-mode="login" class="${state.authMode === 'login' ? 'is-active' : ''}">دخول</button>
        <button type="button" data-mode="register" class="${state.authMode === 'register' ? 'is-active' : ''}">إنشاء حساب</button>
      </div>
    `;

    const formContent = state.authMode === 'login' ? renderLoginForm() : renderRegisterForm();
    content.push(tabs + formContent);
  }

  elements.authSheetContent.innerHTML = content.join('');

  elements.authSheetContent
    .querySelector('.close-btn')
    .addEventListener('click', () => toggleSheet(elements.authSheet, false));

  if (state.currentUser && state.authMode === 'profile') {
    document.getElementById('logoutBtn').addEventListener('click', () => {
      state.currentUser = null;
      updateAuthUI();
      toggleSheet(elements.authSheet, false);
    });
    return;
  }

  const tabsContainer = elements.authSheetContent.querySelector('.auth-tabs');
  tabsContainer.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-mode]');
    if (!button) return;
    state.authMode = button.dataset.mode;
    renderAuthSheet();
  });

  const form = elements.authSheetContent.querySelector('.auth-form');
  form.addEventListener('submit', handleAuthSubmit);
}

function renderLoginForm() {
  return `
    <form class="auth-form" data-type="login">
      <label>
        <span>رقم الهاتف</span>
        <input name="phone" type="tel" inputmode="numeric" required placeholder="09XXXXXXXX" />
      </label>
      <label>
        <span>كلمة المرور</span>
        <input name="password" type="password" required placeholder="••••••••" />
      </label>
      <button type="submit" class="primary-btn">تسجيل الدخول</button>
    </form>
  `;
}

function renderRegisterForm() {
  const otpSection = state.pendingPhone
    ? `
      <div class="sheet-section">
        <p class="helper-text">تم إرسال رمز التحقق إلى ${state.pendingPhone}. يرجى إدخاله بالأسفل.</p>
      </div>
      <form class="auth-form" data-type="verify">
        <label>
          <span>رمز التحقق</span>
          <input name="otp" type="text" inputmode="numeric" required maxlength="6" placeholder="123456" />
        </label>
        <button type="submit" class="primary-btn">تفعيل الحساب</button>
      </form>
    `
    : `
      <form class="auth-form" data-type="register">
        <label>
          <span>الاسم الكامل</span>
          <input name="name" type="text" required placeholder="الاسم الثلاثي" />
        </label>
        <label>
          <span>الرقم الوطني</span>
          <input name="nationalId" type="text" inputmode="numeric" required minlength="11" maxlength="11" placeholder="مثال: 01234567890" />
        </label>
        <label>
          <span>رقم الهاتف</span>
          <input name="phone" type="tel" inputmode="numeric" required placeholder="09XXXXXXXX" />
        </label>
        <label>
          <span>كلمة المرور</span>
          <input name="password" type="password" required placeholder="كلمة مرور قوية" />
        </label>
        <button type="submit" class="primary-btn">إنشاء الحساب</button>
      </form>
    `;
  return otpSection;
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const type = form.dataset.type;

  try {
    if (type === 'login') {
      const formData = new FormData(form);
      const phone = formData.get('phone');
      const password = formData.get('password');
      const user = await MockApi.login(phone, password);
      state.currentUser = user;
      updateAuthUI();
      await refreshUserData();
      toggleSheet(elements.authSheet, false);
    } else if (type === 'register') {
      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());
      const response = await MockApi.register(payload);
      state.pendingPhone = payload.phone;
      renderAuthSheet();
      alert(response.message + ` (رمز تجريبي: ${response.otp})`);
    } else if (type === 'verify') {
      const otp = form.otp.value;
      const user = await MockApi.verifyOtp(state.pendingPhone, otp);
      state.currentUser = user;
      state.pendingPhone = null;
      updateAuthUI();
      await refreshUserData();
      toggleSheet(elements.authSheet, false);
    }
  } catch (error) {
    alert(error.message);
  }
}

async function refreshUserData() {
  if (!state.currentUser) return;
  const phone = state.currentUser.phone;
  const [complaints, requests, violations] = await Promise.all([
    MockApi.listComplaints(phone),
    MockApi.listRequests(phone),
    MockApi.listViolations(phone),
  ]);
  state.complaints = complaints;
  state.requests = requests;
  state.violations = violations;
  renderComplaints();
  renderRequests();
  renderViolations();
}

elements.complaintForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!state.currentUser) {
    alert('يرجى تسجيل الدخول لإرسال الشكوى.');
    openAuthSheet('login');
    return;
  }
  const formData = new FormData(event.target);
  try {
    await MockApi.submitComplaint({
      userPhone: state.currentUser.phone,
      subject: formData.get('subject'),
      description: formData.get('description'),
    });
    event.target.reset();
    await refreshUserData();
  } catch (error) {
    alert(error.message);
  }
});

elements.requestForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!state.currentUser) {
    alert('يرجى تسجيل الدخول لإرسال الطلب.');
    openAuthSheet('login');
    return;
  }
  const formData = new FormData(event.target);
  try {
    await MockApi.submitRequest({
      userPhone: state.currentUser.phone,
      type: formData.get('type'),
      details: formData.get('details'),
    });
    event.target.reset();
    await refreshUserData();
  } catch (error) {
    alert(error.message);
  }
});

function renderComplaints() {
  if (!state.currentUser) {
    elements.complaintsList.innerHTML = '<div class="empty-state">سجّل الدخول للاطلاع على شكاويك.</div>';
    return;
  }
  if (state.complaints.length === 0) {
    elements.complaintsList.innerHTML = '<div class="empty-state">لم يتم تسجيل أي شكوى بعد.</div>';
    return;
  }
  elements.complaintsList.innerHTML = state.complaints
    .map(
      (complaint) => `
        <div class="list-item">
          <h4>${complaint.subject}</h4>
          <p class="helper-text">التاريخ: ${complaint.createdAt}</p>
          <span class="status-badge">${complaint.status}</span>
          <details>
            <summary>تتبع</summary>
            <ul class="list">
              ${complaint.updates.map((update) => `<li>${update}</li>`).join('')}
            </ul>
          </details>
        </div>
      `
    )
    .join('');
}

function renderRequests() {
  if (!state.currentUser) {
    elements.requestsList.innerHTML = '<div class="empty-state">سجّل الدخول للاطلاع على طلباتك.</div>';
    return;
  }
  if (state.requests.length === 0) {
    elements.requestsList.innerHTML = '<div class="empty-state">لا توجد طلبات مسجلة.</div>';
    return;
  }
  elements.requestsList.innerHTML = state.requests
    .map(
      (request) => `
        <div class="list-item">
          <h4>${request.type}</h4>
          <p class="helper-text">التاريخ: ${request.createdAt}</p>
          <span class="status-badge">${request.status}</span>
          <details>
            <summary>آخر التحديثات</summary>
            <ul class="list">
              ${request.updates.map((update) => `<li>${update}</li>`).join('')}
            </ul>
          </details>
        </div>
      `
    )
    .join('');
}

function renderViolations() {
  if (!state.currentUser) {
    elements.violationsList.innerHTML = '<div class="empty-state">سجّل الدخول لعرض مخالفاتك.</div>';
    return;
  }
  if (state.violations.length === 0) {
    elements.violationsList.innerHTML = '<div class="empty-state">لا توجد مخالفات مسجلة على حسابك.</div>';
    return;
  }
  elements.violationsList.innerHTML = state.violations
    .map(
      (violation) => `
        <div class="list-item">
          <h4>${violation.title}</h4>
          <p class="helper-text">تاريخ التحرير: ${violation.issuedAt}</p>
          <p class="helper-text">القيمة: ${violation.amount.toLocaleString()} ل.س</p>
          <span class="status-badge">${violation.status}</span>
          <button class="inline-link" type="button">دفع إلكتروني قريباً</button>
        </div>
      `
    )
    .join('');
}

initialize();
