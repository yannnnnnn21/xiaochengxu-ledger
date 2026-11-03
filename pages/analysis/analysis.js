const ledger = require('../../utils/ledger')

const app = getApp()

function pad(value) {
  return String(value).padStart(2, '0')
}

function toDateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function buildSevenDayTrend(expenses) {
  const days = []
  const now = new Date()
  const totals = {}

  expenses.forEach((bill) => {
    totals[bill.date] = (totals[bill.date] || 0) + Number(bill.amount)
  })

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(now)
    date.setHours(12, 0, 0, 0)
    date.setDate(date.getDate() - offset)
    const key = toDateKey(date)
    days.push({
      date: key,
      label: offset === 0 ? '今天' : `${date.getMonth() + 1}/${date.getDate()}`,
      amount: totals[key] || 0,
    })
  }

  const max = Math.max(...days.map((item) => item.amount), 1)
  return days.map((item) => ({
    ...item,
    amountText: ledger.formatMoney(item.amount),
    height: item.amount ? Math.max(10, Math.round(item.amount / max * 100)) : 4,
  }))
}

Page({
  data: {
    statusBarHeight: 20,
    monthLabel: '',
    expenseText: '0.00',
    averageText: '0.00',
    remainingText: '0.00',
    budgetStatus: '本月预算充足',
    budgetPercent: 0,
    spendingDays: 0,
    trend: [],
    categories: [],
    topCategory: null,
    largestExpense: null,
    recentExpenses: [],
    hasExpense: false,
  },

  onLoad() {
    this.setData({
      statusBarHeight: (app.globalData && app.globalData.statusBarHeight) || 20,
    })
  },

  onShow() {
    this.refreshAnalysis()
  },

  refreshAnalysis() {
    const monthKey = ledger.currentMonthKey()
    const summary = ledger.getSummary(monthKey)
    const expenses = summary.bills.filter((bill) => bill.type === 'expense')
    const chart = ledger.getChartData(summary.bills)
    const budget = ledger.getBudget()
    const remaining = budget - summary.expense
    const now = new Date()
    const elapsedDays = now.getDate()
    const average = elapsedDays ? summary.expense / elapsedDays : 0
    const spendingDates = new Set(expenses.map((bill) => bill.date))
    const sortedByAmount = expenses
      .slice()
      .sort((left, right) => Number(right.amount) - Number(left.amount))

    this.setData({
      monthLabel: ledger.getMonthLabel(monthKey),
      expenseText: ledger.formatMoney(summary.expense),
      averageText: ledger.formatMoney(average),
      remainingText: ledger.formatMoney(Math.abs(remaining)),
      budgetStatus: remaining >= 0 ? '预算剩余' : '预算已超支',
      budgetPercent: Math.min(
        100,
        budget ? Math.round(summary.expense / budget * 100) : 0,
      ),
      spendingDays: spendingDates.size,
      trend: buildSevenDayTrend(expenses),
      categories: chart.entries,
      topCategory: chart.entries[0] || null,
      largestExpense: sortedByAmount[0] || null,
      recentExpenses: expenses.slice(0, 3),
      hasExpense: expenses.length > 0,
    })
  },

  goBack() {
    wx.navigateBack({
      delta: 1,
      fail: () => {
        wx.redirectTo({ url: '/pages/profile/profile' })
      },
    })
  },
})

