"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSession } from "./auth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
const queryClient = new QueryClient();

export default function Provider({ children }: { children: React.ReactNode }) {
    const { data: session, isPending } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (isPending) return;
        if (!session) {
            router.push("/auth");
        }
    }, [isPending, router, session]);

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
