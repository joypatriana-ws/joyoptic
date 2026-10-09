// Setează parola unui cont de admin (ex. prima dată, pentru conturile importate din Croogo).
//
//   node --env-file=.env.local scripts/admin-parola.mjs contact@joyoptic.ro
//
// Parola se cere în terminal (nu apare pe ecran și nu rămâne în istoricul shell-ului).

import readline from "node:readline";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
  console.error("Folosire: node --env-file=.env.local scripts/admin-parola.mjs <email>");
  process.exit(1);
}

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (s) => {
      if (s.includes(question)) rl.output.write(s);
    };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
  });
}

await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB ?? "joyoptic" });
const users = mongoose.connection.db.collection("users");
const user = await users.findOne({ email });
if (!user) {
  console.error(`Nu există contul ${email}.`);
  process.exit(1);
}

const password = await askHidden(`Parola nouă pentru ${user.name} (${email}): `);
if (password.length < 10) {
  console.error("Parola trebuie să aibă minimum 10 caractere.");
  process.exit(1);
}
await users.updateOne({ _id: user._id }, { $set: { passwordHash: await bcrypt.hash(password, 12), active: true } });
console.log("Parola a fost setată.");
await mongoose.disconnect();
