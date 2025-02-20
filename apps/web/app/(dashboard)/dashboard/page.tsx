"use client";

import { client } from "@/lib/hc";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";
import { InferResponseType } from "hono";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, UserIcon, BriefcaseIcon } from "lucide-react";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";

type Application = Extract<
    InferResponseType<typeof client.api.applications.$get>,
    { applications: unknown[] }
>["applications"][number];

type ApplicationResponse =
    | {
          applications: Application[];
      }
    | {
          error: string;
      };

const statusColors = {
    in_review: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    done: "bg-green-500/10 text-green-700 dark:text-green-400",
    canceled: "bg-red-500/10 text-red-700 dark:text-red-400",
} as const;

export default function DashboardPage() {
    const searchParams = useSearchParams();
    const status = searchParams.get("status") as
        | "in_review"
        | "done"
        | "canceled"
        | undefined;

    const { data, isPending } = useQuery<ApplicationResponse>({
        queryKey: ["applications", status],
        queryFn: async () => {
            const res = await client.api.applications.$get({
                query: {
                    status: status ?? undefined,
                },
            });
            return res.json();
        },
        staleTime: 1000 * 5,
    });

    if (isPending || !data) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-muted-foreground">
                    Loading applications...
                </div>
            </div>
        );
    }

    if ("error" in data) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-destructive">Error: {data.error}</div>
            </div>
        );
    }

    return (
        <div className="space-y-8 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Applications
                </h1>
                <Tabs
                    defaultValue={status ?? "in_review"}
                    className="w-full sm:w-[400px]"
                >
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="in_review" asChild>
                            <Link href="?status=in_review">In Review</Link>
                        </TabsTrigger>
                        <TabsTrigger value="done" asChild>
                            <Link href="?status=done">Done</Link>
                        </TabsTrigger>
                        <TabsTrigger value="canceled" asChild>
                            <Link href="?status=canceled">Canceled</Link>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {data.applications.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] rounded-lg border border-dashed">
                    <div className="text-muted-foreground text-center">
                        <p className="text-lg font-medium">
                            No applications found
                        </p>
                        <p className="text-sm">
                            There are no applications in this status.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="rounded-lg border bg-card">
                    <ScrollArea className="h-[calc(100vh-10rem)]">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 p-4">
                            {data.applications.map((application) => (
                                <Card
                                    key={application.id}
                                    className="flex flex-col"
                                >
                                    <CardHeader className="flex-none space-y-3">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-1">
                                                <CardTitle className="line-clamp-1">
                                                    Application #
                                                    {application.id.slice(0, 8)}
                                                </CardTitle>
                                                <CardDescription className="flex items-center gap-2">
                                                    <CalendarIcon className="h-3 w-3" />
                                                    {formatDistanceToNow(
                                                        new Date(
                                                            application.createdAt
                                                        ),
                                                        { addSuffix: true }
                                                    )}
                                                </CardDescription>
                                            </div>
                                            <Badge
                                                variant="secondary"
                                                className={
                                                    statusColors[
                                                        application.status as keyof typeof statusColors
                                                    ]
                                                }
                                            >
                                                {application.status.replace(
                                                    "_",
                                                    " "
                                                )}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm">
                                            <div className="flex items-center gap-1.5">
                                                <UserIcon className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-muted-foreground">
                                                    {application.userId?.slice(
                                                        0,
                                                        8
                                                    ) ?? "No User"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-muted-foreground">
                                                    {application.jobId?.slice(
                                                        0,
                                                        8
                                                    ) ?? "No Job"}
                                                </span>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <div className="space-y-4">
                                            <div>
                                                <div className="mb-2 flex items-center justify-between">
                                                    <span className="text-sm font-medium">
                                                        Match Score
                                                    </span>
                                                    <span className="text-sm font-medium">
                                                        {application.matchScore}
                                                        %
                                                    </span>
                                                </div>
                                                <div className="h-2 rounded-full bg-muted">
                                                    <div
                                                        className="h-full rounded-full bg-primary transition-all"
                                                        style={{
                                                            width: `${application.matchScore}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <span className="text-sm font-medium">
                                                    AI Analysis
                                                </span>
                                                <p className="text-sm text-muted-foreground line-clamp-3">
                                                    {application.aiAnalysis}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                    {application.status === "in_review" && (
                                        <CardFooter className="flex-none gap-2 pt-6">
                                            <Button
                                                className="flex-1"
                                                variant="default"
                                            >
                                                Accept
                                            </Button>
                                            <Button
                                                className="flex-1"
                                                variant="destructive"
                                            >
                                                Decline
                                            </Button>
                                        </CardFooter>
                                    )}
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            )}
        </div>
    );
}
