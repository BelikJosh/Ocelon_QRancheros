import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRegistro } from '../hooks/useRegistro';
import { RootStackParamList } from '../navegation/types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'CrearUsuario'>;

const CrearUsuarioScreen = ({ navigation }: Props) => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [telefono, setTelefono] = useState('');

  const { loading, error, success, registrarUsuario, limpiarEstado } = useRegistro();

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      limpiarEstado();
    }
  }, [error, limpiarEstado]);

  useEffect(() => {
    if (success) {
      Alert.alert(
        'Éxito', 
        'Cuenta creada correctamente en DynamoDB',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    }
  }, [success, navigation]);

  const handleRegister = async () => {
    if (!nombre || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    try {
      await registrarUsuario({
        nombre,
        email,
        password,
        telefono: telefono || undefined
      });
    } catch (err) {
      // Error manejado en el useEffect
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Cuenta</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Nombre completo"
        value={nombre}
        onChangeText={setNombre}
        editable={!loading}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        editable={!loading}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Teléfono (opcional)"
        keyboardType="phone-pad"
        value={telefono}
        onChangeText={setTelefono}
        editable={!loading}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!loading}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Confirmar contraseña"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        editable={!loading}
      />

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Crear Cuenta</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => navigation.goBack()}
        disabled={loading}
      >
        <Text style={styles.backText}>Volver al login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#2c3e50',
  },
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#3498db',
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#f8f9fa',
  },
  button: {
    width: '100%',
    padding: 15,
    backgroundColor: '#3498db',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#95a5a6',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backText: {
    color: '#3498db',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default CrearUsuarioScreen;