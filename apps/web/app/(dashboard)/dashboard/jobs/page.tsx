"use client";

import { client } from "@/lib/hc";
import { useQuery } from "@tanstack/react-query";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { Building2, CalendarDays } from "lucide-react";
import { InferResponseType } from "hono";

type Jobs = Extract<
    InferResponseType<typeof client.api.jobs.$get>,
    { jobs: unknown[] }
>["jobs"][number];

export default function JobsPage() {
    const { data, isPending } = useQuery({
        queryKey: ["jobs"],
        queryFn: async () => {
            const res = await client.api.jobs.$get();
            const data = await res.json();
            if ("error" in data) {
                throw new Error(data.error);
            }
            return data;
        },
    });

    if (isPending) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Jobs</h1>
                </div>
                <JobsSkeleton />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Jobs</h1>
                <div className="text-muted-foreground">
                    {data?.jobs.length} jobs found
                </div>
            </div>
            <div className="grid gap-4">
                {data?.jobs.length ? (
                    data?.jobs.map((job) => <JobCard key={job.id} job={job} />)
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">No jobs found</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function JobCard({ job }: { job: Jobs }) {
    return (
        <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="line-clamp-1">{job.title}</CardTitle>
                    <div className="flex items-center text-muted-foreground text-sm gap-2">
                        <Building2 className="h-4 w-4" />
                        <span>{job.company}</span>
                    </div>
                </div>
                <CardDescription className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    <span>
                        Posted {formatDistanceToNow(new Date(job.createdAt))}{" "}
                        ago
                    </span>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {job.description}
                </p>
            </CardContent>
        </Card>
    );
}

function JobsSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <Card key={i} className="hover:bg-muted/50 transition-colors">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-6 w-[200px]" />
                            <Skeleton className="h-4 w-[150px]" />
                        </div>
                        <Skeleton className="h-4 w-[180px] mt-2" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-[80%] mt-2" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
