import {
  proxyActivities, defineSignal, setHandler, condition, sleep, defineUpdate
}
  from '@temporalio/workflow';

import type * as activities from './activities';
export const finishSignal = defineSignal('finish');
export const update = defineUpdate<number, [number]>('squareUpdate');

const { square } = proxyActivities<typeof activities>({
  startToCloseTimeout: '2 seconds',
  retry: { nonRetryableErrorTypes: ['CreditCardExpiredException'] }
});

export async function UpdateWorkflow(): Promise<string> {
  setHandler(update, async (n) => {
    await Promise.all([square(n), square(n), square(n), square(n)]);
    return 1;
  });

  let finish = false;
  setHandler(finishSignal, () => { finish = true; });

  const approvalOrTimeout = Promise.race([
    condition(() => finish),
    sleep(300000).then(() => {})
  ]);

  await approvalOrTimeout;
  return "Finished";
}

