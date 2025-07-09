import { FontAwesome6 } from '@expo/vector-icons';
import { Pressable, View, StyleSheet} from 'react-native';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';

const Threedots = () => {

    const { theme } = useTheme();
    const colors = theme === 'light' ? Colors.dark : Colors.light;
    return(
        <View>
            <Pressable style={styles.button}>
                <FontAwesome6 name="ellipsis" color = {colors.text} size = {23}/>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    button:{
        padding: 10,
        borderRadius: 20,
        backgroundColor: 'transparent',
    }

})

export default Threedots;