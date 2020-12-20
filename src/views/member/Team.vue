<template>
  <div class="page confirm-page">
    <van-nav-bar title="我的团队" left-text="返回" left-arrow @click-left="onClickLeft" />
    <div class="container">
        <van-list
          v-model="loading"
          :finished="finished"
          :error="error"
          finished-text="没有更多了"
          @load="loadNext"
        >
          <div class="team-list">
            <div class="item" v-for="item in lists" :key="item.id">
              <div class="pic"><img :src="item.avatar" class="img"></div>
              <div class="info">
                <div class="name">{{item.nickname}}</div>
                <div class="level">{{item.level_name}}</div>
              </div>
              <div class="count">
                <div class="title">团队人数</div>
                <div class="num">{{item.recom_count}}</div>
              </div>
            </div>
          </div>
        </van-list>
    </div>
  </div>
</template>
<script >
export default {
  data() {
    return {
      lists:[],
      loading: true,
      finished: false,
      error:false,
      pid:0,
      level:1,
      page:1,
    };
  },
  mounted(){
    this.loadData();
  },
  methods: {
    onClickLeft() {
      this.$router.back();
    },
    onLoad(){
      console.log(11)
    },
    loadData() {
      this.loading = true;
      this.error = false
      this.$api
        .post("member.agent/team", {
          pid:this.pid,
          level:this.level,
          page:this.page
        })
        .then(json => {
          this.loading = false;
          if(json.code==1){
            if(json.data.users){
              this.lists = this.lists.concat(json.data.users);
            }
            if (!json.data.users ||
             json.data.users.length<=0 ||
             json.data.page >= json.data.total) {
              this.finished = true;
            }
          }else{
            this.error = true
          }
        }).catch(err=>{
          console.log(err)
          this.loading = false;
          this.error = true
        });
    },
    loadNext() {
      if(!this.error){
        this.page++;
      }
      this.loadData();
    },
  }
};
</script>
<style lang="scss">
.team-list{
  margin:10px;
  border-radius: 5px;
  background:#fff;
  .item{
    display: flex;
    align-items: center;
    padding:10px 15px;
    .pic{
      .img{
        width:70px;
        height: 70px;
        overflow: hidden;
        border-radius: 70px;
        background: #f5f5f5;
      }
    }
    .info{
      flex:1;
      padding-left: 10px;
      .name{
        font-size: 16px;
        color:#af8320;
      }
      .level{
        padding-top:5px;
        font-size: 14px;
        color:#c0c0c0;
      }
    }
    .count{
      text-align: center;
      .title{
        font-size: 14px;
        color:#af8320;
      }
      .num{
        display: inline-block;
        padding:2px 6px;
        margin-top:5px;
        font-size: 12px;
        color:#fff;
        border-radius: 100px;
        background:#af8320;
      }
    }
  }
}
</style>