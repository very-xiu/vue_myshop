import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/Login'
import Home from '@/components/Home'
import Welcome from '@/components/Welcome'
import Users from '@/components/Users/Users'
import Roles from '@/components/Roles/Roles'
import Rights from '@/components/Rights/Rights'
import Reports from '@/components/Reports/Reports'
import Params from '@/components/Params/Params'
import Orders from '@/components/Orders/Orders'
import Goods from '@/components/Goods/Goods'
import CateGories from '@/components/Orders/Orders'

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
            component: Home,
            redirect:'/welcome',
            children:[
              {path:'/welcome',component:Welcome},
              {path:'/users',component:Users},
              {path:'/roles',component:Roles},
              {path:'/rights',component:Rights},
              {path:'/reports',component:Reports},
              {path:'/params',component:Params},
              {path:'/orders',component:Orders},
              {path:'/goods',component:Goods},
              {path:'/cateGories',component:CateGories},
            ]
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