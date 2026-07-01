// ==========================================
// STATE
// ==========================================
const state = {
    currentView: 'list',
    selectedCustomerId: null,
    searchQuery: '',
    levelFilter: '',
    sortOrder: 'desc',
    page: 1,
    limit: 10,
    totalPages: 1,
    pendingCustomerId: null
};

// ==========================================
// DOM REFS
// ==========================================
const $ = (id) => document.getElementById(id);
const searchInput = $('search-input');
const filterLevel = $('filter-level');
const sortPoin = $('sort-poin');
const limitSelect = $('limit-select');
const customerTbody = $('customer-tbody');
const pagination = $('pagination');
const pageList = $('page-list');
const pageDetail = $('page-detail');
const loadingSpinner = $('loading-spinner');
const emptyState = $('empty-state');
const totalBadge = $('total-customer-badge');

// ==========================================
// API
// ==========================================
const API_BASE = 'api';

async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

async function postJSON(url, data) {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
    return json;
}

function getCustomers() {
    const params = new URLSearchParams({
        search: state.searchQuery,
        level: state.levelFilter,
        sort: state.sortOrder,
        page: state.page,
        limit: state.limit
    });
    return fetchJSON(`${API_BASE}/customers.php?${params}`);
}

function getCustomerById(id) {
    return fetchJSON(`${API_BASE}/customer.php?id=${id}`);
}

function getPointHistory(id) {
    return fetchJSON(`${API_BASE}/points.php?id=${id}`);
}

function getRewardHistory(id) {
    return fetchJSON(`${API_BASE}/rewards.php?id=${id}`);
}

function createCustomer(data) {
    return postJSON(`${API_BASE}/customer-create.php`, data);
}

function updateCustomer(data) {
    return postJSON(`${API_BASE}/customer-update.php`, data);
}

function deleteCustomer(customerId) {
    return postJSON(`${API_BASE}/customer-delete.php`, { customer_id: customerId });
}

// ==========================================
// FORMAT HELPERS
// ==========================================
function formatRupiah(n) {
    return 'Rp' + Number(n).toLocaleString('id-ID');
}

function formatNumber(n) {
    return Number(n).toLocaleString('id-ID');
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getLevelBadge(level, points) {
    if (points >= 5000) {
        return `<span class="badge badge-platinum"><i class="fas fa-crown"></i> Platinum</span>`;
    }
    const icons = { Bronze: 'fa-medal', Silver: 'fa-shield', Gold: 'fa-crown' };
    const icon = icons[level] || 'fa-tag';
    return `<span class="badge badge-${level.toLowerCase()}"><i class="fas ${icon}"></i> ${level}</span>`;
}

function getStatusBadge(status) {
    const s = status.toLowerCase();
    const icons = { berhasil: 'fa-check-circle', diproses: 'fa-clock', dibatalkan: 'fa-times-circle' };
    const icon = icons[s] || 'fa-circle';
    return `<span class="badge-status badge-${s}"><i class="fas ${icon}"></i> ${status}</span>`;
}

function todayStr() {
    return new Date().toISOString().split('T')[0];
}

// ==========================================
// THRESHOLD CONFIG
// ==========================================
const LEVEL_THRESHOLDS = [
    { level: 'Bronze', min: 0, max: 999, next: 'Silver', nextMin: 1000 },
    { level: 'Silver', min: 1000, max: 2999, next: 'Gold', nextMin: 3000 },
    { level: 'Gold', min: 3000, max: Infinity, next: null, nextMin: null }
];

function getLevelInfo(points) {
    for (const t of LEVEL_THRESHOLDS) {
        if (points >= t.min && points <= t.max) return t;
    }
    return LEVEL_THRESHOLDS[2];
}

function calcProgress(points) {
    const info = getLevelInfo(points);
    if (!info.next) return { percent: 100, current: info.level, next: null, currentMin: info.min };
    const range = info.nextMin - info.min;
    const progress = ((points - info.min) / range) * 100;
    return {
        percent: Math.min(100, Math.max(0, Math.round(progress))),
        current: info.level,
        next: info.next,
        currentMin: info.min,
        nextMin: info.nextMin
    };
}

// ==========================================
// TOAST NOTIFICATION
// ==========================================
function showToast(message, type) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const colors = {
        success: 'rgba(34,197,94,.15)',
        error: 'rgba(239,68,68,.15)',
        info: 'rgba(245,158,11,.15)'
    };
    const textColors = {
        success: '#22C55E',
        error: '#EF4444',
        info: '#F59E0B'
    };
    const borders = {
        success: 'rgba(34,197,94,.2)',
        error: 'rgba(239,68,68,.2)',
        info: 'rgba(245,158,11,.2)'
    };

    const t = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle';
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.cssText = `
        position:fixed;bottom:24px;right:24px;z-index:3000;
        background:${colors[type] || colors.info};color:${textColors[type] || textColors.info};
        padding:16px 24px;border-radius:14px;font-family:inherit;
        font-size:14px;font-weight:500;backdrop-filter:blur(12px);
        box-shadow:0 8px 32px rgba(0,0,0,0.3);
        display:flex;align-items:center;gap:10px;
        border:1px solid ${borders[type] || borders.info};
        animation:toastSlide 0.3s ease;
    `;
    toast.innerHTML = `<i class="fas fa-${t}"></i> ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; setTimeout(() => toast.remove(), 300); }, 3000);
}

// inject keyframe if not exists
if (!document.getElementById('toast-style')) {
    const s = document.createElement('style');
    s.id = 'toast-style';
    s.textContent = `@keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`;
    document.head.appendChild(s);
}

// ==========================================
// RENDER: CUSTOMER TABLE
// ==========================================
async function renderCustomerTable() {
    loadingSpinner.style.display = 'block';
    emptyState.style.display = 'none';
    customerTbody.innerHTML = '';
    pagination.innerHTML = '';

    try {
        const result = await getCustomers();
        loadingSpinner.style.display = 'none';

        if (!result.success || result.data.length === 0) {
            emptyState.style.display = 'block';
            totalBadge.textContent = '0 Pelanggan';
            return;
        }

        totalBadge.textContent = `${result.pagination.total} Pelanggan`;
        state.totalPages = result.pagination.totalPages;

        result.data.forEach(c => {
            const tr = document.createElement('tr');
            const level = c.total_points >= 5000 ? 'Platinum' : c.level;
            const avatarClass = getAvatarClass(level);
            tr.innerHTML = `
                <td>
                    <div class="customer-cell">
                        <div class="customer-avatar ${avatarClass}">${getInitials(c.name)}</div>
                        <div class="customer-info">
                            <span class="customer-name">${c.name}</span>
                            <span class="customer-id">${c.customer_id}</span>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="points-cell">
                        <span class="points-value">${formatNumber(c.total_points)}</span>
                        <span class="points-label">Reward Points</span>
                    </div>
                </td>
                <td>${getLevelBadge(c.level, c.total_points)}</td>
                <td>${formatDate(c.last_transaction_date)}</td>
                <td>
                    <button class="btn btn-detail btn-sm" data-id="${c.customer_id}" data-tooltip="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-edit btn-sm" data-id="${c.customer_id}" data-tooltip="Edit Customer">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-hapus btn-sm" data-id="${c.customer_id}" data-tooltip="Delete Customer">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            customerTbody.appendChild(tr);
        });

        renderPagination(result.pagination);
        attachRowButtons();
    } catch (err) {
        loadingSpinner.style.display = 'none';
        customerTbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--danger);padding:30px;">
            <i class="fas fa-exclamation-triangle"></i> Failed to load data: ${err.message}
        </td></tr>`;
    }
}

function attachRowButtons() {
    document.querySelectorAll('.btn-detail').forEach(btn => {
        btn.addEventListener('click', () => showDetailModal(btn.dataset.id));
    });
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => openFormModal(btn.dataset.id));
    });
    document.querySelectorAll('.btn-hapus').forEach(btn => {
        btn.addEventListener('click', () => showHapusModal(btn.dataset.id));
    });
}

// ==========================================
// PAGINATION
// ==========================================
function renderPagination(p) {
    pagination.innerHTML = '';
    if (p.totalPages <= 1) return;

    const prevBtn = document.createElement('button');
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = p.page <= 1;
    prevBtn.addEventListener('click', () => { state.page = p.page - 1; renderCustomerTable(); });
    pagination.appendChild(prevBtn);

    const maxVisible = 5;
    let start = Math.max(1, p.page - Math.floor(maxVisible / 2));
    let end = Math.min(p.totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

    if (start > 1) {
        const first = document.createElement('button');
        first.textContent = '1';
        first.addEventListener('click', () => { state.page = 1; renderCustomerTable(); });
        pagination.appendChild(first);
        if (start > 2) {
            const dots = document.createElement('button');
            dots.textContent = '...';
            dots.disabled = true;
            pagination.appendChild(dots);
        }
    }

    for (let i = start; i <= end; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        if (i === p.page) btn.classList.add('active');
        btn.addEventListener('click', () => { state.page = i; renderCustomerTable(); });
        pagination.appendChild(btn);
    }

    if (end < p.totalPages) {
        if (end < p.totalPages - 1) {
            const dots = document.createElement('button');
            dots.textContent = '...';
            dots.disabled = true;
            pagination.appendChild(dots);
        }
        const last = document.createElement('button');
        last.textContent = p.totalPages;
        last.addEventListener('click', () => { state.page = p.totalPages; renderCustomerTable(); });
        pagination.appendChild(last);
    }

    const nextBtn = document.createElement('button');
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = p.page >= p.totalPages;
    nextBtn.addEventListener('click', () => { state.page = p.page + 1; renderCustomerTable(); });
    pagination.appendChild(nextBtn);
}

// ==========================================
// RENDER: DETAIL PAGE
// ==========================================
async function renderDetail(customerId) {
    state.selectedCustomerId = customerId;

    try {
        const [custRes, pointsRes, rewardsRes] = await Promise.all([
            getCustomerById(customerId),
            getPointHistory(customerId),
            getRewardHistory(customerId)
        ]);

        if (!custRes.success) throw new Error('Customer tidak ditemukan');

        const c = custRes.data;
        const points = pointsRes.data || [];
        const rewards = rewardsRes.data || [];

        renderStatCards(c, rewards.length, points.length);
        renderCustomerInfo(c);
        renderProgress(c.total_points);
        renderPointHistory(points);
        renderRewardHistory(rewards);

        switchView('detail');
    } catch (err) {
        showToast('Gagal memuat detail: ' + err.message, 'error');
        switchView('list');
    }
}

function renderStatCards(c, rewardCount, txCount) {
    $('stat-cards').innerHTML = `
        <div class="stat-card">
            <div class="stat-icon gold"><i class="bi bi-star-fill"></i></div>
            <div class="stat-info">
                <h4>${formatNumber(c.total_points)}</h4>
                <p>Total Points</p>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon green"><i class="bi bi-gift-fill"></i></div>
            <div class="stat-info">
                <h4>${formatNumber(rewardCount)}</h4>
                <p>Rewards Redeemed</p>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon purple"><i class="bi bi-receipt"></i></div>
            <div class="stat-info">
                <h4>${formatNumber(txCount)}</h4>
                <p>Total Transactions</p>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon amber"><i class="bi bi-crown-fill"></i></div>
            <div class="stat-info">
                <h4>${getLevelBadge(c.level, c.total_points)}</h4>
                <p>Membership Level</p>
            </div>
        </div>
    `;
}

function renderCustomerInfo(c) {
    $('customer-info-card').innerHTML = `
        <h3><i class="bi bi-person-vcard-fill"></i> Customer Information</h3>
        <div class="customer-info-grid">
            <div class="info-item">
                <div class="label">Customer ID</div>
                <div class="value">${c.customer_id}</div>
            </div>
            <div class="info-item">
                <div class="label">Name</div>
                <div class="value">${c.name}</div>
            </div>
            <div class="info-item">
                <div class="label">Total Points</div>
                <div class="value">${formatNumber(c.total_points)}</div>
            </div>
            <div class="info-item">
                <div class="label">Member Level</div>
                <div class="value">${getLevelBadge(c.level, c.total_points)}</div>
            </div>
            <div class="info-item">
                <div class="label">Total Transactions</div>
                <div class="value">${formatNumber(c.total_transactions)}</div>
            </div>
            <div class="info-item">
                <div class="label">Last Transaction</div>
                <div class="value">${formatDate(c.last_transaction_date)}</div>
            </div>
        </div>
    `;
}

function renderProgress(points) {
    const container = $('progress-content');
    const prog = calcProgress(points);
    let html = `<div class="progress-container">`;

    if (prog.next) {
        html += `
            <div class="progress-info">
                <span class="level-label current">${prog.current}</span>
                <i class="bi bi-arrow-right"></i>
                <span class="level-label next">${prog.next}</span>
            </div>
            <div class="progress-bar-wrapper">
                <div class="progress-bar-fill" style="width:${prog.percent}%"></div>
            </div>
            <div class="progress-percent">${prog.percent}%</div>
        `;
    } else {
        html += `
            <div class="progress-info">
                <span class="level-label current" style="color:var(--gold);">${prog.current}</span>
                <i class="bi bi-check-circle-fill" style="color:var(--success);"></i>
                <span style="font-size:13px;color:var(--success);font-weight:500;">Maximum Level Reached</span>
            </div>
            <div class="progress-bar-wrapper">
                <div class="progress-bar-fill" style="width:100%;background:linear-gradient(90deg,var(--gold),#fbbf24);"></div>
            </div>
            <div class="progress-percent" style="color:var(--gold);">100%</div>
        `;
    }

    html += `</div>`;
    container.innerHTML = html;
}

function renderPointHistory(points) {
    const tbody = $('point-history-tbody');
    const empty = $('point-empty');

    if (points.length === 0) {
        tbody.innerHTML = '';
        empty.style.display = 'block';
        return;
    }

    empty.style.display = 'none';
    tbody.innerHTML = points.map(p => `
        <tr>
            <td>${formatDate(p.date)}</td>
            <td>${p.transaction_no}</td>
            <td class="poin-number">${formatRupiah(p.total_amount)}</td>
            <td class="poin-number">+${formatNumber(p.points_earned)}</td>
        </tr>
    `).join('');
}

function renderRewardHistory(rewards) {
    const tbody = $('reward-history-tbody');
    const empty = $('reward-empty');

    if (rewards.length === 0) {
        tbody.innerHTML = '';
        empty.style.display = 'block';
        return;
    }

    empty.style.display = 'none';
    tbody.innerHTML = rewards.map(r => `
        <tr>
            <td>${formatDate(r.date)}</td>
            <td><strong>${r.reward_name}</strong></td>
            <td class="poin-number">${formatNumber(r.points_spent)}</td>
            <td>${getStatusBadge(r.status)}</td>
        </tr>
    `).join('');
}

// ==========================================
// NAVIGATION
// ==========================================
function switchView(view) {
    state.currentView = view;
    pageList.classList.toggle('active', view === 'list');
    pageDetail.classList.toggle('active', view === 'detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

$('btn-back').addEventListener('click', () => {
    switchView('list');
    renderCustomerTable();
});

// ==========================================
// MODAL DETAIL
// ==========================================
const modalOverlay = $('modal-overlay');
const modalName = $('modal-customer-name');
const modalConfirm = $('modal-confirm');
const modalCancel = $('modal-cancel');

function showDetailModal(customerId) {
    state.pendingCustomerId = customerId;
    const row = document.querySelector(`.btn-detail[data-id="${customerId}"]`);
    const name = row ? row.closest('tr').querySelector('.customer-name').textContent : customerId;
    modalName.textContent = `View details for "${name}"?`;
    modalOverlay.classList.add('show');
}

function closeModal() {
    modalOverlay.classList.remove('show');
    state.pendingCustomerId = null;
}

modalConfirm.addEventListener('click', () => {
    if (state.pendingCustomerId) {
        const id = state.pendingCustomerId;
        closeModal();
        renderDetail(id);
    }
});

modalCancel.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

// ==========================================
// FORM MODAL (Add / Edit)
// ==========================================
const formOverlay = $('modal-form-overlay');
const formTitle = $('form-modal-title');
const formIcon = $('form-modal-icon');
const form = $('customer-form');
const formId = $('form-customer-id');
const formName = $('form-name');
const formPoints = $('form-points');
const formTransactions = $('form-transactions');
const formDate = $('form-last-date');
const formSubmit = $('form-submit');
const formCancel = $('form-cancel');

async function openFormModal(customerId) {
    if (customerId) {
        formTitle.textContent = 'Edit Customer';
        formIcon.className = 'fas fa-user-edit';
        formSubmit.innerHTML = '<i class="fas fa-save"></i> Simpan Perubahan';

        try {
            const res = await getCustomerById(customerId);
            if (!res.success) throw new Error('Customer tidak ditemukan');
            const c = res.data;
            formId.value = c.customer_id;
            formName.value = c.name;
            formPoints.value = c.total_points;
            formTransactions.value = c.total_transactions;
            formDate.value = c.last_transaction_date || '';
        } catch (err) {
            showToast('Gagal memuat data customer: ' + err.message, 'error');
            return;
        }
    } else {
        formTitle.textContent = 'Tambah Customer';
        formIcon.className = 'fas fa-user-plus';
        formSubmit.innerHTML = '<i class="fas fa-save"></i> Simpan';
        formId.value = '';
        formName.value = '';
        formPoints.value = '';
        formTransactions.value = '';
        formDate.value = todayStr();
    }

    formOverlay.classList.add('show');
}

function closeFormModal() {
    formOverlay.classList.remove('show');
}

formCancel.addEventListener('click', closeFormModal);
formOverlay.addEventListener('click', (e) => { if (e.target === formOverlay) closeFormModal(); });

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        name: formName.value.trim(),
        total_points: parseInt(formPoints.value) || 0,
        total_transactions: parseInt(formTransactions.value) || 0,
        last_transaction_date: formDate.value || todayStr()
    };

    const isEdit = formId.value !== '';

    try {
        let res;
        if (isEdit) {
            data.customer_id = formId.value;
            res = await updateCustomer(data);
        } else {
            res = await createCustomer(data);
        }

        if (res.success) {
            showToast(res.message, 'success');
            closeFormModal();
            renderCustomerTable();
        }
    } catch (err) {
        showToast('Gagal: ' + err.message, 'error');
    }
});

// ==========================================
// MODAL HAPUS
// ==========================================
const hapusOverlay = $('modal-hapus-overlay');
const hapusName = $('hapus-customer-name');
const hapusConfirm = $('hapus-confirm');
const hapusCancel = $('hapus-cancel');
let hapusPendingId = null;

function showHapusModal(customerId) {
    hapusPendingId = customerId;
    const row = document.querySelector(`.btn-hapus[data-id="${customerId}"]`);
    const name = row ? row.closest('tr').querySelector('.customer-name').textContent : customerId;
    hapusName.textContent = `Delete "${name}" (${customerId})?`;
    hapusOverlay.classList.add('show');
}

function closeHapusModal() {
    hapusOverlay.classList.remove('show');
    hapusPendingId = null;
}

hapusConfirm.addEventListener('click', async () => {
    if (!hapusPendingId) return;
    const id = hapusPendingId;
    try {
        const res = await deleteCustomer(id);
        if (res.success) {
            showToast(res.message, 'success');
            closeHapusModal();
            renderCustomerTable();
        }
    } catch (err) {
        showToast('Gagal menghapus: ' + err.message, 'error');
    }
});

hapusCancel.addEventListener('click', closeHapusModal);
hapusOverlay.addEventListener('click', (e) => { if (e.target === hapusOverlay) closeHapusModal(); });

// ==========================================
// EVENT LISTENERS
// ==========================================
$('btn-add-customer').addEventListener('click', () => openFormModal(null));

let searchTimer;
searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
        state.searchQuery = searchInput.value.trim();
        state.page = 1;
        renderCustomerTable();
    }, 350);
});

filterLevel.addEventListener('change', () => {
    state.levelFilter = filterLevel.value;
    state.page = 1;
    renderCustomerTable();
});

sortPoin.addEventListener('change', () => {
    state.sortOrder = sortPoin.value;
    state.page = 1;
    renderCustomerTable();
});

limitSelect.addEventListener('change', () => {
    state.limit = parseInt(limitSelect.value);
    state.page = 1;
    renderCustomerTable();
});

// ==========================================
// NEW: HELPERS
// ==========================================
function getInitials(name) {
    return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
}

function getAvatarClass(level) {
    const m = { Bronze: 'bronze-bg', Silver: 'silver-bg', Gold: 'gold-bg', Platinum: 'platinum-bg' };
    return m[level] || 'gold-bg';
}

function getAllCustomers() {
    const params = new URLSearchParams({ search: '', level: '', sort: 'desc', page: 1, limit: 1000 });
    return fetchJSON(`${API_BASE}/customers.php?${params}`);
}

async function fetchSummaryStats() {
    try {
        const result = await getAllCustomers();
        if (!result.success || !result.data) return;
        const data = result.data;
        const totalCustomers = data.length;
        const totalPoints = data.reduce((s, c) => s + Number(c.total_points), 0);
        const goldCount = data.filter(c => Number(c.total_points) >= 3000 && Number(c.total_points) < 5000).length;
        const platinumCount = data.filter(c => Number(c.total_points) >= 5000).length;
        renderSummaryCards({ totalCustomers, totalPoints, goldCount, platinumCount });
    } catch (e) {
        // silent fail for summary
    }
}

function renderSummaryCards(stats) {
    const fmt = n => Number(n).toLocaleString('id-ID');
    $('sc-customers').textContent = fmt(stats.totalCustomers);
    $('sc-points').textContent = fmt(stats.totalPoints);
    $('sc-gold').textContent = fmt(stats.goldCount);
    $('sc-platinum').textContent = fmt(stats.platinumCount);
}

// ==========================================
// NEW: NAV DATE
// ==========================================
function updateNavDate() {
    const el = $('nav-date');
    if (el) {
        const now = new Date();
        const opts = { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' };
        el.textContent = now.toLocaleDateString('en-US', opts);
    }
}

// ==========================================
// INIT
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    renderCustomerTable();
    fetchSummaryStats();
    updateNavDate();
    document.querySelectorAll('[data-tooltip]').forEach(el => {
        const tip = document.createElement('span');
        tip.className = 'custom-tooltip';
        tip.textContent = el.getAttribute('data-tooltip');
        el.appendChild(tip);
    });
});
