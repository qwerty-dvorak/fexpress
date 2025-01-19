export const runtime = 'edge'

export async function GET() {
  const message = "Hello from Edge Stream!";
  let index = 0;
  let isFirstCharSent = false;

  const stream = new ReadableStream({
    start(controller) {
      const interval = setInterval(() => {
        if (index >= message.length) {
          clearInterval(interval);
          controller.close();
          return;
        }

        if (!isFirstCharSent) {
          controller.enqueue(message[index]);
          index++;
          isFirstCharSent = true;
          setTimeout(() => {
            // Resume after 6 seconds
            const remainingInterval = setInterval(() => {
              if (index >= message.length) {
                clearInterval(remainingInterval);
                controller.close();
                return;
              }
              controller.enqueue(message[index]);
              index++;
            }, 1000);
          }, 6000);
          clearInterval(interval);
        }
      }, 1000);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Transfer-Encoding': 'chunked',
    },
  });
}