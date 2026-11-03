App({
  onLaunch() {
    const windowInfo = wx.getWindowInfo
      ? wx.getWindowInfo()
      : wx.getSystemInfoSync()

    this.globalData.statusBarHeight = windowInfo.statusBarHeight || 20
  },
  globalData: {
    statusBarHeight: 20,
  },
})
