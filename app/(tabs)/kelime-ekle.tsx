import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, Modal, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useEffect } from 'react';
import Checkbox from 'expo-checkbox';
import { useFocusEffect } from 'expo-router';
import { getWords, insertWord, updateWord, deleteWord, toggleListemdeMi } from '@/database/db';
import { WordType } from '@/types';
import CustomButton from '@/components/CustomButton';
import CustomTextInput from '@/components/CustomTextInput';
import { Ionicons } from '@expo/vector-icons';

export default function KelimeEkleScreen() {
    const [words, setWords] = useState<WordType[]>([]);
    const [filteredWords, setFilteredWords] = useState<WordType[]>([]);
    const [searchText, setSearchText] = useState('');
    const [orderBy, setOrderBy] = useState<'sirayla' | 'alfabetik'>('sirayla');
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
        const data = await getWords(orderBy);
        setWords(data);
        // Arama varsa filtrele
        if (searchText.trim() !== '') {
            const search = searchText.toLowerCase();
            setFilteredWords(
                data.filter(w =>
                    w.ingilizceKelime.toLowerCase().includes(search) ||
                    w.turkceKarsiligi.toLowerCase().includes(search)
                )
            );
        } else {
            setFilteredWords(data);
        }
    };

    // Web için scrollbar'ı kalınlaştıran CSS ekle
    useEffect(() => {
        if (Platform.OS === 'web') {
            const style = document.createElement('style');
            style.innerHTML = `
                ::-webkit-scrollbar {
                    width: 28px !important;
                    background: #e0e0e0;
                }
                ::-webkit-scrollbar-thumb {
                    background: #b0b0b0;
                    border-radius: 10px;
                    min-height: 40px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: #888;
                }
            `;
            document.head.appendChild(style);
            return () => { document.head.removeChild(style); };
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchWords();
        }, [orderBy])
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
    const handleRemoveFromListem = async (id: number | undefined) => {
        if (!id) return;
        await toggleListemdeMi(id, false);
        fetchWords();
    };

    const handleToggleListemdeMi = async (id: number | undefined, value: boolean) => {
        if (!id) return;
        await toggleListemdeMi(id, value);
        setFilteredWords(prev => prev.map(w => w.id === id ? { ...w, listemdeMi: value } : w));
        setWords(prev => prev.map(w => w.id === id ? { ...w, listemdeMi: value } : w));
    };

    const renderItem = ({ item }: { item: WordType }) => (
        <View style={styles.listItem}>
            <Text style={styles.wordId}>{item.id}</Text>
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
                <Checkbox
                    value={item.listemdeMi}
                    onValueChange={val => handleToggleListemdeMi(item.id, val)}
                    color={item.listemdeMi ? '#27ae60' : undefined}
                    style={{ marginLeft: 8, marginRight: 2 }}
                />
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Üst Kısım: Sıralama, Arama ve Yeni Kelime Ekle Butonları */}
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <CustomButton
                        title={orderBy === 'sirayla' ? 'Veritabanı Sırası' : 'Alfabetik'}
                        variant="primary"
                        onPress={() => {
                            setOrderBy(orderBy === 'sirayla' ? 'alfabetik' : 'sirayla');
                        }}
                        style={{ marginRight: 8 }}
                    />
                    <CustomTextInput
                        label="Ara"
                        value={searchText}
                        onChangeText={text => {
                            setSearchText(text);
                            if (text.trim() === '') {
                                setFilteredWords(words);
                            } else {
                                setFilteredWords(
                                    words.filter(w => w.ingilizceKelime.toLowerCase().startsWith(text.toLowerCase()))
                                );
                            }
                        }}
                        placeholder="Kelime ara..."
                        style={{ flex: 1 }}
                    />
                </View>
                <CustomButton title="Yeni Kelime Ekle" variant="success" onPress={handleOpenAddModal} />
            </View>

            {/* Ana Liste */}
            <FlatList
                data={filteredWords}
                keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 16 }}
                ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>Henüz eklenmiş kelime yok.</Text>}
                showsVerticalScrollIndicator={true}
                style={Platform.OS === 'web' ? { scrollbarWidth: 'thick' } : {}}
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
    wordId: {
        width: 32,
        fontWeight: 'bold',
        color: '#8e44ad',
        fontSize: 16,
        textAlign: 'center',
        marginRight: 8,
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
        alignItems: 'center',
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
