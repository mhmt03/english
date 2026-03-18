// components/CustomButton.tsx

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps, ViewStyle, TextStyle } from 'react-native';

/**
 * CustomButton İçin Gerekli Özellikler Dışında Eklenenler:
 * title: Buton üzerinde yazacak metin
 * variant: Butonun rengini/stilini belirler (primary=Mavi, secondary=Gri, danger=Kırmızı, success=Yeşil)
 */
interface CustomButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
}

const CustomButton: React.FC<CustomButtonProps> = ({ title, variant = 'primary', style, ...props }) => {
    // Seçilen tipe göre butonun arkaplan rengi belirleniyor
    let backgroundColor = '#3498db'; // Mavi (Varsayılan - Primary)
    if (variant === 'secondary') backgroundColor = '#95a5a6'; // Gri
    if (variant === 'danger') backgroundColor = '#e74c3c'; // Kırmızı (Silme işlemleri)
    if (variant === 'success') backgroundColor = '#2ecc71'; // Yeşil (Ekleme işlemleri)

    return (
        // TouchableOpacity, butona basıldığında şık bir saydamlaşma verir
        <TouchableOpacity
            {...props}
            style={[styles.button, { backgroundColor }, style as ViewStyle]}
            activeOpacity={0.8}
        >
            <Text style={styles.text}>{title}</Text>
        </TouchableOpacity>
    );
};

export default CustomButton;

const styles = StyleSheet.create({
    button: {
        paddingVertical: 12, // Dikey iç boşluk
        paddingHorizontal: 20, // Yatay iç boşluk
        borderRadius: 8, // Köşeleri yumuşatma
        alignItems: 'center', // Metni ortala
        justifyContent: 'center',
        marginVertical: 5, // Butonlar arası hafif boşluk
        shadowColor: '#000', // iOS için gölge rengi
        shadowOffset: { width: 0, height: 2 }, // iOS gölge yönü
        shadowOpacity: 0.2, // iOS gölge koyuluğu
        shadowRadius: 3, // iOS gölgelanma yayılması
        elevation: 3, // Android için gölge özelliği
    },
    text: {
        color: '#fff', // Yazı her halükarda beyaz
        fontSize: 16,
        fontWeight: 'bold', // Kalın yazı
    }
});
