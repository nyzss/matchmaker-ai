"use client";

import { useSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default function Home() {
    const { data: session } = useSession();

    if (session) {
        redirect("/dashboard");
    } else {
        redirect("/auth");
    }
}
