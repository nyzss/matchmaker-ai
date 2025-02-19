"use client";

import {
    BadgeCheck,
    Bot,
    Clock,
    GalleryVerticalEnd,
    Loader2,
    Users,
    X,
} from "lucide-react";
import * as React from "react";

import { NavMain } from "@/components/sidebar/nav-main";
import { NavUser } from "@/components/sidebar/nav-user";
import { TeamSwitcher } from "@/components/sidebar/team-switcher";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar";
import { useSession } from "@/lib/auth";
import { redirect } from "next/navigation";

const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
    teams: [
        {
            name: "Main",
            logo: GalleryVerticalEnd,
            plan: "Enterprise",
        },
    ],
    navMain: [
        {
            title: "Candidates",
            url: "/dashboard",
            icon: Bot,
            isActive: true,
            items: [
                {
                    title: "All",
                    url: "/dashboard",
                    icon: Users,
                },
                {
                    title: "In Review",
                    url: "/dashboard?status=in_review",
                    icon: Clock,
                },
                {
                    title: "Done",
                    url: "/dashboard?status=done",
                    icon: BadgeCheck,
                },
                {
                    title: "Canceled",
                    url: "/dashboard?status=canceled",
                    icon: X,
                },
            ],
        },
    ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { data: session, error } = useSession();

    if (error) {
        redirect("/auth");
    }

    if (!session) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-muted">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="size-9 animate-spin" />
                    <p className="text-lg font-bold">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <TeamSwitcher teams={data.teams} />
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={session!.user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
