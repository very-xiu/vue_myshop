import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/Login'
import Home from '@/components/Home'

Vue.use(Router)

const router = new Router({
    mode: 'history',
    routes: [{
            path: '/',
            redirect: '/login'
        },
        {
            path: '/login',
            name: 'Login',
            component: Login
        },
        {
            path: '/home',
            name: 'Home',
            component: Home
        }
    ]
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
    // to 将要访问的路径
    // from 代表从哪个路径跳转而来
    // next 是一个函数，表示放行
    // next()放行    next('/login')强制跳转

    if(to.path === '/login') return next();
    //从sessionStorage中获取到保存的token值
    const tokenStr = window.sessionStorage.getItem('token');
    // 如果tokenStr是空的
    if(!tokenStr)  return next('/login');
    
    next();
})

export default router