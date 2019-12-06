import * as snabbdom from 'snabbdom';
import propsModule from 'snabbdom/modules/props';
const reconcile = snabbdom.init([propsModule]);


const render = (el,rootDomElement)=>{
  reconcile(rootDomElement, el);
}

const __updater = (componentInstance)=>{
  const oldVNode = componentInstance.__vNode;
  const newVNode = componentInstance.render();
  componentInstance.__vNode = reconcile(oldVNode, newVNode);
}

const MyReactDOM = {
  render,
  __updater
}


export default MyReactDOM