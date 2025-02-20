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
import { CalendarIcon, UserIcon, BriefcaseIcon, Info } from "lucide-react";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { cn } from "@/lib/utils";

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

type FeedbackPayload = {
    applicationId: string;
    feedback: string;
};

const statusColors = {
    in_review: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    done: "bg-green-500/10 text-green-700 dark:text-green-400",
    canceled: "bg-red-500/10 text-red-700 dark:text-red-400",
} as const;

const feedbackSchema = z.object({
    feedback: z.string().min(1, "Feedback is required"),
});

type FeedbackForm = z.infer<typeof feedbackSchema>;

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

    const form = useForm<FeedbackForm>({
        resolver: zodResolver(feedbackSchema),
        defaultValues: {
            feedback: "",
        },
    });

    const handleSubmit = (
        e: React.FormEvent<HTMLFormElement>,
        applicationId: string
    ) => {
        e.preventDefault();
        form.handleSubmit((data) => {
            feedbackMutation.mutate({
                applicationId,
                feedback: data.feedback,
            });
        });
        form.reset();
    };

    const feedbackMutation = useMutation({
        mutationFn: async (payload: FeedbackPayload) => {
            const res = await client.api.applications.$post({
                json: {
                    applicationId: payload.applicationId,
                    feedback: payload.feedback,
                },
            });

            return res.json();
        },
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
                                                    {application.candidateId?.slice(
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
                                    <CardFooter className="flex-none gap-2 pt-6">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                {application.status ===
                                                    "in_review" && (
                                                    <Button
                                                        className="flex-1"
                                                        variant="default"
                                                    >
                                                        Provide Feedback
                                                    </Button>
                                                )}
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>
                                                        Application Feedback
                                                    </DialogTitle>
                                                    <DialogDescription>
                                                        Provide your feedback
                                                        for this application.
                                                        This will help improve
                                                        our matching system.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <Form {...form}>
                                                    <form
                                                        onSubmit={(e) =>
                                                            handleSubmit(
                                                                e,
                                                                application.id
                                                            )
                                                        }
                                                        className="space-y-4"
                                                    >
                                                        <FormField
                                                            control={
                                                                form.control
                                                            }
                                                            name="feedback"
                                                            render={({
                                                                field,
                                                            }) => (
                                                                <FormItem>
                                                                    <FormLabel>
                                                                        Feedback
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Textarea
                                                                            placeholder="Enter your feedback here..."
                                                                            className="min-h-[150px]"
                                                                            {...field}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <Button
                                                            type="submit"
                                                            className="w-full"
                                                            disabled={
                                                                feedbackMutation.isPending
                                                            }
                                                        >
                                                            Submit Feedback
                                                        </Button>
                                                    </form>
                                                </Form>
                                            </DialogContent>
                                        </Dialog>

                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    className={cn(
                                                        application.status !==
                                                            "in_review" &&
                                                            "flex-1"
                                                    )}
                                                >
                                                    <Info className="h-4 w-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-2xl">
                                                <DialogHeader>
                                                    <DialogTitle>
                                                        Application Details
                                                    </DialogTitle>
                                                    <DialogDescription>
                                                        Detailed information
                                                        about the candidate and
                                                        job position
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="grid gap-6">
                                                    {application.candidate && (
                                                        <div className="space-y-2">
                                                            <h3 className="font-semibold">
                                                                Candidate
                                                                Information
                                                            </h3>
                                                            <div className="rounded-lg border p-4 space-y-2">
                                                                <p>
                                                                    <span className="font-medium">
                                                                        Name:
                                                                    </span>{" "}
                                                                    {
                                                                        application
                                                                            .candidate
                                                                            .name
                                                                    }
                                                                </p>
                                                                <p>
                                                                    <span className="font-medium">
                                                                        Email:
                                                                    </span>{" "}
                                                                    {
                                                                        application
                                                                            .candidate
                                                                            .email
                                                                    }
                                                                </p>
                                                                <p>
                                                                    <span className="font-medium">
                                                                        Experience:
                                                                    </span>{" "}
                                                                    {
                                                                        application
                                                                            .candidate
                                                                            .experience
                                                                    }
                                                                </p>
                                                                <p>
                                                                    <span className="font-medium">
                                                                        Skills:
                                                                    </span>{" "}
                                                                    {
                                                                        application
                                                                            .candidate
                                                                            .skills
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {application.job && (
                                                        <div className="space-y-2">
                                                            <h3 className="font-semibold">
                                                                Job Information
                                                            </h3>
                                                            <div className="rounded-lg border p-4 space-y-2">
                                                                <p>
                                                                    <span className="font-medium">
                                                                        Title:
                                                                    </span>{" "}
                                                                    {
                                                                        application
                                                                            .job
                                                                            .title
                                                                    }
                                                                </p>
                                                                <p>
                                                                    <span className="font-medium">
                                                                        Company:
                                                                    </span>{" "}
                                                                    {
                                                                        application
                                                                            .job
                                                                            .company
                                                                    }
                                                                </p>
                                                                <p>
                                                                    <span className="font-medium">
                                                                        Description:
                                                                    </span>{" "}
                                                                    {
                                                                        application
                                                                            .job
                                                                            .description
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            )}
        </div>
    );
}
