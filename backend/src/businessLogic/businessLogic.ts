import { RecommendationItem } from '../models/RecommendationItem'
import { RecommendationsAccess } from '../dataLayer/dataLayer'
import { CreateRecommendationRequest } from '../requests/CreateRecommendationRequest'
import { UpdateRecommendationRequest } from '../requests/UpdateRecommendationRequest'
import { parseUserId } from '../auth/utils'

import * as uuid from 'uuid'

const recommendationsAccess = new RecommendationsAccess()

export async function getAllRecommendations(jwtToken: string): Promise<RecommendationItem[]> {
    const userId = parseUserId(jwtToken);
    return recommendationsAccess.getAllRecommendations(userId);
}

export async function createRecommendation(
  createRecommendationRequest: CreateRecommendationRequest,
  jwtToken: string
): Promise<RecommendationItem> {

  const itemId = uuid.v4()
  const userId = parseUserId(jwtToken)
  
  return recommendationsAccess.createRecommendation({
    recommendationId: itemId,
    userId: userId,
    name: createRecommendationRequest.name,
    why: createRecommendationRequest.why,
    createdAt: new Date().toISOString(),
    attachmentUrl: ''
  })
}

export async function updateRecommendation(
    recommendationId: string, 
    updateRecommendationRequest: UpdateRecommendationRequest,
    jwtToken: string
  ): Promise<void> {
    const userId = parseUserId(jwtToken);
    const recommendationItem = await recommendationsAccess.getRecommendationItem(recommendationId, userId);
    const { name, why } = updateRecommendationRequest;
    await recommendationsAccess.updateRecommendation(recommendationItem.recommendationId, recommendationItem.createdAt, {
      name,
      why,
    })
}

export async function deleteRecommendation(
    itemId: string,
    jwtToken: string
  ): Promise<void> {
    const userId = parseUserId(jwtToken);
    const recommendationItem = await recommendationsAccess.getRecommendationItem(itemId, userId);
    await recommendationsAccess.deleteRecommendation(recommendationItem.recommendationId, recommendationItem.createdAt);
}

export async function setItemUrl(jwtToken: string, recommendationId: string, uploadUrl: string): Promise<void> {
  const userId = parseUserId(jwtToken);
  const recommendationItem = await recommendationsAccess.getRecommendationItem(recommendationId, userId);
  await recommendationsAccess.setItemUrl(recommendationItem.recommendationId, recommendationItem.createdAt, uploadUrl);
}

export async function getRecommendationItem(recommendationId: string, jwtToken: string): Promise<RecommendationItem> {
    const userId = parseUserId(jwtToken);
    return await recommendationsAccess.getRecommendationItem(recommendationId, userId);
}