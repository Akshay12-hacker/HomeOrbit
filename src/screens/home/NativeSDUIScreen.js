import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NativeRenderer from '../../components/sdui/NativeRenderer';

const NativeSDUIScreen = ({ route }) => {
  const { schema } = route.params || {};

  return (
    <SafeAreaView style={styles.container}>
      <NativeRenderer schema={schema} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default NativeSDUIScreen;
