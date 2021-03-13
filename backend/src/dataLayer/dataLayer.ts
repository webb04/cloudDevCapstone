import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { RecommendationItem } from '../models/RecommendationItem'
import { RecommendationUpdate } from '../models/RecommendationUpdate'

const XAWS = AWSXRay.captureAWS(AWS)

function createDynamoDBClient() {
    return new XAWS.DynamoDB.DocumentClient()
}

export class RecommendationsAccess {
    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly recommendationsTable = process.env.RECOMMENDATIONS_TABLE,
        private readonly recommendationsUserIndex = process.env.RECOMMENDATIONS_USER_INDEX
     ) {}

    async getAllRecommendations(userId: string): Promise<RecommendationItem[]> {        
        const result = await this.docClient.query({
            TableName: this.recommendationsTable,
            IndexName: this.recommendationsUserIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId' : userId
            }
        }).promise()
        
        return result.Items as RecommendationItem[];
    }

    async getRecommendationItem(recommendationId: string, userId: string): Promise<RecommendationItem> {
        const result = await this.docClient.query({
            TableName: this.recommendationsTable,
            IndexName: this.recommendationsUserIndex,
            KeyConditionExpression: 'userId = :userId and recommendationId = :recommendationId',
            ExpressionAttributeValues: {
                ':userId' : userId,
                ':recommendationId' : recommendationId
            }
        }).promise()

        return result.Items[0] as RecommendationItem;
    }

    async createRecommendation(recommendation: RecommendationItem): Promise<RecommendationItem> {
        await this.docClient.put({
            TableName: this.recommendationsTable,
            Item: recommendation
        }).promise()

        return recommendation;
    }

    async updateRecommendation(recommendationId: string, createdAt: string, update: RecommendationUpdate): Promise<void> {
        const params = {
            TableName: this.recommendationsTable,
            Key: {
                "recommendationId": recommendationId,
                "createdAt": createdAt
            },
            UpdateExpression:
                'set #n = :name, why = :why',
            ExpressionAttributeValues: {
                ':name': update.name,
                ':why': update.why,
            },
            ExpressionAttributeNames: {
                '#n': 'name'
            },
            ReturnValues: 'UPDATED_NEW'
        };
        
        this.docClient.update(params).promise()
    }

    async deleteRecommendation(recommendationId: string, createdAt: string): Promise<void> {
        const params = {
            TableName: this.recommendationsTable,
            Key: {
                recommendationId: recommendationId,
                createdAt: createdAt
            },
            ConditionExpression:
                'recommendationId = :recommendationId and createdAt = :createdAt',
            ExpressionAttributeValues: {
                ':recommendationId': recommendationId,
                ':createdAt': createdAt
            }
        }

        await this.docClient.delete(params).promise();
    }

    async setItemUrl(recommendationId: string, createdAt: string, itemUrl: string): Promise<void> {
        const params = {
            TableName: this.recommendationsTable,
            Key: {
                recommendationId,
                createdAt
            },
            UpdateExpression: 'set attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: {
                ':attachmentUrl': itemUrl.split('?')[0]
            },
            ReturnValues: 'UPDATED_NEW'
        }

        await this.docClient.update(params).promise();
    }

}