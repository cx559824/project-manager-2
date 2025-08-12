import { Link } from "react-router";
// import { Welcome } from "../welcome/welcome";
import { Button } from "@/components/ui/button";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Taskhub" },
		{ name: "description", content: "Welcome to Taskhub!" },
	];
}

export default function Home() {
	return (
		<div className="w-full h-screen gap-4 flex items-center justify-center">
			<Link to="/sign-in">
				<Button className="bg-blue-500  text-white">Login</Button>
			</Link>
			<Link to="/sign-up">
				<Button variant="outline" className="bg-blue-500  text-white">
					Sign Up
				</Button>
			</Link>
		</div>
	);
}
