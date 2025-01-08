import { client } from "@/lib/api";
import { createResource, For, Match, Show, Switch, type Component } from 'solid-js';

const fetchData = async () => {
	const response = await client.api.public.products.all.$get();
	return response.json();
}

const Product: Component = () => {
	const [user] = createResource(fetchData);
	return (
		<>
			<div class='container w-3/4'>
				<Show when={user.loading}>
					<p>Loading...</p>
				</Show>
				<Switch>
					<Match when={user.error}>
						<span>Error: {user.error}</span>
					</Match>
					<Match when={user()}>
						<For each={user()?.products}>
							{(product) => (
								<div>
									<h2>{product.productName || "No Name Available"}</h2>
									<p>{product.productDescription ?? "No Description Available"}</p>
									<p>Price: ${product.price.toFixed(2)}</p>
									<p>Stock: {product.stock ?? "Out of Stock"}</p>
									<p>Category: {product.ProductCategory ?? "Uncategorized"}</p>
								</div>
							)}
						</For>
					</Match>
				</Switch>
			</div>
		</>
	);
};

export default Product;

