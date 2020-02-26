<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色区域 -->
      <el-row>
        <el-col>
          <el-button type="primary">添加商品分类</el-button>
        </el-col>
      </el-row>
      <!-- 商品分类表格区域 -->
      <el-table border stripe :data="catelist">
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="分类名称" prop="cat_name"></el-table-column>
        <el-table-column label="是否有效"></el-table-column>
        <el-table-column label="排序"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope>
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页指示器 -->
      <el-pagination
        background
        :current-page="1"
        :page-sizes="[1, 2, 5, 10]"
        layout="total,prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类的数据列表，默认为空
      catelist: [],
      // 总条数
      total: 0
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    // 获取商品分类数据的请求
    async getCateList() {
      const { data: result } = await this.$http.get("categories", {
        params: this.queryInfo
      });
      if (result.meta.status !== 200) {
        return this.$message.error("获取商品分类数据失败！");
      }
      // console.log(result.data)
      // 把数据列表赋值给catelist
      this.catelist = result.data.result;
      this.total = result.data.total;
    }
  }
};
</script>

<style lang="less" scoped>
</style>