<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 挂载子组件 -->
    <UserChildren/>
  </div>
</template>

<script>
import UserChildren from './UserChildren/UserChildren.vue'
export default {
  data() {
    return {};
  },
  components:{
    UserChildren
  }
};
</script>

<style lang="less" scoped>
</style>