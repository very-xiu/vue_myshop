import Vue from 'vue'
import App from './App'
import router from './router'

// 引入全局样式表
import './assets/css/global.css'
// 引入element插件
import './plugins/element'

// 引入发起请求的axios
import axios from 'axios'
// 配置请求的根路径
axios.defaults.baseURL='http://106.12.11.162:8888/api/private/v1/'
Vue.prototype.$http=axios

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
