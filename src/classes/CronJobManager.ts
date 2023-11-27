//
// Imports
//

import cron from "node-cron";

//
// Class
//

export interface CronJob
{
	expression : string;

	title : string;

	runAtStartup : boolean;

	callback : (scheduledCronJob : ScheduledCronJob) => Promise<void>;
}

export interface ScheduledCronJob extends CronJob
{
	scheduledTask : cron.ScheduledTask | null;

	log : (message : string) => void;
}

/** A class that manages cron jobs. */
export class CronJobManager
{
	/** All registered cron jobs. */
	scheduledCronJobs : ScheduledCronJob[] = [];

	/** Executes all registered run-at-startup cron jobs. */
	executeAll()
	{
		for (const cronJob of this.scheduledCronJobs.filter(cronJob => cronJob.runAtStartup))
		{
			cronJob.callback(cronJob).then();
		}
	}

	/** Registers the given cron job. */
	register(cronJob : CronJob) : ScheduledCronJob
	{
		console.log("[CronJobManager] Registered cron job: " + cronJob.title);

		const scheduledCronJob : ScheduledCronJob =
			{
				...cronJob,

				scheduledTask: null,

				log: (message : string) =>
				{
					console.log("[CronJobManager] [" + cronJob.title + "] " + message);
				},
			};

		scheduledCronJob.scheduledTask = cron.schedule(cronJob.expression, () =>
		{
			cronJob.callback(scheduledCronJob).then();
		});

		this.scheduledCronJobs.push(scheduledCronJob);

		return scheduledCronJob;
	}

	stopAll()
	{
		for (const cronJob of this.scheduledCronJobs)
		{
			if (cronJob.scheduledTask !== null)
			{
				cronJob.scheduledTask.stop();
			}
		}
	}
}