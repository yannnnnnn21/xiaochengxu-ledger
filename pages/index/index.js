const ledger = require('../../utils/ledger')

const app = getApp()

Page({
  data: {
    statusBarHeight: 20,
    englishMonth: '',
    monthLabel: '',
    balanceText: '0.00',
    incomeText: '0.00',
    expenseText: '0.00',
    budgetText: '2,000.00',
    budgetStatus: '本月预算充足',
    recentBills: [],
    chartEntries: [],
    chartImage: '',
  },

  onLoad() {
    this.setData({
      statusBarHeight: (app.globalData && app.globalData.statusBarHeight) || 20,
    })
  },

  onShow() {
    this.refreshData()
  },

  onReady() {
    this.drawChart()
  },

  onUnload() {
    this.chartDisposed = true
  },

  refreshData() {
    const summary = ledger.getSummary()
    const chart = ledger.getChartData(summary.bills)
    const budget = ledger.getBudget()
    const budgetRemaining = budget - summary.expense
    this.chartEntries = chart.entries
    this.chartTotal = summary.expense

    this.setData({
      englishMonth: ledger.getEnglishMonthLabel(),
      monthLabel: ledger.getMonthLabel(ledger.currentMonthKey(), false),
      balanceText: ledger.formatMoney(summary.balance),
      incomeText: ledger.formatMoney(summary.income),
      expenseText: ledger.formatMoney(summary.expense),
      budgetText: ledger.formatMoney(budget),
      budgetStatus:
        budgetRemaining >= 0
          ? `本月预算充足`
          : `本月已超出 ¥${ledger.formatMoney(Math.abs(budgetRemaining))}`,
      recentBills: summary.bills.slice(0, 2),
      chartEntries: chart.entries,
    }, () => {
      wx.nextTick(() => this.drawChart())
    })
  },

  drawChart() {
    const entries = this.chartEntries || []
    const total = Number(this.chartTotal || 0)

    this.createSelectorQuery()
      .select('#spendingChart')
      .fields({ node: true, size: true })
      .exec((result) => {
        const target = result && result[0]
        if (!target || !target.node || !target.width || !target.height) {
          return
        }

        const canvas = target.node
        const context = canvas.getContext('2d')
        const windowInfo = wx.getWindowInfo
          ? wx.getWindowInfo()
          : wx.getSystemInfoSync()
        const pixelRatio = windowInfo.pixelRatio || 1
        const width = target.width
        const height = target.height

        canvas.width = width * pixelRatio
        canvas.height = height * pixelRatio
        context.scale(pixelRatio, pixelRatio)
        context.clearRect(0, 0, width, height)

        const centerX = width / 2
        const centerY = height / 2
        const outerRadius = Math.min(width, height) / 2 - 2
        const ringWidth = Math.min(width, height) * 0.19
        const radius = outerRadius - ringWidth / 2
        const startOffset = -Math.PI / 2

        context.lineCap = 'butt'
        context.lineWidth = ringWidth

        if (!total || !entries.length) {
          context.beginPath()
          context.strokeStyle = '#ead9cc'
          context.arc(centerX, centerY, radius, 0, Math.PI * 2)
          context.stroke()
        } else {
          const count = entries.length
          const gap = count > 1 ? 0.032 : 0
          const availableAngle = Math.PI * 2 - gap * count
          let angle = startOffset + gap / 2

          entries.forEach((entry) => {
            const sweep = availableAngle * (Number(entry.value) / total)
            context.beginPath()
            context.strokeStyle = entry.color
            context.arc(centerX, centerY, radius, angle, angle + sweep)
            context.stroke()
            angle += sweep + gap
          })
        }

        context.lineWidth = 1.4
        context.strokeStyle = '#84614d'
        context.beginPath()
        context.arc(centerX, centerY, outerRadius - 0.7, 0, Math.PI * 2)
        context.stroke()
        context.beginPath()
        context.arc(
          centerX,
          centerY,
          outerRadius - ringWidth + 0.7,
          0,
          Math.PI * 2,
        )
        context.stroke()

        this.exportChartImage(canvas, width, height, pixelRatio)
      })
  },

  exportChartImage(canvas, width, height, pixelRatio) {
    if (this.chartDisposed) {
      return
    }

    const useDataUrlFallback = () => {
      if (this.chartDisposed) {
        return
      }
      try {
        const dataUrl = canvas.toDataURL('image/png')
        if (dataUrl) {
          this.setData({ chartImage: dataUrl })
        }
      } catch (error) {
        console.warn('Chart image fallback failed', error)
      }
    }

    if (!wx.canvasToTempFilePath) {
      useDataUrlFallback()
      return
    }

    wx.canvasToTempFilePath({
      canvas,
      x: 0,
      y: 0,
      width,
      height,
      destWidth: width * pixelRatio,
      destHeight: height * pixelRatio,
      fileType: 'png',
      success: (result) => {
        if (this.chartDisposed) {
          return
        }
        if (result.tempFilePath) {
          this.setData({ chartImage: result.tempFilePath })
        } else {
          useDataUrlFallback()
        }
      },
      fail: useDataUrlFallback,
    })
  },

  openBills() {
    wx.redirectTo({ url: '/pages/bills/bills' })
  },

  openAdd() {
    wx.redirectTo({ url: '/pages/add/add' })
  },
})
