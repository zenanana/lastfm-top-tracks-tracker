import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import https from 'https';

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

function getRequest() {
    const url = `https://ws.audioscrobbler.com/2.0/?method=user.getweeklytrackchart&user=${process.env.lastfm_user}&api_key=${process.env.lastfm_api_key}&format=json`;

    return new Promise((resolve, reject) => {
        const req = https.get(url, (res) => {
            let rawData = '';

            res.on('data', (chunk) => {
                rawData += chunk;
            });

            res.on('end', () => {
                try {
                    const resJSON = JSON.parse(rawData);
                    const topTracks = resJSON.weeklytrackchart.track;
                    const topTrack = topTracks[0];
                    resolve(topTrack);
                } catch (err: any) {
                    reject(new Error(err));
                }
            });
        });

        req.on('error', (err: any) => {
            reject(new Error(err));
        });
    });
}

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let response: APIGatewayProxyResult;
    const result = await getRequest();
    try {
        response = {
            statusCode: 200,
            body: JSON.stringify({
                message: result,
            }),
        };
    } catch (err) {
        response = {
            statusCode: 500,
            body: JSON.stringify({
                message: 'some error happened',
            }),
        };
    }

    return response;
};
