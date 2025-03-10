import React, { useState } from "react";
import { Modal, View, Text, Button, StyleSheet, ScrollView, Image, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

interface RestaurantModalProps {
  visible: boolean;
  restaurant: any;
  onClose: () => void;
  onNavigate: (coordinates: { latitude: number; longitude: number }) => void;
}

const RestaurantModal: React.FC<RestaurantModalProps> = ({ visible, restaurant, onClose, onNavigate }) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <FontAwesome5 name="times" size={24} color="#000" />
          </TouchableOpacity>

          <ScrollView contentContainerStyle={styles.scrollView}>
            {/* Restaurant Name and Address */}
            <Text style={styles.title}>{restaurant.name}</Text>
            <Text style={styles.address}>{restaurant.address}</Text>
            
            {/* Image Gallery */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageGallery}>
              {restaurant.images.map((image: string, index: number) => (
                <Image key={index} source={{ uri: image }} style={styles.image} />
              ))}
            </ScrollView>

            {/* Description */}
            <Text style={styles.description}>{restaurant.description}</Text>

            {/* Navigation Button */}
            <Button
              title="Start Navigation"
              onPress={() => onNavigate(restaurant.coordinates)}
              color="#912338"
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    alignSelf: "flex-end",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  address: {
    fontSize: 16,
    color: "#555",
    marginBottom: 15,
  },
  imageGallery: {
    marginBottom: 15,
  },
  image: {
    width: 250,
    height: 150,
    borderRadius: 10,
    marginRight: 10,
  },
  description: {
    fontSize: 14,
    color: "#333",
    marginBottom: 20,
  },
  scrollView: {
    paddingBottom: 20, // Ensuring there is space for the button at the bottom
  },
});

export default RestaurantModal;
