ALTER TABLE "applications" RENAME COLUMN "user_id" TO "candidate_id";--> statement-breakpoint
ALTER TABLE "applications" DROP CONSTRAINT "applications_user_id_candidates_id_fk";
--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE no action ON UPDATE no action;