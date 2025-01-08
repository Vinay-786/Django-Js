import Navbar from '@/component/navbar';

const Layout = (props: any) => {
	return (
		<>
			<Navbar />
			{props.children}
			<div class='bg-gray-200'> Footer </div>
		</>
	);
};

export default Layout;

