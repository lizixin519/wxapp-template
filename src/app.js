//app.js
import env from './env.config.js';
const host = ''
App({
  onLaunch: function (options) {
    if(options && options.env) {
      host = env[options.env] ? env[options.env] : 'online'
    }
    this.globalData.isLogin = wx.getStorageSync('token') ? true : false;
    // 全局分享
    wx.onAppRoute(res => {
      let pages = getCurrentPages();
      let view = pages[pages.length - 1];
      view.onShareAppMessage = function () {
        return {
          title: '中能电云网',
          path: '/pages/index/index'
        }
      }
    })
  },
  globalData: {
    userInfo: null,
    host,
    isLogin: false
  }
})