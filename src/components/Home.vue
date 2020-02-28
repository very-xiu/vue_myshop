<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/home-logo.jpg" alt />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="loginOut">退出</el-button>
    </el-header>

    <!-- 页面主体区域 -->
    <el-container>
      <el-aside :width="isCollapse?'64px':'200px'">
        <!-- 侧边栏菜单区域 -->
        <div class="toggle-button" @click="toggleCollapse">
          <i class="el-icon-s-grid"></i>
        </div>
        <el-menu
          class="el-menu-vertical-demo"
          background-color="#576574"
          text-color="#fff"
          active-text-color="#54a0ff"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id">
            <!-- 一级菜单模板区域 -->
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/'+subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveNavState('/'+subItem.path)"
            >
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      // 左侧菜单数据
      menulist: [],
      // 左侧一级图标
      iconsObj: {
        "125": "iconfont icon-users",
        "103": "iconfont icon-tijikongjian",
        "101": "iconfont icon-shangpin",
        "102": "iconfont icon-danju",
        "145": "iconfont icon-baobiao"
      },
      // 是否折叠左侧菜单
      isCollapse: false,
      // 被激活的链接地址
      activePath:''
    };
  },
  created() {
    this.getMenuList();
    this.activePath = window.sessionStorage.getItem('activePath');
    /* this.redirctWelcome(); */
  },
  methods: {
    // 退出登录功能
    loginOut() {
      window.sessionStorage.clear();
      this.$message.success("退出成功");
      this.$router.push("/login");
    },
    // 发送请求获取左侧菜单数据
    async getMenuList() {
      const { data: result } = await this.$http.get("menus");
      if (result.meta.status !== 200)
        return this.$message.error(result.meta.msg);
      this.menulist = result.data;
      // console.log(result);
    },
    // 点击按钮切换菜单的折叠与展开
    toggleCollapse() {
      this.isCollapse = !this.isCollapse;
    },
    // 点击刷新重定向到欢迎界面
    /* redirctWelcome() {
      if (this.$router.path !== "/welcome") {
        this.$router.replace("/welcome");
      }
    }, */
    // 保存链接的激活状态
    saveNavState(activePath){
      window.sessionStorage.setItem('activePath',activePath);
      this.activePath=activePath;
    }
  }
};
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
  .el-header {
    background-color: #222f3e;
    display: flex;
    justify-content: space-between;
    align-items: center;
    > div {
      display: flex;
      align-items: center;
      color: #fff;
      span {
        margin-left: 15px;
      }
      img {
        width: 50px;
        border-radius: 50%;
      }
    }
  }
  .el-aside {
    background-color: #576574;
    .el-menu {
      border: none;
    }
    .toggle-button {
      background-color: #8395a7;
      text-align: center;
      cursor: pointer;
      i {
        font-size: 26px;
        color: #fff;
        line-height: 34px;
        letter-spacing: 0.2em;
      }
    }
  }
  .el-main {
    background-color: #e9edf1;
  }
  .iconfont {
    margin-right: 10px;
    font-size: 20px;
  }
}
</style>