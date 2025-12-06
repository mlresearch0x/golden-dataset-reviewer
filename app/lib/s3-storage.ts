'use server'

import { S3Client, GetObjectCommand, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import type { GroundTruthEntry } from './types';

export interface StoredDataset {
  name: string;
  username: string;
  created_at: string;
  updated_at: string;
  entries: GroundTruthEntry[];
}

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || '';
const DATASET_KEY = 'current-dataset.json';

/**
 * Check if dataset exists in S3
 */
export async function datasetExists(): Promise<boolean> {
  try {
    await s3Client.send(
      new HeadObjectCommand({
        Bucket: BUCKET_NAME,
        Key: DATASET_KEY,
      })
    );
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Read dataset from S3
 */
export async function readDataset(): Promise<StoredDataset> {
  try {
    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: DATASET_KEY,
      })
    );

    const body = await response.Body?.transformToString();
    if (!body) {
      throw new Error('Empty response from S3');
    }

    return JSON.parse(body) as StoredDataset;
  } catch (error) {
    console.error('Error reading from S3:', error);
    throw new Error('Failed to read dataset from S3');
  }
}

/**
 * Write dataset to S3
 */
export async function writeDataset(dataset: StoredDataset): Promise<void> {
  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: DATASET_KEY,
        Body: JSON.stringify(dataset, null, 2),
        ContentType: 'application/json',
      })
    );
  } catch (error) {
    console.error('Error writing to S3:', error);
    throw new Error('Failed to write dataset to S3');
  }
}

/**
 * Delete dataset from S3 (not typically needed, but included for completeness)
 */
export async function deleteDataset(): Promise<void> {
  // For now, we'll just write an empty dataset instead of deleting
  const emptyDataset: StoredDataset = {
    name: '',
    username: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    entries: [],
  };
  await writeDataset(emptyDataset);
}
