import { client } from "@/lib/api";
import { Component, createResource, Show } from "solid-js";

const fetchUrl = async () => {
	const apiurl = client.api.auth.login.google.$url();
	return apiurl.pathname
}

const Home: Component = () => {
	const [data] = createResource(fetchUrl)
	return (
		<>
			<div class='container w-3/4'>
				<span> {data.loading && "Loading..."} </span>
				<Show when={data()} fallback={<p> Still loading </p>}>
					<a href={data()}> Go </a>
					<div>{import.meta.env.MODE}</div>
				</Show>
			</div>
		</>
	);
};

export default Home;

