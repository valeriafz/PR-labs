const { parentPort, workerData } = require("worker_threads");
const fs = require("fs").promises;

const performOperation = async () => {
  const sleepTime = Math.floor(Math.random() * 7000 + 1000);
  console.log(`Worker sleeping for ${sleepTime}ms`);
  await new Promise((resolve) => setTimeout(resolve, sleepTime));

  if (workerData.type === "write") {
    await fs.appendFile(workerData.filePath, workerData.data + "\n");
    parentPort.postMessage({
      success: true,
      message: "Write completed",
      data: workerData.data,
    });
  } else if (workerData.type === "read") {
    const content = await fs.readFile(workerData.filePath, "utf-8");
    parentPort.postMessage({ success: true, data: content });
  }
};

performOperation().catch((error) => {
  console.error("Worker error:", error);
  parentPort.postMessage({ success: false, error: error.message });
});
