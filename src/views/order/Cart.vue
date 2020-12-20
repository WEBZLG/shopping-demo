<template>
  <div class="page order-cart">
    <van-nav-bar title="购物车" left-text="返回" left-arrow @click-left="onClickLeft" :right-text="isManage?'完成':'管理'" @click-right="onClickRight" />
    
    <div v-if="!isLogin" class="login-btn-box">
      <van-button type="info" plain hairline round  @click="goLogin">登录查看</van-button>
    </div>
    <div v-else-if="isLoading">
      <van-skeleton title avatar avatar-shape="square" avatar-size="50" :row="3" />
    </div>
    <div v-else-if="!goods || goods.length<1" class="empty-box">
      <div>购物车暂时没有内容</div>
      <van-button type="info" plain hairline round  @click="goHome">去商城看看</van-button>
    </div>
    <div v-else>
    <van-checkbox-group class="card-goods" v-model="checkedGoods">
      <van-checkbox class="card-goods__item" v-for="item in goods" :disabled="!isManage && item.status !== 1" :key="item.sku_id" :name="item.sku_id">
        <van-card
          :title="item.product_title"
          :desc="item.desc"
          :num="item.count"
          :price="formatPrice(item)"
          :thumb="item.image"
        >
        <div slot="num" @click.stop="return false">
          <van-stepper v-model="item.count" @change="setCount(item.sku_id, item.count)" />
        </div>
        
        </van-card>
      </van-checkbox>
    </van-checkbox-group>
    <van-submit-bar
      :price="totalPrice"
      :disabled="!checkedGoods.length"
      :button-text="submitBarText"
      @submit="onSubmit"
    >
    <van-checkbox v-model="checked" @change="setChecked">全选</van-checkbox>
    </van-submit-bar>
    </div>
  </div>
</template>

<script>
import store from '../../store';
import utils from '../../utils';


export default {
  components: {},

  data() {
    return {
      isLoading: true,
      isManage: false,
      checkedGoods: [],
      checked:false,
      goods: [ ]
    };
  },

  computed: {
    submitBarText() {
      const count = this.checkedGoods.length;
      return (this.isManage?'删除':'结算') + (count ? `(${count})` : "");
    },
    isLogin(){
      return store.state.isLogin
    },
    member(){
      return store.state.userinfo
    },
    totalPrice() {
      let total = 0;
      for(let i=0;i<this.goods.length;i++){
        const item=this.goods[i]
        if(item.status == 1){
          if(this.checkedGoods.indexOf(item.sku_id) !== -1){
            total += item.price*item.count*(item.is_discount == 1?this.discount:100)
          }
        }
      }
      return total;
    },
    discount() {
      if(this.member && this.member.level && this.member.level.discount){
        let discount = this.member.level.discount;
        if(discount > 0 && discount<100){
          return discount;
        }
      }
      return 100;
    },
    hasDiscount() {
      return this.discount < 100;
    }
  },
  mounted() {
    if(store.state.isLogin){
      this.loadData()
    }
  },
  methods: {
    formatPrice(item) {
      if(isNaN(item.price)){
        return item.product_price * this.discount/100;
      }
      return item.price * this.discount/100;
    },
    goLogin() {
      this.$router.push('/login')
    },
    goHome() {
      this.$router.push('/')
    },
    setChecked(){
      this.checkedGoods=[]
      if(this.checked){
        this.goods.forEach(value=>{
          if(this.isManage || value.status === 1){
            this.checkedGoods.push(value.sku_id)
          }
        })
        
      }
    },
    setCount(sku_id, count){
      //console.log(sku_id,count)
      this.$api.post('cart/update',{sku_id:sku_id,count:count})
    },
    onSubmit() {
      if(this.isManage){
        if(this.checkedGoods.length<1){
          this.$toast('请选择要删除的项');
          return;
        }
        this.$api.post('cart/delete',{sku_id:this.checkedGoods.join(',')}).then(json=>{
          if(json.code == 1){
            this.$toast.success('删除成功')
            this.checkedGoods=[]
            this.isLoading=true;
            this.loadData();
          }else{
            this.$toast.fail(json.msg)
          }
        })
      }else{
        if(this.checkedGoods.length<1){
          this.$toast('请选择商品结算');
          return;
        }
        this.$router.push('/order/confirm?from=cart&sku_id='+this.checkedGoods.join(','))
      }
    },

    onClickLeft() {
      this.$router.back();
    },
    onClickRight() {
      this.checkedGoods = [];
      this.isManage = !this.isManage
    },
    getSpecData(item){
      if(!item.spec_data || item.spec_data.length<1){
        return item.goods_no
      }
      let desc = [];
      for(let i in item.specs){
        desc.push(item.spec_data[i].title+': '+item.specs[i])
      }
      return desc.join(';')
    },
    loadData() {
      
      this.$api.post('cart/getall').then(res=>{
        this.isLoading=false;
        this.goods = utils.fixListImage(res.data,'product_image,cart_product_image')
        this.goods.forEach(value=>{
          value.image = value.product_image
          value.desc = this.getSpecData(value)
          return value
        })
      }).catch(err=>{
        this.isLoading=false;
        this.$toast.fail(err.msg||'获取购物车失败')
      })
    }
  }
};
</script>

<style lang="scss">
.order-cart {
  .card-goods {
    padding: 10px 0;

    &__item {
      position: relative;
      background-color: #fff;

      .van-checkbox__label {
        width: 100%;
        height: auto; // temp
        padding: 0 10px 0 15px;
        box-sizing: border-box;
      }

      .van-checkbox__icon {
        top: 50%;
        left: 10px;
        z-index: 1;
        position: absolute;
        margin-top: -10px;
      }

      .van-card__price {
        color: #f44;
      }
    }
  }

  .van-submit-bar {
    position: absolute;
  }
}
.login-btn-box{
  text-align: center;
  margin-top:50px;
}
</style>
