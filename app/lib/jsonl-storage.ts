'use server'

import { S3Client, GetObjectCommand, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import type { JSONLDocument } from './types';

export interface StoredJSONLDataset {
  name: string;
  username: string;
  created_at: string;
  updated_at: string;
  documents: JSONLDocument[];
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
const JSONL_DATASET_KEY = 'current-jsonl-dataset.json';

/**
 * Check if JSONL dataset exists in S3
 */
export async function jsonlDatasetExists(): Promise<boolean> {
  try {
    await s3Client.send(
      new HeadObjectCommand({
        Bucket: BUCKET_NAME,
        Key: JSONL_DATASET_KEY,
      })
    );
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Read JSONL dataset from S3
 */
export async function readJSONLDataset(): Promise<StoredJSONLDataset> {
  try {
    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: JSONL_DATASET_KEY,
      })
    );

    const body = await response.Body?.transformToString();
    if (!body) {
      throw new Error('Empty response from S3');
    }

    return JSON.parse(body) as StoredJSONLDataset;
  } catch (error) {
    console.error('Error reading JSONL dataset from S3:', error);
    throw new Error('Failed to read JSONL dataset from S3');
  }
}

/**
 * Write JSONL dataset to S3
 */
export async function writeJSONLDataset(dataset: StoredJSONLDataset): Promise<void> {
  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: JSONL_DATASET_KEY,
        Body: JSON.stringify(dataset, null, 2),
        ContentType: 'application/json',
      })
    );
  } catch (error) {
    console.error('Error writing JSONL dataset to S3:', error);
    throw new Error('Failed to write JSONL dataset to S3');
  }
}

/**
 * Delete JSONL dataset from S3
 */
export async function deleteJSONLDataset(): Promise<void> {
  const emptyDataset: StoredJSONLDataset = {
    name: '',
    username: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    documents: [],
  };
  await writeJSONLDataset(emptyDataset);
}
