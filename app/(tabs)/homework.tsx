import useHomework from '@/app/Service/UseHomework';
import { StyleSheet, Text, View } from 'react-native';
import AddButton from '../components/AddButton';

export default function Homework() {
  const { error, Homework } = useHomework();
  
  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}.${month}`;
}

  return (
  <View style={styles.container}>
    {error && <Text>Error: {error}</Text>}
    
    {Homework && Homework.map((item) => (
      <View key={item.id}>
        <Text style={styles.item}>{item.Subjekt} {formatDate(item.due)}</Text>
        <Text>{item.to_do}</Text>
        
      </View>
    ))}
    <AddButton/>
  </View>
);

}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
    },
    item: {
        fontSize: 30,
        paddingVertical: 8,
        borderColor: '#20232a',
        borderRadius: 6,
        backgroundColor: '#61dafb',
        color: '#20232a',
        textAlign: 'center',
        fontWeight: 'bold'
    }
})