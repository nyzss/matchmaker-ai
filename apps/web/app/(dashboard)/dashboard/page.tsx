"use client";

import { client } from "@/lib/hc";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
export default function DashboardPage() {
    const searchParams = useSearchParams();
    const status = searchParams.get("status") as
        | "in_review"
        | "done"
        | "canceled"
        | undefined;

    const { data, isPending } = useQuery({
        queryKey: ["applications", status],
        queryFn: async () => {
            const res = await client.api.applications.$get({
                query: {
                    status,
                },
            });
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
