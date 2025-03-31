import React from "react";
import { View, Text, ImageBackground, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { headerStyles as styles } from "../Header/GenericHeader.Styles"; 

interface GenericHeaderProps {
  testID: string;
  title: string;
  noticeText: string;
  noticeIcon: string;
}

const GenericHeader: React.FC<GenericHeaderProps> = ({ testID, title, noticeText, noticeIcon }) => {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <ImageBackground
      source={require("../../../assets/images/header-background.jpg")}
      style={styles.background}
      testID={testID}
    >
      <View style={styles.overlay} />
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <FontAwesome5 name="arrow-left" size={30} color="#fff" />
      </TouchableOpacity>
      <View style={styles.container}>
        <Text style={styles.reportTitle}>{t(title)}</Text>
        <View style={styles.noticeContainer}>
          <FontAwesome5 name={noticeIcon} size={18} color="#912338" />
          <Text style={styles.noticeText}>{t(noticeText)}</Text>
        </View>
      </View>
    </ImageBackground>
  );
};

export default GenericHeader;
