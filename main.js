import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
import initUniIdPages from '@/uni_modules/uni-id-pages/init.js'
Vue.config.productionTip = false

// 导入 uni-id-pages store
import * as uniIdPagesStore from '@/uni_modules/uni-id-pages/common/store'

App.mpType = 'app'

// 初始化uni-id-pages
initUniIdPages()

// 将 uniIdPagesStore 挂载到 Vue 原型上，类似于 make_admin 的逻辑
Vue.prototype.$uniIdPagesStore = uniIdPagesStore

const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
import initUniIdPages from '@/uni_modules/uni-id-pages/init.js'

// 导入 uni-id-pages store
import * as uniIdPagesStore from '@/uni_modules/uni-id-pages/common/store'

export function createApp() {
  const app = createSSRApp(App)
  
  // 初始化uni-id-pages
  initUniIdPages()
  
  // 将 uniIdPagesStore 挂载到 Vue 全局属性上，类似于 make_admin 的逻辑
  app.config.globalProperties.$uniIdPagesStore = uniIdPagesStore
  
  return {
    app
  }
}
// #endif