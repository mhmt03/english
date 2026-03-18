// components/CustomTextInput.tsx

import React from 'react';
import { TextInput, StyleSheet, TextInputProps, View, Text } from 'react-native';

/**
 * CustomTextInput İçin Özellikler:
 * label: İsteğe bağlı, metin kutusunun üzerinde yazacak açıklayıcı başlık
 */
interface CustomTextInputProps extends TextInputProps {
    label?: string;
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({ label, style, ...props }) => {
    return (
        // En dış kapsayıcı
        <View style={styles.container}>
            {/* Eğer label (başlık) verildiyse bunu çiz */}
            {label && <Text style={styles.label}>{label}</Text>}

            {/* TextInput: React Native'in standart yazı girme veya gösterme elemanı */}
            <TextInput
                {...props}
                style={[
                    styles.input,
                    // Eğer "editable=false" gönderilmişse (sadece okunabilir) arka planı farklı yap
                    props.editable === false ? styles.readonlyInput : null,
                    style
                ]}
                placeholderTextColor="#7f8c8d" // Yer tutucu metin rengi
            />
        </View>
    );
};

export default CustomTextInput;

const styles = StyleSheet.create({
    container: {
        marginVertical: 8, // Yukarıdan aşağıdan boşluk
        width: '100%', // Kapsayıcı genişliği
    },
    label: {
        marginBottom: 4, // Input ile label arası boşluk
        fontSize: 14,
        color: '#34495e',
        fontWeight: '600', // Yarı-kalın font
    },
    input: {
        borderWidth: 1, // Kenarlık
        borderColor: '#bdc3c7', // Açık gri kenarlık rengi
        borderRadius: 8, // Yuvarlatılmış köşeler
        paddingHorizontal: 12, // İç sağ/sol boşluk
        paddingVertical: 10, // İç üst/alt boşluk
        fontSize: 16,
        color: '#2c3e50', // Girdi rengi
        backgroundColor: '#fff', // İç arkaplan rengi beyaz
        minHeight: 48, // Ekranlarda parmak hassasiyeti için en az belli bir yükseklik
    },
    readonlyInput: {
        backgroundColor: '#f5f6fa', // Düzenlenemez ise arka planı çok açık gri yapıyoruz
        color: '#7f8c8d' // Yazı rengini de hafif solet
    }
});
