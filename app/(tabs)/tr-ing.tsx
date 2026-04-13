import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import Checkbox from 'expo-checkbox';
import CustomRadio from '@/components/CustomRadio';
import CustomButton from '@/components/CustomButton';
import CustomTextInput from '@/components/CustomTextInput';
import { getWords, toggleListemdeMi } from '@/database/db';
import { WordType } from '@/types';
import { useFocusEffect } from 'expo-router';

export default function TrIngScreen() {
    const [order, setOrder] = useState<string>('sirayla');
    const [filterType, setFilterType] = useState<string>('tumu');
    const [showExample, setShowExample] = useState<boolean>(false);
    const [words, setWords] = useState<WordType[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [isRevealed, setIsRevealed] = useState<boolean>(false);

    const fetchWords = async () => {
        const data = await getWords(
            order as 'alfabetik' | 'sirayla' | 'karisik',
            filterType === 'listemdekiler'
        );
        setWords(data);
        setCurrentIndex(0);
        setIsRevealed(false);
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchWords();
        }, [order, filterType])
    );

    const currentWord = words[currentIndex] || null;

    const handleNextWord = () => {
        if (words.length === 0) return;
        setIsRevealed(false);
        if (currentIndex < words.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setCurrentIndex(0);
        }
    };

    const handlePrevWord = () => {
        if (words.length === 0) return;
        setIsRevealed(false);
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        } else {
            setCurrentIndex(words.length - 1);
        }
    };

    const handleAddToList = async () => {
        if (!currentWord || !currentWord.id) return;
        await toggleListemdeMi(currentWord.id, true);
        const updatedWords = [...words];
        updatedWords[currentIndex].listemdeMi = true;
        setWords(updatedWords);
    };

    const handleRemoveFromList = async () => {
        if (!currentWord || !currentWord.id) return;
        await toggleListemdeMi(currentWord.id, false);
        const updatedWords = [...words];
        updatedWords[currentIndex].listemdeMi = false;
        setWords(updatedWords);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* 1. Üst Kısım: Filtreleme Radyo Butonları */}
            <View style={styles.filterSection}>
                <CustomRadio
                    options={[
                        { label: 'Tümü', value: 'tumu' },
                        { label: 'Listemdekiler', value: 'listemdekiler' }
                    ]}
                    selectedValue={filterType}
                    onSelect={(val) => setFilterType(val)}
                />
                <CustomRadio
                    options={[
                        { label: 'Sırayla', value: 'sirayla' },
                        { label: 'Alfabetik', value: 'alfabetik' },
                        { label: 'Karışık', value: 'karisik' }
                    ]}
                    selectedValue={order}
                    onSelect={(val) => setOrder(val)}
                    orientation="row"
                />
            </View>

            {/* 2. Orta Kısım: Checkbox */}
            <View style={styles.checkboxContainer}>
                <Checkbox
                    value={showExample}
                    onValueChange={setShowExample}
                    color={showExample ? '#2980b9' : undefined}
                />
                <Text style={styles.checkboxLabel}>Örnek Cümleyi de Göster</Text>
            </View>

            {/* 3. Ana Kısım: Kelime Gösterim Kutuları (Ters Çevrilmiş Halde) */}
            <View style={styles.wordsContainer}>
                {/* Tıklanabilir Türkçe Kelime Alanı */}
                <TouchableOpacity activeOpacity={0.7} onPress={() => setIsRevealed(!isRevealed)}>
                    <View pointerEvents="none">
                        <CustomTextInput
                            label="Türkçe Karşılığı (Çeviriyi görmek için dokunun)"
                            value={currentWord ? currentWord.turkceKarsiligi : ''}
                            editable={false}
                        />
                    </View>
                </TouchableOpacity>

                {/* Checkbox işaretliyse gösterilecek olan Türkçe Örnek Cümle */}
                {showExample && (
                    <CustomTextInput
                        label="Örnek Cümle Türkçesi"
                        value={currentWord ? currentWord.ornekCumleTurkcesi : ''}
                        editable={false}
                        multiline={true}
                    />
                )}

                {/* Gizli Tutulan (Tıklanan) Bölümler */}
                {isRevealed && (
                    <>
                        <CustomTextInput
                            label="İngilizce Kelime"
                            value={currentWord ? currentWord.ingilizceKelime : ''}
                            editable={false}
                        />
                        {showExample && (
                            <CustomTextInput
                                label="İngilizce Örnek Cümle"
                                value={currentWord ? currentWord.ingilizceOrnekCumle : ''}
                                editable={false}
                                multiline={true}
                            />
                        )}
                    </>
                )}
            </View>

            {/* 4. Alt Kısım: Aksiyon Butonları */}
            <View style={styles.buttonContainer}>
                <View style={styles.navigationButtons}>
                    {order === 'sirayla' && (
                        <View style={{ flex: 1, marginRight: 5 }}>
                            <CustomButton title="Geri" variant="secondary" onPress={handlePrevWord} />
                        </View>
                    )}
                    <View style={{ flex: 1, marginLeft: order === 'sirayla' ? 5 : 0 }}>
                        <CustomButton title="Değiştir" onPress={handleNextWord} />
                    </View>
                </View>

                {/* Bilmediklerime Ekle Butonu */}
                {currentWord && (
                    currentWord.listemdeMi ? (
                        <CustomButton
                            title="Bilmediklerimden Çıkar"
                            variant="primary"
                            style={{ backgroundColor: '#8e44ad' }}
                            onPress={handleRemoveFromList}
                        />
                    ) : (
                        <CustomButton
                            title="Bilmediklerime Ekle"
                            variant="danger"
                            onPress={handleAddToList}
                        />
                    )
                )}

                {words.length === 0 && (
                     <Text style={styles.noDataText}> {"Hiç kelime bulunamadı... Lütfen Excel'den yükleme yapın veya Kelimeler sekmesinden ekleyin."} </Text>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#ecf0f1',
    },
    filterSection: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
        elevation: 2,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        paddingHorizontal: 8,
    },
    checkboxLabel: {
        marginLeft: 8,
        fontSize: 16,
        color: '#2c3e50',
    },
    wordsContainer: {
        marginBottom: 15,
    },
    buttonContainer: {
        marginTop: 10,
        gap: 10,
    },
    navigationButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    noDataText: {
        marginTop: 20,
        color: '#e74c3c',
        textAlign: 'center',
    }
});
