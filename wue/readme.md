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


//在页面中的dom和虚拟dom是一一对应关系
//现有ast和数据生成VNode
//将旧的VNode和新的VNode diff比较 更新

# 响应式

对于对象可以使用递归来相应化  但是数组也需要处理

- push
- pop
- shift
- unshift
- reverse
- sort
- splice

1. 在改变数组的数据的时候，要发出通知
  - vue2中缺陷 数组发生变化  设置length没法通知 （vue3 使用proxy解决这个问题）
2. 加入的元素应该变成响应式
  - 扩展函数功能：1.使用临时函数名存储函数 2.重新定义原来的函数 3.定义扩展的功能 4.调用临时的函数

扩展数组的push和pop如何处理？
修改要进行响应式化的数组的原型（__proto__）
还要考虑 对新赋值的数据 响应式
