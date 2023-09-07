const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
    region: "ap-southeast-2",
});

const s3 = new AWS.S3();
const bucketName = "n11069449-counter";
const objectKey = "counter.json";

let counter = null;

async function createS3bucket() {
    try {
        await s3.createBucket({ Bucket: bucketName }).promise();
        console.log(`Created bucket: ${bucketName}`);
    } catch(err) {
        if (err.code === 'BucketAlreadyOwnedByYou') {
            console.log(`Bucket already exists: ${bucketName}`);
        } else {
            console.log(`Error creating bucket: ${err}`);
        }
    }
}

async function uploadJsonToS3() {
    const params = {
        Bucket: bucketName,
        Key: objectKey,
        Body: JSON.stringify({ counter }), // Updated to store counter
        ContentType: "application/json",
    };

    try {
        await s3.putObject(params).promise();
        console.log("Counter updated successfully.");
    } catch (err) {
        console.error("Error uploading counter:", err);
    }
}

async function getObjectFromS3() {
    const params = {
        Bucket: bucketName,
        Key: objectKey,
    };

    try {
        const data = await s3.getObject(params).promise();
        counter = JSON.parse(data.Body.toString("utf-8")).counter;
        console.log("Counter retrieved successfully:", counter);
    } catch (err) {
        if (err.code === 'NoSuchKey') {
            console.log("Counter does not exist, initializing to 0.");
            counter = 0; // Initialize counter if it does not exist
        } else {
            console.error("Error retrieving counter:", err);
        }
    }
}

const incrementCounter = async () => {
    await createS3bucket();
    await getObjectFromS3();
    if(counter !== null) {
        counter++; // Increment counter
        await uploadJsonToS3();
        return counter; // Let other modules access
    } else {
        console.error("Failed to initialize counter.");
        return null; // null == error
    }
};

module.exports = {
    incrementCounter
};
