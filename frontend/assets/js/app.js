const state = {
  currentUser: null,
  selectedCategory: null,
  selectedService: null,
  otpPhone: null,
  services: [],
  chat: {
    isOpen: false,
    initiated: false,
    messages: [],
  },
};

const categoryDescriptions = {
  'خدمات قنصلية': 'إجراءات تصديق وتنظيم الوثائق الرسمية الخاصة بالمواطنين والمقيمين.',
  'خدمات سجل النفوس': 'خدمات الأحوال المدنية التي تضمن تحديث بيانات الأسرة والقيود المدنية.',
  'خدمات مؤسسة المياه': 'طلبات اشتراك المياه، النقل، والمتابعة الفنية لشبكات التزويد.',
  'خدمات المصالح العقارية': 'إصدار البيانات والسجلات العقارية ومتابعة معاملات الملكية.',
  'خدمات مديرية التربية': 'خدمات الطلاب والمعلمين المتعلقة بالشهادات والمصادقات.',
  'خدمات الشؤون الاجتماعية والعمل': 'برامج الدعم الاجتماعي وتمكين الأسر والفئات المستفيدة.',
};

const categoryMeta = {
  'خدمات قنصلية': {
    icon: '🛂',
    caption: 'شؤون المواطنين خارج القطر',
    gradient: ['#4EA69B', '#1F5E53'],
  },
  'خدمات سجل النفوس': {
    icon: '🪪',
    caption: 'القيود والبيانات المدنية',
    gradient: ['#5CB0A2', '#2C6D62'],
  },
  'خدمات مؤسسة المياه': {
    icon: '💧',
    caption: 'إدارة الاشتراكات والشبكات',
    gradient: ['#5EC4C2', '#1E686C'],
  },
  'خدمات المصالح العقارية': {
    icon: '🏠',
    caption: 'الملكية والرسوم العقارية',
    gradient: ['#63B07C', '#1F5A3F'],
  },
  'خدمات مديرية التربية': {
    icon: '🎓',
    caption: 'الشهادات والامتحانات',
    gradient: ['#7FCF87', '#2C7A4F'],
  },
  'خدمات الشؤون الاجتماعية والعمل': {
    icon: '🤝',
    caption: 'دعم وتمكين الفئات المحتاجة',
    gradient: ['#A1DFA4', '#386B4A'],
  },
};

const elements = {
  servicesList: document.getElementById('servicesList'),
  serviceDetails: document.getElementById('serviceDetails'),
  categoryNav: document.getElementById('categoryNav'),
  categoryMenu: document.getElementById('categoryMenu'),
  servicesHeading: document.getElementById('servicesHeading'),
  servicesSubtitle: document.getElementById('servicesSubtitle'),
  heroStats: document.getElementById('heroStats'),
  complaintsPanel: document.getElementById('complaintsPanel'),
  requestsPanel: document.getElementById('requestsPanel'),
  suggestionsPanel: document.getElementById('suggestionsPanel'),
  violationsPanel: document.getElementById('violationsPanel'),
  authModal: document.getElementById('authModal'),
  toast: document.getElementById('toast'),
  loginForm: document.getElementById('loginForm'),
  registerForm: document.getElementById('registerForm'),
  otpForm: document.getElementById('otpForm'),
  userActions: document.querySelector('.user-actions'),
  navToggle: document.getElementById('navToggle'),
  categoryBar: document.getElementById('categoryBar'),
  chatbot: document.getElementById('chatbot'),
  chatbotTrigger: document.getElementById('chatbotTrigger'),
  chatbotWindow: document.getElementById('chatbotWindow'),
  chatbotClose: document.getElementById('chatbotClose'),
  chatMessages: document.getElementById('chatMessages'),
  chatForm: document.getElementById('chatForm'),
  chatInput: document.getElementById('chatInput'),
};

const normalizeText = (value = '') =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    .replace(/[\u061f\u060c\u061b\.,!؟،؛]/g, '')
    .replace(/[\s\u200f\u200e]+/g, ' ');

const pushChatMessage = (sender, text) => {
  state.chat.messages.push({
    id: `${sender}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    sender,
    text,
    time: new Date(),
  });
  renderChatMessages();
};

const renderChatMessages = () => {
  if (!elements.chatMessages) return;

  elements.chatMessages.innerHTML = state.chat.messages
    .map((message) => {
      const segments = [];
      let listBuffer = [];

      message.text
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .forEach((line) => {
          if (line.startsWith('- ')) {
            listBuffer.push(line.replace(/^-\s*/, ''));
          } else {
            if (listBuffer.length) {
              segments.push(`<ul>${listBuffer.map((item) => `<li>${item}</li>`).join('')}</ul>`);
              listBuffer = [];
            }
            segments.push(`<p>${line}</p>`);
          }
        });

      if (listBuffer.length) {
        segments.push(`<ul>${listBuffer.map((item) => `<li>${item}</li>`).join('')}</ul>`);
      }

      const bubble = `<div class="chatbot__bubble">${segments.join('')}</div>`;
      return `<div class="chatbot__message chatbot__message--${message.sender}">${bubble}</div>`;
    })
    .join('');

  elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
};

const getServiceHighlights = () => {
  if (!state.services.length) return '';
  const highlights = state.services.slice(0, 3).map((service) => `- ${service.title}: ${service.summary}`);
  return `يمكنني إرشادك حول الخدمات التالية على سبيل المثال:\n${highlights.join('\n')}`;
};

const ensureChatGreeting = () => {
  if (state.chat.initiated) return;
  const greetingLines = [
    'مرحباً بك! أنا المساعد الرقمي لمحافظة درعا، أجيبك حول الخدمات الإلكترونية ومساراتها.',
  ];
  const highlights = getServiceHighlights();
  if (highlights) {
    greetingLines.push(highlights);
  } else {
    greetingLines.push('اسألني عن أي خدمة أو تصنيف وسيتم تزويدك بالتفاصيل المتاحة.');
  }
  pushChatMessage('bot', greetingLines.join('\n'));
  state.chat.initiated = true;
};

const toggleChatbot = (open = !state.chat.isOpen) => {
  if (!elements.chatbot || !elements.chatbotWindow || !elements.chatbotTrigger) return;
  state.chat.isOpen = open;
  elements.chatbot.classList.toggle('chatbot--open', open);
  elements.chatbotWindow.hidden = !open;
  elements.chatbotWindow.setAttribute('aria-hidden', open ? 'false' : 'true');
  elements.chatbotTrigger.setAttribute('aria-expanded', String(open));

  if (open) {
    ensureChatGreeting();
    elements.chatInput?.focus();
  }
};

const formatServiceDetails = (service) => {
  const lines = [
    `خدمة ${service.title}`,
    service.summary,
  ];
  if (service.online) {
    lines.push('✅ متاحة للتقديم الإلكتروني عبر المنصة.');
  } else {
    lines.push('ℹ️ تتطلب مراجعة المركز المختص لإتمام الطلب.');
  }
  const workflowSteps = Array.isArray(service.workflow) ? service.workflow.slice(0, 3) : [];
  if (workflowSteps.length) {
    lines.push('مسار العمل الأساسي:');
    workflowSteps.forEach((step, index) => {
      lines.push(`- الخطوة ${index + 1}: ${step}`);
    });
  }
  if (service.contact) {
    lines.push('قنوات التواصل:');
    const { phone, email, address } = service.contact;
    if (phone) lines.push(`- هاتف: ${phone}`);
    if (email) lines.push(`- بريد إلكتروني: ${email}`);
    if (address) lines.push(`- العنوان: ${address}`);
  }
  lines.push('بإمكانك الضغط على زر "التقديم على الخدمة" من صفحة التفاصيل لإكمال الطلب.');
  return lines.join('\n');
};

const createChatbotReply = (rawMessage) => {
  const query = normalizeText(rawMessage);
  const simplifiedQuery = query.replace(/^ال/, '').trim();

  if (!query) {
    return 'أرسل سؤالك حول خدمة أو تصنيف معين وسأزودك بالتفاصيل.';
  }

  if (/^مرحب|السلام|اهلا/.test(query)) {
    return 'أهلاً بك! كيف يمكنني مساعدتك اليوم في خدمات محافظة درعا؟';
  }

  if (/تسجيل|دخول|حساب/.test(query)) {
    return 'للدخول إلى الخدمات الإلكترونية، استخدم زر "تسجيل الدخول" في الترويسة. وإن لم يكن لديك حساب يمكنك إنشاء حساب جديد وستصلك كلمة مرور لمرة واحدة لتفعيل الحساب.';
  }

  if (/شكاو|شكوى/.test(query)) {
    return 'يمكنك تقديم الشكوى من خلال بطاقة "خدمة الشكاوى" في الواجهة الرئيسية، كما تستطيع متابعة حالة الشكوى بعد تسجيل الدخول.';
  }

  const services = state.services || [];
  if (!services.length) {
    return 'أقوم حالياً بتحميل الخدمات من السجلات التجريبية، أعد إرسال سؤالك بعد لحظات.';
  }

  const serviceMatches = services.filter((service) => {
    const content = [service.title, service.summary, service.category, service.description]
      .map((field) => normalizeText(field))
      .join(' ');
    return content.includes(query);
  });

  if (serviceMatches.length === 1) {
    return formatServiceDetails(serviceMatches[0]);
  }

  if (serviceMatches.length > 1) {
    const lines = ['تم العثور على أكثر من خدمة مرتبطة بسؤالك:'];
    serviceMatches.slice(0, 5).forEach((service) => {
      lines.push(`- ${service.title}: ${service.summary}`);
    });
    lines.push('يمكنك تحديد اسم خدمة بعينها للحصول على تفاصيل أوسع.');
    return lines.join('\n');
  }

  const categoryMatch = Object.keys(categoryDescriptions).find((category) => {
    const normalizedCategory = normalizeText(category);
    const simplifiedCategory = normalizedCategory.replace(/^خدمات\s+/, '');
    return (
      normalizedCategory.includes(query) ||
      query.includes(normalizedCategory) ||
      simplifiedCategory.includes(query) ||
      query.includes(simplifiedCategory) ||
      (simplifiedQuery && simplifiedCategory.includes(simplifiedQuery)) ||
      (simplifiedQuery && simplifiedQuery.includes(simplifiedCategory))
    );
  });

  if (categoryMatch) {
    const related = services.filter((service) => service.category === categoryMatch);
    if (related.length) {
      const lines = [`ضمن ${categoryMatch} يتوفر لدينا:`];
      related.forEach((service) => lines.push(`- ${service.title}: ${service.summary}`));
      lines.push('أخبرني باسم الخدمة التي تريد تفاصيلها أو استخدم القائمة لفتح تفاصيلها الكاملة.');
      return lines.join('\n');
    }
  }

  return 'لم أجد خدمة مطابقة تماماً لسؤالك. جرّب ذكر اسم الخدمة أو التصنيف أو الاستفسار عن الشكاوى والطلبات، وسأقدم لك المعلومات المتاحة.';
};

const initChatbot = () => {
  if (!elements.chatbot) return;

  renderChatMessages();

  elements.chatbotTrigger?.addEventListener('click', () => {
    toggleChatbot(!state.chat.isOpen);
  });

  elements.chatbotClose?.addEventListener('click', () => {
    toggleChatbot(false);
  });

  elements.chatForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const message = elements.chatInput?.value?.trim();
    if (!message) return;

    pushChatMessage('user', message);
    elements.chatInput.value = '';

    setTimeout(() => {
      const reply = createChatbotReply(message);
      pushChatMessage('bot', reply);
    }, 320);
  });

  document.addEventListener('click', (event) => {
    if (!state.chat.isOpen) return;
    if (!elements.chatbot?.contains(event.target)) {
      toggleChatbot(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && state.chat.isOpen) {
      toggleChatbot(false);
    }
  });
};

const toggleNavigation = (force) => {
  if (!elements.categoryNav || !elements.navToggle) return;
  const isOpen = typeof force === 'boolean' ? force : !elements.categoryNav.classList.contains('open');
  elements.categoryNav.classList.toggle('open', isOpen);
  elements.navToggle.setAttribute('aria-expanded', String(isOpen));
  elements.categoryBar?.classList.toggle('open', isOpen);
};

const updateServicesIntro = () => {
  if (!elements.servicesHeading || !elements.servicesSubtitle) return;
  if (!state.selectedCategory) {
    elements.servicesHeading.textContent = 'التصنيفات الرئيسية';
    elements.servicesSubtitle.textContent = 'اختر تصنيفاً من القائمة العلوية للاطلاع على الخدمات المرتبطة به.';
    return;
  }

  elements.servicesHeading.textContent = state.selectedCategory;
  elements.servicesSubtitle.textContent =
    categoryDescriptions[state.selectedCategory] || 'مجموعة من الخدمات المرتبطة بهذا التصنيف.';
};

const updateUserActions = () => {
  if (!elements.userActions) return;

  if (state.currentUser) {
    elements.userActions.innerHTML = `
      <div class="badge">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.33 0-8 2.17-8 5v1h16v-1c0-2.83-3.67-5-8-5Z"/></svg>
        <span>${state.currentUser.fullName}</span>
      </div>
      <button class="btn btn-outline" id="logoutBtn">تسجيل الخروج</button>
    `;
    elements.userActions.querySelector('#logoutBtn').addEventListener('click', () => {
      state.currentUser = null;
      showToast('تم تسجيل الخروج بنجاح.');
      updateUserActions();
      loadComplaints();
      loadRequests();
    });
  } else {
    elements.userActions.innerHTML = `
      <button class="btn btn-outline" id="loginTrigger">تسجيل الدخول</button>
      <button class="btn" id="registerTrigger">إنشاء حساب</button>
    `;
    initAuthTriggers();
  }
};

const showToast = (message, duration = 3000) => {
  elements.toast.textContent = message;
  elements.toast.classList.add('show');
  setTimeout(() => elements.toast.classList.remove('show'), duration);
};

const toggleModal = (open = true) => {
  if (open) {
    elements.authModal.classList.add('open');
    elements.authModal.setAttribute('aria-hidden', 'false');
  } else {
    elements.authModal.classList.remove('open');
    elements.authModal.setAttribute('aria-hidden', 'true');
    switchAuthTab('login');
    state.otpPhone = null;
  }
};

const switchAuthTab = (tab) => {
  const tabs = elements.authModal.querySelectorAll('.modal__tab');
  const forms = elements.authModal.querySelectorAll('[data-tab-content]');

  tabs.forEach((btn) => btn.classList.toggle('active', btn.dataset.tab === tab));
  forms.forEach((form) => {
    form.classList.toggle('hidden', form.dataset.tabContent !== tab);
  });

  const subtitle = {
    login: 'سجّل الدخول للوصول لكافة الخدمات',
    register: 'أنشئ حساباً جديداً لتفعيل الخدمات الإلكترونية',
    otp: 'أدخل كلمة المرور لمرة واحدة المرسلة إلى هاتفك',
  };
  document.getElementById('authSubtitle').textContent = subtitle[tab];
};

const renderHeroStats = (services) => {
  const stats = [
    { label: 'خدمات متاحة إلكترونياً', value: services.filter((s) => s.online).length },
    { label: 'تصنيفات الخدمة', value: new Set(services.map((s) => s.category)).size },
    { label: 'زمن الاستجابة المتوسط', value: '48 ساعة' },
  ];
  elements.heroStats.innerHTML = stats
    .map(
      (stat) => `
      <div class="stat">
        <span>${stat.label}</span>
        <strong>${stat.value}</strong>
      </div>
    `
    )
    .join('');
};

const renderNavigation = (services) => {
  if (!elements.categoryMenu) return;
  const categories = [...new Set(services.map((service) => service.category))];

  if (!categories.length) {
    elements.categoryMenu.innerHTML = '<li class="site-nav__item">لا توجد تصنيفات متاحة حالياً.</li>';
    updateServicesIntro();
    return;
  }

  if (!state.selectedCategory || !categories.includes(state.selectedCategory)) {
    state.selectedCategory = categories[0];
  }

  const defaultMeta = { icon: '📁', caption: 'مجموعة خدمات متنوعة', gradient: ['#428177', '#054239'] };

  elements.categoryMenu.innerHTML = categories
    .map((category) => {
      const meta = { ...defaultMeta, ...(categoryMeta[category] || {}) };
      const [accentStart, accentEnd] = meta.gradient || defaultMeta.gradient;
      const accentStyle = `style="--accent-start:${accentStart}; --accent-end:${accentEnd};"`;

      return `
        <li class="site-nav__item">
          <button type="button" class="site-nav__button ${state.selectedCategory === category ? 'active' : ''}" data-category="${category}" ${accentStyle}>
            <span class="site-nav__icon" aria-hidden="true">${meta.icon}</span>
            <span class="site-nav__text">
              <span class="site-nav__label">${category}</span>
              ${meta.caption ? `<span class="site-nav__caption">${meta.caption}</span>` : ''}
            </span>
          </button>
        </li>
      `;
    })
    .join('');

  updateServicesIntro();
};

const renderServices = (services) => {
  if (!state.selectedCategory) {
    elements.servicesList.innerHTML = '<p class="empty-state">اختر تصنيفاً من الأعلى لعرض الخدمات.</p>';
    return;
  }

  const filtered = services.filter((service) => service.category === state.selectedCategory);

  elements.servicesList.innerHTML = filtered
    .map(
      (service) => `
      <article class="service-card ${state.selectedService === service.id ? 'active' : ''}" data-service-id="${service.id}">
        <h4>${service.title}</h4>
        <p class="service-card__summary">${service.summary || service.description}</p>
        <div class="taglist">
          ${(service.tags || []).map((tag) => `<span>${tag}</span>`).join('')}
        </div>
        <span class="service-card__action">استعراض التفاصيل الكاملة</span>
      </article>
    `
    )
    .join('');

  if (!filtered.length) {
    elements.servicesList.innerHTML = '<p class="empty-state">لا توجد خدمات ضمن هذا التصنيف حالياً.</p>';
  }
};

const renderServiceDetails = async (serviceId) => {
  if (!serviceId) {
    elements.serviceDetails.innerHTML = `
      <div class="empty-state">
        <h4>اختر خدمة للاطلاع على تفاصيلها</h4>
        <p>اضغط على أي خدمة من القائمة لاستعراض الوصف، مسار العمل، قنوات التواصل، وإمكانية التقديم الإلكتروني.</p>
      </div>
    `;
    return;
  }

  try {
    const service = await MockApi.getServiceById(serviceId);
    state.selectedService = serviceId;

    const workflowList = service.workflow.map((step) => `<li>${step}</li>`).join('');

    elements.serviceDetails.innerHTML = `
      <div class="detail-header">
        <h4>${service.title}</h4>
        <span class="tag">${service.category}</span>
      </div>
      <p>${service.description}</p>
      <h5>مسار العمل</h5>
      <ul>${workflowList}</ul>
      <h5>قنوات التواصل</h5>
      <ul>
        <li>📞 ${service.contact.phone}</li>
        <li>✉️ ${service.contact.email}</li>
        <li>📍 ${service.contact.address}</li>
      </ul>
      ${service.online
        ? '<button class="btn" id="applyService">التقديم على الخدمة إلكترونياً</button>'
        : '<p class="empty-state">هذه الخدمة تتطلب الحضور الشخصي حالياً.</p>'}
    `;

    elements.serviceDetails.querySelector('#applyService')?.addEventListener('click', handleApplyService);
  } catch (error) {
    showToast(error.message);
  }
};

const statusLabels = {
  pending: 'بانتظار المراجعة',
  'in-progress': 'قيد المعالجة',
  completed: 'منجزة',
  rejected: 'مرفوضة',
};

const renderComplaints = (items = []) => {
  elements.complaintsPanel.innerHTML = `
    <h4>سجل الشكاوى</h4>
    <form id="complaintForm" class="form-grid">
      <label>
        <span>موضوع الشكوى</span>
        <input type="text" name="subject" required />
      </label>
      <label>
        <span>التصنيف</span>
        <input type="text" name="category" placeholder="مثال: مياه، كهرباء" required />
      </label>
      <label>
        <span>تفاصيل الشكوى</span>
        <textarea name="details" required></textarea>
      </label>
      <button class="btn" type="submit">إرسال الشكوى</button>
    </form>
    ${items.length
      ? `
        <table class="table">
          <thead>
            <tr>
              <th>المعرف</th>
              <th>الموضوع</th>
              <th>التصنيف</th>
              <th>الحالة</th>
              <th>تحديثات</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map(
                (item) => `
                  <tr>
                    <td>${item.id}</td>
                    <td>${item.subject}</td>
                    <td>${item.category}</td>
                    <td><span class="status-tag ${item.status}">${statusLabels[item.status]}</span></td>
                    <td>${item.updates
                      .map((update) => `<div>${update.date} - ${update.note}</div>`)
                      .join('')}</td>
                  </tr>
                `
              )
              .join('')}
          </tbody>
        </table>
      `
      : '<p class="empty-state">لم تقم بتسجيل أي شكوى بعد.</p>'}
  `;

  elements.complaintsPanel.classList.add('active');
  elements.complaintsPanel.querySelector('#complaintForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!state.currentUser) return requireAuth();

    const formData = new FormData(event.target);
    const payload = Object.fromEntries(formData.entries());

    try {
      await MockApi.submitComplaint(state.currentUser.id, payload);
      showToast('تم تسجيل الشكوى بنجاح.');
      loadComplaints();
      event.target.reset();
    } catch (error) {
      showToast(error.message);
    }
  });
};

const renderRequests = (items = []) => {
  elements.requestsPanel.innerHTML = `
    <h4>متابعة الطلبات</h4>
    <form id="requestForm" class="form-grid">
      <label>
        <span>موضوع الطلب</span>
        <input type="text" name="subject" required />
      </label>
      <label>
        <span>الجهة المعنية</span>
        <input type="text" name="department" required />
      </label>
      <label>
        <span>تفاصيل الطلب</span>
        <textarea name="details" required></textarea>
      </label>
      <button class="btn" type="submit">إرسال الطلب</button>
    </form>
    ${items.length
      ? `
        <table class="table">
          <thead>
            <tr>
              <th>المعرف</th>
              <th>الموضوع</th>
              <th>الجهة</th>
              <th>الحالة</th>
              <th>تاريخ التقديم</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map(
                (item) => `
                  <tr>
                    <td>${item.id}</td>
                    <td>${item.subject}</td>
                    <td>${item.department}</td>
                    <td><span class="status-tag ${item.status}">${statusLabels[item.status]}</span></td>
                    <td>${item.createdAt}</td>
                  </tr>
                `
              )
              .join('')}
          </tbody>
        </table>
      `
      : '<p class="empty-state">لم يتم إرسال أي طلب حتى الآن.</p>'}
  `;

  elements.requestsPanel.classList.add('active');
  elements.requestsPanel.querySelector('#requestForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!state.currentUser) return requireAuth();

    const payload = Object.fromEntries(new FormData(event.target).entries());

    try {
      await MockApi.submitRequest(state.currentUser.id, payload);
      showToast('تم إرسال الطلب بنجاح.');
      loadRequests();
      event.target.reset();
    } catch (error) {
      showToast(error.message);
    }
  });
};

const renderSuggestions = async () => {
  const items = await MockApi.getSuggestions();

  elements.suggestionsPanel.innerHTML = `
    <h4>خدمة الاقتراحات</h4>
    <form id="suggestionForm" class="form-grid">
      <label>
        <span>عنوان الاقتراح</span>
        <input type="text" name="title" required />
      </label>
      <label>
        <span>وصف مختصر</span>
        <textarea name="body" required></textarea>
      </label>
      <button class="btn" type="submit">إرسال الاقتراح</button>
    </form>
    ${items.length
      ? `
        <table class="table">
          <thead>
            <tr>
              <th>العنوان</th>
              <th>الوصف</th>
              <th>التاريخ</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map(
                (item) => `
                  <tr>
                    <td>${item.title}</td>
                    <td>${item.body}</td>
                    <td>${item.createdAt}</td>
                  </tr>
                `
              )
              .join('')}
          </tbody>
        </table>
      `
      : '<p class="empty-state">لا توجد اقتراحات بعد، كن أول من يشارك رأيه.</p>'}
  `;

  elements.suggestionsPanel.classList.add('active');
  elements.suggestionsPanel.querySelector('#suggestionForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.target).entries());
    try {
      await MockApi.submitSuggestion(payload);
      showToast('شكراً لمساهمتك!');
      renderSuggestions();
      event.target.reset();
    } catch (error) {
      showToast(error.message);
    }
  });
};

const renderViolations = async () => {
  const items = await MockApi.getViolations();
  const total = items.reduce((sum, item) => sum + item.amount, 0);

  elements.violationsPanel.innerHTML = `
    <h4>المخالفات المسجلة</h4>
    <p>يمكنك استعراض المخالفات والدفع الإلكتروني عند توفره.</p>
    ${items.length
      ? `
        <table class="table">
          <thead>
            <tr>
              <th>الرقم</th>
              <th>النوع</th>
              <th>الوصف</th>
              <th>القيمة (ل.س)</th>
              <th>الحالة</th>
              <th>تاريخ المخالفة</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map(
                (item) => `
                  <tr>
                    <td>${item.id}</td>
                    <td>${item.type}</td>
                    <td>${item.description}</td>
                    <td>${item.amount.toLocaleString('ar-SY')}</td>
                    <td>${item.status}</td>
                    <td>${item.issuedAt}</td>
                  </tr>
                `
              )
              .join('')}
          </tbody>
        </table>
        <div class="detail-header" style="margin-top:1.5rem;">
          <span class="tag">إجمالي الذمم</span>
          <strong>${total.toLocaleString('ar-SY')} ل.س</strong>
        </div>
      `
      : '<p class="empty-state">لا توجد مخالفات مسجلة.</p>'}
  `;

  elements.violationsPanel.classList.add('active');
};

const requireAuth = () => {
  showToast('الرجاء تسجيل الدخول لإتمام هذه العملية.');
  toggleModal(true);
};

const handleApplyService = () => {
  if (!state.currentUser) {
    requireAuth();
    return;
  }
  showToast('تم تهيئة طلبك للخدمة، سيجري تحويلك لواجهة التقديم قريباً.');
};

const loadComplaints = async () => {
  if (!state.currentUser) {
    renderComplaints();
    return;
  }
  const items = await MockApi.getComplaints(state.currentUser.id);
  renderComplaints(items);
};

const loadRequests = async () => {
  if (!state.currentUser) {
    renderRequests();
    return;
  }
  const items = await MockApi.getRequests(state.currentUser.id);
  renderRequests(items);
};

const initPanels = async () => {
  await loadComplaints();
  await loadRequests();
  await renderSuggestions();
  await renderViolations();
};

const initAuthTriggers = () => {
  const loginTrigger = document.getElementById('loginTrigger');
  const registerTrigger = document.getElementById('registerTrigger');
  loginTrigger?.addEventListener('click', () => {
    switchAuthTab('login');
    toggleModal(true);
  });

  registerTrigger?.addEventListener('click', () => {
    switchAuthTab('register');
    toggleModal(true);
  });
};

const initAuth = () => {
  elements.authModal.addEventListener('click', (event) => {
    if (event.target.dataset.close !== undefined || event.target === elements.authModal) {
      toggleModal(false);
    }
  });

  elements.authModal.querySelectorAll('.modal__tab').forEach((tab) => {
    tab.addEventListener('click', () => switchAuthTab(tab.dataset.tab));
  });

  elements.loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const { phone, password } = Object.fromEntries(new FormData(event.target).entries());
    try {
      const user = await MockApi.login(phone, password);
      state.currentUser = user;
      toggleModal(false);
      showToast(`مرحباً بك ${user.fullName}!`);
      loadComplaints();
      loadRequests();
      updateUserActions();
    } catch (error) {
      showToast(error.message);
    }
  });

  elements.registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.target).entries());
    try {
      const { phone, otp } = await MockApi.register(payload);
      state.otpPhone = phone;
      switchAuthTab('otp');
      const hint = elements.otpForm.querySelector('.otp__hint');
      hint.textContent = `تم إرسال كلمة مرور لمرة واحدة إلى الرقم ${phone}. (رمز تجريبي: ${otp})`;
    } catch (error) {
      showToast(error.message);
    }
  });

  elements.otpForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const { otp } = Object.fromEntries(new FormData(event.target).entries());
    if (!state.otpPhone) return;

    try {
      const user = await MockApi.verifyOtp(state.otpPhone, otp);
      state.currentUser = user;
      state.otpPhone = null;
      switchAuthTab('login');
      toggleModal(false);
      showToast('تم تفعيل الحساب بنجاح! يمكنك الآن استخدام المنصة.');
      loadComplaints();
      loadRequests();
      updateUserActions();
    } catch (error) {
      showToast(error.message);
    }
  });
};

const initNavigationCards = () => {
  document.querySelectorAll('.card').forEach((card) => {
    card.addEventListener('click', () => {
      const target = card.dataset.target;
      const panel = document.getElementById(`${target}Panel`);
      if (!panel) return;
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      panel.classList.add('active');
    });
  });
};

const initServices = async () => {
  try {
    const services = await MockApi.getServices();
    state.services = services;
    renderHeroStats(services);
    renderNavigation(services);
    renderServices(services);
    renderServiceDetails(state.selectedService);

    elements.navToggle?.addEventListener('click', () => toggleNavigation());

    elements.categoryMenu?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-category]');
      if (!button) return;
      state.selectedCategory = button.dataset.category;
      state.selectedService = null;
      renderNavigation(state.services);
      renderServices(state.services);
      renderServiceDetails(null);
      if (window.matchMedia('(max-width: 960px)').matches) {
        toggleNavigation(false);
      }
    });

    elements.servicesList.addEventListener('click', (event) => {
      const card = event.target.closest('[data-service-id]');
      if (!card) return;
      const serviceId = card.dataset.serviceId;
      renderServiceDetails(serviceId);
      renderServices(state.services);
    });
  } catch (error) {
    showToast('تعذر تحميل الخدمات حالياً.');
    console.error(error);
  }
};

const initCTAButtons = () => {
  document.getElementById('exploreServices').addEventListener('click', () => {
    document.getElementById('servicesSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (state.services?.length) {
      renderNavigation(state.services);
      renderServices(state.services);
    }
  });

  document.getElementById('contactSupport').addEventListener('click', () => {
    window.location.href = 'tel:015123456';
  });
};

const init = async () => {
  updateUserActions();
  initAuth();
  initNavigationCards();
  initCTAButtons();
  await initServices();
  initChatbot();
  await initPanels();
};

window.addEventListener('DOMContentLoaded', init);
