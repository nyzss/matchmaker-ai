"use client";

import { client } from "@/lib/hc";
import { useQuery } from "@tanstack/react-query";

export default function DashboardPage() {
    const { data, isPending } = useQuery({
        queryKey: ["applications"],
        queryFn: async () => {
            const res = await client.api.applications.$get();
            return res.json();
        },
    });

    if (isPending) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Dashboard</h1>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
}
