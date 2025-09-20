// screens/LoginScreen.tsx
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { RootStackParamList } from '../navegation/types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }
    navigation.replace('AppTabs');
  };

  const handleGuestLogin = () => {
    navigation.replace('AppTabs');
  };

  const handleCreateAccount = () => {
    // Navegar a pantalla de registro
    Alert.alert('Próximamente', 'Esta función estará disponible pronto');
  };

  // Funciones de escala responsiva
  const horizontalScale = (size: number) => size;
  const verticalScale = (size: number) => size;
  const moderateScale = (size: number, factor = 0.5) => size + (size - size) * factor;

  return (
    <View style={[styles.container, { padding: horizontalScale(20) }]}>
      {/* Imagen circular responsiva */}
      <Image
        source={require('../../assets/images/Logo_ocelon.jpg')}
        style={{
          width: horizontalScale(160),
          height: horizontalScale(160),
          borderRadius: horizontalScale(80),
          marginBottom: verticalScale(15),
          marginTop: verticalScale(30),
          resizeMode: 'cover',
          borderWidth: 3,
          borderColor: '#3498db',
        }}
      />

      {/* Encabezado con logo/título */}
      <View style={[styles.header, { marginBottom: verticalScale(10) }]}>
        <Text style={[styles.welcomeText, { 
          fontSize: moderateScale(24, 0.3),
          marginBottom: verticalScale(0)
        }]}>
          Bienvenido a
        </Text>
        <Text style={[styles.appName, { 
          fontSize: moderateScale(32, 0.3),
          marginTop: verticalScale(-10)
        }]}>
          Ocelon
        </Text>
      </View>

      {/* Campos de formulario */}
      <View style={[styles.formContainer, { marginBottom: verticalScale(20) }]}>
        <Text style={[styles.label, { 
          fontSize: moderateScale(16, 0.3),
          marginBottom: verticalScale(8),
        }]}>
          Correo electrónico
        </Text>
        <TextInput
          style={[styles.input, {
            padding: horizontalScale(15),
            borderRadius: horizontalScale(10),
            marginBottom: verticalScale(20),
            fontSize: moderateScale(16, 0.3),
          }]}
          placeholder="Ingresa tu correo electrónico"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#7f8c8d"
          value={email}
          onChangeText={setEmail}
        />
        
        <Text style={[styles.label, { 
          fontSize: moderateScale(16, 0.3),
          marginBottom: verticalScale(8),
        }]}>
          Contraseña
        </Text>
        <TextInput
          style={[styles.input, {
            padding: horizontalScale(15),
            borderRadius: horizontalScale(10),
            marginBottom: verticalScale(10),
            fontSize: moderateScale(16, 0.3),
          }]}
          placeholder="Ingresa tu contraseña"
          secureTextEntry
          placeholderTextColor="#7f8c8d"
          value={password}
          onChangeText={setPassword}
        />

        {/* Botón de crear cuenta */}
        <TouchableOpacity onPress={() => navigation.navigate('CrearUsuario')}>
          <Text style={[styles.createAccountText, { 
            fontSize: moderateScale(14, 0.3),
            marginTop: verticalScale(10)
          }]}>
            Crear cuenta
          </Text>
        </TouchableOpacity>

        {/* Opción de invitado */}
        <TouchableOpacity onPress={handleGuestLogin}>
          <Text style={[styles.guestText, { 
            fontSize: moderateScale(14, 0.3),
            marginTop: verticalScale(10)
          }]}>
            Continuar como invitado
          </Text>
        </TouchableOpacity>
      </View>

      {/* Botón de Entrar */}
      <TouchableOpacity 
        style={[styles.mainButton, {
          padding: verticalScale(15),
          borderRadius: horizontalScale(10),
          marginBottom: verticalScale(5),
        }]} 
        onPress={handleLogin}
      >
        <Text style={[styles.mainButtonText, { 
          fontSize: moderateScale(18, 0.3) 
        }]}>
          Iniciar sesión
        </Text>
      </TouchableOpacity>

      {/* Separador */}
      <View style={[styles.separator, { 
        marginVertical: verticalScale(20) 
      }]}>
        <View style={[styles.separatorLine, { 
          height: verticalScale(1) 
        }]} />
        <Text style={[styles.separatorText, { 
          fontSize: moderateScale(14, 0.3),
          marginHorizontal: horizontalScale(10)
        }]}>
          o
        </Text>
        <View style={[styles.separatorLine, { 
          height: verticalScale(1) 
        }]} />
      </View>

      {/* Botón de Google */}
      <TouchableOpacity 
        style={[styles.googleButton, {
          padding: verticalScale(12),
          borderRadius: horizontalScale(10),
          marginBottom: verticalScale(20),
        }]} 
      >
        <Image
          source={require('../../assets/images/Logo_Google.png')}
          style={{
            width: moderateScale(20),
            height: moderateScale(20),
            resizeMode: 'contain',
          }}
        />
        <Text style={[styles.googleButtonText, { 
          fontSize: moderateScale(16, 0.3),
          marginLeft: horizontalScale(10)
        }]}>
          Iniciar sesión con Google
        </Text>
      </TouchableOpacity>

      {/* Enlaces legales */}
      <View style={styles.legalLinks}>
        <TouchableOpacity>
          <Text style={[styles.legalText, { 
            fontSize: moderateScale(12, 0.3) 
          }]}>
            Términos de servicio
          </Text>
        </TouchableOpacity>
        <Text style={[styles.legalSeparator, { 
          fontSize: moderateScale(12, 0.3),
          marginHorizontal: horizontalScale(5)
        }]}>
          |
        </Text>
        <TouchableOpacity>
          <Text style={[styles.legalText, { 
            fontSize: moderateScale(12, 0.3) 
          }]}>
            Política de privacidad
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  header: {
    alignItems: 'center',
  },
  welcomeText: {
    color: '#2c3e50',
    fontWeight: '300',
  },
  appName: {
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  formContainer: {
    width: '100%',
  },
  label: {
    color: '#2c3e50',
    fontWeight: '600',
  },
  input: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    color: '#2c3e50',
    borderWidth: 1,
    borderColor: '#3498db',
  },
  createAccountText: {
    color: '#3498db',
    textAlign: 'center',
    fontWeight: '600',
  },
  guestText: {
    color: '#7f8c8d',
    textAlign: 'center',
    fontWeight: '500',
  },
  mainButton: {
    width: '100%',
    backgroundColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  separatorLine: {
    flex: 1,
    backgroundColor: '#bdc3c7',
  },
  separatorText: {
    color: '#7f8c8d',
  },
  googleButton: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#bdc3c7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButtonText: {
    color: '#2c3e50',
    fontWeight: '500',
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  legalText: {
    color: '#7f8c8d',
  },
  legalSeparator: {
    color: '#7f8c8d',
  },
});

export default LoginScreen;