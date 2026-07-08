import { NextRequest } from "next/server";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_BASE_URL ??
  "";


function isAuthPath(path: string[]) {
  return path[0] === "auth";
}
function backendUrl(path: string[], search: string) {
  const baseUrl = API_BASE_URL.replace(/\/+$/, "");
  if (!baseUrl) {
    throw new Error("Missing backend URL. Set NEXT_PUBLIC_API_BASE_URL in .env.local.");
  }

  return `${baseUrl}/${path.map(encodeURIComponent).join("/")}${search}`;
}

async function proxy(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  try {
    const { path = [] } = await context.params;
    const authorization = request.headers.get("authorization");
    if (!isAuthPath(path)) {
      if (!authorization) {
        return Response.json({ message: "Unauthorized" }, { status: 401 });
      }
    }

    const url = backendUrl(path, request.nextUrl.search);
    const headers = new Headers();
    const contentType = request.headers.get("content-type");
    const deviceId = request.headers.get("x-device-id");

    if (contentType) headers.set("content-type", contentType);
    if (authorization) headers.set("authorization", authorization);
    if (deviceId) headers.set("x-device-id", deviceId);

    const hasBody = request.method !== "GET" && request.method !== "HEAD";
    const response = await fetch(url, {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      cache: "no-store",
    });

    const responseHeaders = new Headers();
    const responseContentType = response.headers.get("content-type");
    if (responseContentType) responseHeaders.set("content-type", responseContentType);
    responseHeaders.set("cache-control", "no-store");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to reach backend.";
    return Response.json({ message }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;

