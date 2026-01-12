import { PassThrough } from "stream";
import { renderToPipeableStream } from "react-dom/server";
import { ServerRouter } from "react-router";
import { createReadableStreamFromReadable } from "@react-router/node";
import { type EntryContext } from "react-router";
import { isbot } from "isbot";
import { addDocumentResponseHeaders } from "./shopify.server";

export const streamTimeout = 5000;

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext
) {
  try {
    console.log('[ENTRY] Request received:', request.method, request.url);
    
    addDocumentResponseHeaders(request, responseHeaders);
    console.log('[ENTRY] Headers added successfully');
    
    const userAgent = request.headers.get("user-agent");
    const callbackName = isbot(userAgent ?? '')
      ? "onAllReady"
      : "onShellReady";

    return new Promise((resolve, reject) => {
      const { pipe, abort } = renderToPipeableStream(
        <ServerRouter
          context={reactRouterContext}
          url={request.url}
        />,
        {
          [callbackName]: () => {
            console.log('[ENTRY] Stream ready, resolving response');
            const body = new PassThrough();
            const stream = createReadableStreamFromReadable(body);

            responseHeaders.set("Content-Type", "text/html");
            resolve(
              new Response(stream, {
                headers: responseHeaders,
                status: responseStatusCode,
              })
            );
            pipe(body);
          },
          onShellError(error) {
            console.error('[ENTRY] Shell error:', error);
            reject(error);
          },
          onError(error) {
            console.error('[ENTRY] Render error:', error);
            responseStatusCode = 500;
            console.error(error);
          },
        }
      );

      setTimeout(abort, streamTimeout + 1000);
    });
  } catch (error) {
    console.error('[ENTRY] Top-level error in handleRequest:', error);
    throw error;
  }
}
