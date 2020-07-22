# 数据驱动模型
Vue利用数据和页面中模板 生成新的html标签 替换页面放置模板的位置


# 为什么要使用虚拟dom？
```html
<div>
  <div>hello word!</div>  
<div>

```
转为虚拟daom
```js
{
  tag:'div',
  data:{
    title:'',
    class:''
  },
  children:[
    { 
      tag:'div'
    }
  ]
}
//文本节点
{
  tag:undefined,value:'hello word!'
}
```
p2 38