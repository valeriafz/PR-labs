const express = require("express");
const { Worker } = require("worker_threads");
const path = require("path");
const fs = require("fs").promises;
const { Mutex } = require("async-mutex");
const net = require("net");

const app = express();
app.use(express.json());

const COMMAND_FILE_PATH = path.resolve(__dirname, "../src/data/commands.txt");
const SHARED_FILE_PATH = path.resolve(
  __dirname,
  "../src/data/shared_resource.txt"
);
const WORKER_PATH = path.resolve(__dirname, "./threads.js");

const PORT = 3000;
const CHECK_INTERVAL = 2000;

const mutex = new Mutex();
let pendingWrites = 0;
let lastProcessedCommands = new Set();

const initializeFiles = async () => {
  try {
    await fs.mkdir(path.dirname(COMMAND_FILE_PATH), { recursive: true });
    await fs.mkdir(path.dirname(SHARED_FILE_PATH), { recursive: true });
    await fs.writeFile(SHARED_FILE_PATH, "");
    console.log("Files initialized successfully");
  } catch (error) {
    console.error("Error initializing files:", error);
    throw error;
  }
};

const createWorker = async (operation, data) => {
  return new Promise((resolve, reject) => {
    console.log(`Creating worker for ${operation} operation`);
    const worker = new Worker(WORKER_PATH, {
      workerData: {
        type: operation,
        filePath: SHARED_FILE_PATH,
        data: data,
      },
    });

    worker.on("message", (message) => {
      console.log(`Worker completed ${operation}:`, message);
      resolve(message);
    });
    worker.on("error", (error) => {
      console.error(`Worker error in ${operation}:`, error);
      reject(error);
    });
    worker.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
};

const handleCommand = async (command) => {
  console.log("Handling command:", command);

  const release = await mutex.acquire();
  try {
    if (command.startsWith("write")) {
      const dataToWrite = command.slice(6).trim();
      console.log("Processing write command:", dataToWrite);
      pendingWrites++;
      try {
        const result = await createWorker("write", dataToWrite);
        if (result.success) {
          console.log("Write successful:", result.data);
        }
      } finally {
        pendingWrites--;
      }
    } else if (command.startsWith("read")) {
      console.log("Processing read command");
      while (pendingWrites > 0) {
        console.log(`Waiting for ${pendingWrites} pending writes...`);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      const result = await createWorker("read");
      if (result.success) {
        console.log("Read result:\n", result.data);
      }
    } else {
      console.log("Unknown command:", command);
    }
  } finally {
    release();
  }
};

const processCommandFile = async () => {
  console.log("Checking commands file...");
  try {
    const data = await fs.readFile(COMMAND_FILE_PATH, "utf-8");
    console.log("Raw file content:", data);

    const commands = data.split("\n").filter((line) => line.trim());

    const newCommands = commands.filter(
      (cmd) => !lastProcessedCommands.has(cmd)
    );
    console.log("New commands to process:", newCommands);

    if (newCommands.length > 0) {
      await fs.writeFile(COMMAND_FILE_PATH, "");
      console.log("Cleared command file");

      lastProcessedCommands = new Set(commands);

      for (const command of newCommands) {
        await handleCommand(command);
      }
    }
  } catch (error) {
    console.error("Error processing command file:", error);
  }
};

const startServer = async () => {
  try {
    await initializeFiles();

    const tcpServer = net.createServer((socket) => {
      console.log("Client connected");

      socket.on("data", async (data) => {
        try {
          const command = data.toString().trim();
          const result = await handleCommand(command);
          socket.write(JSON.stringify(result));
        } catch (error) {
          console.error("Error processing command:", error);
          socket.write(
            JSON.stringify({ success: false, error: error.message })
          );
        }
      });

      socket.on("end", () => {
        console.log("Client disconnected");
      });
    });

    tcpServer.listen(PORT, () => {
      console.log(`TCP server running on port ${PORT}`);
    });

    setInterval(processCommandFile, CHECK_INTERVAL);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
