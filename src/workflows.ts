import {
  proxyActivities, defineSignal, setHandler, condition, sleep, defineUpdate
}
  from '@temporalio/workflow';

export const finishSignal = defineSignal('finish');
export const update = defineUpdate<number, [number]>('squareUpdate');

export async function UpdateWorkflow(): Promise<string> {
  setHandler(update, (n) => {
    const result = n * n;
    console.log(`UpdateWorkflow: Squaring ${n} = ${result}`);
    return result;
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

