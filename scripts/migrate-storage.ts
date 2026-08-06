import "dotenv/config";
import fs from "fs";
import path from "path";
import mime from "mime-types";
import { Client, Storage, ID } from "node-appwrite";
import { InputFile } from "node-appwrite/file";

const OLD = new Client()
  .setEndpoint(process.env.OLD_ENDPOINT!)
  .setProject(process.env.OLD_PROJECT!)
  .setKey(process.env.OLD_API_KEY!);

const NEW = new Client()
  .setEndpoint(process.env.NEW_ENDPOINT!)
  .setProject(process.env.NEW_PROJECT!)
  .setKey(process.env.NEW_API_KEY!);

const oldStorage = new Storage(OLD);
const newStorage = new Storage(NEW);

const OLD_BUCKET = process.env.OLD_BUCKET!;
const NEW_BUCKET = process.env.NEW_BUCKET!;

const TEMP_DIR = "./tmp-storage";

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR);
}

async function migrate() {
  let offset: string | undefined;

  const mapping: Record<string, string> = {};

  while (true) {
    const res = await oldStorage.listFiles(
      OLD_BUCKET,
      offset ? [`cursorAfter("${offset}")`] : [],
    );

    if (res.files.length === 0) break;

    for (const file of res.files) {
      console.log(`Downloading ${file.name}`);

      const arrayBuffer = await oldStorage.getFileDownload(
        OLD_BUCKET,
        file.$id,
      );

      const buffer = Buffer.from(arrayBuffer);

      const ext =
        mime.extension(file.mimeType) ||
        path.extname(file.name).replace(".", "") ||
        "jpg";

      const localPath = path.join(TEMP_DIR, `${file.$id}.${ext}`);

      fs.writeFileSync(localPath, buffer);

      console.log(`Uploading ${file.name}`);

      const uploaded = await newStorage.createFile(
        NEW_BUCKET,
        ID.unique(),
        InputFile.fromPath(localPath, file.name),
      );

      mapping[file.$id] = uploaded.$id;

      fs.unlinkSync(localPath);

      console.log(`${file.name}  ${file.$id} -> ${uploaded.$id}`);
    }

    offset = res.files[res.files.length - 1].$id;
  }

  fs.writeFileSync("./file-id-map.json", JSON.stringify(mapping, null, 2));

  console.log("Migration Completed.");
}

migrate().catch(console.error);
