import path from "path";
const REDIS_SECOND = 60;
const REDIS_MINUTE = 1;
const REDIS_HOUR = 1;

export const REDIS_EXPIRE = REDIS_SECOND * REDIS_MINUTE * REDIS_HOUR;
const DOCUMENT_FILES_FOLDER = "documents"
const INDEXED_FILES_FOLDER = "indexed"
export const INDEXED_FILES_PATH = path.join(__dirname, "../" + INDEXED_FILES_FOLDER);
export const DOCUMENT_FILES_PATH = path.join(__dirname, "../" + DOCUMENT_FILES_FOLDER);