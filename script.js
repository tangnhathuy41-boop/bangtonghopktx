// ==================== STORAGE & DATA ====================
let appData = {
  roomName: 'Phòng 402 - KTX',
  members: [
    { id: 1, name: 'Huy' },
    { id: 2, name: 'Long' },
    { id: 3, name: 'Tuấn' },
    { id: 4, name: 'Minh' },
    { id: 5, name: 'Nam' },
    { id: 6, name: 'Khánh' }
  ],
  expenses: [
    { id: 1, name: 'Bình nước Lavie 20L', amount: 22000, category: 'Sinh hoạt', payer: 1, beneficiaries: [1,2,3,4,5,6], date: '2025-09-10' },
    { id: 2, name: 'Nước rửa bát Sunlight', amount: 30000, category: 'Vệ sinh', payer: 2, beneficiaries: [1,2,3,4,5,6], date: '2025-09-09' },
    { id: 3, name: 'Túi rác 3 cuộn', amount: 35000, category: 'Vệ sinh', payer: 3, beneficiaries: [1,2,3,4,5,6], date: '2025-09-08' }
  ],
  notices: [
    { id: 1, title: 'Lịch kiểm tra phòng chiều thứ 5', content: 'BQL sẽ kiểm tra vệ sinh phòng vào chiều thứ 5 lúc 15h', type: 'urgent', author: 1, date: '2025-09-10' },
    { id: 2, title: 'Đốc tiền điện nước', content: 'Tiền điện nước tháng 9 là 150k, ai chưa nộp vui lòng nộp sớm', type: 'finance', author: 2, date: '2025-09-09' },
    { id: 3, title: 'Đổi ca trực chiều 12/9', content: 'Huy bận thi, xin đổi ca trực với Tuấn', type: 'swap', author: 1, date: '2025-09-08' }
  ],
  duty: [
    { day: 'T2', person: 1, task: 'Quét phòng' },
    { day: 'T3', person: 2, task: 'Đổ rác' },
    { day: 'T4', person: 3, task: 'Lau sàn' },
    { day: 'T5', person: 4, task: 'Quét phòng' },
    { day: 'T6', person: 5, task: 'Đổ rác' },
    { day: 'T7', person: 6, task: 'Lau sàn' },
    { day: 'CN', person: 1, task: 'Quét phòng' }
  ]
};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
  loadDataFromLocalStorage();
  initializeApp();
});

function loadDataFromLocalStorage() {
  const saved = localStorage.getItem('ktxAppData');
  if (saved) {
    appData = JSON.parse(saved);
  }
}

function saveDataToLocalStorage() {
  localStorage.setItem('ktxAppData', JSON.stringify(appData));
}

function initializeApp() {
  updateRoomTitle();
  populateMemberSelects();
  renderExpenses();
  renderNotices();
  renderDutySchedule();
  renderMembers();
  updateStats();
  switchTab('expenses');
}

// ==================== TAB NAVIGATION ====================
function switchTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('[id^="tabContent-"]').forEach(tab => {
    tab.classList.add('hidden');
  });

  // Show selected tab
  const selectedTab = document.getElementById(`tabContent-${tabName}`);
  if (selectedTab) {
    selectedTab.classList.remove('hidden');
  }

  // Update stats visibility
  if (tabName === 'notices') {
    document.getElementById('compactStatsStrip').classList.add('hidden');
    document.getElementById('fullStatsContainer').classList.remove('hidden');
  } else {
    document.getElementById('compactStatsStrip').classList.remove('hidden');
    document.getElementById('fullStatsContainer').classList.add('hidden');
  }

  // Update nav buttons
  updateNavButtons(tabName);
}

function selectTabFromSidebar(tabName) {
  toggleSidebar(false);
  switchTab(tabName);
}

function updateNavButtons(tabName) {
  document.querySelectorAll('[id^="nav"]').forEach(btn => {
    btn.classList.remove('bg-indigo-600', 'text-white');
    btn.classList.add('text-slate-700', 'hover:bg-indigo-50');
  });

  const selectedBtn = document.getElementById(`nav${tabName.charAt(0).toUpperCase() + tabName.slice(1)}Btn`);
  if (selectedBtn) {
    selectedBtn.classList.add('bg-indigo-600', 'text-white');
    selectedBtn.classList.remove('text-slate-700', 'hover:bg-indigo-50');
  }
}

// ==================== SIDEBAR ====================
function toggleSidebar(show) {
  const drawer = document.getElementById('sidebarDrawer');
  const overlay = document.getElementById('sidebarOverlay');
  
  if (show) {
    drawer.classList.remove('-translate-x-full');
    overlay.classList.remove('opacity-0', 'pointer-events-none');
  } else {
    drawer.classList.add('-translate-x-full');
    overlay.classList.add('opacity-0', 'pointer-events-none');
  }
}

// ==================== MODAL MANAGEMENT ====================
function closeModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
}

function openModal(modalId) {
  document.getElementById(modalId).classList.remove('hidden');
}

// ==================== ROOM SETTINGS ====================
function openRoomSettingsModal() {
  openModal('modalRoomSettings');
  document.getElementById('inputNewRoomTitle').value = appData.roomName;
}

function saveNewRoomTitle() {
  const newTitle = document.getElementById('inputNewRoomTitle').value.trim();
  if (newTitle) {
    appData.roomName = newTitle;
    updateRoomTitle();
    saveDataToLocalStorage();
    closeModal('modalRoomSettings');
  }
}

function updateRoomTitle() {
  document.getElementById('headerRoomTitle').textContent = appData.roomName;
  document.getElementById('drawerRoomNameLabel').textContent = appData.roomName;
}

// ==================== EXPENSES ====================
function handleSaveExpense(event) {
  event.preventDefault();
  
  const name = document.getElementById('inputExpenseName').value;
  const amount = parseInt(document.getElementById('inputExpenseAmount').value);
  const category = document.getElementById('selectCategory').value;
  const payer = parseInt(document.getElementById('selectPayer').value);
  const beneficiaries = Array.from(document.querySelectorAll('#beneficiariesCheckboxGrid input:checked')).map(cb => parseInt(cb.value));

  if (beneficiaries.length === 0) {
    alert('Vui lòng chọn ít nhất 1 người cùng chia tiền');
    return;
  }

  const expense = {
    id: appData.expenses.length + 1,
    name,
    amount,
    category,
    payer,
    beneficiaries,
    date: new Date().toISOString().split('T')[0]
  };

  appData.expenses.push(expense);
  saveDataToLocalStorage();
  renderExpenses();
  updateStats();
  
  // Reset form
  document.getElementById('formAddExpense').reset();
  document.querySelectorAll('#beneficiariesCheckboxGrid input').forEach(cb => cb.checked = true);
}

function renderExpenses() {
  const tableBody = document.getElementById('expenseTableBody');
  const mobileList = document.getElementById('expenseMobileList');
  
  tableBody.innerHTML = '';
  mobileList.innerHTML = '';

  appData.expenses.forEach(expense => {
    const payer = appData.members.find(m => m.id === expense.payer);
    const beneficiaryNames = expense.beneficiaries.map(id => appData.members.find(m => m.id === id).name).join(', ');

    // Desktop table row
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="py-3 px-3 font-semibold text-slate-900">${expense.name}</td>
      <td class="py-3 px-3 text-slate-500 text-xs">${expense.category}</td>
      <td class="py-3 px-3 font-bold text-indigo-600">${expense.amount.toLocaleString('vi-VN')} ₫</td>
      <td class="py-3 px-3 text-slate-800">${payer?.name}</td>
      <td class="py-3 px-3 text-xs text-slate-600">${beneficiaryNames}</td>
      <td class="py-3 px-3 text-right">
        <button onclick="editExpense(${expense.id})" class="px-2 py-1 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded transition">Sửa</button>
        <button onclick="deleteExpense(${expense.id})" class="px-2 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded transition">Xóa</button>
      </td>
    `;
    tableBody.appendChild(row);

    // Mobile card
    const card = document.createElement('div');
    card.className = 'bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2';
    card.innerHTML = `
      <div class="flex justify-between items-start">
        <div>
          <div class="font-bold text-slate-900">${expense.name}</div>
          <div class="text-xs text-slate-500">${expense.category}</div>
        </div>
        <div class="font-bold text-indigo-600 text-right">${expense.amount.toLocaleString('vi-VN')} ₫</div>
      </div>
      <div class="text-xs text-slate-600">Người ứng: <span class="font-bold">${payer?.name}</span></div>
      <div class="text-xs text-slate-600">Chia cho: <span class="font-bold">${beneficiaryNames}</span></div>
      <div class="flex gap-2 justify-end">
        <button onclick="editExpense(${expense.id})" class="px-2 py-1 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded">Sửa</button>
        <button onclick="deleteExpense(${expense.id})" class="px-2 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded">Xóa</button>
      </div>
    `;
    mobileList.appendChild(card);
  });

  document.getElementById('expenseCountBadge').textContent = `${appData.expenses.length} khoản`;
  document.getElementById('sidebarExpenseBadge').textContent = appData.expenses.length;
}

function deleteExpense(id) {
  if (confirm('Bạn có chắc chắn muốn xóa khoản chi này?')) {
    appData.expenses = appData.expenses.filter(e => e.id !== id);
    saveDataToLocalStorage();
    renderExpenses();
    updateStats();
  }
}

function editExpense(id) {
  const expense = appData.expenses.find(e => e.id === id);
  if (!expense) return;

  document.getElementById('editExpenseId').value = id;
  document.getElementById('editExpenseName').value = expense.name;
  document.getElementById('editExpenseAmount').value = expense.amount;
  document.getElementById('editExpenseCategory').value = expense.category;
  document.getElementById('editExpensePayer').value = expense.payer;

  // Populate beneficiaries
  const grid = document.getElementById('editBeneficiariesCheckboxGrid');
  grid.innerHTML = '';
  appData.members.forEach(member => {
    const label = document.createElement('label');
    label.className = 'flex items-center gap-2 cursor-pointer';
    label.innerHTML = `
      <input type="checkbox" value="${member.id}" ${expense.beneficiaries.includes(member.id) ? 'checked' : ''}>
      <span class="text-xs font-semibold">${member.name}</span>
    `;
    grid.appendChild(label);
  });

  openModal('modalEditExpense');
}

function handleSaveEditedExpense(event) {
  event.preventDefault();
  
  const id = parseInt(document.getElementById('editExpenseId').value);
  const expense = appData.expenses.find(e => e.id === id);
  
  expense.name = document.getElementById('editExpenseName').value;
  expense.amount = parseInt(document.getElementById('editExpenseAmount').value);
  expense.category = document.getElementById('editExpenseCategory').value;
  expense.payer = parseInt(document.getElementById('editExpensePayer').value);
  expense.beneficiaries = Array.from(document.querySelectorAll('#editBeneficiariesCheckboxGrid input:checked')).map(cb => parseInt(cb.value));

  saveDataToLocalStorage();
  renderExpenses();
  updateStats();
  closeModal('modalEditExpense');
}

// ==================== NOTICES ====================
function openCreateNoticeModal() {
  openModal('modalCreateNotice');
  document.getElementById('noticeAuthorSelect').value = appData.members[0].id;
}

function handleSaveNotice(event) {
  event.preventDefault();
  
  const title = document.getElementById('noticeTitleInput').value;
  const content = document.getElementById('noticeContentInput').value;
  const type = document.getElementById('noticeTypeInput').value;
  const author = parseInt(document.getElementById('noticeAuthorSelect').value);

  const notice = {
    id: appData.notices.length + 1,
    title,
    content,
    type,
    author,
    date: new Date().toISOString().split('T')[0]
  };

  appData.notices.push(notice);
  saveDataToLocalStorage();
  renderNotices();
  closeModal('modalCreateNotice');
  document.getElementById('formCreateNotice').reset();
}

function renderNotices() {
  const container = document.getElementById('fullNoticesContainer');
  const topList = document.getElementById('topNoticeList');
  
  container.innerHTML = '';
  topList.innerHTML = '';

  const typeColors = {
    swap: 'bg-sky-50 border-sky-200 text-sky-900',
    urgent: 'bg-rose-50 border-rose-200 text-rose-900',
    finance: 'bg-amber-50 border-amber-200 text-amber-900',
    general: 'bg-slate-50 border-slate-200 text-slate-900'
  };

  appData.notices.forEach((notice, idx) => {
    const author = appData.members.find(m => m.id === notice.author);
    const colorClass = typeColors[notice.type] || typeColors.general;

    const card = document.createElement('div');
    card.className = `p-3 border rounded-xl ${colorClass}`;
    card.innerHTML = `
      <div class="flex justify-between items-start gap-2">
        <div class="flex-grow min-w-0">
          <div class="font-bold text-sm">${notice.title}</div>
          <div class="text-xs mt-1 opacity-75">${notice.content}</div>
          <div class="text-[10px] mt-2 opacity-60">${author?.name} - ${notice.date}</div>
        </div>
        <button onclick="deleteNotice(${notice.id})" class="px-2 py-1 text-xs font-bold hover:opacity-70">Xóa</button>
      </div>
    `;
    container.appendChild(card);

    if (idx < 3) {
      topList.appendChild(card.cloneNode(true));
    }
  });

  document.getElementById('noticeCountTag').textContent = appData.notices.length;
  document.getElementById('sidebarNoticeBadge').textContent = appData.notices.length;
}

function deleteNotice(id) {
  appData.notices = appData.notices.filter(n => n.id !== id);
  saveDataToLocalStorage();
  renderNotices();
}

function filterNotices(type) {
  document.querySelectorAll('[id^="noticeFilter-"]').forEach(btn => {
    btn.classList.remove('bg-slate-900', 'text-white');
    btn.classList.add('bg-slate-100', 'text-slate-600');
  });

  document.getElementById(`noticeFilter-${type}`).classList.add('bg-slate-900', 'text-white');
  document.getElementById(`noticeFilter-${type}`).classList.remove('bg-slate-100', 'text-slate-600');

  const container = document.getElementById('fullNoticesContainer');
  container.innerHTML = '';

  const filtered = type === 'all' ? appData.notices : appData.notices.filter(n => n.type === type);
  
  const typeColors = {
    swap: 'bg-sky-50 border-sky-200 text-sky-900',
    urgent: 'bg-rose-50 border-rose-200 text-rose-900',
    finance: 'bg-amber-50 border-amber-200 text-amber-900',
    general: 'bg-slate-50 border-slate-200 text-slate-900'
  };

  filtered.forEach(notice => {
    const author = appData.members.find(m => m.id === notice.author);
    const colorClass = typeColors[notice.type] || typeColors.general;

    const card = document.createElement('div');
    card.className = `p-3 border rounded-xl ${colorClass}`;
    card.innerHTML = `
      <div class="flex justify-between items-start gap-2">
        <div class="flex-grow min-w-0">
          <div class="font-bold text-sm">${notice.title}</div>
          <div class="text-xs mt-1 opacity-75">${notice.content}</div>
          <div class="text-[10px] mt-2 opacity-60">${author?.name} - ${notice.date}</div>
        </div>
        <button onclick="deleteNotice(${notice.id})" class="px-2 py-1 text-xs font-bold hover:opacity-70">Xóa</button>
      </div>
    `;
    container.appendChild(card);
  });
}

// ==================== DUTY SCHEDULE ====================
function renderDutySchedule() {
  const grid = document.getElementById('weeklyDutyGrid');
  grid.innerHTML = '';

  appData.duty.forEach((duty, idx) => {
    const person = appData.members.find(m => m.id === duty.person);
    const card = document.createElement('div');
    card.className = 'bg-white p-3 rounded-xl border border-slate-200 hover:shadow-md transition';
    card.innerHTML = `
      <div class="flex items-center justify-between mb-2">
        <div class="font-bold text-sm text-slate-900">${duty.day}</div>
        <button onclick="swapDutyModal(${idx})" class="px-2 py-1 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded">Đổi</button>
      </div>
      <div class="text-xs text-slate-600">Trực: <span class="font-bold text-emerald-600">${person?.name}</span></div>
      <div class="text-xs text-slate-600 mt-1">Việc: ${duty.task}</div>
    `;
    grid.appendChild(card);
  });

  updateTodayDuty();
}

function updateTodayDuty() {
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const today = days[new Date().getDay()];
  const todayDuty = appData.duty.find(d => d.day === today);
  
  if (todayDuty) {
    const person = appData.members.find(m => m.id === todayDuty.person);
    document.getElementById('compactTodayDuty').textContent = person?.name || 'N/A';
    document.getElementById('statTodayDutyPerson').textContent = person?.name || 'N/A';
    document.getElementById('statTodayDutyTask').textContent = todayDuty.task;
  }
}

function swapDutyModal(dayIndex) {
  openModal('modalSwapDuty');
  const daySelect = document.getElementById('swapDaySelect');
  daySelect.innerHTML = '';
  appData.duty.forEach((d, idx) => {
    const option = document.createElement('option');
    option.value = idx;
    option.textContent = d.day;
    daySelect.appendChild(option);
  });
  daySelect.value = dayIndex;

  const memberSelect = document.getElementById('swapTargetMemberSelect');
  memberSelect.innerHTML = '';
  appData.members.forEach(m => {
    const option = document.createElement('option');
    option.value = m.id;
    option.textContent = m.name;
    memberSelect.appendChild(option);
  });
}

// ==================== MEMBERS ====================
function renderMembers() {
  const container = document.getElementById('membersListContainer');
  container.innerHTML = '';

  appData.members.forEach(member => {
    const card = document.createElement('div');
    card.className = 'bg-white p-3 rounded-xl border border-slate-200 hover:shadow-md transition';
    card.innerHTML = `
      <div class="flex items-center gap-2 mb-2">
        <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">${member.name.charAt(0)}</div>
        <div class="flex-grow min-w-0">
          <div class="font-bold text-slate-900 text-sm">${member.name}</div>
          <div class="text-xs text-slate-500">Thành viên phòng</div>
        </div>
        <button onclick="editMember(${member.id})" class="px-2 py-1 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded">Sửa</button>
      </div>
    `;
    container.appendChild(card);
  });

  document.getElementById('sidebarMemberCountBadge').textContent = appData.members.length;
}

function openAddMemberModal() {
  document.getElementById('inputMemberId').value = '';
  document.getElementById('inputMemberName').value = '';
  document.getElementById('memberModalTitle').textContent = 'Thêm Bạn Cùng Phòng';
  openModal('modalMemberForm');
}

function handleSaveMember(event) {
  event.preventDefault();
  
  const id = document.getElementById('inputMemberId').value;
  const name = document.getElementById('inputMemberName').value.trim();

  if (!name) return;

  if (id) {
    const member = appData.members.find(m => m.id === parseInt(id));
    if (member) member.name = name;
  } else {
    appData.members.push({
      id: Math.max(...appData.members.map(m => m.id), 0) + 1,
      name
    });
  }

  saveDataToLocalStorage();
  renderMembers();
  populateMemberSelects();
  closeModal('modalMemberForm');
}

function editMember(id) {
  const member = appData.members.find(m => m.id === id);
  if (member) {
    document.getElementById('inputMemberId').value = id;
    document.getElementById('inputMemberName').value = member.name;
    document.getElementById('memberModalTitle').textContent = 'Sửa Thông Tin Bạn';
    openModal('modalMemberForm');
  }
}

function populateMemberSelects() {
  const selects = ['selectPayer', 'editExpensePayer', 'aiExpensePayer', 'noticeAuthorSelect'];
  
  selects.forEach(selectId => {
    const select = document.getElementById(selectId);
    if (select) {
      const currentValue = select.value;
      select.innerHTML = '';
      appData.members.forEach(member => {
        const option = document.createElement('option');
        option.value = member.id;
        option.textContent = member.name;
        select.appendChild(option);
      });
      if (currentValue) select.value = currentValue;
    }
  });

  // Populate beneficiaries checkboxes
  const grids = ['beneficiariesCheckboxGrid', 'editBeneficiariesCheckboxGrid', 'aiBeneficiariesGrid'];
  grids.forEach(gridId => {
    const grid = document.getElementById(gridId);
    if (grid && grid.childNodes.length === 0) {
      appData.members.forEach(member => {
        const label = document.createElement('label');
        label.className = 'flex items-center gap-2 cursor-pointer';
        label.innerHTML = `
          <input type="checkbox" value="${member.id}" checked>
          <span class="text-xs font-semibold">${member.name}</span>
        `;
        grid.appendChild(label);
      });
    }
  });
}

// ==================== STATS ====================
function updateStats() {
  const total = appData.expenses.reduce((sum, e) => sum + e.amount, 0);
  const average = appData.members.length > 0 ? Math.round(total / appData.members.length) : 0;
  const transfers = Math.max(appData.members.length - 1, 0);

  document.getElementById('compactTotalExpense').textContent = `${total.toLocaleString('vi-VN')} ₫`;
  document.getElementById('compactAvgExpense').textContent = `${average.toLocaleString('vi-VN')} ₫`;
  document.getElementById('compactTransfers').textContent = `${transfers} lệnh`;

  document.getElementById('statTotalExpense').textContent = `${total.toLocaleString('vi-VN')} ₫`;
  document.getElementById('statAverageExpense').textContent = `${average.toLocaleString('vi-VN')} ₫`;
  document.getElementById('statTransferCount').textContent = `${transfers} lệnh`;
}

// ==================== QUICK ACTIONS ====================
function toggleTopNoticeBanner() {
  const content = document.getElementById('noticeBannerContent');
  const icon = document.getElementById('btnToggleNoticeIcon');
  
  content.classList.toggle('hidden');
  icon.innerHTML = content.classList.contains('hidden') 
    ? '<i class="fa-solid fa-chevron-down"></i>' 
    : '<i class="fa-solid fa-chevron-up"></i>';
}

function toggleAllBeneficiaries() {
  const checkboxes = document.querySelectorAll('#beneficiariesCheckboxGrid input');
  const allChecked = Array.from(checkboxes).every(cb => cb.checked);
  
  checkboxes.forEach(cb => cb.checked = !allChecked);
  
  const btn = document.getElementById('btnToggleAllBeneficiaries');
  btn.textContent = allChecked ? 'Chọn tất cả' : 'Bỏ chọn tất cả';
}

function toggleEditBeneficiaries() {
  const checkboxes = document.querySelectorAll('#editBeneficiariesCheckboxGrid input');
  const allChecked = Array.from(checkboxes).every(cb => cb.checked);
  
  checkboxes.forEach(cb => cb.checked = !allChecked);
}

function toggleAIBeneficiaries() {
  const checkboxes = document.querySelectorAll('#aiBeneficiariesGrid input');
  const allChecked = Array.from(checkboxes).every(cb => cb.checked);
  
  checkboxes.forEach(cb => cb.checked = !allChecked);
}

function setQuickExpense(name, amount, category) {
  document.getElementById('inputExpenseName').value = name;
  document.getElementById('inputExpenseAmount').value = amount;
  document.getElementById('selectCategory').value = category;
}

function updateAmountPreview() {
  const amount = document.getElementById('inputExpenseAmount').value;
  const badge = document.getElementById('amountPreviewBadge');
  if (amount) {
    badge.textContent = parseInt(amount).toLocaleString('vi-VN') + ' ₫';
  }
}

// ==================== STUB FUNCTIONS (TO BE IMPLEMENTED) ====================
function openScanBillModal() {
  openModal('modalScanBill');
}

function handleBillImageSelected(event) {
  alert('Chức năng quét bill AI sẽ được hoàn thành sau');
}

function confirmAICreatedExpense() {
  alert('Chức năng quét bill AI sẽ được hoàn thành sau');
  closeModal('modalScanBill');
}

function openSpinWheelModal() {
  openModal('modalSpinWheel');
}

function startSpinningWheel() {
  alert('Chức năng vòng quay sẽ được hoàn thành sau');
}

function assignSpinnedPersonToToday() {
  alert('Chức năng gán trực sẽ được hoàn thành sau');
}

function regenerateSchedule() {
  alert('Chức năng xáo trộn lịch sẽ được hoàn thành sau');
}

function executeSwapDuty() {
  alert('Chức năng đổi ca sẽ được hoàn thành sau');
  closeModal('modalSwapDuty');
}

function openAddChecklistModal() {
  alert('Chức năng checklist sẽ được hoàn thành sau');
}

function openShareReportModal() {
  openModal('modalShareReport');
  document.getElementById('shareReportTextarea').value = generateReport();
}

function generateReport() {
  const total = appData.expenses.reduce((sum, e) => sum + e.amount, 0);
  const average = appData.members.length > 0 ? Math.round(total / appData.members.length) : 0;
  
  return `📊 BÁO CÁO KTX - ${appData.roomName}

💰 Tổng chi tiêu: ${total.toLocaleString('vi-VN')} ₫
👥 Bình quân/người: ${average.toLocaleString('vi-VN')} ₫
📅 Thời gian: ${new Date().toLocaleDateString('vi-VN')}

=== CHI TIẾT KHOẢN CHI ===`;
}

function copyReportTextToClipboard() {
  const text = document.getElementById('shareReportTextarea').value;
  navigator.clipboard.writeText(text);
  alert('Đã sao chép báo cáo!');
}

function copyQRTransferText() {
  alert('Chức năng VietQR sẽ được hoàn thành sau');
}

function confirmQRPaymentSuccess() {
  alert('Chức năng xác nhận thanh toán sẽ được hoàn thành sau');
}

function closeVietQRModal() {
  closeModal('modalVietQR');
}

function exportDataJson() {
  const json = JSON.stringify(appData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ktx-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
}
