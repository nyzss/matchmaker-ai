"use client";

import { Button } from "@/components/ui/button";
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
    return (
        <div>
            <h1 className="text-4xl font-bold">Matchmaker AI</h1>
            <Button>Click me</Button>
            <h2>{data?.message}</h2>
            <h2>{data?.job.map((job) => job.title)}</h2>
        </div>
    );
}
