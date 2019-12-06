import { h } from 'snabbdom';
import MyReactDOM from './MyReactDOM'

const createElement = (type, props, ...children) => {
  // console.log(type, props, children)
  if (type.prototype && type.prototype.isClassComponent) {
    const componentInstance = new type(props);
    componentInstance.__vNode = componentInstance.render();
    componentInstance.__vNode.data.hook = {
      create: () => {
        componentInstance.componentDidMount()
      }
    }
    return componentInstance.__vNode;
  }
  if (typeof type === 'function') {
    return type(props)
  }
  return h(type, { props }, children);
}

class Component {
  constructor() { }
  componentDidMount() { }
  render() { }
  setState(partialState) {
    this.state = {
      ...this.state,
      ...partialState
    }
    MyReactDOM.__updater(this);
  }
}
Component.prototype.isClassComponent = true

const MyReact = {
  createElement,
  Component
}
export default MyReact
