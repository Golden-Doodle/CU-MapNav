import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { useRouter } from "expo-router";
import BottomNavigation from "@/app/components/BottomNavigation/BottomNavigation";

/* 
  Sample multi-language prompts and 
  OpenAI logic remain the same—only color & styling changed 
*/

// --------- Language Setup --------- //
type LangKey = "English" | "French" | "Spanish";

const PROMPTS: Record<
  LangKey,
  {
    system: string;
    greeting: string;
    typingIndicator: string;
    alwaysActive: string;
  }
> = {
  English: {
    system: `You’re Cony – a Concordia University health bot... (omitted for brevity)`,
    greeting: `Hi, I’m Cony! How can I help you today?`,
    typingIndicator: `Cony is typing...`,
    alwaysActive: `Always active`,
  },
  French: {
    system: `Vous êtes Cony – un chatbot de santé...`,
    greeting: `Salut, je suis Cony ! Comment puis-je t’aider aujourd’hui ?`,
    typingIndicator: `Cony est en train d’écrire...`,
    alwaysActive: `Toujours actif`,
  },
  Spanish: {
    system: `Eres Cony – un bot de salud...`,
    greeting: `¡Hola, soy Cony! ¿En qué puedo ayudarte hoy?`,
    typingIndicator: `Cony está escribiendo...`,
    alwaysActive: `Siempre activo`,
  },
};

const SELECTED_LANGUAGE: LangKey = "English";

// --------- OpenAI Setup --------- //
const OPENAI_API_KEY = "sk-xxxxxx"; // <— Your actual key

async function callOpenAiAPI(
  conversation: { role: string; content: string }[]
): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: conversation,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error("Network or OpenAI error");
  }
  const data = await response.json();
  return data.choices[0].message.content;
}

// --------- Types --------- //
interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface Message {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
  timestamp: Date;
}

// --------- ChatBotScreen --------- //
export default function ChatBotScreen(): React.JSX.Element {
  const router = useRouter();

  const [conversation, setConversation] = useState<AIMessage[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNetworkError, setShowNetworkError] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  // Localization
  const systemPrompt = PROMPTS[SELECTED_LANGUAGE].system;
  const greeting = PROMPTS[SELECTED_LANGUAGE].greeting;
  const typingText = PROMPTS[SELECTED_LANGUAGE].typingIndicator;
  const statusText = PROMPTS[SELECTED_LANGUAGE].alwaysActive;

  // On mount, set system prompt + greeting
  useEffect(() => {
    const systemMsg: AIMessage = { role: "system", content: systemPrompt };
    const greetingMsg: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: greeting,
      timestamp: new Date(),
    };
    setConversation([systemMsg]);
    setMessages([greetingMsg]);
  }, []);

  // Handle user input
  const addUserMessage = (content: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setConversation((prev) => [...prev, { role: "user", content }]);
  };

  const addBotMessage = (content: string) => {
    const botMsg: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, botMsg]);
    setConversation((prev) => [...prev, { role: "assistant", content }]);
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const userInput = inputText.trim();
    setInputText("");
    addUserMessage(userInput);

    setLoading(true);
    try {
      const replyText = await callOpenAiAPI(
        conversation.concat({ role: "user", content: userInput })
      );
      addBotMessage(replyText);
    } catch (error) {
      setShowNetworkError(true);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (msg: Message) => {
    if (msg.role === "system") return null; // don't show system prompts

    const isBot = msg.role === "assistant";
    const bubbleStyle = isBot ? styles.botBubble : styles.userBubble;
    const textStyle = isBot ? styles.botText : styles.userText;

    // Reusable avatar container
    const Avatar = () => (
      <View
        style={[
          styles.avatarContainer,
          isBot ? styles.avatarBot : styles.avatarUser,
        ]}
      >
        <Icon name={isBot ? "robot" : "user"} size={18} color="#FFF" />
      </View>
    );

    return (
      <View
        key={msg.id}
        style={[
          styles.messageRow,
          isBot ? styles.leftAlign : styles.rightAlign,
        ]}
      >
        {isBot && <Avatar />}
        <View style={bubbleStyle}>
          <Text style={textStyle}>{msg.content}</Text>
        </View>
        {!isBot && <Avatar />}
      </View>
    );
  };

  // Handle network error modal
  const handleNetworkError = () => {
    setShowNetworkError(false);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Network Error Modal */}
      <Modal
        visible={showNetworkError}
        animationType="slide"
        transparent
        onRequestClose={() => setShowNetworkError(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>No Internet Connection</Text>
            <Text style={styles.modalMessage}>
              Oops! You are offline or the request failed.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleNetworkError}
            >
              <Text style={styles.modalButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backArrowWrapper}
        >
          <Icon name="arrow-left" size={20} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.avatarCircle}>
            <Icon name="robot" size={20} color="#912338" />
          </View>
          <View style={styles.titleArea}>
            <Text style={styles.headerTitle}>Cony</Text>
            <View style={styles.statusRow}>
              <View style={styles.greenDot} />
              <Text style={styles.headerStatus}>{statusText}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Chat Body */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesList}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        >
          {messages.map(renderMessage)}
          {loading && (
            <View style={[styles.messageRow, styles.leftAlign]}>
              <View style={[styles.avatarContainer, styles.avatarBot]}>
                <Icon name="robot" size={18} color="#FFF" />
              </View>
              <View style={styles.botBubble}>
                <Text style={styles.botText}>{typingText}</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Footer input + disclaimer */}
        <View style={styles.footerContainer}>
          <View style={styles.inputBar}>
            <TextInput
              style={styles.inputField}
              placeholder="Type your message..."
              placeholderTextColor="#666"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.disclaimerContainer}>
            <Text style={styles.disclaimerText}>
              This chatbot does not provide professional medical advice.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Bottom Navigation for consistent layout */}
      <BottomNavigation testID="bottom-navigation" />
    </SafeAreaView>
  );
}

/* 
  STYLES 
  (Adopts same color scheme & shadow usage as your ButtonSection, 
  etc. We replaced #990000 with #912338 and added shadows to bubbles.)
*/
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  /* HEADER */
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#912338",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backArrowWrapper: {
    paddingRight: 12,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  titleArea: {
    flexDirection: "column",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#FFF",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#00FF00",
    marginRight: 5,
  },
  headerStatus: {
    fontSize: 13,
    color: "#FFF",
    opacity: 0.9,
  },

  /* CHAT BODY */
  chatContainer: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  messagesList: {
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  messageRow: {
    flexDirection: "row",
    marginVertical: 4,
    alignItems: "flex-end",
  },
  leftAlign: {
    justifyContent: "flex-start",
  },
  rightAlign: {
    justifyContent: "flex-end",
  },

  /* AVATARS & BUBBLES */
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginHorizontal: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarBot: {
    backgroundColor: "#333",
  },
  avatarUser: {
    backgroundColor: "#912338",
  },
  botBubble: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 10,
    maxWidth: "70%",
    // matching shadow style from ButtonSection
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  botText: {
    color: "#333",
  },
  userBubble: {
    backgroundColor: "#912338",
    borderRadius: 12,
    padding: 10,
    maxWidth: "70%",
    // optional shadow
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  userText: {
    color: "#FFF",
  },

  /* FOOTER / INPUT */
  footerContainer: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  inputField: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: "#333",
    marginRight: 8,
    // optional shadow if you want the input to stand out
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sendButton: {
    backgroundColor: "#912338",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sendButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  disclaimerContainer: {
    alignItems: "center",
    marginBottom: Platform.OS === "ios" ? 10 : 15,
  },
  disclaimerText: {
    fontSize: 12,
    color: "#666",
    opacity: 0.8,
  },

  /* MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#912338",
  },
  modalMessage: {
    fontSize: 14,
    textAlign: "center",
    color: "#333",
    marginBottom: 16,
  },
  modalButton: {
    backgroundColor: "#912338",
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  modalButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});
