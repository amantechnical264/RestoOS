/**
 * meshyService.js
 * 
 * Real 3D model generation using Meshy.ai API.
 * Requires VITE_MESHY_API_KEY in your .env file.
 * Get a free key at: https://www.meshy.ai/ → Settings → API Keys
 */

const MESHY_API_KEY = import.meta.env.VITE_MESHY_API_KEY;
const MESHY_BASE = 'https://api.meshy.ai/v2';

/**
 * Generate a 3D GLB model from a dish image URL.
 * 
 * Flow:
 * 1. Submit image-to-3d task → get task ID
 * 2. Poll task status until complete
 * 3. Return the GLB download URL
 * 
 * @param {string} imageUrl - Public URL of the dish image
 * @param {function} onProgress - Optional callback with progress (0-100)
 * @returns {Promise<string>} - Public GLB URL for the model
 */
export async function generateMeshyModel(imageUrl, onProgress) {
  if (!MESHY_API_KEY) {
    throw new Error('MESHY_API_KEY_MISSING');
  }

  // Step 1: Submit the image-to-3d task
  const submitResponse = await fetch(`${MESHY_BASE}/image-to-3d`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MESHY_API_KEY}`,
    },
    body: JSON.stringify({
      image_url: imageUrl,
      enable_pbr: true,        // Physical-based rendering for realistic food models
      should_remesh: true,
      should_texture: true,
    }),
  });

  if (!submitResponse.ok) {
    const err = await submitResponse.json().catch(() => ({}));
    throw new Error(err?.message || `Meshy API error: ${submitResponse.status}`);
  }

  const { result: taskId } = await submitResponse.json();
  if (!taskId) throw new Error('No task ID returned from Meshy');

  // Step 2: Poll for completion (max 10 minutes)
  const MAX_POLLS = 60;
  const POLL_INTERVAL_MS = 10000; // 10 seconds

  for (let i = 0; i < MAX_POLLS; i++) {
    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));

    const statusResponse = await fetch(`${MESHY_BASE}/image-to-3d/${taskId}`, {
      headers: { 'Authorization': `Bearer ${MESHY_API_KEY}` },
    });

    if (!statusResponse.ok) continue;

    const task = await statusResponse.json();

    if (onProgress) {
      onProgress(task.progress || Math.min(10 + i * 1.5, 95));
    }

    if (task.status === 'SUCCEEDED') {
      // Prefer GLB format, fallback to any model_urls entry
      const glbUrl = task.model_urls?.glb || task.model_urls?.obj || Object.values(task.model_urls || {})[0];
      if (!glbUrl) throw new Error('Model generated but no download URL found');
      return glbUrl;
    }

    if (task.status === 'FAILED' || task.status === 'EXPIRED') {
      throw new Error(`3D generation failed: ${task.task_error?.message || task.status}`);
    }
  }

  throw new Error('3D generation timed out. Please try again.');
}
