const BILLS_KEY = 'warm-ledger-bills-v1'
const BUDGET_KEY = 'warm-ledger-budget-v1'

const CATEGORY_META = {
  餐饮: { icon: '🍜', tone: 'peach', color: '#ef9b70' },
  交通: { icon: '🚌', tone: 'blue', color: '#91b8d3' },
  学习: { icon: '📖', tone: 'sage', color: '#9fbea5' },
  娱乐: { icon: '🎮', tone: 'lilac', color: '#c7aed9' },
  兼职: { icon: '💼', tone: 'yellow', color: '#f1ce6d' },
  生活费: { icon: '🧺', tone: 'yellow', color: '#f1ce6d' },
  奖学金: { icon: '🎓', tone: 'sage', color: '#9fbea5' },
  红包: { icon: '🧧', tone: 'peach', color: '#ef9b70' },
  其他收入: { icon: '✨', tone: 'lilac', color: '#c7aed9' },
  其他支出: { icon: '🧸', tone: 'blue', color: '#91b8d3' },
}

const EXPENSE_CATEGORIES = ['餐饮', '交通', '学习', '娱乐', '兼职', '其他支出']
const INCOME_CATEGORIES = ['生活费', '兼职', '奖学金', '红包', '其他收入']

function pad(value) {
  return String(value).padStart(2, '0')
}

function dateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function dateDaysAgo(days, hour, minute) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(hour, minute, 0, 0)
  return dateKey(date)
}

function getSeedBills() {
  return [
    {
      id: 'demo-1',
      type: 'expense',
      category: '餐饮',
      note: '和室友一起吃火锅',
      amount: 86,
      date: dateDaysAgo(0, 18, 36),
      time: '18:36',
      createdAt: Date.now(),
    },
    {
      id: 'demo-2',
      type: 'income',
      category: '兼职',
      note: '周末咖啡店兼职',
      amount: 320,
      date: dateDaysAgo(1, 21, 10),
      time: '21:10',
      createdAt: Date.now() - 1,
    },
    {
      id: 'demo-3',
      type: 'expense',
      category: '学习',
      note: '专业课教材',
      amount: 45.8,
      date: dateDaysAgo(2, 15, 24),
      time: '15:24',
      createdAt: Date.now() - 2,
    },
    {
      id: 'demo-4',
      type: 'expense',
      category: '交通',
      note: '公交卡充值',
      amount: 20,
      date: dateDaysAgo(3, 9, 12),
      time: '09:12',
      createdAt: Date.now() - 3,
    },
    {
      id: 'demo-5',
      type: 'expense',
      category: '娱乐',
      note: '周末看电影',
      amount: 39,
      date: dateDaysAgo(4, 20, 5),
      time: '20:05',
      createdAt: Date.now() - 4,
    },
  ]
}

function initializeBills() {
  const stored = wx.getStorageSync(BILLS_KEY)
  if (!Array.isArray(stored)) {
    const seed = getSeedBills()
    wx.setStorageSync(BILLS_KEY, seed)
    return seed
  }
  return stored
}

function getBills() {
  return initializeBills()
    .slice()
    .sort((a, b) => {
      const dateCompare = String(b.date).localeCompare(String(a.date))
      return dateCompare || Number(b.createdAt || 0) - Number(a.createdAt || 0)
    })
}

function decorateBill(bill) {
  const meta = CATEGORY_META[bill.category] || CATEGORY_META['其他支出']
  const date = new Date(`${bill.date}T00:00:00`)

  return {
    ...bill,
    icon: meta.icon,
    tone: meta.tone,
    color: meta.color,
    amountText: Number(bill.amount).toFixed(2),
    amountPrefix: bill.type === 'income' ? '+' : '-',
    dateText: `${pad(date.getMonth() + 1)}月${pad(date.getDate())}日`,
    fullDateText: `${date.getFullYear()}年${pad(date.getMonth() + 1)}月${pad(date.getDate())}日`,
    timeText: bill.time || '12:00',
    categoryLabel: bill.category,
  }
}

function saveBill(bill) {
  const bills = getBills()
  const now = new Date()
  const saved = {
    ...bill,
    id: bill.id || `bill-${Date.now()}`,
    amount: Number(Number(bill.amount).toFixed(2)),
    createdAt: bill.createdAt || Date.now(),
    time: bill.time || `${pad(now.getHours())}:${pad(now.getMinutes())}`,
  }
  const index = bills.findIndex((item) => item.id === saved.id)

  if (index >= 0) {
    bills[index] = saved
  } else {
    bills.unshift(saved)
  }

  wx.setStorageSync(BILLS_KEY, bills)
  return saved
}

function getBill(id) {
  return getBills().find((bill) => bill.id === id)
}

function deleteBill(id) {
  const next = getBills().filter((bill) => bill.id !== id)
  wx.setStorageSync(BILLS_KEY, next)
}

function clearMonth(monthKey) {
  const next = getBills().filter((bill) => bill.date.slice(0, 7) !== monthKey)
  wx.setStorageSync(BILLS_KEY, next)
}

function currentMonthKey() {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}`
}

function getMonthBills(monthKey = currentMonthKey()) {
  return getBills()
    .filter((bill) => bill.date.slice(0, 7) === monthKey)
    .map(decorateBill)
}

function getSummary(monthKey = currentMonthKey()) {
  const bills = getMonthBills(monthKey)
  const income = bills
    .filter((bill) => bill.type === 'income')
    .reduce((sum, bill) => sum + Number(bill.amount), 0)
  const expense = bills
    .filter((bill) => bill.type === 'expense')
    .reduce((sum, bill) => sum + Number(bill.amount), 0)

  return {
    bills,
    income,
    expense,
    balance: income - expense,
    count: bills.length,
    incomeText: income.toFixed(2),
    expenseText: expense.toFixed(2),
    balanceText: (income - expense).toFixed(2),
  }
}

function getChartData(bills) {
  const totals = {}
  bills
    .filter((bill) => bill.type === 'expense')
    .forEach((bill) => {
      totals[bill.category] = (totals[bill.category] || 0) + Number(bill.amount)
    })

  const entries = Object.keys(totals)
    .map((name) => ({
      name,
      value: totals[name],
      icon: (CATEGORY_META[name] || CATEGORY_META['其他支出']).icon,
      color: (CATEGORY_META[name] || CATEGORY_META['其他支出']).color,
    }))
    .sort((a, b) => b.value - a.value)

  const total = entries.reduce((sum, item) => sum + item.value, 0)
  let cursor = 0
  const segments = entries.map((item) => {
    const start = cursor
    cursor += total ? (item.value / total) * 100 : 0
    return `${item.color} ${start.toFixed(1)}% ${cursor.toFixed(1)}%`
  })

  let assignedPercent = 0
  const percentEntries = entries.map((item, index) => {
    const percent =
      total && index < entries.length - 1
        ? Math.round((item.value / total) * 100)
        : total
          ? 100 - assignedPercent
          : 0
    assignedPercent += percent

    return {
      ...item,
      percent,
      valueText: formatMoney(item.value),
    }
  })

  return {
    entries: percentEntries,
    background: total
      ? `conic-gradient(${segments.join(', ')})`
      : 'conic-gradient(#ead9cc 0% 100%)',
  }
}

function formatMoney(value) {
  const parts = Number(value || 0).toFixed(2).split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}

function getMonthLabel(monthKey, withYear = true) {
  const parts = monthKey.split('-')
  return withYear
    ? `${parts[0]}年${Number(parts[1])}月`
    : `${Number(parts[1])}月`
}

function getEnglishMonthLabel(date = new Date()) {
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  return `${months[date.getMonth()]} ${date.getFullYear()}`
}

function getBudget() {
  const value = Number(wx.getStorageSync(BUDGET_KEY))
  return value > 0 ? value : 2000
}

function setBudget(value) {
  wx.setStorageSync(BUDGET_KEY, Number(value))
}

module.exports = {
  CATEGORY_META,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  currentMonthKey,
  dateKey,
  decorateBill,
  deleteBill,
  formatMoney,
  getBill,
  getBills,
  getBudget,
  getChartData,
  getEnglishMonthLabel,
  getMonthBills,
  getMonthLabel,
  getSummary,
  initializeBills,
  clearMonth,
  saveBill,
  setBudget,
}
