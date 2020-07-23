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