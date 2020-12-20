<template>
  <div class="page product-detail">
    <van-nav-bar title="" left-text="" left-arrow @click-left="onClickLeft" />
    <div class="container">
    <van-swipe class="goods-swipe" :autoplay="3000">
      <van-swipe-item v-for="thumb in images" :key="thumb.id">
        <img :src="thumb.image" />
      </van-swipe-item>
    </van-swipe>

    <van-cell-group>
      <van-cell>
        <div class="goods-title">{{ product.title }}</div>
        <div class="goods-price">{{ formatPrice(product.min_price) }}</div>
      </van-cell>
      <van-cell class="goods-express">
        <van-col span="10">运费：{{ postage }}</van-col>
        <van-col span="14">剩余：{{ product.storage }}</van-col>
      </van-cell>
    </van-cell-group>

    <van-cell-group class="goods-cell-group">
      <van-cell title="商品属性" v-if="product.has_prop" is-link @click="showProp = true" />
      <van-cell title="商品规格" v-if="product.has_spec" is-link @click="buyMode=0;show = true;" />
    </van-cell-group>

    <van-panel class="margin-top" title="商品详情"></van-panel>
      <div v-if="product.content" class="html-content" v-html="product.content"></div>
      <div v-else class="empty-box">暂无介绍~</div>
    </div>

    <van-goods-action>
      <van-goods-action-icon icon="chat-o" @click="sorry">客服</van-goods-action-icon>
      <van-goods-action-icon icon="cart-o" @click="onClickCart">购物车</van-goods-action-icon>
      <van-goods-action-button type="warning" @click="onAddCart">加入购物车</van-goods-action-button>
      <van-goods-action-button type="danger" @click="onBuy">立即购买</van-goods-action-button>
    </van-goods-action>

    <van-sku
      v-model="show"
      :sku="skus"
      :goods="product"
      :goods-id="product.id"
      :quota="quota"
      :quota-used="quotaUsed"
      :hide-stock="sku?sku.hide_stock:false"
      :message-config="messageConfig"
      :show-add-cart-btn="buyMode==0"
      @buy-clicked="onBuyClicked"
      @add-cart="onAddCartClicked"
    />
    <van-popup v-model="showProp" closeable position="bottom">
      <div class="pop-container">
        <van-cell-group>
          <van-cell v-for="(val, key) in product.prop_data" :key="key" :title="key" :value="val" />
        </van-cell-group>
      </div>
    </van-popup>
  </div>
</template>

<script>
import utils from "../../utils";
import goods from "../../goods";

export default {
  components: {},

  data() {
    return {
      id: 0,
      images: [],
      sku:null,
      skus: {},
      is_favourite: false,
      postage: '',
      product: {
        title: "",
        price: 0,
        express: "免运费",
        remain: 0,
      },
      quota:0,
      quotaUsed:0,
      messageConfig:{},
      buyMode:0,
      show: false,
      showProp: false
    };
  },
  computed: {
    hasProp() {
      return (
        this.product.prop_data &&
        Object.values(this.product.prop_data).length > 0
      );
    },
    isLogin() {
      return this.$store.state.isLogin;
    }
  },
  mounted() {
    let id = this.$route.params.id
    if(!id){
      this.$toast.fail('参数错误')
      this.$router.back()
    }else{
      this.id = id
      this.loadData()
    }
  },
  methods: {
    loadData() {
      this.$api.post('product/view',{
        id: this.id
      }).then(res=>{

        this.postage = res.data.postage
        this.product = goods.transGoods(res.data.product);
        
        this.is_favourite = res.data.is_favourite == 1
        this.skus = goods.transSku(res.data.skus,this.product)
        if(!res.data.images || res.data.images.length<1){
          this.images = [{
            id: 0,
            image: this.product.image
          }]
        }else{
          this.images = utils.fixListImage(res.data.images)
        }
        this.$api.wxShare({
              title: this.product.title,
              desc: this.product.vice_title,
              imgUrl: this.product.image
            })
      }).catch((error)=>{
        console.log(error)
        this.$toast.fail('产品资料错误')
        this.$router.back()
      })
    },
    formatPrice(price) {
      return "¥" + (Math.round(price * 100) / 100).toFixed(2);
    },
    onClickLeft() {
      this.$router.back();
    },
    onClickCart() {
      this.$router.push("/cart");
    },
    onBuyClicked(skuData) {
      if(this.product.levels && this.product.levels.length>0){
        if(this.product.levels.indexOf(parseInt(this.member.level_id)) < 0){
          this.$toast("您当前用户组不能购买此商品~");
          return;
        }
      }
      this.$router.push("/order/confirm?product_id=" + skuData.goodsId+'&sku_id='+skuData.selectedSkuComb.id+'&count='+skuData.selectedNum);
    },
    onAddCartClicked(skuData) {
      if (!skuData.selectedSkuComb.id) {
            this.$toast("请选择规格~");
      } else {
        if(this.product.levels && this.product.levels.length>0){
          if(this.product.levels.indexOf(parseInt(this.member.level_id)) < 0){
            this.$toast("您当前用户组不能购买此商品~");
            return;
          }
        }
          if (skuData.selectedSkuComb.stock_num < skuData.selectedNum) {
              this.$toast("库存不足,请修改数量~");
              return
          }
          var data = {
              sku_id: skuData.selectedSkuComb.id,
              count: skuData.selectedNum
          }
          this.$api.post('cart/add', data).then(json => {
              if (json.code == 1) {
                this.$toast("成功添加到购物车~");
                this.$store.dispatch('updateCartCount')
                this.show=false
              } else {
                this.$toast.fail(json.msg);
              }
              
          })
      }
    },
    onAddCart() {
      this.buyMode=0;
        this.show = true;
    },
    onBuy() {
      this.buyMode=1;
        this.show = true;
    },
    sorry() {
      this.$toast("功能暂未上线~");
    }
  }
};
</script>

<style lang="scss">
.product-detail{
.van-nav-bar{
  background:transparent;
  position: fixed;
  .van-icon{
    color:#fff;
    text-shadow: 1px 2px 5px rgba(0,0,0,.3);
  }
}
}
.goods {
  padding-bottom: 50px;

  &-swipe {
    img {
      width: 100%;
      display: block;
    }
  }

  &-title {
    font-size: 16px;
  }

  &-price {
    color: #f44;
  }

  &-express {
    color: #999;
    font-size: 12px;
    padding: 5px 15px;
  }

  &-cell-group {
    margin: 15px 0;

    .van-cell__value {
      color: #999;
    }
  }

  &-tag {
    margin-left: 5px;
  }
}
</style>
