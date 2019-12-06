import MyReact from './MyReact'
import MyReactDOM from './MyReactDOM'

class Test extends MyReact.Component {
  constructor(props) {
    super(props)
    this.state = {
      count: 0
    }
    setTimeout(()=>{
      this.setState({
        count:5
      })
    },2000)
  }
  componentDidMount() {
    console.log('Component mounted');
  }
  render() {
    return (
      <div>
        {this.state.count}:
        test
      </div>
    )
  }
}

function App() {
  return (
    <div>
      hello world
      <Test />
    </div>
  )
}

MyReactDOM.render(
  <App />,
  document.getElementById('app')
)