import Vue from 'vue'
import App from './App'
import router from './router'

// 引入vue树形插件
import TreeTable from 'vue-table-with-tree-grid'
Vue.component('tree-table', TreeTable)

// 引入富文本编辑器插件
import VueQuillEditor from 'vue-quill-editor'
// 富文本编辑器插件需要的样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

// 引入全局样式表
import './assets/css/global.css'
// 引入element插件
import './plugins/element'
// 引入字体图标样式
import './assets/fonts/iconfont.css'

// 导入进度条动画插件NProgress
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 引入发起请求的axios
import axios from 'axios'
// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 在request拦截器中，展示进度条NProgress.start()
    // axios请求拦截器
axios.interceptors.request.use(config => {
    // console.log(config);
    // 在最后必须return config
    NProgress.start()
    config.headers.Authorization = window.sessionStorage.getItem('token');
    return config;
})
// 在response拦截器中隐藏进度条NProgress.done()
axios.interceptors.response.use(config => {
    // console.log(config);
    // 在最后必须return config
    NProgress.done()
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

// 将富文本编辑器注册为全局可用的组件
Vue.use(VueQuillEditor)

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    components: { App },
    template: '<App/>'
})