<template>
  <div>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            @keyup.enter.native="enterSearch"
            class="input-with-select"
            v-model="queryInfo.query"
            clearable
            @clear="getUsersList"
          >
            <el-button @click="resetPage" slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userslist" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="编辑" placement="top" :enterable="false">
              <el-button
                type="primary"
                size="mini"
                icon="el-icon-edit"
                circle
                @click="showEditDialog(scope.row.id)"
              ></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="删除" placement="top" :enterable="false">
              <el-button
                type="danger"
                size="mini"
                icon="el-icon-delete"
                circle
                @click="removeUserById(scope.row.id)"
              ></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button
                type="warning"
                size="mini"
                icon="el-icon-setting"
                circle
                @click="setRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页指示器 -->
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加用户对话框提示 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 内容主体区域 -->
      <el-form
        :model="addForm"
        :rules="addRuleForm"
        ref="addFormRef"
        label-width="70px"
        status-icon
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" show-password></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible=false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户的对话框 -->
    <el-dialog title="编辑用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="70px"
        status-icon
      >
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%" @close="setRoleDialogClosed">
      <div>
        <p>当前用户：{{userInfo.username}}</p>
        <p>当前角色：{{userInfo.role_name}}</p>
        <p>
          分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 验证邮箱的校验规则
    let checkEmail = (rule, value, callback) => {
      const regEmail = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/;
      if (regEmail.test(value)) {
        return callback();
      }
      callback(new Error("请输入合法的邮箱！"));
    };
    // 验证手机号的校验规则
    let checkMobile = (rule, value, callback) => {
      const regMobile = /^1[3-9][0-9]{9}$/;
      if (regMobile.test(value)) {
        return callback();
      }
      callback(new Error("请输入合法的手机号码！"));
    };
    return {
      // 获取用户列表的参数对象
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 5
      },
      userslist: [],
      total: 0,
      // 控制添加用户对话框的显示和隐藏
      addDialogVisible: false,
      // 添加用户的表单数据
      addForm: {
        username: "",
        password: "",
        emali: "",
        mobile: ""
      },
      // 添加表单的验证规则对象
      addRuleForm: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 3, max: 8, message: "长度在 3 到 8 个字符", trigger: "blur" }
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 6, max: 15, message: "长度在 6~15 个字符", trigger: "blur" }
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "请输入手机号码", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }
        ]
      },
      // 控制编辑用户对话框的显示与隐藏
      editDialogVisible: false,
      // 查询到的用户信息
      editForm: {},
      // 编辑表单的验证规则
      editFormRules: {
        email: [
          { required: true, message: "请修改邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "请修改手机号码", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }
        ]
      },
      // 控制分配对话框的显示与隐藏
      setRoleDialogVisible: false,
      // 需要被分配角色的用户信息
      userInfo: {},
      // 所有数据的角色列表
      rolesList: [],
      // 已选中的角色Id值
      selectedRoleId: ''
    };
  },
  created() {
    this.getUsersList();
  },
  methods: {
    // 发起获取用户数据请求
    async getUsersList() {
      const { data: result } = await this.$http.get("users", {
        params: this.queryInfo
      });
      if (result.meta.status !== 200)
        return this.$message.error("获取用户列表失败！");
      this.userslist = result.data.users;
      this.total = result.data.total;
      // console.log(result);
    },
    // 监听pagesize改变的事件,一页多少条
    handleSizeChange(newSize) {
      // console.log(newSize);
      this.queryInfo.pagesize = newSize;
      this.getUsersList();
    },
    // 监听页码值改变的事件，点击页码发生变化
    handleCurrentChange(newPage) {
      // console.log(newPage);
      this.queryInfo.pagenum = newPage;
      this.getUsersList();
    },
    // 监听switch开关状态变化
    async userStateChange(userinfo) {
      // console.log(userinfo);
      const { data: result } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      );
      if (result.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state;
        return this.$message.error("更新用户状态失败");
      }
      this.$message.success("更新用户状态成功");
    },
    // 按enter键也能进行搜索
    enterSearch() {
      this.queryInfo.pagenum = 1;
      this.getUsersList();
    },
    // 点击搜索重置页码
    resetPage() {
      this.queryInfo.pagenum = 1;
      this.getUsersList();
    },
    // 第一种方法监听添加用户对话框关闭事件并重置整个表单
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    // 点击按钮添加新用户
    addUser() {
      // 对整个表单进行校验的方法
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return;
        // 可以发起添加用户的请求
        const { data: result } = await this.$http.post("users", this.addForm);
        if (result.meta.status !== 201) {
          return this.$message.error("添加用户失败");
        }
        this.$message.success("添加用户成功");

        // 添加隐藏用户对话框功能
        this.addDialogVisible = false;
        // 重新获取用户列表数据
        this.getUsersList();
      });
    },
    // 展示编辑用户的对话框
    async showEditDialog(id) {
      const { data: result } = await this.$http.get(`users/${id}`);
      if (result.meta.status !== 200) {
        return this.$message.error("查询用户信息失败！");
      }
      this.editForm = result.data;
      // console.log(this.editForm);
      this.editDialogVisible = true;
    },
    // 监听修改用户对话框关闭事件并重置表单
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    // 修改用户信息并提交
    editUserInfo() {
      // 对整个表单进行校验的方法
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return;
        // 点击确定验证有没有修改
        const { data: result } = await this.$http.get(
          `users/${this.editForm.id}`
        );
        if (
          this.editForm.email === result.data.email &&
          this.editForm.mobile === result.data.mobile
        ) {
          // 添加隐藏修改用户对话框功能
          this.editDialogVisible = false;
          // 重新获取用户列表数据
          this.getUsersList();
          this.$message.warning("用户没有更新");
        } else {
          // 发起修改用户信息的请求
          const { data: result } = await this.$http.put(
            `users/${this.editForm.id}`,
            {
              email: this.editForm.email,
              mobile: this.editForm.mobile
            }
          );
          if (result.meta.status !== 200) {
            return this.$message.error("更新用户信息失败");
          }

          // 添加隐藏修改用户对话框功能
          this.editDialogVisible = false;
          // 重新获取用户列表数据
          this.getUsersList();
          this.$message.success("更新用户信息成功");
        }
      });
    },
    // 根据ID删除用户
    async removeUserById(id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该用户, 是否继续?",
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
      const { data: result } = await this.$http.delete(`users/${id}`);
      if (result.meta.status !== 200) {
        return this.$message.error("删除用户失败");
      }
      this.$message.success("删除用户成功");
      this.getUsersList();
    },
    // 展示分配角色的对话框
    async setRole(userInfo) {
      // console.log(userInfo);
      this.userInfo = userInfo;
      // 在展示分配对话框之前，获取所有角色列表
      const { data: result } = await this.$http.get("roles");
      if (result.meta.status !== 200) {
        return this.$message.error("获取角色列表失败！");
      }
      this.rolesList = result.data;
      this.setRoleDialogVisible = true;
    },
    // 点击确定按钮分配角色并保存
    async saveRoleInfo(){
      if(!this.selectedRoleId){
        return this.$message.error('请选择分配角色！')
      }
      const {data:result} = await this.$http.put(`users/${this.userInfo.id}/role`,{rid:this.selectedRoleId})
      if(result.meta.status !==200){
        return this.$message.error('更新角色失败！')
      }
      this.$message.success('更新角色成功！');
      this.getUsersList();
      this.setRoleDialogVisible=false;
    },
    // 监听分配角色对话框的关闭事件，重置
    setRoleDialogClosed(){
      this.selectedRoleId='';
      this.userInfo='';
    }
  },
  watch: {
    // 第二种方法监听添加用户对话框关闭事件并重置整个表单
    /* addDialogVisible(){
      if(this.addDialogVisible===false){
        this.$refs.addFormRef.resetFields();
      }
    } */
  }
};
</script>

<style lang="less" scoped>
</style>