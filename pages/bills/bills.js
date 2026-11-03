const ledger = require('../../utils/ledger')

const app = getApp()

Page({
  data: {
    statusBarHeight: 20,
    monthKey: '',
    monthLabel: '',
    bills: [],
    count: 0,
    incomeText: '0.00',
    expenseText: '0.00',
  },

  onLoad() {
    this.setData({
      statusBarHeight: (app.globalData && app.globalData.statusBarHeight) || 20,
      monthKey: ledger.currentMonthKey(),
    })
  },

  onShow() {
    this.refreshBills()
  },

  refreshBills() {
    const summary = ledger.getSummary(this.data.monthKey)
    this.setData({
      bills: summary.bills,
      count: summary.count,
      incomeText: summary.incomeText,
      expenseText: summary.expenseText,
      monthLabel: ledger.getMonthLabel(this.data.monthKey),
    })
  },

  onMonthChange(event) {
    this.setData({ monthKey: event.detail.value }, () => {
      this.refreshBills()
    })
  },

  editBill(event) {
    const id = event.currentTarget.dataset.id
    wx.redirectTo({ url: `/pages/add/add?id=${id}` })
  },

  removeBill(event) {
    const id = event.currentTarget.dataset.id
    wx.showModal({
      title: '删除这笔账单？',
      content: '删除后无法恢复，请确认是否继续。',
      confirmText: '删除',
      confirmColor: '#b65e56',
      success: (result) => {
        if (!result.confirm) {
          return
        }
        ledger.deleteBill(id)
        this.refreshBills()
        wx.showToast({ title: '已删除', icon: 'success' })
      },
    })
  },

  openAdd() {
    wx.redirectTo({ url: '/pages/add/add' })
  },

})
