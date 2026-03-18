// database/db.ts

import * as SQLite from 'expo-sqlite';
import { WordType } from '../types';

/*
  AÇIKLAMA:
  Bu dosya tamamen veritabanı (SQLite) işlemlerini modüler hale getirmek için kullanılmıştır.
  Bu sayede diğer dosyalarda (UI tarafında) karmaşık SQL sorguları yazmak yerine buradaki fonksiyonları çağıracağız.
  "expo-sqlite" kütüphanesi kullanılıyor. Son sürümlerde SQLite.openDatabaseSync(dbName) kullanımı tercih edilmektedir.
*/

// Veritabanı adını tanımlayalım
const DB_NAME = 'englishwork.db';

// Veritabanı bağlantısı. .openDatabaseSync() metodu eşzamanlı (synchronous) bir veritabanı objesi döndürür.
const db = SQLite.openDatabaseSync(DB_NAME);

/**
 * Veritabanını başlatan ve gerekliyse tabloyu oluşturan fonksiyon
 */
export const initDB = async () => {
    try {
        // execAsync ile SQL sorgusunu çalıştırıyoruz.
        // IF NOT EXISTS: Tablo zaten varsa bir daha oluşturmaz.
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS words (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ingilizceKelime TEXT NOT NULL,
                ingilizceOrnekCumle TEXT,
                turkceKarsiligi TEXT NOT NULL,
                ornekCumleTurkcesi TEXT,
                eklenmeTarihi TEXT,
                listemdeMi INTEGER DEFAULT 0
            );
        `);
        console.log("Veritabanı ve tablo başarıyla oluşturuldu.");
    } catch (error) {
        console.error("Veritabanı oluşturulurken hata:", error);
    }
};

/**
 * Yeni bir kelime ekleme fonksiyonu
 * @param word Eklenecek kelime objesi
 */
export const insertWord = async (word: WordType) => {
    try {
        // runAsync: Parametreli SQL sorgularını çalıştırmak için kullanılır ("?" işaretleri parametre yerleridir)
        // Böylece SQL Injection (kötü niyetli kod çalıştırma) saldırılarına karşı güvenli hale gelir.
        const result = await db.runAsync(
            `INSERT INTO words (ingilizceKelime, ingilizceOrnekCumle, turkceKarsiligi, ornekCumleTurkcesi, eklenmeTarihi, listemdeMi) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                word.ingilizceKelime,
                word.ingilizceOrnekCumle,
                word.turkceKarsiligi,
                word.ornekCumleTurkcesi,
                word.eklenmeTarihi,
                word.listemdeMi ? 1 : 0 // Veritabanında boolean yerine 1 ve 0 olarak tutuyoruz
            ]
        );
        return result.lastInsertRowId; // Eklenen satırın ID'sini döndürür
    } catch (error) {
        console.error("Kelime eklenirken hata:", error);
        throw error;
    }
};

/**
 * Veritabanındaki kelimeleri getirme (Tümünü, veya sadece 'Listemdekiler', veya belirli sırayla)
 * @param orderBy Sıralama şekli ('alfabetik', 'sirayla', 'karisik')
 * @param filterListemdeMi Sadece listemde olanları getir (true ise listemdeMi=1 olanları getir)
 */
export const getWords = async (orderBy: 'alfabetik' | 'sirayla' | 'karisik' = 'sirayla', filterListemdeMi: boolean = false): Promise<WordType[]> => {
    try {
        let query = "SELECT * FROM words";

        // Sadece "Listemdekiler" filtrelemesi varsa sorguya WHERE şartı ekliyoruz
        if (filterListemdeMi) {
            query += " WHERE listemdeMi = 1";
        }

        // Sıralama (Order By) şartlarına göre sorguyu güncelliyoruz
        if (orderBy === 'alfabetik') {
            query += " ORDER BY ingilizceKelime ASC";
        } else if (orderBy === 'karisik') {
            query += " ORDER BY RANDOM()"; // SQLite'da rastgele getirmek için RANDOM() fonksiyonu kullanılır
        } else {
            // 'sirayla' (id'ye veya eklenme tarihine göre)
            query += " ORDER BY id ASC";
        }

        // getAllAsync metodu eşleşen tüm sonuçları bir dizi (array) halinde döndürür.
        const allRows = await db.getAllAsync<any>(query);

        // Veritabanından gelen 0 / 1 verisini boolean'a çeviriyoruz
        const mappedRows: WordType[] = allRows.map(row => ({
            ...row,
            listemdeMi: row.listemdeMi === 1
        }));

        return mappedRows;
    } catch (error) {
        console.error("Kelimeler getirilirken hata:", error);
        return [];
    }
};

/**
 * Kelime güncelleme işlemi
 * @param id Güncellenecek kelimenin ID'si
 * @param word Güncellenecek yeni veriler
 */
export const updateWord = async (id: number, word: WordType) => {
    try {
        await db.runAsync(
            `UPDATE words SET 
                ingilizceKelime = ?, 
                ingilizceOrnekCumle = ?, 
                turkceKarsiligi = ?, 
                ornekCumleTurkcesi = ?, 
                listemdeMi = ? 
             WHERE id = ?`,
            [
                word.ingilizceKelime,
                word.ingilizceOrnekCumle,
                word.turkceKarsiligi,
                word.ornekCumleTurkcesi,
                word.listemdeMi ? 1 : 0,
                id
            ]
        );
    } catch (error) {
        console.error("Kelime güncellenirken hata:", error);
        throw error;
    }
};

/**
 * Kelime Silme fonksiyonu
 * @param id Silinecek kelimenin ID'si
 */
export const deleteWord = async (id: number) => {
    try {
        await db.runAsync("DELETE FROM words WHERE id = ?", [id]);
    } catch (error) {
        console.error("Kelime silinirken hata:", error);
        throw error;
    }
};

/**
 * "Bilmediklerime Ekle" butonu için listemdeMi durumunu değiştirme
 * @param id Kelime ID'si
 * @param listemdeMi Yeni durum (true / false)
 */
export const toggleListemdeMi = async (id: number, listemdeMi: boolean) => {
    try {
        await db.runAsync("UPDATE words SET listemdeMi = ? WHERE id = ?", [listemdeMi ? 1 : 0, id]);
    } catch (error) {
        console.error("ListemdeMi güncellenirken hata:", error);
        throw error;
    }
};

/**
 * Excel'den veri yüklerken eski verileri silip yenilerini toplu ekleme
 * Bu işlem "Transaction" (İşlem bloğu) kullanılarak yapılmalı ki eğer biri hata verirse hiçbiri eklenmesin (veritabanı tutarlılığı).
 * @param words Excel'den gelen yeni kelimeler
 */
export const clearAndInsertWords = async (words: WordType[]) => {
    try {
        // Tabloyu tamamen temizleme (id numarasını da sıfırlamak için tabloyu silip baştan oluşturacağız veya DELETE kullanacağız)
        await db.execAsync("DELETE FROM words;");

        // Hızlı toplu ekleme (Bulk insert) için statement (ifade) hazırlıyoruz. 
        // Ancak expo-sqlite'ta runAsync içindeki döngü ile idare edilebilir. Daha performanslı olması için withTransaction kullanılır.
        // openDatabaseSync kullandığımız için withTransactionAsync veya düz for döngüsü kullanabiliriz.
        for (const word of words) {
            await insertWord(word);
        }
        console.log("Eski veriler silindi ve yeni Excel verileri eklendi.");
    } catch (error) {
        console.error("Toplu veri ekleme sırasında hata:", error);
        throw error;
    }
};
