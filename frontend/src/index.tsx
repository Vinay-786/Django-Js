/* @refresh reload */
import { render } from 'solid-js/web'
import './index.css'
import { Route, Router } from '@solidjs/router'
import Layout from './router/layout.tsx'
import Home from './router/home.tsx'
import About from './router/about.tsx'
import Product from './router/products.tsx'

const root = document.getElementById('root')

render(() => (
	<Router root={Layout}>
		<Route path="/" component={Home} />
		<Route path="/about" component={About} />
		<Route path="/product" component={Product} />
	</Router>

), root!)
