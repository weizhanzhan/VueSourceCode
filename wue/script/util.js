const doubleBracketreg = /\{\{(.+?)\}\}/g; //双花括号正则验证

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