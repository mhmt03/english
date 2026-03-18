// components/CustomRadio.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

/**
 * CustomRadioProps Arayüzü:
 * options: Radyo butonlarının liste elemanları. (label: Gösterilecek metin, value: Arka plandaki değer)
 * selectedValue: Şu an seçili olan değer
 * onSelect: Bir radyo butonu tıklandığında tetiklenecek fonksiyon (Parent component'ı haberdar etmek için)
 * orientation: Radyo butonlarının yatay ('row') mu yoksa dikey ('column') mi dizileceğini seçiyoruz.
 */
interface CustomRadioProps {
    options: { label: string; value: string }[];
    selectedValue: string;
    onSelect: (value: string) => void;
    orientation?: 'row' | 'column';
}

const CustomRadio: React.FC<CustomRadioProps> = ({ options, selectedValue, onSelect, orientation = 'row' }) => {
    return (
        // React Native'in kendi "View" birleştirme özelliği: Tüm elemanları sarmalayan ana kapsayıcı
        <View style={[styles.container, { flexDirection: orientation }]}>
            {options.map((option, index) => {
                // Şu anki döngüdeki (option.value) seçili olan değerle eşleşiyorsa true yaparız.
                const isSelected = selectedValue === option.value;

                return (
                    // TouchableOpacity buton gibi davranır ve basıldığında hafif saydamlaşarak kullanıcıya geri bildirim verir
                    <TouchableOpacity
                        key={index}
                        style={styles.radioContainer}
                        onPress={() => onSelect(option.value)}
                        activeOpacity={0.7} // Basınca ne kadar saydam olacağı
                    >
                        {/* Bu kısım yuvarlak daire çizim kısmıdır */}
                        <View style={[styles.outerCircle, isSelected && styles.selectedOuterCircle]}>
                            {/* Eğer seçiliyse, ana dairenin içinde bir de küçük, içi dolu daire göster */}
                            {isSelected && <View style={styles.innerCircle} />}
                        </View>

                        {/* Seçeneğin yazısı */}
                        <Text style={[styles.label, isSelected && styles.selectedLabel]}>
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

export default CustomRadio;

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
        gap: 15, // Elemanlar arası boşluk
    },
    radioContainer: {
        flexDirection: 'row', // Daire ve yazıyı yan yana (yatay) dizer
        alignItems: 'center', // İkisini dikeyde ortalar
    },
    outerCircle: {
        width: 20,
        height: 20,
        borderRadius: 10, // Tam yuvarlak olması için genişliğin/yüksekliğin yarısı verilir
        borderWidth: 2, // Dış çizgi kalınlığı
        borderColor: '#7f8c8d', // Klasik gri bir çizgi
        justifyContent: 'center', // İçindeki içi dolu daireyi ortalamak için
        alignItems: 'center',
        marginRight: 8,
    },
    selectedOuterCircle: {
        borderColor: '#2980b9', // Seçiliyse kenarlar mavi olur
    },
    innerCircle: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#2980b9', // İç daire mavi renk olur
    },
    label: {
        fontSize: 16,
        color: '#2c3e50', // Yazı rengi koyu gri/siyah
    },
    selectedLabel: {
        fontWeight: 'bold', // Eğer seçiliyse yazı kalın (bold) fonta dönüşür
        color: '#000',
    }
});
