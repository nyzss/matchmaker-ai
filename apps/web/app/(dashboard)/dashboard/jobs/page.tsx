"use client";

import { client } from "@/lib/hc";
import { useQuery } from "@tanstack/react-query";

export default function JobsPage() {
    const { data, isPending } = useQuery({
        queryKey: ["jobs"],
        queryFn: async () => {
            const res = await client.api.jobs.$get();
            return res.json();
        },
    });

    if (isPending) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Jobs</h1>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
}
