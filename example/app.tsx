import React, { useState } from "react";
import ReactDOM from "react-dom";
import Code from './codeTest'
import styles from './app.less'

function App() {

  return (
    <div className={styles.container}>
      <div className={styles.title} >code-generator 调试</div>
      <div className={styles.debugBox}>
        <Code />
      </div>
    </div>
  );
}

// export default App;

// const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

// root.render(<App />)

ReactDOM.render(
  <App />, document.querySelector('#root')
)