import Vue from 'vue';
import Vant from 'vant';
import { Lazyload } from 'vant';
import 'vant/lib/index.css';

import vueg from 'vueg-history';
import router from './router';
import store from './store';
import utils from './utils';
import api from './api';

import App from './App.vue';
import InfoBlock from './components/InfoBlock.vue'
import ProductList from './components/ProductList.vue'
import GoodsList from './components/GoodsList.vue'
// import GroupbuyList from './components/GroupbuyList.vue'
import AddressList from './components/AddressList.vue'
// import GroupRule from './components/GroupRule.vue'
import Splash from './views/Splash.vue'

// 用于微信分享的页面跳转
const query = utils.parseQuery(location.search)
if(query && query.path){
  // 保留除path外的其它参数
  let querys = [];
  for(const key in query){
    if(key === 'path')continue;
    querys.push(key + '=' + query[key]);
  }
  location.href = '/'+(querys.length>0?('?'+querys.join('&')):'')+'#'+query.path
  // 防止页面刷新时执行后续逻辑
  throw SyntaxError()
}

if(query && (query['openid'] || query['_authed'])){
  api.wechatAuthed=true
  api.openid = query['openid']
  if(location.replace ){
    const locationParts = location.href.split('#', 2);
    location.replace(utils.dropParam(locationParts[0],'_authed') + (locationParts.length>1?('#'+locationParts[1]):''));
  } 
}
if(query.agent){
  store.commit('setAgent', query.agent);
}

Vue.prototype.$api = api;

Vue.use(vueg, router, {
  shadow: false,
  roots: ['index','index-group','index-product','index-credit','index-cart','index-member'],
  map: {
    'index':{
      enter: ['index-group','index-product','index-credit','index-cart','index-member']
    },
    'index-group':{
      enter: ['index-product','index-credit','index-cart','index-member']
    },
    'index-product':{
      enter: ['index-credit','index-cart','index-member']
    },
    'index-credit':{
      enter: ['index-cart','index-member']
    },
    'index-cart':{
      enter: ['index-member']
    },
  }
});
Vue.use(Vant);
Vue.use(Lazyload);
Vue.component('info-block',InfoBlock)
Vue.component('product-list',ProductList)
Vue.component('goods-list',GoodsList)
// Vue.component('group-list',GroupbuyList)
Vue.component('address-list',AddressList)
// Vue.component('group-rule',GroupRule)
Vue.component('v-splash',Splash)

Vue.config.productionTip = false

let currentAgent = query.agent
let isLogin = false

store.subscribe((mutation, state) => {
  if(mutation.type == 'setIsLogin'){
    if(isLogin != state.isLogin){
      store.dispatch('updateUserinfo')
      isLogin = state.isLogin
    }
  }
  if(mutation.type == 'setUserinfo'){
    
    if(state.userinfo && state.userinfo.is_agent > 0 && state.userinfo.agentcode != ''){
      if(state.userinfo.agentcode != currentAgent){
        const urls = location.href.split('#')
        urls[0] = utils.replaceParam(urls[0], 'agent', state.userinfo.agentcode)
        
        currentAgent = state.userinfo.agentcode
        store.commit('setAgent', currentAgent);
        history.pushState(null,document.title,urls.join('#'))

        if(state.siteinfo && state.siteinfo['webname']){
          api.wxShareDefault(state.siteinfo)
        }
      }
    }
  }
  if(mutation.type == 'setSiteinfo'){

    api.wxShareDefault(state.siteinfo)
  }
})

router.afterEach(()=>{
  api.wxSetShareDefault()
})

api.restore()
  .then(()=>{
    console.log('登录初始化完成')
    
    // 用于打开子页面自动将首页放入历史记录
    console.log(location.hash)
    if(window.performance && history.replaceState){
      if (window.performance.navigation.type == 1) {
        console.log("页面被刷新")
      }else{
        console.log("首次被加载")
        let curhash = location.hash
        if(curhash){
          let hashQuery=curhash.split('?')
          if(hashQuery[0] != '/'){
            // 进入页面非首页时将首页压入历史记录,防止后退就直接退出应用
            let locationurl=location.origin+location.pathname+location.search;
            history.replaceState(null,document.title,locationurl+'#/')
            history.pushState(null,document.title,locationurl+curhash)
          }
        }
      }
    }

    store.dispatch('updateGlobal');
    new Vue({
      router,
      store,
      render: h => h(App)
    }).$mount('#app')
    
  })


