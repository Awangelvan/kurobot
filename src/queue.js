const queue = [];
let processing = false;

export function addQueue(task) {

  queue.push(task);
  processQueue();

}

async function processQueue() {

  if (processing) return;
  if (queue.length === 0) return;

  processing = true;

  const task = queue.shift();

  try {

    await task();

  } catch (err) {

    console.log("Queue error:", err);

  }

  processing = false;

  processQueue();

}