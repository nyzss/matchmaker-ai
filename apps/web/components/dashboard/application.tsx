import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, UserIcon, BriefcaseIcon, Info } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Application } from "@/app/(dashboard)/dashboard/page";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { client } from "@/lib/hc";
import { cn } from "@/lib/utils";

const statusColors = {
    in_review: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    done: "bg-green-500/10 text-green-700 dark:text-green-400",
    canceled: "bg-red-500/10 text-red-700 dark:text-red-400",
} as const;

const feedbackSchema = z.object({
    feedback: z.string().min(1, "Feedback is required"),
});

type FeedbackForm = z.infer<typeof feedbackSchema>;

export default function ApplicationCard({
    application,
}: {
    application: Application;
}) {
    const form = useForm<FeedbackForm>({
        resolver: zodResolver(feedbackSchema),
        defaultValues: {
            feedback: "",
        },
    });

    const feedbackMutation = useMutation({
        mutationFn: async (payload: {
            applicationId: string;
            feedback: string;
        }) => {
            const res = await client.api.applications.$post({
                json: {
                    applicationId: payload.applicationId,
                    feedback: payload.feedback,
                },
            });
            return res.json();
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        form.handleSubmit((data) => {
            feedbackMutation.mutate({
                applicationId: application.id,
                feedback: data.feedback,
            });
        })();
        form.reset();
    };

    return (
        <Card className="flex flex-col">
            <CardHeader className="flex-none space-y-3">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                        <CardTitle className="line-clamp-1">
                            Application #{application.id.slice(0, 8)}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                            <CalendarIcon className="h-3 w-3" />
                            {formatDistanceToNow(
                                new Date(application.createdAt),
                                {
                                    addSuffix: true,
                                }
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
                        {application.status.replace("_", " ")}
                    </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                            {application.candidateId?.slice(0, 8) ?? "No User"}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                            {application.jobId?.slice(0, 8) ?? "No Job"}
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
                                {application.matchScore}%
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
                        <span className="text-sm font-medium">AI Analysis</span>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                            {application.aiAnalysis}
                        </p>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex-none gap-2 pt-6">
                <Dialog>
                    <DialogTrigger asChild>
                        {application.status === "in_review" && (
                            <Button className="flex-1" variant="default">
                                Provide Feedback
                            </Button>
                        )}
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Application Feedback</DialogTitle>
                            <DialogDescription>
                                Provide your feedback for this application. This
                                will help improve our matching system.
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="feedback"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Feedback</FormLabel>
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
                                    disabled={feedbackMutation.isPending}
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
                                application.status !== "in_review" && "flex-1"
                            )}
                        >
                            <Info className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Application Details</DialogTitle>
                            <DialogDescription>
                                Detailed information about the candidate and job
                                position
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-6">
                            {application.candidate && (
                                <div className="space-y-2">
                                    <h3 className="font-semibold">
                                        Candidate Information
                                    </h3>
                                    <div className="rounded-lg border p-4 space-y-2">
                                        <p>
                                            <span className="font-medium">
                                                Name:
                                            </span>{" "}
                                            {application.candidate.name}
                                        </p>
                                        <p>
                                            <span className="font-medium">
                                                Email:
                                            </span>{" "}
                                            {application.candidate.email}
                                        </p>
                                        <p>
                                            <span className="font-medium">
                                                Experience:
                                            </span>{" "}
                                            {application.candidate.experience}
                                        </p>
                                        <p>
                                            <span className="font-medium">
                                                Skills:
                                            </span>{" "}
                                            {application.candidate.skills}
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
                                            {application.job.title}
                                        </p>
                                        <p>
                                            <span className="font-medium">
                                                Company:
                                            </span>{" "}
                                            {application.job.company}
                                        </p>
                                        <p>
                                            <span className="font-medium">
                                                Description:
                                            </span>{" "}
                                            {application.job.description}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </CardFooter>
        </Card>
    );
}
