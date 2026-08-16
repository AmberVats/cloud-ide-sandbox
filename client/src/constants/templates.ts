import { WorkspaceTemplate } from '../types';

export const WORKSPACE_TEMPLATES: Record<string, WorkspaceTemplate> = {
  python: {
    id: 'python',
    name: 'Python 3 (Data & Algorithms)',
    language: 'python',
    description: 'Python 3 sandbox with algorithms, file I/O, and data processing examples.',
    files: [
      {
        id: 'main_py',
        name: 'main.py',
        language: 'python',
        isMain: true,
        content: `"""
CodeSphere Cloud IDE — Python 3 Sandbox
Demonstrating algorithm benchmarking & system resource tracking.
"""

import time
import sys
import math

def fibonacci(n: int) -> int:
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

def prime_sieve(limit: int) -> list[int]:
    primes = []
    is_prime = [True] * (limit + 1)
    for p in range(2, limit + 1):
        if is_prime[p]:
            primes.append(p)
            for i in range(p * p, limit + 1, p):
                is_prime[i] = False
    return primes

def main():
    print("=" * 60)
    print("⚡ CodeSphere High-Performance Python Runtime")
    print(f"🐍 Python Version: {sys.version.split()[0]}")
    print("=" * 60)
    
    # 1. Fibonacci benchmark
    n = 50
    start = time.perf_counter()
    fib_res = fibonacci(n)
    fib_time = (time.perf_counter() - start) * 1000
    print(f"✨ Fibonacci({n}) = {fib_res} (computed in {fib_time:.3f}ms)")
    
    # 2. Prime Sieve benchmark
    prime_limit = 100_000
    start = time.perf_counter()
    primes = prime_sieve(prime_limit)
    sieve_time = (time.perf_counter() - start) * 1000
    print(f"🔢 Found {len(primes):,} primes under {prime_limit:,} in {sieve_time:.2f}ms")
    print(f"   Largest prime: {primes[-1]:,}")
    
    # 3. Trigonometric computation
    angles = [0, 30, 45, 60, 90]
    print("\n📐 Quick Math Verification:")
    for deg in angles:
        rad = math.radians(deg)
        print(f"   sin({deg:2d}°) = {math.sin(rad):.4f} | cos({deg:2d}°) = {math.cos(rad):.4f}")
        
    print("\n✅ Execution completed successfully within Docker Sandbox limits.")

if __name__ == "__main__":
    main()
`,
      },
      {
        id: 'utils_py',
        name: 'utils.py',
        language: 'python',
        content: `def format_bytes(bytes_num: int) -> str:
    for unit in ['B', 'KB', 'MB', 'GB']:
        if bytes_num < 1024.0:
            return f"{bytes_num:3.1f} {unit}"
        bytes_num /= 1024.0
    return f"{bytes_num:.1f} TB"
`,
      }
    ],
  },
  javascript: {
    id: 'javascript',
    name: 'Node.js (Async & Concurrency)',
    language: 'javascript',
    description: 'Modern Node.js runtime with asynchronous concurrency and event loop metrics.',
    files: [
      {
        id: 'index_js',
        name: 'index.js',
        language: 'javascript',
        isMain: true,
        content: `/**
 * CodeSphere Cloud IDE — Node.js Sandbox
 * Demonstrates async event-loop concurrency & data transformations.
 */

const os = require('os');

async function simulateWorkerTask(id, delayMs) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id, processedAt: new Date().toISOString(), latencyMs: delayMs });
    }, delayMs);
  });
}

async function main() {
  console.log("============================================================");
  console.log("🚀 CodeSphere Node.js Engine (V8 Runtime)");
  console.log(\`📦 Node Version: \${process.version} | Platform: \${process.platform}\`);
  console.log("============================================================");

  console.log("\\n⏳ Dispatching 5 concurrent asynchronous worker tasks...");
  const start = performance.now();

  const tasks = [100, 250, 150, 300, 200].map((delay, index) =>
    simulateWorkerTask(index + 1, delay)
  );

  const results = await Promise.all(tasks);
  const totalDuration = (performance.now() - start).toFixed(2);

  console.log(\`✅ All concurrent tasks resolved in \${totalDuration}ms:\\n\`);
  console.table(results);

  // Memory usage
  const memory = process.memoryUsage();
  console.log("\\n📊 Memory Diagnostics:");
  console.log(\`   Heap Used: \${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB\`);
  console.log(\`   Heap Total: \${(memory.heapTotal / 1024 / 1024).toFixed(2)} MB\`);
  console.log(\`   RSS: \${(memory.rss / 1024 / 1024).toFixed(2)} MB\`);
}

main().catch(console.error);
`,
      }
    ],
  },
  typescript: {
    id: 'typescript',
    name: 'TypeScript (Strict Typed Models)',
    language: 'typescript',
    description: 'TypeScript engine with strict types, interfaces, and generic algorithms.',
    files: [
      {
        id: 'main_ts',
        name: 'main.ts',
        language: 'typescript',
        isMain: true,
        content: `/**
 * CodeSphere Cloud IDE — TypeScript Sandbox
 * Generic Data Structures & Type-Safe Operations
 */

interface TaskMetric<T> {
  id: string;
  data: T;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdAt: number;
}

class PriorityTaskQueue<T> {
  private queue: TaskMetric<T>[] = [];

  enqueue(item: TaskMetric<T>): void {
    const priorityWeights: Record<string, number> = {
      CRITICAL: 4,
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };
    this.queue.push(item);
    this.queue.sort((a, b) => priorityWeights[b.priority] - priorityWeights[a.priority]);
  }

  dequeue(): TaskMetric<T> | undefined {
    return this.queue.shift();
  }

  size(): number {
    return this.queue.length;
  }
}

function run(): void {
  console.log("🔷 CodeSphere TypeScript Engine");
  console.log("--------------------------------------------------");
  
  const taskQueue = new PriorityTaskQueue<{ jobName: string; duration: number }>();

  taskQueue.enqueue({ id: 'task-1', priority: 'LOW', data: { jobName: 'Cache Purge', duration: 120 }, createdAt: Date.now() });
  taskQueue.enqueue({ id: 'task-2', priority: 'CRITICAL', data: { jobName: 'Database Failover', duration: 45 }, createdAt: Date.now() });
  taskQueue.enqueue({ id: 'task-3', priority: 'HIGH', data: { jobName: 'Payment Webhook', duration: 80 }, createdAt: Date.now() });

  console.log(\`📥 Queued \${taskQueue.size()} tasks. Processing in prioritized order:\\n\`);

  while (taskQueue.size() > 0) {
    const task = taskQueue.dequeue();
    if (task) {
      console.log(\`  ⚡ [\${task.priority}] \${task.data.jobName} (Job ID: \${task.id})\`);
    }
  }

  console.log("\\n✨ Type validation passed & queue executed successfully.");
}

run();
`,
      }
    ],
  },
  cpp: {
    id: 'cpp',
    name: 'C++ 17 (High Performance STL)',
    language: 'cpp',
    description: 'Native C++17 execution sandbox with STL containers and fast I/O.',
    files: [
      {
        id: 'main_cpp',
        name: 'main.cpp',
        language: 'cpp',
        isMain: true,
        content: `// CodeSphere Cloud IDE — C++17 Runner
#include <iostream>
#include <vector>
#include <numeric>
#include <algorithm>
#include <chrono>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    cout << "============================================================" << "\\n";
    cout << "⚡ CodeSphere C++17 Isolated Native Execution" << "\\n";
    cout << "============================================================" << "\\n";

    const size_t N = 1000000;
    vector<int> numbers(N);
    iota(numbers.begin(), numbers.end(), 1);

    auto start = chrono::high_resolution_clock::now();
    long long sum = 0;
    for (int num : numbers) {
        if (num % 2 == 0) sum += num;
    }
    auto end = chrono::high_resolution_clock::now();
    chrono::duration<double, milli> duration = end - start;

    cout << "🔢 Sum of even numbers from 1 to " << N << " = " << sum << "\\n";
    cout << "⏱️ Computed in: " << duration.count() << " ms" << "\\n";
    cout << "✅ Sandbox memory & process quota constraints verified." << "\\n";

    return 0;
}
`,
      }
    ],
  },
  java: {
    id: 'java',
    name: 'Java 17 (OpenJDK Enterprise)',
    language: 'java',
    description: 'Java 17 OpenJDK sandbox with streams, concurrency, and OOP structures.',
    files: [
      {
        id: 'Main_java',
        name: 'Main.java',
        language: 'java',
        isMain: true,
        content: `// CodeSphere Cloud IDE — Java 17 Sandbox
import java.util.*;
import java.util.stream.Collectors;

public class Main {
    public static void main(String[] args) {
        System.out.println("============================================================");
        System.out.println("☕ CodeSphere Java 17 OpenJDK Execution Sandbox");
        System.out.println("============================================================");

        List<String> microservices = Arrays.asList(
            "auth-service", "api-gateway", "payment-service", 
            "notification-engine", "execution-worker", "analytics-pipeline"
        );

        System.out.println("🔄 Processing microservices registry via Parallel Stream:");

        List<String> processed = microservices.parallelStream()
            .map(String::toUpperCase)
            .filter(name -> name.contains("SERVICE") || name.contains("ENGINE"))
            .sorted()
            .collect(Collectors.toList());

        processed.forEach(service -> System.out.println("  ➜ Active Pod: " + service));

        System.out.println("\n📊 Java Virtual Machine Metrics:");
        Runtime runtime = Runtime.getRuntime();
        long maxMemory = runtime.maxMemory() / (1024 * 1024);
        long totalMemory = runtime.totalMemory() / (1024 * 1024);
        long freeMemory = runtime.freeMemory() / (1024 * 1024);

        System.out.println("   Available Processors: " + runtime.availableProcessors());
        System.out.println("   Max Memory: " + maxMemory + " MB");
        System.out.println("   Allocated Memory: " + totalMemory + " MB (Free: " + freeMemory + " MB)");
        System.out.println("\n✅ Java Sandbox container executed cleanly.");
    }
}
`,
      }
    ],
  },
  go: {
    id: 'go',
    name: 'Go 1.22 (Goroutines & Channels)',
    language: 'go',
    description: 'Golang execution sandbox with lightweight goroutines and channel sync.',
    files: [
      {
        id: 'main_go',
        name: 'main.go',
        language: 'go',
        isMain: true,
        content: `// CodeSphere Cloud IDE — Go Sandbox
package main

import (
	"fmt"
	"runtime"
	"sync"
	"time"
)

type WorkerResult struct {
	ID        int
	Duration  time.Duration
	Timestamp time.Time
}

func worker(id int, ch chan<- WorkerResult, wg *sync.WaitGroup) {
	defer wg.Done()
	start := time.Now()
	// Simulate work
	time.Sleep(time.Duration(id*40) * time.Millisecond)
	ch <- WorkerResult{
		ID:        id,
		Duration:  time.Since(start),
		Timestamp: time.Now(),
	}
}

func main() {
	fmt.Println("============================================================")
	fmt.Println("🐹 CodeSphere Go 1.22 Runtime (Goroutines Engine)")
	fmt.Printf("💻 OS/Arch: %s/%s | Go CPUs: %d\n", runtime.GOOS, runtime.GOARCH, runtime.NumCPU())
	fmt.Println("============================================================")

	numWorkers := 4
	ch := make(chan WorkerResult, numWorkers)
	var wg sync.WaitGroup

	fmt.Printf("🚀 Spawning %d concurrent goroutines...\n", numWorkers)
	for i := 1; i <= numWorkers; i++ {
		wg.Add(1)
		go worker(i, ch, &wg)
	}

	wg.Wait()
	close(ch)

	for res := range ch {
		fmt.Printf("  ⚡ Goroutine #%d finished in %v\n", res.ID, res.Duration)
	}

	fmt.Println("\n✅ All goroutines synchronized via channels.")
}
`,
      }
    ],
  },
};
