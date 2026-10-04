import { exportJWK, exportPKCS8, generateKeyPair } from "jose";

const keys = await generateKeyPair("RS256", { extractable: true });
const privateKey = await exportPKCS8(keys.privateKey);
const publicKey = await exportJWK(keys.publicKey);
const jwks = JSON.stringify({ keys: [{ use: "sig", ...publicKey }] });

console.log("\n===== JWT_PRIVATE_KEY (copy everything on the next line) =====");
console.log(privateKey.trimEnd().replace(/\n/g, " "));
console.log("\n===== JWKS (copy everything on the next line) =====");
console.log(jwks);
