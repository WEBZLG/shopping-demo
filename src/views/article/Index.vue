<template>
  <div class="page article-index">
    <van-tabs v-model="activeKey" @click="setCate" scrollspy sticky>
      <van-tab v-for="cate in cates" :key="cate.id" :title="cate.title"></van-tab>
    </van-tabs>
    <div class="container">
      <van-list
      v-model="loading"
      :error="error"
      :finished="finished"
      finished-text="没有更多了"
      @load="loadNext"
    >
    <van-card
      v-for="art in articles"
      @click="viewArticle(art.id)"
      :key="art.id"
      :desc="art.description"
      :title="art.title"
      :thumb="art.cover"
  >
    <template #bottom>
      {{formatDate(art.create_time)}}
    </template>
  </van-card>
      </van-list>
    </div>
  </div>
</template>
<script >
import utils from "../../utils";

export default {
  data() {
    
    return {
      topid:0,
      paramid:0,
      activeKey: 0,
      cates: [],
      error: false,
      loading: true,
      finished: false,
      page: 1,
      articles: []
    };
  },
  mounted() {
    const query = this.$route.query
    if(query.topid){
      this.topid = query.topid
    }
    if(query.paramid){
      this.paramid = query.id
    }
    this.loadData()
  },
  methods: {
    loadData() {
      this.$api.post("article/get_cates", { pid: this.topid }).then(json => {
        if (json.code == 1) {
          this.cates = utils.fixListImage(json.data, 'icon,image');
          if(this.paramid>0){
            for(let i=0;i<this.cates.length;i++){
              if(this.paramid == this.cates[i].id){
                this.activeKey = i;
                break;
              }
            }
          }
          this.loadArticles()
        }
      });
    },
    formatDate (time) {
      return utils.dateFormat('Y-m-d H:i', time)
    },
    loadArticles() {
      this.loading=true
      let cateid=0
      if(this.cates[this.activeKey]){
        cateid = this.cates[this.activeKey].id
      }
      this.$api.post("article/get_list", { cate: cateid }).then(json => {
        this.loading=false
        if (json.code == 1) {
          this.articles = this.articles.concat(utils.fixListImage(json.data.lists,'cover'));
          if (
              !json.data.lists ||
              json.data.lists.length <= 0 ||
              json.data.page >= json.data.total_page
            ) {
              this.finished = true;
            }
        }else{
          this.error = true;
        }
      });
    },
    viewArticle(id) {
      this.$router.push("/article/detail/" + id);
    },
    setCate() {
      
      this.page = 1;
      this.finished = false;
      this.articles = [];
      this.loadArticles()
    },
    loadNext() {
      if(!this.error){
        this.page++;
      }
      this.loadArticles();
    }
  }
};
</script>
<style lang="scss">
  .article-index{
    .van-card{
      background-color:#fff;
    }
  }
</style>