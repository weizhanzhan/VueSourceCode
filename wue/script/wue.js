function Wue (options){
  this._options = options
  this._template = document.querySelector(options.el)
  this._parentNode = this._template.parentNode
  this._data = typeof options.data == 'function'? options.data():options.data
  
  this.$mount()
}


Wue.prototype.$mount = function(){
  // 提供一个render方法 生成虚拟dom
  this.render = this.createRenderFn()
  this.$mountComponent()
}


Wue.prototype.$mountComponent = function(){
  let mount = function(){
    
    this.update(this.render())
  }
  mount.call(this)

}

Wue.prototype.update =function(generateNode){
  // 渲染新的模板
  this._parentNode.replaceChild(generateNode,this._template)
  // document.body.replaceChild(generateNode,document.querySelector(this._options.el))
}

Wue.prototype.createRenderFn =function(){
  // Vue 将AST+data =》VNode
  // 这里 VNode+data => 含有数据的VNode
  let astAsVnode = getVNode(this._template)
  return function render(){
    //蒋模拟的ast 也就是vnode 转换为带数据的vnode
    const vNodeWithData = combineVNodeWithData(astAsVnode,this._data)
    console.log('ast', astAsVnode)
    console.log('vnode data', vNodeWithData)
    return parseVNode(vNodeWithData)
  }

}





// Wue.prototype.render = function(){
//   this.compiler()
// }

// 将模板与数据结合 得到真正的dom
// Wue.prototype.compiler = function(){
//   // 深拷贝一份模板  后面要换成虚拟dom
//   const generateNode = this._template.cloneNode(true)

//   // 处理新的模板 
//   // Vue  DOM-> 字符串模板 -> VNode -> 真正DOM
//   // 便利子节点 根据节点里的文本节点 获取带有{{}}的内容 取出括号里key值 把data[key]的值替换进去
//   compiler(generateNode,this._data)
//   this.update(generateNode)
// }
