import React, { useRef, useState } from 'react'
import insertHomework from '@/service/insertHomework'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { FontAwesome6 } from '@expo/vector-icons'
import ModernTextBox from '@/components/ModernTextBox'
import getCurrentDate from '@/service/Date/getCurrentDate'

const AddButton = () => {
    const [modalVisible, setModalVisible] = useState(false)
    const [inputText, setInputText] = useState('')
    const [inputAssign, setInputAssign] = useState('')
    const [inputDate] = useState(getCurrentDate())
    const [error, setError] = useState('')
    const inputRef = useRef(null)

    const handlePress = () => {
        if (inputText && inputAssign !== '') {
            insertHomework(inputText, inputDate, inputAssign)
            setModalVisible(false)
            setInputText('')
            setError('')
        } else {
            setError('Please fill in all fields.')
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
                            style={styles.modalView}
                            onPress={( e ) => e.stopPropagation()}
                        >
                            <View style={styles.inputGroup}>
                                <Text style={styles.infoText}>Subject</Text>
                                <ModernTextBox
                                    HolderPlace="Type your Subject"
                                    value={inputText}
                                    onChangeText={setInputText}
                                    ref={inputRef}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.infoText}>Homework</Text>
                                <ModernTextBox
                                    HolderPlace="Type your Assignment"
                                    value={inputAssign}
                                    onChangeText={setInputAssign}
                                    ref={inputRef}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.infoText}>Date</Text>
                                <ModernTextBox
                                    HolderPlace=""
                                    value={inputDate}
                                    editable={false}
                                />
                            </View>

                            <Pressable
                                style={[styles.button, styles.buttonClose]}
                                onPress={handlePress}
                            >
                                <Text style={styles.textStyle}>Add Homework</Text>
                            </Pressable>
                        </Pressable>
                    </Pressable>
                </Modal>

                <Pressable
                    style={styles.addButton}
                    onPress={() => setModalVisible(true)}
                >
                    <FontAwesome6 name="plus" size={24} color="white"/>
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
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        boxShadow: '0px 2px 4px #00000040',
        elevation: 5,
        width: '70%',
        height: 360,
    },
    addButton: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 60,
        height: 60,
        backgroundColor: '#C084FC',
        borderRadius: 30,
        position: 'absolute',
        bottom: 5,
        right: 5,
        elevation: 8,
    },
    button: {
        borderRadius: 20,
        padding: 10,
    },
    buttonClose: {
        backgroundColor: '#2196F3',
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
        color: '#374151',
        marginBottom: 4,
    },
    inputGroup: {
        width: '100%',
        marginBottom: 10,
    },
})

export default AddButton
