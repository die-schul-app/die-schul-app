import { FlatList, StyleSheet, Text, View } from 'react-native';
import AddButton from '../components/Buttons/AddButton';
import HomeworkBox from '../components/HomeworkBox';
import getHomework from '@/app/Service/getHomework';
import formatDate from '../Service/Date/formatDate';

export default function Homework() {
  const { error, Homework } = getHomework();

  return (
    <View style={styles.container}>
      {error && <Text>Error: {error}</Text>}

      <FlatList
        data={Homework}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <HomeworkBox
            Subject={item.Subjekt}
            Text={item.to_do}
            date={formatDate(item.due)}
          />
        )}
        contentContainerStyle={styles.listContent}
      />

      <AddButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
});
