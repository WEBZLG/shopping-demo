<template>
  <div class="page article">
    <van-nav-bar title="详情" left-text="返回" left-arrow @click-left="onClickLeft" />
    <h1 class="article-title">{{article.title}}</h1>
    <div class="van-hairline--bottom">
      <div class="article-info">
        发布日期: {{publish_date}}
        浏览: {{article.views}}
      </div>
    </div>
    <div class="article-detail">
      <div v-if="article.content" class="html-content" v-html="article.content"></div>
      <div v-else class="empty-box">暂无内容~</div>
    </div>
  </div>
</template>
<script >
import utils from "../../utils";

export default {
  data() {
    return {
      article:{}
    };
  },
  computed: {
    publish_date () {
      if(!this.article.create_time){
        return '-'
      }
      return utils.dateFormat('Y-m-d H:i',this.article.create_time);
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
    onClickLeft() {
      this.$router.back();
    },
    loadData() {
      this.$api.post('article/view',{
        id: this.id
      }).then(res=>{

        this.article = res.data.article;
        this.article.content = utils.parseHtml(this.article.content)
        
        this.is_favourite = res.data.is_favourite == 1
        
        if(!res.data.images || res.data.images.length<1){
          this.images = [{
            id: 0,
            image: this.article.cover
          }]
        }else{
          this.images = utils.fixListImage(res.data.images)
        }
        this.$api.wxShare({
              title: this.article.title,
              desc: this.article.vice_title,
              imgUrl: this.article.cover
            })
      }).catch((error)=>{
        console.log(error)
        this.$toast.fail('资料错误')
        this.$router.back()
      })
    }
  }
};
</script>
<style lang="scss">
.article{
  background:#fdfdfd !important;
  .article-title{
    text-align: center;
  }
  .article-info{
    text-align: center;
    padding:0.5rem 0;
  }
  .article-detail{
    padding:10px;
    img{
      max-width: 100%;
    }
  }
}
</style>