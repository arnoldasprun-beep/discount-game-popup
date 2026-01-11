// Helper function to replace react-router's json() export
// Uses standard Web API Response.json()
export function json(data: any, init?: { status?: number; headers?: HeadersInit }) {
  return Response.json(data, init);
}
