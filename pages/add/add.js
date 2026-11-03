const ledger = require('../../utils/ledger')

const app = getApp()

function buildCategories(type, selected) {
  const names =
    type === 'income'
      ? ledger.INCOME_CATEGORIES
      : ledger.EXPENSE_CATEGORIES.slice(0, 5)

  return names.map((name) => {
    const meta = ledger.CATEGORY_META[name]
    return {
      name,
      icon: meta.icon,
      tone: meta.tone,
      selected: name === selected,
    }
  })
}

Page({
  data: {
    statusBarHeight: 20,
    type: 'expense',
    amount: '',
    selectedCategory: '餐饮',
    categories: [],
    date: '',
    note: '',
    editing: false,
    editingId: '',
    saving: false,
  },

  onLoad(options) {
    const statusBarHeight = (app.globalData && app.globalData.statusBarHeight) || 20
    const today = ledger.dateKey(new Date())
    let pageData = {
      statusBarHeight,
      date: today,
      categories: buildCategories('expense', '餐饮'),
    }

    if (options && options.id) {
      const bill = ledger.getBill(options.id)
      if (bill) {
        pageData = {
          ...pageData,
          type: bill.type,
          amount: String(bill.amount),
          selectedCategory: bill.category,
          categories: buildCategories(bill.type, bill.category),
          date: bill.date,
          note: bill.note || '',
          editing: true,
          editingId: bill.id,
        }
      }
    }

    this.setData(pageData)
  },

  changeType(event) {
    const type = event.currentTarget.dataset.type
    if (type === this.data.type) {
      return
    }

    const firstCategory =
      type === 'income'
        ? ledger.INCOME_CATEGORIES[0]
        : ledger.EXPENSE_CATEGORIES[0]

    this.setData({
      type,
      selectedCategory: firstCategory,
      categories: buildCategories(type, firstCategory),
    })
  },

  selectCategory(event) {
    const selectedCategory = event.currentTarget.dataset.category
    this.setData({
      selectedCategory,
      categories: buildCategories(this.data.type, selectedCategory),
    })
  },

  onAmountInput(event) {
    this.setData({ amount: event.detail.value })
  },

  onDateChange(event) {
    this.setData({ date: event.detail.value })
  },

  onNoteInput(event) {
    this.setData({ note: event.detail.value })
  },

  saveBill() {
    if (this.data.saving) {
      return
    }

    const amount = Number(this.data.amount)
    if (!amount || amount <= 0) {
      wx.showToast({ title: '请输入正确金额', icon: 'none' })
      return
    }

    this.setData({ saving: true })
    const existing = this.data.editing ? ledger.getBill(this.data.editingId) : null

    ledger.saveBill({
      id: this.data.editingId,
      type: this.data.type,
      category: this.data.selectedCategory,
      amount,
      date: this.data.date,
      note: this.data.note.trim() || this.data.selectedCategory,
      createdAt: existing ? existing.createdAt : Date.now(),
    })

    wx.showToast({
      title: this.data.editing ? '账单已更新' : '记账成功',
      icon: 'success',
      duration: 900,
    })

    setTimeout(() => {
      wx.redirectTo({ url: '/pages/bills/bills' })
    }, 620)
  },

})
