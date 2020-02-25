<template>
  <div>
    <el-button type="info" @click="loginOut">退出</el-button>
  </div>
</template>

<script>
export default {
  data() {
    return {
    };
  },
  methods:{
    loginOut(){
      window.sessionStorage.clear();
      this.$message.success('退出成功');
      this.$router.push('/login');
    }
  }
}
</script>

<style lang="less" scoped>

</style>