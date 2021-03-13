import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import * as serviceWorker from './serviceWorker'
import 'semantic-ui-css/semantic.min.css'
import { makeAuthRouting } from './routing';

ReactDOM.render(makeAuthRouting(), document.getElementById('root'))

serviceWorker.unregister()
