import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateRecommendationRequest } from '../../requests/UpdateRecommendationRequest'
import { updateRecommendation } from '../../businessLogic/businessLogic';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const recommendationId = event.pathParameters.recommendationId;
  const updatedRecommendation: UpdateRecommendationRequest = JSON.parse(event.body);
  const authorization = event.headers.Authorization;
  const split = authorization.split(' ');
  const jwtToken = split[1];

  await updateRecommendation(recommendationId, updatedRecommendation, jwtToken);
  
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
      "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS 
    },
    body: ''
  };
}
