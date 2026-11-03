Component({
  properties: {
    active: {
      type: String,
      value: 'home',
    },
  },

  methods: {
    switchPage(event) {
      const { page, url } = event.currentTarget.dataset
      if (page === this.data.active) {
        return
      }

      wx.redirectTo({ url })
    },
  },
})
