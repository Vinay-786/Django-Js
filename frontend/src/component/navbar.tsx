import { A } from '@solidjs/router';
import { For, type Component } from 'solid-js';

const Navbar: Component = () => {
	const links = [
		{ name: "Home", path: "/" },
		{ name: "Products", path: "/product" },
		{ name: "About", path: "/about" },
		{ name: "Sign In", path: "/signin" },
	];

	return (
		<nav class="p-5 bg-blue-100 rounded-xl">
			<ul class='flex space-x-6 font-semibold'>
				<For each={links}>
					{(links) => (
						<li>
							<A href={links.path} activeClass="underlined" inactiveClass='default'> {links.name} </A>
						</li>
					)}
				</For>
			</ul>
		</nav>

	);
};

export default Navbar;

