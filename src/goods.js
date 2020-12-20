
import utils from "./utils";

const transGoods = (product)=>{

    product.image=utils.fixImageUrl(product.image);
    product.picture=product.image;

    product.has_spec = utils.countObject( product.spec_data ) > 0;
    product.has_prop = utils.countObject( product.prop_data ) > 0;
    product.content = utils.parseHtml(product.content)
    
    if(product.levels && product.levels instanceof Array){
        product.levels = product.levels.map(item=>{
            return parseInt(item)
        })
    }

    return product;
}

const transSku = (skus, product)=>{
    var sku={
        tree:[],
        list:[],
        price: product.min_price,
        stock_num: product.storage, // 商品总库存
        collection_id: 0, 
        none_sku: true,
        messages:[],
        hide_stock: false 
    }
    if(skus && skus.length > 0){
        skus = utils.fixListImage(skus)
        skus.forEach(item=>{
            var skuitem={
                id: item.sku_id,
                price: item.price * 100,
                stock_num: item.storage 
            }
            if(item.specs){
                for(var k in item.specs){
                    skuitem[k]=item.specs[k];
                }
            }
            sku.list.push(skuitem)
        })
        if(product.has_spec){
            sku.none_sku=false;
            for(var k in product.spec_data){
                var treeItem={
                    k:product.spec_data[k].title,
                    k_s:k,
                    v:product.spec_data[k].data.map(dataItem=>{
                        return {
                            id: dataItem,
                            name: dataItem
                        }
                    })
                }
                sku.tree.push(treeItem);
            }

        }else{
            sku.collection_id=skus[0].sku_id;
            sku.price = parseFloat(skus[0].price);
            sku.none_sku=true;
        }
    }
    //console.log(sku)
    return sku;
}

export default {
    transGoods:transGoods,
    transSku:transSku
}