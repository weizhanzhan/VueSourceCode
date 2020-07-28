//双花括号正则验证
const doubleBracketreg = /\{\{(.+?)\}\}/g; 

// 获取深层级的obj属性值
const getKeyValue = function(target,key){
  if(!target || typeof target !== 'object') {
    console.warn('数据对象不存在')
    return ''
  }
  const keys = key.split('.')
  let obj = target;
  let k
  while(k = keys.shift()){
    obj = obj[k]
  }
  return obj && typeof obj === 'string' ? obj : JSON.stringify(obj)
}

//递归寻找文本节点 正则找出花括号里的key值 获取到data中的值 然后替换文本内容nodeValue
const compiler = function(tmpNode,target){
  let childNodes = tmpNode.childNodes;//取出子元素
  for(let index = 0; index<childNodes.length; index++){
    const childNode = childNodes[index]
    if(childNode.nodeType === 1){ //元素节点,当是元素节点 继续向下找他的子文本节点
      compiler(childNode,target)
    }else if(childNode.nodeType === 3){   //文本节点
      let txt = childNode.nodeValue
      txt = txt.replace(doubleBracketreg,(_,keyValue)=>{ 
        const key = keyValue.trim();
        const value = getKeyValue(target,key)
        return value
      })
      childNode.nodeValue = txt
    }
  }
}

//虚拟dom

class VNode{
  constructor(tag,data,value,type){
    this.tag = tag && tag.toLowerCase()
    this.data = data
    this.value = value
    this.type = type
    this.children = []
  }
  appendChild( vnode ){
    this.children.push(vnode)
  }
}

/**
 * 使用递归来遍历dom元素 生成虚拟dom
 * Vue使用的源码使用的栈结构 ，使用栈存储 父元素 来实现递归生成
 */

 function getVNode(node){
  let nodeType = node.nodeType
  let _vnode = null

  if(nodeType ===1){//元素
    let attrObj = {}
    let attrs = node.attributes

    for( let i =0;i<attrs.length;i++){
      attrObj[attrs[i].nodeName] = attrs[i].nodeValue
    }
    _vnode = new VNode(node.tagName,attrObj,undefined,nodeType)

    const childNodes = node.childNodes
    
    for(let j=0;j<childNodes.length;j++){
      _vnode.children.push(getVNode(childNodes[j]))
    }
  } else if(nodeType===3){//文本
    _vnode = new VNode(undefined,undefined,node.nodeValue,nodeType)
  }
  return _vnode
 }
 //虚拟dom转 真实dom
 function parseVNode(vnode){
   let _dom = null
   if(vnode.type ===1){
      _dom = document.createElement(vnode.tag)
      if(vnode.data){
        const attrsName = Object.keys(vnode.data)
          for(let i =0;i<attrsName.length;i++){
            const attr = attrsName[i]
            _dom.setAttribute(attrsName[i],vnode.data[attrsName[i]])
          }
      
        
      }
      const children = vnode.children
      if(children&&children.length){
        for(let j=0;j<children.length;j++){
          const child = children[j]
          _dom.appendChild(parseVNode(child))
        }
      }
   }else if(vnode.type === 3){
      _dom = document.createTextNode(vnode.value)
   }
   return _dom
   
 }

//蒋Vnode和data结合，转为带数据的Vode
function combineVNodeWithData(vnode,data){
  let _type = vnode.type
  let _data = vnode.data
  let _value = vnode.value
  let _tag = vnode.tag
  let _children = vnode.children

  let _vnode = null

  if(_type === 1 ){//元素节点

    _vnode = new VNode(_tag,_data,_value,_type)

    if(_children&&_children.length){
      for(let i = 0; i<_children.length; i++){
        _vnode.children.push(combineVNodeWithData(_children[i],data))
      }
    }
  }else if( _type === 3){ //文本节点
    let value = _value.trim()
    value = value.replace(doubleBracketreg,(_,objKey)=>{
      return getKeyValue(data,objKey)
    })
    _vnode = new VNode(_tag,_data,value,_type)
  }
  return _vnode
}



//扩展数组方法 来响应数组新加入的数据

const ARRAY_METHODS = [
  'push','pop','shift','unshift'
]

// let arr = []
//     继承关系 :     arr -> Array.prototype -> Object.prototype -> ...
// 改变继承关系 ：     arr -> 改写的方法 ->  Array.prototype -> Object.prototype -> ...

let arr_method = Object.create(Array.prototype) //创建一个原型魏数组的对象
console.log('arr_method', arr_method)
ARRAY_METHODS.forEach(method =>{
  //此时arr_method是一个空对象，原型为数组 ，重写的方法定义在对象上，没重写也可调用数组原型链上的方法 不冲突
  arr_method[method] = function(){
    console.log( '扩展',method,'方法')
    //对数组新操作的对象 进行响应式话
    reactify(arguments)
    return Array.prototype[method].apply(this,arguments)
  }
})

let arr = []
// Vue源码做了判断 如果浏览器支持__proto__ 就执行
// 如果不支持 ，vue使用的是混入法 就是直接挂在到对象的原型上
arr.__proto__ = arr_method
console.log('arr', arr.__proto__)
console.log('arr_method', arr_method)

//数据响应式

function defineReactive(target,key,value,enumerable){
  
  if(typeof value === 'object' && value !== null && !Array.isArray(value)){
    reactify(value)
  }
  let _value = value
  Object.defineProperty(target,key,{
    enumerable:!!enumerable,
    get(){ 
      console.log('get',`${key}: ${_value}`)
      return _value 
    },
    set(newValue){
      console.log('set',`${key}: ${newValue}`)

      //对新赋值的对象响应式话
      reactify(newValue)
      _value = newValue
    }
  })

}

function reactify(obj){
  const keys = Object.keys(obj)
  for(let i = 0 ; i< keys.length ; i++) {
    const key = keys[i]
    const value = obj[key]

    // 如果是数字就循环里面的每一个元素 去递归绑定响应式
    // 如果不是数组 就直接绑定响应式，如果是obj则需要 递归子对象 并绑定响应式

    if(Array.isArray(value)){
      // 对操作的数组 扩展功能 新操作的对象 加入响应式话
      value.__proto__ = arr_method
      for (let index = 0; index < value.length; index++) {
        const item = value[index];
        reactify(item)
      }

    }else{
  
      defineReactive(obj,key,value,true)

    }
  }

}

const o = {
  name:'weizhan',
  like:{
    food:'apple'
  },
  class:[1,2,3,4],
  cur:[{name:'chines'}]
}
reactify(o)
console.log('defineProperty', o)

