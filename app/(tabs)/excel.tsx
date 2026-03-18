import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import CustomButton from '@/components/CustomButton';
import { getWords, clearAndInsertWords } from '@/database/db';
import { exportWordsToExcel, importWordsFromExcel } from '@/utils/excelUtils';
import { Ionicons } from '@expo/vector-icons';

export default function ExcelScreen() {
    const [loading, setLoading] = useState(false);

    // Veritabanındaki tüm kelimeleri Excel olarak dışa aktar/indir
    const handleExport = async () => {
        try {
            setLoading(true);

            // Tüm kelimeleri sırasiyla getir ("order: sirayla")
            const words = await getWords('sirayla');

            if (words.length === 0) {
                Alert.alert("Bilgi", "Veritabanınız boş. İndirilecek kelime bulunamadı.");
                setLoading(false);
                return;
            }

            // Utils altındaki Excel Export fonksiyonunu çalıştır
            await exportWordsToExcel(words);

            Alert.alert("Başarılı", "Kelimeler başarıyla dışa aktarıldı/paylaşıldı.");
        } catch (error) {
            Alert.alert("Hata", "Dışa aktarma işlemi başarısız oldu.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Cihazdan Excel seçip mevcut listeyi silerek üzerine Excel dosyasını yükler
    const handleImport = async () => {
        // Toplu silme yapacağımız için önce onay alalım
        Alert.alert(
            "Emin misiniz?",
            "Excel yüklendiğinde mevcut veritabanınızdaki TÜM kelimeler silinecek ve sadece Excel'deki kelimeler kalacaktır. Bu işlem geri alınamaz.",
            [
                { text: "Vazgeç", style: "cancel" },
                {
                    text: "Yükle",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setLoading(true);

                            // 1. Dosya seçici aç ve Excel'den oku
                            const newWords = await importWordsFromExcel();

                            // Eğer dosya seçilmediyse veya okuma iptal edildiyse
                            if (!newWords || newWords.length === 0) {
                                setLoading(false);
                                return;
                            }

                            // 2. Veritabanını temizle ve yeni kelimeleri ekle
                            await clearAndInsertWords(newWords);

                            Alert.alert("Başarılı", `${newWords.length} adet kelime veritabanına eklendi.`);
                        } catch (error) {
                            Alert.alert("Hata", "İçe aktarma işlemi başarısız oldu. Lütfen doğru formatta bir Excel kullandığınızdan emin olun.");
                            console.error(error);
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Ionicons name="cloud-download" size={60} color="#2980b9" style={{ textAlign: 'center', marginBottom: 10 }} />
                <Text style={styles.title}>Kelimeleri İndir</Text>
                <Text style={styles.description}>
                    Veritabanınızda bulunan tüm kelimeleri bir Excel dosyası olarak cihazınıza indirmenizi sağlar.
                    İndirdiğiniz bu dosyaya bilgisayarda yeni satırlar ekleyebilir, ardından uygulamaya tekrar yükleyebilirsiniz.
                </Text>
                <CustomButton
                    title="Mevcut Kelimeleri İndir"
                    variant="primary"
                    onPress={handleExport}
                    disabled={loading}
                />
            </View>

            <View style={styles.card}>
                <Ionicons name="cloud-upload" size={60} color="#e74c3c" style={{ textAlign: 'center', marginBottom: 10 }} />
                <Text style={styles.title}>Excel Yükle</Text>
                <Text style={styles.description}>
                    Hazırladığınız veya indirdiğiniz Excel dosyasını veritabanına aktarır.
                    {'\n\n'}
                    <Text style={{ fontWeight: 'bold', color: '#c0392b' }}>DİKKAT:</Text> Yükleme işlemi sonucunda uygulamadaki tüm eski kelimeler silinir!
                </Text>
                <CustomButton
                    title="Excel Yükle"
                    variant="danger"
                    onPress={handleImport}
                    disabled={loading}
                />
            </View>

            {/* Yükleme sırasındaki Bekleme (Loading) İşareti */}
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#ffffff" />
                    <Text style={{ marginTop: 10, color: 'white', fontWeight: 'bold' }}>İşlem Yapılıyor, Lütfen Bekleyin...</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#ecf0f1',
        justifyContent: 'center', // Kartları dikeyde ortalamak için
        gap: 20, // İki kart arası boşluk
    },
    card: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2c3e50',
        textAlign: 'center',
        marginBottom: 10,
    },
    description: {
        fontSize: 14,
        color: '#7f8c8d',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject, // Tüm ekranı kaplar
        backgroundColor: 'rgba(0,0,0,0.7)', // Yarı saydam siyah
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100, // Diğer her şeyin üstünde olması için
    }
});
