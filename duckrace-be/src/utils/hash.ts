import * as crypto from "crypto";

export const Hasher = {
  HMAC_SHA256: (key: string | Buffer, data: string | Buffer) => {
    return crypto.createHmac("sha256", key).update(data).digest();
  },
  HEX: (data: Buffer) => {
    return data.toString("hex");
  },
};
