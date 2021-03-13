import { apiEndpoint } from '../config'
import { Recommendation } from '../types/Recommendation';
import { CreateRecommendationRequest } from '../types/CreateRecommendationRequest';
import Axios from 'axios'
import { UpdateRecommendationRequest } from '../types/UpdateRecommendationRequest';

export async function getRecommendations(idToken: string): Promise<Recommendation[]> {
  console.log('Fetching recommendations')

  const response = await Axios.get(`${apiEndpoint}/recommendations`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Recommendations:', response.data)
  return response.data.recommendations
}

export async function createRecommendation(
  idToken: string,
  newRecommendation: CreateRecommendationRequest
): Promise<Recommendation> {
  const response = await Axios.post(`${apiEndpoint}/recommendations`,  JSON.stringify(newRecommendation), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })

  return response.data.item
}

export async function patchRecommendation(
  idToken: string,
  recommendationId: string,
  updatedRecommendation: UpdateRecommendationRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/recommendations/${recommendationId}`, JSON.stringify(updatedRecommendation), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteRecommendation(
  idToken: string,
  recommendationId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/recommendations/${recommendationId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  recommendationId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/recommendations/${recommendationId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
