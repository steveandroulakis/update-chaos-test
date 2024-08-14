import { Client, WorkflowHandleWithFirstExecutionRunId } from '@temporalio/client';
import { UpdateWorkflow, update } from './workflows';

export async function runWorkflows(client: Client, taskQueue: string, numWorkflows: number): Promise<void> {
  const datenow = Date.now();

  const startTime = Date.now();

  const handle = await client.workflow.start(UpdateWorkflow, {
    taskQueue,
    workflowId: `update-chaos-${datenow}`
  });

  console.log(`Started workflow ${handle.workflowId}`);

  // every 200ms send an update
  for (let count = 0; count < 30; count++) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    await sendUpdate(handle, Math.floor(Math.random() * 10));
  }

  // sleep for 1 second
  await new Promise((resolve) => setTimeout(resolve, 1000));

  await handle.signal('finish');

  console.log(`Result is ${await handle.result()}`);

  const endTime = Date.now();
  const executionTime = endTime - startTime;
  console.log(`Execution time: ${executionTime}ms`);
}

async function sendUpdate(handle: WorkflowHandleWithFirstExecutionRunId, num: number): Promise<void> {
  const updateResult = await handle.executeUpdate(update, {args: [num]});
  console.log(`Update result for ${num} is ${updateResult}`);
}