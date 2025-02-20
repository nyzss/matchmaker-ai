"use client";

import ApplicationCard from "@/components/dashboard/application";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { client } from "@/lib/hc";
import { useQuery } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type Application = Extract<
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

export default function DashboardPage() {
    const searchParams = useSearchParams();
    const status = searchParams.get("status") as
        | "in_review"
        | "done"
        | "canceled"
        | undefined;

    const { data, isPending, refetch } = useQuery<ApplicationResponse>({
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
        <div className="space-y-8 pr-5 sm:pr-0 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                        Applications
                    </h1>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => refetch()}
                        disabled={isPending}
                    >
                        <RefreshCw
                            className={cn(
                                "h-4 w-4",
                                isPending && "animate-spin"
                            )}
                        />
                        <span className="sr-only">Refresh applications</span>
                    </Button>
                </div>
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
                                <ApplicationCard
                                    key={application.id}
                                    application={application}
                                />
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            )}
        </div>
    );
}
