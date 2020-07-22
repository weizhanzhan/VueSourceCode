function Wue (options){
  this._options = options

  const dom = document.querySelector(options.el)
  const vNode = getVNode(dom)
  this._tmpNode = vNodeToDom(vNode)
  
  this._data = typeof options.data == 'function'? options.data():options.data
  this._parentNode = this._tmpNode.parentNode
  this.render()
}


Wue.prototype.render = function(){
  this.compiler()
}

// 将模板与数据结合 得到真正的dom
Wue.prototype.compiler = function(){
  // 深拷贝一份模板  后面要换成虚拟dom
  const generateNode = this._tmpNode.cloneNode(true)

  // 处理新的模板 
  // Vue  DOM-> 字符串模板 -> VNode -> 真正DOM
  // 便利子节点 根据节点里的文本节点 获取带有{{}}的内容 取出括号里key值 把data[key]的值替换进去
  compiler(generateNode,this._data)
  this.update(generateNode)
}

Wue.prototype.update =function(generateNode){
  // 渲染新的模板
  // this._parentNode.replaceChild(generateNode,document.querySelector(this._options.el))
  document.body.replaceChild(generateNode,document.querySelector(this._options.el))
}