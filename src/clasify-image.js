const VisualRecognitionV3 = require('ibm-watson/visual-recognition/v3');
const { IamAuthenticator } = require('ibm-watson/auth');
const Buffer = require('buffer').Buffer;

/*const visualRecognition = new VisualRecognitionV3({
    version: ai.version,
    authenticator: new IamAuthenticator({
        apikey: ai.apikey,
    }),
    url: ai.url,
});*/

const visualRecognition = new VisualRecognitionV3({
    version: '2018-03-19',
    authenticator: new IamAuthenticator({
        apikey: '',
    }),
    url: '',
});

/**
 * Helper
 * @param {*} errorMessage
 * @param {*} url
 */
function getTheErrorResponse(errorMessage, url) {
    return {
        statusCode: 500,
        body: {
            url: url || '',
            errorMessage: errorMessage
        }
    };
}

/**
 *
 * main() will be run when the action is invoked
 *
 * @param Cloud Functions actions accept a single parameter, which must be a JSON object.
 *
 * @return The output of this action, which must be a JSON object.
 *
 */
function main(params) {

    return new Promise(function (resolve, reject) {

        try {

            // const buffer = Buffer.from(params.imageString, 'base64');
            const buffer = Buffer.from(params.imageString);
            const classifyParams = {
                imagesFile: buffer,
                classifier_ids: ['person'],
            };

            visualRecognition.classify(classifyParams)
                .then(classifiedImages => {
                    console.log(JSON.stringify(classifiedImages.result, null, 2));
                    const classifiers = classifiedImages.result.images[0].classifiers;
                    const res = classifiers.length ? classifiedImages.result.images[0].classifiers[0].classes : [];
                    const validRes = res.filter( cl => cl.class === 'person' && cl.score >= 0.5);
                    resolve({
                        statusCode: 200,
                        body: {
                            array: validRes
                            // class: res.class,
                            // score: res.score,
                        },
                        headers: { 'Content-Type': 'application/json' }
                    });
                })
                .catch(err => {
                    console.error('Error while initializing the AI service', err);
                    resolve(getTheErrorResponse('Error while classifying image', params));
                });

        } catch (err) {
            console.error('Error while initializing the AI service', err);
            resolve(getTheErrorResponse('Error while communicating with the visual recognition service', classifyParams.url));
        }
    });
}
