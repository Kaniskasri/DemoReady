import { DemoPlanRequest, DemoPlanResponse, ApiError } from './types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3001').replace(/\/+$/, '');

export async function generateDemoPlan(request: DemoPlanRequest): Promise<DemoPlanResponse> {
  const endpoint = `${API_BASE_URL}/generate-plan`;

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
  } catch (networkError) {
    throw new Error('Unable to connect to the DemoReady service. Please check your network or verify the backend is running.');
  }

  let data: any;
  try {
    data = await response.json();
  } catch (err) {
    throw new Error(`Server returned an unreadable response (HTTP ${response.status}).`);
  }

  if (!response.ok) {
    const apiError = data as ApiError;
    const msg = apiError?.error?.message || `Request failed with status code ${response.status}.`;
    throw new Error(msg);
  }

  return data as DemoPlanResponse;
}
