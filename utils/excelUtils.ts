// utils/excelUtils.ts

import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import * as XLSX from 'xlsx';
import { WordType } from '../types';

/*
  AÇIKLAMA:
  Bu dosya Excel ithalatı (import) ve ihracatı (export) işlemlerini yönetmek için
  özellikle ayrı bir modül olarak tasarlandı.
  "xlsx" kütüphanesini kullanarak Excel dosyalarını okuyup yazıyoruz.
  "expo-file-system", "expo-sharing" ve "expo-document-picker" ile de dosya seçme
  ve kaydetme/paylaşma yeteneklerini mobil cihazda gerçekleştiriyoruz.
*/

/**
 * Mevcut kelimeleri cihazda bir Excel dosyasına indirir/kaydeder (Export İşlemi)
 * @param words Veritabanından gelen mevcut kelimeler dizisi
 */
export const exportWordsToExcel = async (words: WordType[]) => {
    try {
        // 1. Kelimelerimizi Excel'in "Sheet" (Çalışma Sayfası) formatına uygun json dizisine dönüştürelim
        // Burada objelerin key isimleri (ingilizceKelime vs.) Excel sütun başlıkları (header) olacak
        const worksheet = XLSX.utils.json_to_sheet(words);

        // 2. Bir "WorkBook" (Çalışma Kitabı) oluşturuyoruz ve çalışma sayfamızı içine ekliyoruz.
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Kelimeler");

        // 3. Çalışma kitabını base64 formatında (metin katarı) dışa aktarıyoruz
        // Çünkü React Native / Expo Native File System string (metin) ile daha rahat çalışır
        const base64Data = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });

        // 4. Cihazın Dokümanlar dizinine kaydetmek için dosya yolunu (URI) hazırlıyoruz
        const fileUri = FileSystem.documentDirectory + "Kelimeler_Listesi.xlsx";

        // 5. Dosyayı cihaza yazıyoruz (Encoding: base64)
        await FileSystem.writeAsStringAsync(fileUri, base64Data, {
            encoding: 'base64',
        });

        // 6. Kullanıcıya bu dosyayı indirebilmesi / paylaşabilmesi için (Email'e yollama, Drive'a atma vs.) paylaşım paneli (Share) açıyoruz
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri);
        } else {
            console.warn("Paylaşım özelliği bu cihazda desteklenmiyor, dosya sadece cihaza kaydedildi.");
        }

    } catch (error) {
        console.error("Excel dışa aktarma (Export) sırasında hata: ", error);
        throw error;
    }
};

/**
 * Cihazdan bir Excel dosyası seçip içeriğini okur (Import İşlemi)
 * @returns {Promise<WordType[]>} Excel'den çıkarılan kelime dizisi
 */
export const importWordsFromExcel = async (): Promise<WordType[]> => {
    try {
        // 1. Kullanıcıdan bir dosya seçmesini istiyoruz
        const fileResult = await DocumentPicker.getDocumentAsync({
            type: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
            copyToCacheDirectory: true // Dosyayı okuyabilmek için önbelleğe al
        });

        // 2. Kullanıcı seçim yapmaktan vazgeçmişse veya iptal etmişse (canceled) null dönüyoruz
        if (fileResult.canceled || !fileResult.assets || fileResult.assets.length === 0) {
            return []; // İşlem iptal, boş dizi dönüyoruz ki hata çıkmasın
        }

        const selectedFile = fileResult.assets[0];

        // 3. Seçilen dosyanın içeriğini "base64" string olarak (metin formatında) okuyoruz
        const base64Content = await FileSystem.readAsStringAsync(selectedFile.uri, {
            encoding: 'base64'
        });

        // 4. Bu base64 verisini XLSX kütüphanesi kullanarak bir Çalışma Kitabına dönüştürüyoruz
        const workbook = XLSX.read(base64Content, { type: 'base64' });

        // 5. İlk çalışma sayfasının (Sheet) ismini bulup (genelde Sheet1 veya Kelimeler'dir) o sayfayı seçiyoruz
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // 6. Excel sayfasını JSON (Obje dizisi) formatına çeviriyoruz. 
        // Not: Excel sütun başlıkları objelerin key'leri olur. Excel'deki kolon isimleriyle WordType uyumlu olmalıdır.
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

        // 7. Gelen JSON verilerini WordType'a uyumlu hale getirmek için zorunlu alanları (ingilizceKelime vb.) var mı kontrol edip dönüşsün
        const importedWords: WordType[] = jsonData.map(row => ({
            // Eğer id excel'de var ama biz eklerken yoksayacaksak id'yi çıkarabiliriz, ancak şimdilik veritabanı kendisi oto artış versin.
            ingilizceKelime: row.ingilizceKelime || '',
            ingilizceOrnekCumle: row.ingilizceOrnekCumle || '',
            turkceKarsiligi: row.turkceKarsiligi || '',
            ornekCumleTurkcesi: row.ornekCumleTurkcesi || '',
            eklenmeTarihi: row.eklenmeTarihi ? String(row.eklenmeTarihi) : new Date().toISOString(),
            listemdeMi: row.listemdeMi === 1 || row.listemdeMi === true // Eğer 1 veya true gelirse boolean true yap
        }));

        return importedWords;
    } catch (error) {
        console.error("Excel içeri aktarma (Import) sırasında hata: ", error);
        throw error; // UI'a fırlat ki kullanıcıya hata mesajı gösterebilelim
    }
};
