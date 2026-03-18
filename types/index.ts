// types/index.ts

// Veritabanındaki "words" (Kelimeler) tablosu için kullanacağımız Veri Modeli
export interface WordType {
    id?: number; // Otomatik artan (AUTOINCREMENT) id, oluştururken vermeyeceğimiz için opsiyonel (?) yapıldı.
    ingilizceKelime: string; // Öğrenilecek İngilizce kelime
    ingilizceOrnekCumle: string; // Kelimenin geçtiği örnek İngilizce cümle
    turkceKarsiligi: string; // Kelimenin Türkçe anlamı
    ornekCumleTurkcesi: string; // Örnek İngilizce cümlenin Türkçe çevirisi
    eklenmeTarihi: string; // Kelimenin veritabanına eklendiği tarih (ISO formatında string olarak tutacağız)
    listemdeMi: boolean; // Kullanıcının "Öğrenilecekler Listeme Ekle" / "Bilmediklerime Ekle" özelliği için (0 veya 1 mantığı için)
}
