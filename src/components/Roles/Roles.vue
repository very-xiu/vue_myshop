<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 添加角色区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible=true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="rolelist" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom',i1===0?'bdtop':'','vcenter']"
              v-for="(item1,i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级和三级权限 -->
              <el-col :span="19">
                <el-row
                  :class="[i2===0?'':'bdtop','vcenter']"
                  v-for="(item2 ,i2) in item1.children"
                  :key="item2.id"
                >
                  <!-- 二级 -->
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="danger"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showRoleEditDialog(scope.row.id)"
            >编辑</el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeRoleById(scope.row.id)"
            >删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色对话框提示 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 内容主体区域 -->
      <el-form
        :model="addRoleForm"
        :rules="addRoleRule"
        ref="addRoleRef"
        label-width="90px"
        status-icon
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible=false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改角色的对话框 -->
    <el-dialog title="编辑角色" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form
        :model="editRoleForm"
        :rules="addRoleRule"
        ref="editRoleFormRef"
        label-width="80px"
        status-icon
      >
        <el-form-item label="角色名" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      center
      @close="setRightDialogClosed"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightslist"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有角色列表数据
      rolelist: [],
      // 控制添加角色对话框的显示和隐藏
      addDialogVisible: false,
      // 控制编辑角色对话框的显示与隐藏
      editDialogVisible: false,
      // 查询到的角色信息
      editRoleForm: {},
      // 添加角色的表单数据
      addRoleForm: {
        roleName: "",
        roleDesc: ""
      },
      // 添加表单的验证规则对象,编辑角色表单的验证规则
      addRoleRule: {
        roleName: [
          { required: true, message: "请输入角色名", trigger: "blur" },
          { min: 2, max: 8, message: "长度在 2 到 8 个字符", trigger: "blur" }
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
          { min: 3, max: 30, message: "长度在 3~30 个字符", trigger: "blur" }
        ]
      },
      // 控制分配权限对话框的显示与隐藏
      setRightDialogVisible: false,
      // 保存所有权限的数组
      rightslist: [],
      // 树形控件的属性绑定对象
      treeProps: {
        label: "authName",
        children: "children"
      },
      // 默认选中的节点ID值数组
      defKeys: [],
      // 当前即将分配权限的角色id
      roleId: ""
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    // 获取所有角色列表
    async getRolesList() {
      const { data: result } = await this.$http.get("roles");
      if (result.meta.status !== 200) {
        return this.$message.error("获取角色列表失败！");
      }
      this.rolelist = result.data;
      // console.log(this.rolelist);
    },
    // 监听修改角色对话框关闭事件并重置表单
    editDialogClosed() {
      this.$refs.editRoleFormRef.resetFields();
    },
    // 监听添加角色对话框关闭事件并重置整个表单
    addDialogClosed() {
      this.$refs.addRoleRef.resetFields();
    },
    // 点击按钮添加新角色
    addRole() {
      // 对整个表单进行校验的方法
      this.$refs.addRoleRef.validate(async valid => {
        if (!valid) return;
        // 可以发起添加角色的请求
        const { data: result } = await this.$http.post(
          "roles",
          this.addRoleForm
        );
        // console.log(result);
        if (result.meta.status !== 201) {
          return this.$message.error("添加角色失败");
        }
        this.$message.success("添加角色成功");

        // 添加隐藏角色对话框功能
        this.addDialogVisible = false;
        // 重新获取角色列表数据
        this.getRolesList();
      });
    },
    // 根据ID删除用户
    async removeRoleById(id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该角色, 是否继续?",
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
      const { data: result } = await this.$http.delete(`roles/${id}`);
      if (result.meta.status !== 200) {
        return this.$message.error("删除角色失败");
      }
      this.$message.success("删除角色成功");
      this.getRolesList();
    },
    // 展示编辑角色的对话框
    async showRoleEditDialog(id) {
      // console.log(id)
      const { data: result } = await this.$http.get(`roles/${id}`);
      if (result.meta.status !== 200) {
        return this.$message.error("查询角色信息失败！");
      }
      this.editRoleForm = result.data;
      // console.log(this.editForm);
      this.editDialogVisible = true;
    },
    // 修改角色信息并提交
    editRoleInfo() {
      // 对整个表单进行校验的方法
      this.$refs.editRoleFormRef.validate(async valid => {
        if (!valid) return;
        // 点击确定验证有没有修改
        const { data: result } = await this.$http.get(
          `roles/${this.editRoleForm.roleId}`
        );
        if (
          this.editRoleForm.roleName === result.data.roleName &&
          this.editRoleForm.roleDesc === result.data.roleDesc
        ) {
          // 添加隐藏修改角色对话框功能
          this.editDialogVisible = false;
          // 重新获取角色列表数据
          this.getRolesList();
          this.$message.warning("角色都没有更新");
        } else {
          // 发起修改角色信息的请求
          const { data: result } = await this.$http.put(
            `roles/${this.editRoleForm.roleId}`,
            {
              roleName: this.editRoleForm.roleName,
              roleDesc: this.editRoleForm.roleDesc
            }
          );
          if (result.meta.status !== 200) {
            return this.$message.error("更新角色信息失败");
          }
          // 添加隐藏修改角色对话框功能
          this.editDialogVisible = false;
          // 重新获取角色列表数据
          this.getRolesList();
          this.$message.success("更新角色信息成功");
        }

        // console.log(result);
      });
    },
    // 根据ID删除对应的权限
    async removeRightById(role, rightId) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该权限, 是否继续?",
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);

      // 如果权限确认删除则返回字符串confirm
      // 如果权限取消删除则返回字符串cancel
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除！");
      }
      const { data: result } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      if (result.meta.status !== 200) {
        return this.$message.error("删除权限失败");
      }
      this.$message.success("删除权限成功");
      // console.log(result.data)
      // 重新赋值不刷新页面删除权限的方法
      role.children = result.data;
    },
    // 展示分配权限的对话框
    async showSetRightDialog(role) {
      this.roleId = role.id;
      // 获取所有权限数据
      const { data: result } = await this.$http.get("rights/tree");
      if (result.meta.status !== 200) {
        return this.$message.error("获取权限失败");
      }
      // 把获取到的权限数据保存到data中
      this.rightslist = result.data;
      // 递归获取到的三级节点Id
      this.getLeafKeys(role, this.defKeys);
      this.setRightDialogVisible = true;
    },
    // 通过递归形式，获取角色下所有三级权限的id，并保存到defKeys数组中
    getLeafKeys(node, arr) {
      // 如果当前node节点不包含children属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id);
      }
      node.children.forEach(item => this.getLeafKeys(item, arr));
    },
    // 监听分配权限对话框的关闭事件
    setRightDialogClosed() {
      this.defKeys = [];
    },
    // 点击为角色分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ];

      const idStr = keys.join(",");

      const { data: result } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      );

      if (result.meta.status !== 200) {
        return this.$message.error("分配权限失败！");
      }

      this.$message.success("分配权限成功！");
      this.getRolesList();
      this.setRightDialogVisible = false;
    }
  }
};
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>