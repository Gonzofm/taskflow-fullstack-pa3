import mongoose from 'mongoose';

export async function connectDatabase(uri: string): Promise<void> {
  mongoose.set('bufferCommands', false);
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10_000,
    connectTimeoutMS: 10_000,
    // Confirmar las escrituras sólo después del journal evita perder un cambio
    // reconocido si MongoDB se detiene de golpe, incluido el cierre en Windows.
    // https://www.mongodb.com/docs/manual/reference/write-concern/
    writeConcern: { w: 'majority', journal: true, wtimeoutMS: 10_000 },
  });
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
