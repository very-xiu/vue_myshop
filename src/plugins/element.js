import Vue from 'vue'
// 按需导入Element组件
import { Button,Form, FormItem,Input,Message } from 'element-ui';
Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)

// Message需要全局挂载
Vue.prototype.$message = Message