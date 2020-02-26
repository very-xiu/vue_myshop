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
          <el-button type="primary" @click="showAddCateDialog">添加商品分类</el-button>
        </el-col>
      </el-row>
      <!-- 商品分类表格区域 -->
      <tree-table
        :data="catelist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted===false" style="color:#10ac84"></i>
          <i class="el-icon-error" v-else style="color:#ee5253"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showCateEditDialog(scope.row.cat_id)"
          >编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCateById(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页指示器 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        background
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total,prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加商品分类对话框提示 -->
    <el-dialog
      title="添加商品分类"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <!-- 内容主体区域 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
        status-icon
      >
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:">
          <!-- options指定数据来源 -->
          <!-- props用来指定配置对象 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            expand-trigger="hover"
            :props="cascaderProps"
            @change="parentCateChanged"
            clearable
            change-on-select
          ></el-cascader>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible=false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类名称的对话框 -->
    <el-dialog title="编辑分类" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form
        :model="editCateForm"
        :rules="addCateFormRules"
        ref="editCateFormRef"
        label-width="80px"
        status-icon
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCateInfo">确 定</el-button>
      </span>
    </el-dialog>
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
      total: 0,
      // 添加商品分类显示和隐藏
      addDialogVisible: false,
      // 为table指定列的定义
      columns: [
        { label: "分类名称", prop: "cat_name" },
        {
          label: "是否有效",
          // 表示将当前列定义为模板列
          type: "template",
          // 表示当前列使用的模板名称
          template: "isok"
        },
        {
          label: "排序",
          // 表示将当前列定义为模板列
          type: "template",
          // 表示当前列使用的模板名称
          template: "order"
        },
        {
          label: "操作",
          // 表示将当前列定义为模板列
          type: "template",
          // 表示当前列使用的模板名称
          template: "opt"
        }
      ],
      // 添加分类的表单数据对象
      addCateForm: {
        // 将要添加的分类名称
        cat_name: "",
        // 父级分类ID
        cat_pid: 0,
        // 分类的等级，默认要添加的是1级分类
        cat_level: 0
      },
      // 查询到的角色信息
      editCateForm: {},
      // 商品分类表单校验规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" }
        ]
      },
      // 父级分类的列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children"
      },
      // 选中的父级分类ID数组
      selectedKeys: [],
      // 点击编辑按钮，默认false
      editDialogVisible: false
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
    },
    // 监听pagesize改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCateList();
    },
    // 监听pagenum的改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getCateList();
    },
    // 点击按钮展示添加分类
    showAddCateDialog() {
      this.getParentCateList();
      this.addDialogVisible = true;
    },
    // 获取父级分类的数据列表，发请求
    async getParentCateList() {
      const { data: result } = await this.$http.get("categories", {
        params: { type: 2 }
      });
      if (result.meta.status !== 200) {
        return this.$message.error("获取父级分类数据失败");
      }
      // console.log(result)
      this.parentCateList = result.data;
    },
    // 选择下拉列表项发生变化触发这个函数
    parentCateChanged() {
      // 如果selectedKeys数组中的length大于0，证明选中了父级分类
      // 反之就说明没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的ID
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ];
        // 为当前分类等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length;
      } else {
        // 父级分类的ID
        this.addCateForm.cat_pid = 0;
        // 为当前分类等级赋值
        this.addCateForm.cat_level = 0;
      }
    },
    // 添加商品分类确定按钮
    addCate() {
      // console.log(this.addCateForm);
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return;
        const { data: result } = await this.$http.post(
          "categories",
          this.addCateForm
        );
        if (result.meta.status !== 201) {
          this.$message.error("添加商品分类失败！");
        }
        this.$message.success("添加商品分类成功！");
        this.getCateList();
        this.addDialogVisible = false;
      });
    },
    // 监听添加对话框的关闭事件，重置表单数据
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields();
      this.selectedKeys = [];
      this.addCateForm.cat_level = 0;
      this.addCateForm.cat_pid = 0;
    },
    // 监听编辑对话框的关闭事件，重置表单数据
    editDialogClosed() {
      this.$refs.editCateFormRef.resetFields();
    },
    // 展示编辑商品的对话框
    async showCateEditDialog(id) {
      const { data: result } = await this.$http.get(`categories/${id}`);
      if (result.meta.status !== 200) {
        return this.$message.error("查询商品信息失败！");
      }
      // console.log(result.data)
      this.editCateForm = result.data;
      this.editDialogVisible = true;
    },
    // 修改商品信息并提交
    editCateInfo() {
      // console.log(cate)
      // 对整个表单进行校验的方法
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) return;
        // 点击确定验证有没有修改
        const { data: result } = await this.$http.get(
          `categories/${this.editCateForm.cat_id}`
        );
        if (this.editCateForm.cat_name === result.data.cat_name) {
          // 添加隐藏修改商品对话框功能
          this.editDialogVisible = false;
          this.$message.warning("商品都没有更新");
        } else {
          // 发起修改商品信息的请求
          const { data: result } = await this.$http.put(
            `categories/${this.editCateForm.cat_id}`,
            {
              cat_name: this.editCateForm.cat_name
            }
          );
          if (result.meta.status !== 200) {
            return this.$message.error("更新商品信息失败");
          }
          // 添加隐藏修改商品对话框功能
          this.editDialogVisible = false;
          // 重新获取商品列表数据
          console.log(result.data);
          console.log(this.catelist);
          // this.catelist = result.data;
          this.$message.success("更新商品信息成功");
        }
      });
    },
    // 根据ID删除用户
    async removeCateById(id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该商品, 是否继续?",
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);

      // 如果用户确认删除则返回字符串confirm
      // 如果用户取消删除则返回字符串cancel
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除！");
      }
      const { data: result } = await this.$http.delete(`categories/${id}`);
      if (result.meta.status !== 200) {
        return this.$message.error("删除商品失败");
      }
      this.$message.success("删除商品成功");
      this.getCateList();
    }
  }
};
</script>

<style lang="less" scoped>
.zk-table {
  margin-top: 15px;
  i {
    font-size: 16px;
  }
}
.el-cascader {
  width: 100%;
}
</style>