import { FontAwesome6 } from '@expo/vector-icons';
import { Pressable, View, StyleSheet } from 'react-native';


const Threedots = () => {
    return(
        <View>
            <Pressable>
                <FontAwesome6 name="ellipsis" color = "white" size = {23}/>
            </Pressable>
        </View>
    )
}

export default Threedots;