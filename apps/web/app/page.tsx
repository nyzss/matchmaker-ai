"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth";
import { client } from "@/lib/hc";
import { useEffect, useState } from "react";

export default function Home() {
    const [data, setData] = useState<{
        message: string;
        job: {
            id: string;
            title: string;
            description: string;
            company: string;
            createdAt: string;
            updatedAt: string;
        }[];
    } | null>(null);
    useEffect(() => {
        const fetchData = async () => {
            const resp = await client.api.posts.$get();
            const data = await resp.json();

            setData(data);

            console.log(data);
        };
        fetchData();
    }, []);

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const email = formData.get("email")?.toString() ?? "";
        const password = formData.get("password")?.toString() ?? "";

        console.log(email, password);
        const resp = await authClient.signUp.email({
            email: email,
            password: password,
            name: email,
        });

        console.log(resp);
    };

    return (
        <div>
            <h1 className="text-4xl font-bold">Matchmaker AI</h1>
            <Button>Click me</Button>
            <h2>{data?.message}</h2>
            <h2>{data?.job.map((job) => job.title)}</h2>

            <form onSubmit={onSubmit}>
                <Input type="email" placeholder="Email" name="email" />
                <Input type="password" placeholder="Password" name="password" />
                <Button type="submit">Login</Button>
            </form>
        </div>
    );
}
