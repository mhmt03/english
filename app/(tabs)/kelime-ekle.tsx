import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getWords, insertWord, updateWord, deleteWord } from '@/database/db';
import { WordType } from '@/types';
import CustomButton from '@/components/CustomButton';
import CustomTextInput from '@/components/CustomTextInput';
import { Ionicons } from '@expo/vector-icons';

export default function KelimeEkleScreen() {
    const [words, setWords] = useState<WordType[]>([]);
    // Modal görünürlük state'i
    const [modalVisible, setModalVisible] = useState(false);
    // Düzenleme mi yoksa Ekleme mi yapıyoruz (id varsa düzenleme)
    const [editingWord, setEditingWord] = useState<WordType | null>(null);

    // Form elemanları
    const [ingilizceKelime, setIngilizceKelime] = useState('');
    const [ingilizceOrnekCumle, setIngilizceOrnekCumle] = useState('');
    const [turkceKarsiligi, setTurkceKarsiligi] = useState('');
    const [ornekCumleTurkcesi, setOrnekCumleTurkcesi] = useState('');

    // Veritabanından kelimeleri çek (Normal sırayla)
    const fetchWords = async () => {
        const data = await getWords('sirayla');
        setWords(data);
    };

    useFocusEffect(
        useCallback(() => {
            fetchWords();
        }, [])
    );

    // Sayfa başındaki "Yeni Kelime Ekle"ye basıldığında Formu temizler
    const handleOpenAddModal = () => {
        setEditingWord(null);
        setIngilizceKelime('');
        setIngilizceOrnekCumle('');
        setTurkceKarsiligi('');
        setOrnekCumleTurkcesi('');
        setModalVisible(true);
    };

    // Listedeki "Düzenle"ye basıldığında o kelimenin verilerini Form'a doldurur
    const handleOpenEditModal = (word: WordType) => {
        setEditingWord(word);
        setIngilizceKelime(word.ingilizceKelime);
        setIngilizceOrnekCumle(word.ingilizceOrnekCumle);
        setTurkceKarsiligi(word.turkceKarsiligi);
        setOrnekCumleTurkcesi(word.ornekCumleTurkcesi);
        setModalVisible(true);
    };

    // Sil butonuna basınca silmeden önce kullanıcıdan emin misin diye onay alır (Alert.alert)
    const handleDeleteWord = (id: number | undefined) => {
        if (!id) return;
        Alert.alert("Emin Misiniz?", "Bu kelimeyi silmek istediğinize emin misiniz?", [
            { text: "Vazgeç", style: "cancel" },
            {
                text: "Sil",
                style: "destructive",
                onPress: async () => {
                    await deleteWord(id);
                    fetchWords(); // Sildikten sonra listeyi yenile
                }
            }
        ]);
    };

    // Modal içindeki "Kaydet" butonu
    const handleSaveWord = async () => {
        if (!ingilizceKelime || !turkceKarsiligi) {
            Alert.alert("Hata", "Lütfen en azından kelime ve karşılığını doldurunuz.");
            return;
        }

        const newWord: WordType = {
            ingilizceKelime,
            ingilizceOrnekCumle,
            turkceKarsiligi,
            ornekCumleTurkcesi,
            eklenmeTarihi: new Date().toISOString(),
            listemdeMi: editingWord ? editingWord.listemdeMi : false // düzenleniyorsa eski durumu koru
        };

        if (editingWord && editingWord.id) {
            // Güncelleme Modu
            await updateWord(editingWord.id, newWord);
        } else {
            // Yeni Ekleme Modu
            await insertWord(newWord);
        }

        setModalVisible(false); // Modal'ı kapat
        fetchWords(); // Ekranda listeyi yenile
    };

    // FlatList satır tasarımı (Her bir kelime kutusu)
    const renderItem = ({ item }: { item: WordType }) => (
        <View style={styles.listItem}>
            <View style={styles.listTextContainer}>
                <Text style={styles.wordTitle}>{item.ingilizceKelime}</Text>
                <Text style={styles.wordSubtitle}>{item.turkceKarsiligi}</Text>
            </View>
            <View style={styles.listButtonsContainer}>
                <TouchableOpacity style={[styles.iconButton, { backgroundColor: '#f39c12' }]} onPress={() => handleOpenEditModal(item)}>
                    <Ionicons name="pencil" size={20} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.iconButton, { backgroundColor: '#e74c3c' }]} onPress={() => handleDeleteWord(item.id)}>
                    <Ionicons name="trash" size={20} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Üst Kısım: Yeni Kelime Ekle Butonu */}
            <View style={styles.header}>
                <CustomButton title="Yeni Kelime Ekle" variant="success" onPress={handleOpenAddModal} />
            </View>

            {/* Ana Liste */}
            <FlatList
                data={words}
                keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 16 }}
                ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>Henüz eklenmiş kelime yok.</Text>}
            />

            {/* Kayıt / Düzenleme Ekranı (Modal) */}
            <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>{editingWord ? 'Kelime Düzenle' : 'Yeni Kelime Ekle'}</Text>

                    <ScrollView contentContainerStyle={styles.modalScroll}>
                        <CustomTextInput
                            label="İngilizce Kelime *"
                            value={ingilizceKelime}
                            onChangeText={setIngilizceKelime}
                            placeholder="Apple"
                        />
                        <CustomTextInput
                            label="İngilizce Örnek Cümle"
                            value={ingilizceOrnekCumle}
                            onChangeText={setIngilizceOrnekCumle}
                            placeholder="I eat an apple."
                            multiline
                        />
                        <CustomTextInput
                            label="Türkçe Karşılığı *"
                            value={turkceKarsiligi}
                            onChangeText={setTurkceKarsiligi}
                            placeholder="Elma"
                        />
                        <CustomTextInput
                            label="Örnek Cümle Türkçesi"
                            value={ornekCumleTurkcesi}
                            onChangeText={setOrnekCumleTurkcesi}
                            placeholder="Bir elma yerim."
                            multiline
                        />

                        <View style={{ height: 20 }} />
                        <CustomButton title="Kaydet" variant="primary" onPress={handleSaveWord} />
                        <CustomButton title="İptal" variant="secondary" onPress={() => setModalVisible(false)} />
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ecf0f1',
    },
    header: {
        padding: 16,
        backgroundColor: '#fff',
        elevation: 4,
    },
    listItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        elevation: 2,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    listTextContainer: {
        flex: 1,
    },
    wordTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    wordSubtitle: {
        fontSize: 15,
        color: '#7f8c8d',
        marginTop: 4,
    },
    listButtonsContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    iconButton: {
        padding: 10,
        borderRadius: 5,
    },
    // Modal Stilleri
    modalContainer: {
        flex: 1,
        backgroundColor: '#ecf0f1',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        padding: 20,
        backgroundColor: '#fff',
        color: '#2c3e50',
        borderBottomWidth: 1,
        borderColor: '#bdc3c7',
    },
    modalScroll: {
        padding: 20,
        paddingBottom: 50,
    }
});
