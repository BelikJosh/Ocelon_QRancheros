import { RootStackParamList } from '@/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Button, Text, View } from 'react-native';


type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: LoginScreenProps) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Login Screen</Text>
      <Button
        title="Go to Main App"
        onPress={() => navigation.navigate('MainTabs')}
      />
    </View>
  );
}