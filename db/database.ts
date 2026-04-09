import * as SQLite from 'expo-sqlite';

const DB_NAME = 'tugas_akhir.db';

export const initDatabase = async () => {
  const db = await SQLite.openDatabaseAsync(DB_NAME);

  // Jalankan query inisialisasi tabel
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY NOT NULL,
      key TEXT UNIQUE NOT NULL,
      value TEXT
    );
  `);

  console.log('Database initialized successfully');
  return db;
};
