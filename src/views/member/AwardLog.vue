<template>
  <div class="page awardlog-page">
    <van-nav-bar title="奖励明细" left-text="返回" left-arrow @click-left="onClickLeft" right-text="提现" @click-right="$router.push('/member/cash')" />
    <div class="container">
    <van-dropdown-menu>
      <van-dropdown-item v-model="awardType" :options="typeList" @change="setAwardType" />
      <van-dropdown-item v-model="dateRannge" :title="dateTitle" :options="rangeList" @change="setAwardDate" />
    </van-dropdown-menu>
    <div class="block_title">订单 {{statics.order_count}} 笔, 奖励 ￥{{formatMoney(statics.total_amount)}}</div>
    <van-list v-model="loading" :error="error" :finished="finished" finished-text="没有更多了" @load="loadNext">
      <van-cell v-for="item in lists" :key="item.id" :title="item.remark" :label="formatDate(item.create_time)" >
        <template #title>
          <div>{{item.remark}}</div>
          <div v-if="item.from_member_id > 0">来源: {{item.nickname?item.nickname:item.username}}</div>
        </template>
        <div :class="item.amount>0?'grow-amount':'dec-amount'">+{{formatMoney(item.amount)}}</div>
        <van-tag v-if="item.status > 0" round>已发放</van-tag>
        <van-tag v-else round type="warning">待发放</van-tag>
      </van-cell>
    </van-list>
    </div>
    
    <van-action-sheet v-model="showDate" title="选择日期">
      <van-datetime-picker
      v-model="currentDate"
      type="year-month"
      :min-date="minDate"
      :max-date="maxDate"
      :formatter="formatter"
      @confirm="dateConfirm"
    />
    </van-action-sheet>
  </div>
</template>
<script >
import utils from '../../utils'

export default {
  data() {
    return {
      awardType: '',
      dateRannge: '',
      dateValue: [],
      typeList: [
        { text: '全部奖励', value: '' }
      ],
      rangeList: [
        { text: '不限时间', value: '' },
        { text: '本周', value: 'week' },
        { text: '本月', value: 'month' },
        { text: '选择月份', value: 'diy' },
      ],
      dateTitle: '选择日期',
      showDate: false,
      currentDate:new Date(),
      minDate: new Date(1970,0,1),
      maxDate: new Date(),
      error: false,
      loading: true,
      finished: false,
      page: 0,
      lists: [],
      statics:{}
    };
  },
  mounted() {
    this.loadData()
  },
  methods: {
    onClickLeft() {
      this.$router.back();
    },
    loadData() {
      this.loading = true;
      this.error = false
      this.$api
        .post("member.agent/award_log", {
          page: this.page,
          type: this.awardType,
          daterange: this.dateRannge?(this.dateRannge=='diy'?this.dateValue:this.dateRannge):''
        })
        .then(json => {
          this.loading = false;
          if(json.code==1){
            if(json.data.types && this.typeList.length < 2){
              for(let k in json.data.types){
                this.typeList.push({
                  text: json.data.types[k],
                  value: k
                })
              }
            }
            if(json.data.static_data){
              this.statics = json.data.static_data;
            }
            if(json.data.logs){
              this.lists = this.lists.concat(json.data.logs);
            }
            if (!json.data.logs ||
             json.data.logs.length<=0 ||
             json.data.page >= json.data.total_page) {
              this.finished = true;
            }
          }else{
            this.error = true
          }
        }).catch(err=>{
          console.log(err)
          this.loading = false;
          this.finished = true;
          this.error = true
        });
    },
    formatter(type, val) {
      if (type === 'year') {
        return `${val}年`;
      } else if (type === 'month') {
        return `${val}月`;
      }
      return val;
    },
    dateConfirm(value) {
      this.dateTitle = value.getFullYear()+'年'+(value.getMonth()+1)+'月'
      this.showDate=false;
      this.dateValue = value.getFullYear()+'-'+(value.getMonth()+1)
      this.reload()
    },
    formatDate(timestamp) {
      return utils.dateFormat('Y-m-d H:i:s',timestamp)
    },
    formatMoney(money) {
      if(this.type =='credit'){
        return Math.round(money * 0.01)
      }
      return (money*0.01).toFixed(2)
    },
    loadNext() {
      if(!this.error){
        this.page++;
      }
      this.loadData();
    },
    reload() {
      this.lists=[];
      this.page = 1;
      this.loadData();
    },
    setAwardType() {
      this.reload()
    },
    setAwardDate() {
      if(this.dateRannge == 'diy'){
        this.showDate = true
      }else{
        if(this.dateRannge=='week'){
          this.dateTitle = '本周'
        }else if(this.dateRannge=='month'){
          this.dateTitle = '本月'
        }else if(this.dateRannge=='year'){
          this.dateTitle = '今年'
        }else{
          this.dateTitle = '选择日期'
        }
        this.reload()
      }
    }
  }
};
</script>

<style lang="scss">
.awardlog-page{
  .block_title{
    margin: 0;
    padding: 16px;
    color: rgba(69, 90, 100, 0.6);
    font-weight: normal;
    font-size: 14px;
    line-height: 16px;
  }
  .grow-amount{
    color:#090
  }
  .dec-amount{
    color:#900
  }
}
</style>