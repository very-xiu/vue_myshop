<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            @keyup.enter.native="enterSearch"
            class="input-with-select"
            clearable
            v-model="queryInfo.query"
            @clear="getOrdersList"
          >
            <el-button slot="append" icon="el-icon-search" @click="getOrdersList"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 订单列表区域 -->
      <el-table :data="orderslist" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格(元)" prop="order_price" width="110px"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status" width="110px">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status==='1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send" width="80px"></el-table-column>
        <el-table-column label="下单时间" width="180px">
          <template slot-scope="scope">{{scope.row.create_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template>
            <el-tooltip effect="dark" content="修改地址" placement="top" :enterable="false">
              <el-button type="primary" size="mini" icon="el-icon-edit" circle @click="showAddress"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="定位" placement="top" :enterable="false">
              <el-button
                type="success"
                size="mini"
                icon="el-icon-location"
                circle
                @click="showProgressBox"
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
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 修改地址的对话框 -->
    <el-dialog title="修改地址" :visible.sync="addressVisible" width="50%" @close="addressClosed">
      <el-form
        :model="addressForm"
        :rules="addressFormRules"
        ref="addressFormRef"
        label-width="90px"
        status-icon
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            :options="cityData"
            v-model="addressForm.address1"
            :props="{expandTrigger:'hover'}"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressOrder">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 展示物流进度的对话框 -->
    <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%">
      <el-form label-width="90px" status-icon>
        <!-- 时间线 -->
        <el-timeline :reverse="true">
          <el-timeline-item
            v-for="(activity, index) in progressInfo"
            :key="index"
            :timestamp="activity.time"
          >{{activity.context}}</el-timeline-item>
        </el-timeline>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import cityData from "./citydata.js";
export default {
  data() {
    return {
      // 查询参数对象
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10
      },
      // 总条数
      total: 0,
      // 订单列表数据
      orderslist: [],
      // 修改对话框的展示和隐藏
      addressVisible: false,
      // 修改地址表单校验对象
      addressFormRules: {
        address1: [
          { required: true, message: "请选择省市区县", trigger: "blur" }
        ],
        address2: [
          { required: true, message: "请填写详细地址", trigger: "blur" }
        ]
      },
      // 修改地址的表单对象
      addressForm: {
        address2: "",
        address1: []
      },
      // 中国省市区县
      cityData,
      // 物流对话框的展示和隐藏
      progressVisible: false,
      // 物流信息数组
      progressInfo: []
    };
  },
  created() {
    this.getOrdersList();
  },
  methods: {
    // 获取订单数据列表
    async getOrdersList() {
      const { data: result } = await this.$http.get("orders", {
        params: this.queryInfo
      });
      if (result.meta.status !== 200) {
        return this.$message.error("获取订单列表数据失败");
      }
      // console.log(result);
      this.total = result.data.total;
      this.orderslist = result.data.goods;
    },
    // 触发显示每页多少条数据展示
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getOrdersList();
    },
    // 触发显示第几页的页码值
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getOrdersList();
    },
    // 修改地址信息的对话框
    showAddress() {
      this.addressVisible = true;
    },
    // 监听关闭修改对话框事件，重置表单
    addressClosed() {
      this.$refs.addressFormRef.resetFields();
    },
    // 修改订单地址，点击确定事件
    addressOrder() {
      this.$refs.addressFormRef.validate(valid => {
        if (!valid) return;
        this.$message.success("暂时不懂");
        this.addressVisible = false;
      });
    },
    // 展示物流信息对话框
    async showProgressBox() {
      const { data: result } = await this.$http.get("/kuaidi/1106975712662");
      if (result.meta.status !== 200) {
        return this.$message.error("获取物流进度失败！");
      }
      this.progressInfo = result.data;
      this.progressVisible = true;
      // console.log(this.progressInfo);
    }
  }
};
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>