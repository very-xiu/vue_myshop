<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索与添加商品区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            @keyup.enter.native="enterSearch"
            class="input-with-select"
            clearable
            v-model="queryInfo.query"
            @clear="getGoodsList"
          >
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addGood">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 商品列表区域 -->
      <el-table :data="goodslist" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price" width="95px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="160px">
          <template slot-scope="scope">
            {{scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="编辑" placement="top" :enterable="false">
              <el-button
                type="primary"
                size="mini"
                icon="el-icon-edit"
                circle
                @click="showEditDialog(scope.row.goods_id)"
              ></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="删除" placement="top" :enterable="false">
              <el-button
                type="danger"
                size="mini"
                icon="el-icon-delete"
                circle
                @click="removeGoodById(scope.row.goods_id)"
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
      :page-sizes="[5, 10, 15, 20]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
    </el-card>

    <!-- 修改商品的对话框 -->
    <el-dialog title="编辑商品" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="80px"
        status-icon
      >
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="editForm.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格" prop="goods_price">
          <el-input v-model="editForm.goods_price" type="number"></el-input>
        </el-form-item>
        <el-form-item label="商品重量" prop="goods_weight">
          <el-input v-model="editForm.goods_weight" type="number"></el-input>
        </el-form-item>
        <el-form-item label="商品数量" prop="goods_number">
          <el-input v-model="editForm.goods_number" type="number"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editGoods">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询参数对象
      queryInfo:{
        query:'',
        pagenum:1,
        pagesize:10
      },
      // 总共商品条数
      total:0,
      // 商品列表
      goodslist:[],
      // 添加商品对话框的显示和隐藏
      addDialogVisible:false,
      // 添加商品的表单数据
      addGoodForm:{},
      // 编辑商品对话框展示和隐藏
      editDialogVisible:false,
      // 编辑商品校验规则对象
      editFormRules:{
        goods_name:[
          {required:true,message:'请输入商品名称',trigger:'blur'}
        ],
        goods_price:[
          {required:true,message:'请输入商品价格',trigger:'blur'},

        ],
        goods_number:[
          {required:true,message:'请输入商品数量',trigger:'blur'}
        ],
        goods_weight:[
          {required:true,message:'请输入商品重量',trigger:'blur'}
        ]
      },
      // 编辑商品表单对象
      editForm:{
        goods_id:'',
        goods_name:'',
        goods_price:'',
        goods_number:'',
        goods_weight:'',
      }
    };
  },
  methods:{
    // 发起请求获取商品列表数据
    async getGoodsList(){
      const {data:result} = await this.$http.get('goods',{params:this.queryInfo})
      if(result.meta.status !==200){
        return this.$message.error('获取商品数据失败！')
      }
      // this.$message.success('获取商品数据成功！')
      this.total=result.data.total;
      this.goodslist=result.data.goods;
    },
    // 触发显示每页多少条数据展示
    handleSizeChange(newSize){
      this.queryInfo.pagesize=newSize;
      this.getGoodsList();
    },
    // 触发显示第几页的页码值
    handleCurrentChange(newPage){
      this.queryInfo.pagenum=newPage;
      this.getGoodsList();
    },
    // 按enter键也能进行搜索
    enterSearch() {
      this.queryInfo.pagenum = 1;
      this.getGoodsList();
    },
    // 根据ID删除商品
    async removeGoodById(id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该商品, 是否继续?",
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);

      // 如果商品确认删除则返回字符串confirm
      // 如果商品取消删除则返回字符串cancel
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除！");
      }
      const { data: result } = await this.$http.delete(`goods/${id}`);
      if (result.meta.status !== 200) {
        return this.$message.error("删除商品失败");
      }
      this.$message.success("删除商品成功");
      this.getGoodsList();
    },
    // 监听关闭编辑商品事件重置表单
    editDialogClosed(){
      this.$refs.editFormRef.resetFields();
    },
    // 展示编辑商品的对话框
    async showEditDialog(id) {
      const { data: result } = await this.$http.get(`goods/${id}`);
      if (result.meta.status !== 200) {
        return this.$message.error("查询商品信息失败！");
      }
      this.editForm = result.data;
      this.editDialogVisible=true;
    },
    // 添加商品按钮
    addGood(){
      this.$router.push('/goods/add')
    },
    // 点击确定按钮提交修改数据
    editGoods(){
      // 对整个表单进行校验的方法
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return;
         
          // 发起修改商品信息的请求
          const { data: result } = await this.$http.put(
            `goods/${this.editForm.goods_id}`,this.editForm
          );
          if (result.meta.status !== 200) {
            return this.$message.error("更新商品信息失败");
          }
          // 添加隐藏修改商品对话框功能
          this.editDialogVisible = false;
          // 重新获取商品列表数据
          this.getGoodsList();
          // this.getParentCateList();
          this.$message.success("更新商品信息成功");
        
      });
    }
  },
  created(){
    this.getGoodsList();
  }
};
</script>

<style lang="less" scoped>
</style>