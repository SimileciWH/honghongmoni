import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const AUDIO_CONTENT_TYPE = "audio/mpeg";
const AUDIO_CACHE_CONTROL = "public, max-age=31536000, immutable";

type AudioSource = "game-init" | "tts";

interface R2Config {
  accessKeyId: string;
  secretAccessKey: string;
  endpoint: string;
  bucketName: string;
  publicUrl: string;
}

interface UploadAudioOptions {
  source: AudioSource;
  voiceRoleId?: number;
}

interface UploadedAudio {
  key: string;
  url: string;
  size: number;
  contentType: string;
}

let cachedClient: S3Client | null = null;

function getRequiredEnv(name: keyof NodeJS.ProcessEnv): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required R2 environment variable: ${name}`);
  }

  return value;
}

function getR2Config(): R2Config {
  return {
    accessKeyId: getRequiredEnv("R2_ACCESS_KEY_ID"),
    secretAccessKey: getRequiredEnv("R2_SECRET_ACCESS_KEY"),
    endpoint: getRequiredEnv("R2_ENDPOINT"),
    bucketName: getRequiredEnv("R2_BUCKET_NAME"),
    publicUrl: getRequiredEnv("R2_PUBLIC_URL"),
  };
}

function getS3Client(config: R2Config): S3Client {
  if (!cachedClient) {
    cachedClient = new S3Client({
      region: "auto",
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  return cachedClient;
}

function createAudioKey(source: AudioSource): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");

  return `tts/${year}/${month}/${day}/${source}/${Date.now()}-${crypto.randomUUID()}.mp3`;
}

function buildPublicUrl(publicUrl: string, key: string): string {
  return `${publicUrl.replace(/\/$/, "")}/${key.replace(/^\//, "")}`;
}

export async function uploadAudioToR2(
  fileBuffer: Buffer,
  options: UploadAudioOptions
): Promise<UploadedAudio> {
  const config = getR2Config();
  const key = createAudioKey(options.source);
  const metadata: Record<string, string> = {
    source: options.source,
  };

  if (options.voiceRoleId !== undefined) {
    metadata.voiceRoleId = String(options.voiceRoleId);
  }

  await getS3Client(config).send(
    new PutObjectCommand({
      Bucket: config.bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: AUDIO_CONTENT_TYPE,
      CacheControl: AUDIO_CACHE_CONTROL,
      Metadata: metadata,
    })
  );

  return {
    key,
    url: buildPublicUrl(config.publicUrl, key),
    size: fileBuffer.length,
    contentType: AUDIO_CONTENT_TYPE,
  };
}
