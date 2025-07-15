import ModernTextBox from '@/components/ModernTextBox'
import { Colors } from '@/constants/Colors'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { getCurrentDate } from '@/service/dateUtils'
import insertHomework from '@/service/insertHomework'
import { FontAwesome6 } from '@expo/vector-icons'
import React, { useRef, useState } from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'

const AddButton = () => {
    const {theme} = useTheme()
    const colors = theme === 'light' ? Colors.light : Colors.dark
    const {user} = useAuth()
    const [modalVisible, setModalVisible] = useState(false)
    const [inputText, setInputText] = useState('')
    const [inputAssign, setInputAssign] = useState('')
    const [inputDate] = useState(getCurrentDate())
    const inputRef = useRef(null)

    const handlePress = () => {
        if (inputText && inputAssign !== '') {
            if (user) {
                insertHomework(user.id , inputText, inputDate, inputAssign).then()
                setModalVisible(false)
                setInputText('')
            } else {
                console.log("You're not logged in")
            }
        } else {
            console.log("Pls fill out all fields")
        }
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <Pressable
                        style={styles.modalOverlay}
                        onPress={() => setModalVisible(false)}
                    >
                        <Pressable
                            style={[styles.modalView, {backgroundColor: colors.background}]}
                            onPress={( e ) => e.stopPropagation()}
                        >
                            <View style={styles.inputGroup}>
                                <Text style={[styles.infoText, {color: colors.text}]}>Subject</Text>
                                <ModernTextBox
                                    HolderPlace="Type your Subject"
                                    value={inputText}
                                    onChangeText={setInputText}
                                    ref={inputRef}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.infoText, {color: colors.text}]}>Homework</Text>
                                <ModernTextBox
                                    HolderPlace="Type your Assignment"
                                    value={inputAssign}
                                    onChangeText={setInputAssign}
                                    ref={inputRef}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.infoText, {color: colors.text}]}>Date</Text>
                                <ModernTextBox
                                    HolderPlace=""
                                    value={inputDate}
                                    editable={false}
                                />
                            </View>

                            <Pressable
                                style={[styles.button, styles.buttonClose, {backgroundColor: colors.tint}]}
                                onPress={handlePress}
                            >
                                <Text style={[styles.textStyle, {color: colors.background}]}>Add Homework</Text>
                            </Pressable>
                        </Pressable>
                    </Pressable>
                </Modal>

                <Pressable
                    style={[styles.addButton, {backgroundColor: colors.tint}]}
                    onPress={() => setModalVisible(true)}
                >
                    <FontAwesome6 name="plus" size={24} color={colors.background}/>
                </Pressable>
            </SafeAreaView>
        </SafeAreaProvider>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        margin: 20,
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        elevation: 5,
        width: '70%',
    },
    addButton: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 60,
        height: 60,
        borderRadius: 30,
        position: 'absolute',
        bottom: 20,
        right: 20,
        elevation: 8,
    },
    button: {
        borderRadius: 20,
        padding: 10,
    },
    buttonClose: {
        marginTop: 3,
        width: 150,
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    infoText: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    inputGroup: {
        width: '100%',
        marginBottom: 10,
    },
})

export default AddButton

