<template>
  <div class="page express-page">
    <van-nav-bar title="快递详情" left-text="返回" left-arrow @click-left="onClickLeft" />
    <div class="container">

      <div class="goods-info">
        <van-card
        v-if="product"
          :desc="express"
          :title="product.title"
          :thumb="product.image"
        >
        <template #desc>
          <div class="card-desc">
          {{express}}<br />
          {{express_no}}
          </div>
        </template>
        </van-card>
      </div>
    
    <van-steps v-if="traces && traces.length>0" direction="vertical" :active="0">
      <van-step v-for="(trace,idx) in traces" :key="idx">
        <h4>{{trace.AcceptStation}}</h4>
        <p>{{trace.AcceptTime}}</p>
      </van-step>
    </van-steps>
    <van-empty v-else description="暂无物流轨迹" />
    
    </div>
  </div>
</template>
<script >

import utils from "../../utils";

export default {
  data() {
    return {
      order_id:0,
      product:{},
      express_no:'',
      express:'',
      traces:[],
      lastStatus:'已发货'
    };
  },
  mounted() {
    const order_id = this.$route.query.id;
    if (order_id && !isNaN(order_id)) {
      this.order_id = order_id * 1;
    } else {
      this.$toast.fail("参数错误");
      this.$router.back();
    }
    this.loadData();
  },
  methods: {
    onClickLeft() {
      this.$router.back();
    },
    loadData() {
      this.$api.get('member.order/express?id='+this.order_id).then(json=>{
        if(json.code == 1){
          
          const data = json.data
          if(data.product){
            data.product['image'] = utils.fixImageUrl(data.product['image'])
          }
          if (data.traces && data.traces.length>0){
              let firstdate = data.traces[0].AcceptTime
              let lastdate = data.traces[data.traces.length-1].AcceptTime
              let curDate = utils.string2date(firstdate)
              if (curDate < utils.string2date(lastdate)){
                  data.traces = data.traces.reverse()
              }
          }
          this.express_no=data.express_no
          this.express=data.express
          this.traces=data.traces
          this.product=data.product

        }
      }).catch(err=>{
        this.$toast.fail(err.msg||'系统繁忙')
      })
    }
  }
};
</script>

<style lang="scss">
.express-page{
  .van-card__title{
    font-size:14px;
    margin-bottom:15px;
  }
  .card-desc{
    color:#999;
  }
  .goods-info{
    background: #fff;
    padding: 10px 0;
  }
  .van-step{
    h4{
      margin: 0;
    }
    p{
      margin:0;
    }
  }
}
</style>