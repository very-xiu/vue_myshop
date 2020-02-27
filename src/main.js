import Vue from 'vue'
import App from './App'
import router from './router'

// 引入vue树形插件
import TreeTable from 'vue-table-with-tree-grid'
Vue.component('tree-table', TreeTable)

// 引入全局样式表
import './assets/css/global.css'
// 引入element插件
import './plugins/element'
// 引入字体图标样式
import './assets/fonts/iconfont.css'

// 引入发起请求的axios
import axios from 'axios'
// 配置请求的根路径
axios.defaults.baseURL = 'http://106.12.11.162:8888/api/private/v1/'
    // axios请求拦截器
axios.interceptors.request.use(config => {
    // console.log(config);
    // 在最后必须return config
    config.headers.Authorization = window.sessionStorage.getItem('token');
    return config;
})
Vue.prototype.$http = axios

// 定义全局时间过滤器
Vue.filter('dateFormat', function(originVal) {
    const dt = new Date(originVal)
    const y = dt.getFullYear();
    const m = (dt.getMonth() + 1 + '').padStart(2, '0')
    const d = (dt.getDate() + '').padStart(2, '0')
    var hh = dt.getHours().toString().padStart(2, '0')
    var mm = dt.getMinutes().toString().padStart(2, '0')
    var ss = dt.getSeconds().toString().padStart(2, '0')
    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    components: { App },
    template: '<App/>'
})