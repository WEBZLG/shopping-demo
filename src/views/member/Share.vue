<template>
  <div class="page share-page">
    <van-nav-bar title="分享" left-text="返回" left-arrow @click-left="onClickLeft" />
    <div class="share-title">
      <h1>{{siteinfo.name}}</h1>
    </div>
    <div class="share-block" v-if="member.is_agent > 0">
      <div class="share-inner share-border-bottom">
      <h3>您的分享码</h3>
      <div class="share-code">{{member.agentcode}}</div>
      <van-button type="primary" size="small" @click="copyCode">复制邀请码</van-button>
      <div class="share-dot dot-left"></div>
      <div class="share-dot dot-right"></div>
      </div>
      <div class="share-inner">
        <van-image :src="shareimg" ></van-image>
        <div class="text">长按保存图片后可分享</div>
      </div>
    </div>
    <div v-else>
      <van-notice-bar wrapable :scrollable="false">
        您还不是【代言人】，暂时不能分享
      </van-notice-bar>
    </div>
    <div class="subtitle">
      {{siteinfo.description}}
    </div>
  </div>
</template>
<script >
import utils from '../../utils'

export default {
  data() {
    return {
      shareimg:'',
      qrimage:'',
    };
  },
  computed: {
    member() {
      return this.$store.state.userinfo;
    },
    siteinfo(){
      return this.$store.state.siteinfo;
    }
  },
  mounted() {
    if(!this.member || !this.member.id){
      this.$store.dispatch("updateUserinfo").then(()=>{
        this.loadData()
      })
    }else{
      this.loadData()
    }
  },
  methods: {
    onClickLeft() {
      this.$router.back();
    },
    loadData(){
      if(!this.member.agentcode || !this.member.is_agent){
        return;
      }
      let url = location.href.split('#')[0]
      url = utils.dropParam(url, ['code', 'state', 'force', '_authed', 'openid']);
        this.$api.post('member.agent/poster',{
          page:url
        }).then(json=>{
            if(json.code==1){
              this.shareimg=utils.fixImageUrl(json.data.poster_url)
                this.qrimage=utils.fixImageUrl(json.data.qr_url)
            }else{
                this.$toast.fail(json.msg||'加载失败')
            }
        }).catch(err=>{
          this.$toast.fail(err.msg||'加载失败')
        })
    },
    onCopy: function() {
      this.$toast.success("复制成功");
    },
    onError: function() {
      this.$toast.fail("复制失败, 请手动选择复制");
    }
  }
};
</script>

<style lang="scss">
.share-page {
  background: url(/static/share/background.png) center center no-repeat;
  background-size: cover;
  .share-title {
    padding-top: 50px;
  }
  h1 {
    text-indent: -99em;
    width: 250px;
    height: 50px;
    background: url(/static/share/title_treasure.png) center center no-repeat;
    background-size: contain;
    margin: 0 auto 20px auto;
  }
  .subtitle{
    text-indent: -99em;
    width: 300px;
    height: 30px;
    background: url(/static/share/title_subtitle.png) center center no-repeat;
    background-size: contain;
    margin: 10px auto 20px auto;
  }
  .share-block{
    border-radius: 10px;
    background:#fff;
    text-align: center;
    overflow: hidden;
    position: relative;
    margin:0 40px;
    .share-inner {
      padding:20px;
      position: relative;
    }
    h3{font-size:14px;color:#b9956b}
    .share-code{
      font-size:28px;
      margin-bottom:20px;
      color:#b08859;
    }
    .share-border-bottom{
      border-bottom:1px #af8755 dashed;
    }
    .share-dot{
      position: absolute;
      bottom:-10px;
      width:20px;
      height:20px;
      border-radius: 20px;
      background:#ccb47d;
    }
    .dot-left{
      left:-10px;
    }
    .dot-right{
      right:-10px;
      background-color:#b89564;
    }
    .van-image{
      width:200px;
      height:200px;
      border-radius:5px;
      overflow: hidden;
      box-shadow: 0 0 10px rgba(0,0,0,.2)
    }
    .text{
      color:#b59064;
      margin-top:10px;
    }
  }

}
</style>