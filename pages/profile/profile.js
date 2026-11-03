const ledger = require('../../utils/ledger')

const app = getApp()

function drawRoundedRect(context, x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2)
  context.beginPath()
  context.moveTo(x + safeRadius, y)
  context.lineTo(x + width - safeRadius, y)
  context.quadraticCurveTo(x + width, y, x + width, y + safeRadius)
  context.lineTo(x + width, y + height - safeRadius)
  context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height)
  context.lineTo(x + safeRadius, y + height)
  context.quadraticCurveTo(x, y + height, x, y + height - safeRadius)
  context.lineTo(x, y + safeRadius)
  context.quadraticCurveTo(x, y, x + safeRadius, y)
  context.closePath()
}

function fitText(context, value, maxWidth) {
  const text = String(value || '')
  if (context.measureText(text).width <= maxWidth) {
    return text
  }

  let fitted = text
  while (fitted.length && context.measureText(`${fitted}…`).width > maxWidth) {
    fitted = fitted.slice(0, -1)
  }
  return `${fitted}…`
}

function formatExportTime(date) {
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

Page({
  data: {
    statusBarHeight: 20,
    monthLabel: '',
    budgetText: '2,000.00',
    exporting: false,
  },

  onLoad() {
    this.setData({
      statusBarHeight: (app.globalData && app.globalData.statusBarHeight) || 20,
    })
  },

  onShow() {
    this.refreshProfile()
  },

  refreshProfile() {
    this.setData({
      monthLabel: ledger.getMonthLabel(ledger.currentMonthKey()),
      budgetText: ledger.formatMoney(ledger.getBudget()),
    })
  },

  exportBills() {
    if (this.exportInProgress) {
      return
    }

    const monthKey = ledger.currentMonthKey()
    const summary = ledger.getSummary(monthKey)
    if (!summary.bills.length) {
      wx.showToast({ title: '本月暂无账单', icon: 'none' })
      return
    }

    this.exportInProgress = true
    this.setData({ exporting: true })
    wx.showLoading({ title: '正在生成长图', mask: true })

    this.createSelectorQuery()
      .select('#billExportCanvas')
      .fields({ node: true })
      .exec((result) => {
        const target = result && result[0]
        if (!target || !target.node) {
          this.finishExport()
          wx.showToast({ title: '图片生成失败', icon: 'none' })
          return
        }

        try {
          const canvas = target.node
          const chart = ledger.getChartData(summary.bills)
          this.drawBillImage(canvas, monthKey, summary, chart.entries)
          this.exportCanvasImage(canvas)
        } catch (error) {
          console.error('Bill image rendering failed', error)
          this.finishExport()
          wx.showToast({ title: '图片生成失败', icon: 'none' })
        }
      })
  },

  drawBillImage(canvas, monthKey, summary, chartEntries) {
    const context = canvas.getContext('2d')
    const width = 1080
    const margin = 72
    const contentWidth = width - margin * 2
    const visibleBills = summary.bills.slice(0, 40)
    const hiddenCount = Math.max(0, summary.bills.length - visibleBills.length)
    const categoryRows = chartEntries.slice(0, 5)
    const categoryHeight = categoryRows.length
      ? 62 + categoryRows.length * 54
      : 92
    const listHeight = 94 + visibleBills.length * 72 + (hiddenCount ? 46 : 0)
    const height = 160 + 220 + 56 + categoryHeight + 52 + listHeight + 94

    canvas.width = width
    canvas.height = height
    context.clearRect(0, 0, width, height)
    context.textBaseline = 'middle'

    context.fillStyle = '#f7eee6'
    context.fillRect(0, 0, width, height)
    context.fillStyle = 'rgba(243, 211, 108, 0.34)'
    context.beginPath()
    context.arc(width - 60, 30, 170, 0, Math.PI * 2)
    context.fill()
    context.fillStyle = 'rgba(239, 155, 112, 0.18)'
    context.beginPath()
    context.arc(width - 170, 105, 82, 0, Math.PI * 2)
    context.fill()

    context.textAlign = 'left'
    context.fillStyle = '#5d4337'
    context.font = 'bold 48px "PingFang SC", sans-serif'
    context.fillText('暖萌学生记账本', margin, 82)
    context.fillStyle = '#957d70'
    context.font = '24px "PingFang SC", sans-serif'
    context.fillText('把每一笔日常，认真收藏起来', margin, 124)

    context.fillStyle = 'rgba(255, 253, 249, 0.88)'
    drawRoundedRect(context, 742, 54, 266, 58, 29)
    context.fill()
    context.fillStyle = '#765b4c'
    context.font = 'bold 24px "PingFang SC", sans-serif'
    context.textAlign = 'center'
    context.fillText(ledger.getMonthLabel(monthKey), 875, 84)

    const summaryY = 160
    context.fillStyle = '#fffdfa'
    drawRoundedRect(context, margin, summaryY, contentWidth, 220, 32)
    context.fill()

    context.textAlign = 'left'
    context.fillStyle = '#9b8376'
    context.font = '24px "PingFang SC", sans-serif'
    context.fillText('本月结余', margin + 34, summaryY + 46)
    context.fillStyle = '#5d4337'
    context.font = 'bold 58px Georgia, serif'
    context.fillText(`¥ ${summary.balanceText}`, margin + 34, summaryY + 104)

    context.strokeStyle = '#eaded3'
    context.lineWidth = 2
    context.beginPath()
    context.moveTo(margin + 34, summaryY + 140)
    context.lineTo(width - margin - 34, summaryY + 140)
    context.stroke()

    context.fillStyle = '#9b8376'
    context.font = '22px "PingFang SC", sans-serif'
    context.fillText('本月收入', margin + 34, summaryY + 174)
    context.fillText('本月支出', width / 2 + 26, summaryY + 174)
    context.fillStyle = '#76936d'
    context.font = 'bold 31px Georgia, serif'
    context.fillText(`¥ ${summary.incomeText}`, margin + 34, summaryY + 207)
    context.fillStyle = '#b7645f'
    context.fillText(`¥ ${summary.expenseText}`, width / 2 + 26, summaryY + 207)

    let currentY = summaryY + 270
    context.fillStyle = '#5d4337'
    context.font = 'bold 32px "PingFang SC", sans-serif'
    context.fillText('分类占比', margin, currentY)
    context.textAlign = 'right'
    context.fillStyle = '#9b8376'
    context.font = '21px "PingFang SC", sans-serif'
    context.fillText('按支出金额排序', width - margin, currentY)

    currentY += 34
    if (!categoryRows.length) {
      context.textAlign = 'left'
      context.fillStyle = '#a48b7e'
      context.font = '24px "PingFang SC", sans-serif'
      context.fillText('本月暂无支出分类', margin, currentY + 24)
      currentY += 58
    } else {
      categoryRows.forEach((item) => {
        context.fillStyle = item.color
        context.beginPath()
        context.arc(margin + 8, currentY + 13, 8, 0, Math.PI * 2)
        context.fill()

        context.textAlign = 'left'
        context.fillStyle = '#6b5043'
        context.font = '24px "PingFang SC", sans-serif'
        context.fillText(item.name, margin + 28, currentY + 13)
        context.textAlign = 'right'
        context.fillStyle = '#8f7769'
        context.font = '22px "PingFang SC", sans-serif'
        context.fillText(`${item.percent}%  ¥${item.valueText}`, width - margin, currentY + 13)

        context.fillStyle = '#eaded3'
        drawRoundedRect(context, margin + 28, currentY + 31, contentWidth - 28, 9, 5)
        context.fill()
        context.fillStyle = item.color
        const progressWidth = Math.max(
          9,
          (contentWidth - 28) * Math.min(Number(item.percent), 100) / 100,
        )
        drawRoundedRect(context, margin + 28, currentY + 31, progressWidth, 9, 5)
        context.fill()
        currentY += 54
      })
    }

    currentY += 34
    context.textAlign = 'left'
    context.fillStyle = '#5d4337'
    context.font = 'bold 32px "PingFang SC", sans-serif'
    context.fillText('账单明细', margin, currentY)
    context.textAlign = 'right'
    context.fillStyle = '#9b8376'
    context.font = '21px "PingFang SC", sans-serif'
    context.fillText(`共 ${summary.count} 笔`, width - margin, currentY)

    const listY = currentY + 26
    context.fillStyle = '#fffdfa'
    drawRoundedRect(
      context,
      margin,
      listY,
      contentWidth,
      visibleBills.length * 72 + (hiddenCount ? 46 : 0) + 26,
      28,
    )
    context.fill()

    let rowY = listY + 40
    visibleBills.forEach((bill, index) => {
      context.fillStyle = bill.color
      context.beginPath()
      context.arc(margin + 32, rowY, 9, 0, Math.PI * 2)
      context.fill()

      context.textAlign = 'left'
      context.fillStyle = '#5f4538'
      context.font = 'bold 25px "PingFang SC", sans-serif'
      context.fillText(bill.category, margin + 54, rowY)

      const noteX = margin + 210
      const amountWidth = 190
      context.fillStyle = '#91796c'
      context.font = '22px "PingFang SC", sans-serif'
      context.fillText(
        fitText(context, bill.note || bill.category, contentWidth - 210 - amountWidth),
        noteX,
        rowY,
      )
      context.fillStyle = '#aa9386'
      context.font = '19px "PingFang SC", sans-serif'
      context.fillText(`${bill.dateText}  ${bill.timeText}`, margin + 54, rowY + 25)

      context.textAlign = 'right'
      context.fillStyle = bill.type === 'income' ? '#73916b' : '#b7645f'
      context.font = 'bold 24px Georgia, serif'
      context.fillText(
        `${bill.amountPrefix}¥ ${bill.amountText}`,
        width - margin - 28,
        rowY,
      )

      if (index < visibleBills.length - 1) {
        context.strokeStyle = '#eee4dc'
        context.lineWidth = 1
        context.beginPath()
        context.moveTo(margin + 36, rowY + 36)
        context.lineTo(width - margin - 28, rowY + 36)
        context.stroke()
      }
      rowY += 72
    })

    if (hiddenCount) {
      context.textAlign = 'center'
      context.fillStyle = '#9f887b'
      context.font = '20px "PingFang SC", sans-serif'
      context.fillText(
        `图片展示最近 40 笔，另有 ${hiddenCount} 笔可在账单页查看`,
        width / 2,
        rowY + 9,
      )
      rowY += 46
    }

    const footerY = rowY + 40
    context.textAlign = 'left'
    context.fillStyle = '#a38b7e'
    context.font = '19px "PingFang SC", sans-serif'
    context.fillText(`生成时间：${formatExportTime(new Date())}`, margin, footerY)
    context.textAlign = 'right'
    context.fillText('暖萌学生记账本', width - margin, footerY)
  },

  exportCanvasImage(canvas) {
    if (!wx.canvasToTempFilePath) {
      this.finishExport()
      wx.showToast({ title: '当前版本不支持图片导出', icon: 'none' })
      return
    }

    wx.canvasToTempFilePath({
      canvas,
      fileType: 'png',
      quality: 1,
      success: (result) => {
        this.finishExport()
        this.saveBillImage(result.tempFilePath)
      },
      fail: () => {
        this.finishExport()
        wx.showToast({ title: '图片生成失败', icon: 'none' })
      },
    })
  },

  saveBillImage(filePath) {
    wx.saveImageToPhotosAlbum({
      filePath,
      success: () => {
        wx.showToast({ title: '已保存到相册', icon: 'success' })
        setTimeout(() => {
          wx.previewImage({ urls: [filePath] })
        }, 600)
      },
      fail: (error) => {
        const message = error && error.errMsg ? error.errMsg : ''
        if (message.includes('auth deny') || message.includes('authorize')) {
          wx.showModal({
            title: '需要相册权限',
            content: '请在设置中允许保存图片到相册，然后重新导出。',
            confirmText: '去设置',
            success: (result) => {
              if (result.confirm) {
                wx.openSetting()
              }
            },
          })
          return
        }

        wx.showModal({
          title: '图片已生成',
          content: '自动保存失败，可以打开图片后长按保存到相册。',
          confirmText: '预览图片',
          success: (result) => {
            if (result.confirm) {
              wx.previewImage({ urls: [filePath] })
            }
          },
        })
      },
    })
  },

  finishExport() {
    this.exportInProgress = false
    this.setData({ exporting: false })
    wx.hideLoading()
  },

  editBudget() {
    wx.showModal({
      title: '设置本月预算',
      content: `当前预算 ¥${this.data.budgetText}`,
      editable: true,
      placeholderText: '请输入预算金额',
      confirmText: '保存',
      success: (result) => {
        if (!result.confirm) {
          return
        }
        const value = Number(result.content)
        if (!value || value <= 0) {
          wx.showToast({ title: '请输入正确金额', icon: 'none' })
          return
        }
        ledger.setBudget(value)
        this.refreshProfile()
        wx.showToast({ title: '预算已更新', icon: 'success' })
      },
    })
  },

  switchTheme() {
    wx.showActionSheet({
      itemList: ['奶油小熊（当前）', '鼠尾草绿', '蜜桃日记'],
      success: (result) => {
        if (result.tapIndex === 0) {
          wx.showToast({ title: '当前主题', icon: 'none' })
          return
        }
        wx.showToast({ title: '新主题正在准备中', icon: 'none' })
      },
    })
  },

  openAnalysis() {
    wx.navigateTo({ url: '/pages/analysis/analysis' })
  },

  clearMonth() {
    const monthKey = ledger.currentMonthKey()
    wx.showModal({
      title: '清除本月记录？',
      content: `${ledger.getMonthLabel(monthKey)}的账单将被清空，且无法恢复。`,
      confirmText: '清除',
      confirmColor: '#b65e56',
      success: (result) => {
        if (!result.confirm) {
          return
        }
        ledger.clearMonth(monthKey)
        wx.showToast({ title: '本月记录已清除', icon: 'success' })
      },
    })
  },

  openHelp() {
    wx.showModal({
      title: '帮助与反馈',
      content: '暖萌学生记账本 v1.0\n\n如需反馈问题，请截图并说明操作步骤。当前数据仅保存在本机。',
      showCancel: false,
      confirmText: '知道啦',
    })
  },
})
