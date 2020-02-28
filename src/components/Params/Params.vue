<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->

    <el-card>
      <!-- 警告区域 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数" type="warning" show-icon :closable="false"></el-alert>

      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            v-model="selectedCateKeys"
            :options="catelist"
            expand-trigger="hover"
            :props="cateProps"
            @change="handleChange"
            clearable
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tab页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加动态参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染Tag标签 -->
                <el-tag
                  class="params-tags"
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i,scope.row)"
                >{{item}}</el-tag>

                <!-- 切换输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >修改</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParamsById(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加静态属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染Tag标签 -->
                <el-tag class="params-tags"
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i,scope.row)"
                >{{item}}</el-tag>
                <!-- 切换输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>

            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >修改</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParamsById(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加动态参数或者静态属性对话框提示 -->
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @closed="addDialogVisibleClosed"
    >
      <!-- 内容主体区域 -->
      <el-form
        :model="addParamsForm"
        :rules="addParamsFormRules"
        ref="addParamsFormRef"
        label-width="100px"
        status-icon
      >
        <el-form-item :label="titleText+'名称:'" prop="attr_name" label-width="120px">
          <el-input v-model="addParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible=false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改动态参数或者静态属性对话框提示 -->
    <el-dialog
      :title="'修改'+titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @closed="editDialogVisibleClosed"
    >
      <!-- 内容主体区域，校验规则用添加的规则 -->
      <el-form
        :model="editParamsForm"
        :rules="addParamsFormRules"
        ref="editParamsFormRef"
        label-width="100px"
        status-icon
      >
        <el-form-item :label="titleText+'名称:'" prop="attr_name" label-width="120px">
          <el-input v-model="editParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible=false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类列表
      catelist: [],
      // 级联选择框的配置对象
      cateProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children"
      },
      // 级联选择框双向绑定到的数组
      selectedCateKeys: [],
      // 被激活的页签名称
      activeName: "many",
      // 动态参数的数据
      manyTableData: [],
      // 静态属性的数据
      onlyTableData: [],
      // 控制添加对话框的显示和隐藏
      addDialogVisible: false,
      // 添加参数的表单数据对象
      addParamsForm: {},
      // 添加表单数据的校验规则对象
      addParamsFormRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" }
        ]
      },
      // 修改对话框的展示和隐藏
      editDialogVisible: false,
      // 修改的表单数据对象
      editParamsForm: {}
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    // 获取分类列表的数据
    async getCateList() {
      const { data: result } = await this.$http.get("categories");
      if (result.meta.status !== 200) {
        return this.$message.error("获取商品分类失败！");
      }
      this.catelist = result.data;
    },
    // 级联选择框选中项变化，会触发这个函数
    handleChange() {
      this.getParamsData();
    },
    //tab页签点击事件的处理函数
    handleTabClick() {
      this.getParamsData();
    },
    // 获取参数的列表数据
    async getParamsData() {
      // 证明选中的不是三级分类
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys.length = [];
        this.manyTableData=[]
        this.onlyTableData=[]
        return;
      }
      // 证明选中的是三级分类,根据所选分类的ID和当前所处的面板获取对应的参数
      const { data: result } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName }
        }
      );

      if (result.meta.status !== 200) {
        return this.$message.error("获取参数列表失败！");
      }

      result.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(",") : [];
        // 控制各自的文本框显示和隐藏
        item.inputVisible = false;
        // 控制各自的输入内容
        item.inputValue = "";
      });
      // console.log(result.data);

      if (this.activeName === "many") {
        this.manyTableData = result.data;
      } else {
        this.onlyTableData = result.data;
      }
    },
    // 点击按钮添加参数
    addParams() {
      this.$refs.addParamsFormRef.validate(async valid => {
        if (!valid) return;
        const { data: result } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addParamsForm.attr_name,
            attr_sel: this.activeName
          }
        );

        if (result.meta.status !== 201) {
          return this.$message.error("添加参数失败！");
        }
        this.$message.success("添加参数成功！");
        this.addDialogVisible = false;
        this.getParamsData();
      });
    },
    // 监听添加对话框的关闭事件
    addDialogVisibleClosed() {
      this.$refs.addParamsFormRef.resetFields();
    },
    // 点击按钮展示修改的对话框
    async showEditDialog(attr_id) {
      // 查询当前参数的信息
      const { data: result } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attr_id}`,
        {
          params: { attr_sel: this.activeName }
        }
      );
      if (result.meta.status !== 200) {
        return this.$message.error("获取参数信息失败！");
      }
      this.editParamsForm = result.data;
      this.editDialogVisible = true;
    },
    // 清空修改的表单内容
    editDialogVisibleClosed() {
      this.$refs.editParamsFormRef.resetFields();
    },
    // 点击确定提交修改的内容
    editParams() {
      this.$refs.editParamsFormRef.validate(async valid => {
        if (!valid) return;
        const { data: result } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editParamsForm.attr_id}`,
          {
            attr_name: this.editParamsForm.attr_name,
            attr_sel: this.activeName
          }
        );

        if (result.meta.status !== 200) {
          return this.$message.error("修改参数失败！");
        }
        this.$message.success("修改参数成功！");
        this.getParamsData();
        this.editDialogVisible = false;
      });
    },
    //点击删除按钮，发送删除请求
    async removeParamsById(attr_id) {
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
      const { data: result } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attr_id}`
      );
      if (result.meta.status !== 200) {
        return this.$message.error("删除商品失败");
      }
      this.$message.success("删除商品成功");
      this.getParamsData();
    },
    // 文本框失去焦点或者按下enter键
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = "";
        row.inputVisible = false;
        return;
      }
      // 如果没有return，则证明输入了内容，需要做后续处理
      row.attr_vals.push(row.inputValue.trim());
      row.inputValue = "";
      row.inputVisible = false;
      // 需要发起请求保存这些内容
      this.saveAttrVals(row);
    },
    // 点击按钮展示输入文本框
    showInput(row) {
      row.inputVisible = true;
      // 让文本框自动获得焦点
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    // 删除对应的标签
    handleClose(i, row) {
      row.attr_vals.splice(i, 1);
      // 删除后发起更新请求
      this.saveAttrVals(row);
    },
    // 抽离共用的保存标签函数,handleInputConfirm和handleClose行调用
    async saveAttrVals(row) {
      const { data: result } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(",")
        }
      );
      if (result.meta.status !== 200) {
        return this.$message.error("修改参数项失败！");
      }
      this.$message.success("修改参数项成功！");
    }
  },
  computed: {
    // 如果按钮需要被禁用，则返回true，否则返回false
    isBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true;
      }
      return false;
    },
    // 当前选中的三级分类ID
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2];
      }
      return null;
    },
    // 动态计算添加按钮的标题的文字
    titleText() {
      if (this.activeName === "many") {
        return "动态参数";
      }
      return "静态属性";
    }
  }
};
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.params-tags {
  margin-right: 15px;
}
.input-new-tag {
  width: 120px;
}
</style>